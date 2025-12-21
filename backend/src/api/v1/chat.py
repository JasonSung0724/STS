import json
from typing import AsyncGenerator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from src.api.v1.deps import CurrentUser, Database
from src.core import NotFoundException
from src.models import Conversation, Message
from src.models.conversation import MessageRole
from src.schemas import (
    ConversationCreate,
    ConversationResponse,
    ConversationListResponse,
    MessageCreate,
    MessageResponse,
)
from src.services.agents import run_ceo_agent, stream_ceo_agent

router = APIRouter()


@router.get("/conversations", response_model=list[ConversationListResponse])
async def get_conversations(
    current_user: CurrentUser,
    db: Database,
) -> list[Conversation]:
    """Get all conversations for current user."""
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
    )
    return list(result.scalars().all())


@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    data: ConversationCreate,
    current_user: CurrentUser,
    db: Database,
) -> Conversation:
    """Create a new conversation."""
    conversation = Conversation(
        user_id=current_user.id,
        title=data.title or "New Conversation",
    )
    db.add(conversation)
    await db.flush()
    await db.refresh(conversation)

    return conversation


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: str,
    current_user: CurrentUser,
    db: Database,
) -> Conversation:
    """Get a conversation by ID."""
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise NotFoundException("Conversation not found")

    return conversation


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: CurrentUser,
    db: Database,
) -> dict[str, str]:
    """Delete a conversation."""
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise NotFoundException("Conversation not found")

    await db.delete(conversation)
    return {"message": "Conversation deleted"}


@router.post(
    "/conversations/{conversation_id}/messages",
    response_model=MessageResponse,
)
async def send_message(
    conversation_id: str,
    data: MessageCreate,
    current_user: CurrentUser,
    db: Database,
) -> Message:
    """Send a message in a conversation."""
    # Get conversation
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise NotFoundException("Conversation not found")

    # Create user message
    user_message = Message(
        conversation_id=conversation_id,
        role=MessageRole.USER,
        content=data.content,
    )
    db.add(user_message)
    await db.flush()

    # Build conversation context
    context = {
        "user_id": str(current_user.id),
        "conversation_id": conversation_id,
        "history": [
            {"role": msg.role.value, "content": msg.content}
            for msg in conversation.messages
        ],
    }

    # Get AI response using OpenAI Agents SDK
    ai_response = await run_ceo_agent(
        message=data.content,
        context=context,
    )

    # Create assistant message
    assistant_message = Message(
        conversation_id=conversation_id,
        role=MessageRole.ASSISTANT,
        content=ai_response["content"],
        message_metadata=ai_response.get("metadata"),
    )
    db.add(assistant_message)
    await db.flush()
    await db.refresh(assistant_message)

    # Update conversation title if it's the first message
    if len(conversation.messages) == 0:
        conversation.title = data.content[:50] + ("..." if len(data.content) > 50 else "")

    return assistant_message


@router.post("/conversations/{conversation_id}/messages/stream")
async def send_message_stream(
    conversation_id: str,
    data: MessageCreate,
    current_user: CurrentUser,
    db: Database,
) -> StreamingResponse:
    """Send a message and stream the AI response."""
    # Get conversation
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise NotFoundException("Conversation not found")

    # Create user message
    user_message = Message(
        conversation_id=conversation_id,
        role=MessageRole.USER,
        content=data.content,
    )
    db.add(user_message)
    await db.flush()

    # Build conversation context
    context = {
        "user_id": str(current_user.id),
        "conversation_id": conversation_id,
        "history": [
            {"role": msg.role.value, "content": msg.content}
            for msg in conversation.messages
        ],
    }

    async def generate() -> AsyncGenerator[str, None]:
        """Generate SSE events from agent stream."""
        full_content = ""

        async for chunk in stream_ceo_agent(data.content, context):
            if chunk.get("type") == "error":
                yield f"data: {json.dumps({'error': chunk['data']})}\n\n"
                break

            chunk_data = chunk.get("data", "")
            if chunk_data:
                full_content += str(chunk_data)
                yield f"data: {json.dumps({'content': chunk_data})}\n\n"

        # Save the complete message
        if full_content:
            assistant_message = Message(
                conversation_id=conversation_id,
                role=MessageRole.ASSISTANT,
                content=full_content,
            )
            db.add(assistant_message)
            await db.commit()

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/quick-chat")
async def quick_chat(
    data: MessageCreate,
    current_user: CurrentUser,
) -> dict:
    """Quick chat without conversation history (for simple queries)."""
    context = {"user_id": str(current_user.id)}

    response = await run_ceo_agent(
        message=data.content,
        context=context,
    )

    return {
        "content": response["content"],
        "metadata": response.get("metadata"),
    }
