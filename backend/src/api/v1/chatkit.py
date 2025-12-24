"""
ChatKit API endpoints - Self-hosted ChatKit Server.

Implements a self-hosted ChatKit server using the openai-chatkit SDK.
The frontend uses @openai/chatkit-react which connects to this endpoint.
"""

from collections import defaultdict
from datetime import datetime
from typing import Annotated, Any, AsyncIterator
from uuid import uuid4

from fastapi import APIRouter, Depends, Header, Request
from fastapi.responses import Response, StreamingResponse
from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.v1.deps import get_current_user
from src.config import settings
from src.db import get_db
from src.models import User

# Import ChatKit SDK components
try:
    from chatkit.server import ChatKitServer, StreamingResult
    from chatkit.store import Store
    from chatkit.types import (
        AssistantMessageContent,
        AssistantMessageItem,
        Page,
        ThreadItemDoneEvent,
        ThreadMetadata,
        ThreadStreamEvent,
        UserMessageItem,
    )
    CHATKIT_AVAILABLE = True
except ImportError as e:
    print(f"ChatKit SDK not available: {e}")
    CHATKIT_AVAILABLE = False

router = APIRouter()

# OpenAI async client for chat completions
_openai_client: AsyncOpenAI | None = None


def get_openai_client() -> AsyncOpenAI:
    """Get or create AsyncOpenAI client singleton."""
    global _openai_client
    if _openai_client is None:
        if not settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY is not configured")
        _openai_client = AsyncOpenAI(api_key=settings.openai_api_key)
    return _openai_client


async def get_optional_user(
    authorization: Annotated[str | None, Header()] = None,
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Get current user if authenticated, None otherwise (for dev mode)."""
    if not authorization or not authorization.startswith("Bearer "):
        if settings.is_development:
            return None
        from src.core import UnauthorizedException
        raise UnauthorizedException("Invalid authorization header")

    try:
        return await get_current_user(authorization, db)
    except Exception:
        if settings.is_development:
            return None
        raise


OptionalUser = Annotated[User | None, Depends(get_optional_user)]


if CHATKIT_AVAILABLE:
    class InMemoryChatKitStore(Store[dict]):
        """
        In-memory store for ChatKit threads and items.
        For production, this should be replaced with a database-backed store.
        """

        def __init__(self):
            self._threads: dict[str, ThreadMetadata] = {}
            self._items: dict[str, list[Any]] = defaultdict(list)
            self._attachments: dict[str, Any] = {}

        def generate_thread_id(self, context: dict) -> str:
            return f"thread_{uuid4().hex[:16]}"

        def generate_item_id(self, kind: str, thread: ThreadMetadata, context: dict) -> str:
            return f"{kind}_{uuid4().hex[:16]}"

        async def load_thread(self, thread_id: str, context: dict) -> ThreadMetadata | None:
            return self._threads.get(thread_id)

        async def save_thread(self, thread: ThreadMetadata, context: dict) -> None:
            self._threads[thread.id] = thread

        async def load_threads(
            self,
            limit: int,
            after: str | None,
            order: str,
            context: dict,
        ) -> Page[ThreadMetadata]:
            """Load threads with pagination."""
            threads = list(self._threads.values())
            # Sort by created_at
            reverse = order == "desc"
            threads.sort(key=lambda t: t.created_at, reverse=reverse)

            # Handle pagination
            if after:
                try:
                    idx = next(i for i, t in enumerate(threads) if t.id == after)
                    threads = threads[idx + 1:]
                except StopIteration:
                    pass

            result = threads[:limit]
            has_more = len(threads) > limit

            return Page(
                data=result,
                has_more=has_more,
                after=result[-1].id if result and has_more else None,
            )

        async def delete_thread(self, thread_id: str, context: dict) -> None:
            self._threads.pop(thread_id, None)
            self._items.pop(thread_id, None)

        async def load_thread_items(
            self,
            thread_id: str,
            after: str | None,
            limit: int,
            order: str,
            context: dict,
        ) -> Page[Any]:
            """Load thread items with pagination."""
            items = self._items.get(thread_id, [])

            # Sort by created_at
            reverse = order == "desc"
            items = sorted(items, key=lambda i: getattr(i, 'created_at', datetime.min), reverse=reverse)

            # Handle pagination
            if after:
                try:
                    idx = next(i for i, item in enumerate(items) if item.id == after)
                    items = items[idx + 1:]
                except StopIteration:
                    pass

            result = items[:limit]
            has_more = len(items) > limit

            return Page(
                data=result,
                has_more=has_more,
                after=result[-1].id if result and has_more else None,
            )

        async def add_thread_item(
            self,
            thread_id: str,
            item: Any,
            context: dict,
        ) -> None:
            self._items[thread_id].append(item)

        async def save_item(self, thread_id: str, item: Any, context: dict) -> None:
            items = self._items[thread_id]
            for i, existing in enumerate(items):
                if existing.id == item.id:
                    items[i] = item
                    return
            items.append(item)

        async def load_item(self, thread_id: str, item_id: str, context: dict) -> Any | None:
            items = self._items.get(thread_id, [])
            for item in items:
                if item.id == item_id:
                    return item
            return None

        async def delete_thread_item(self, thread_id: str, item_id: str, context: dict) -> None:
            if thread_id in self._items:
                self._items[thread_id] = [i for i in self._items[thread_id] if i.id != item_id]

        async def save_attachment(self, attachment: Any, context: dict) -> None:
            self._attachments[attachment.id] = attachment

        async def load_attachment(self, attachment_id: str, context: dict) -> Any | None:
            return self._attachments.get(attachment_id)

        async def delete_attachment(self, attachment_id: str, context: dict) -> None:
            self._attachments.pop(attachment_id, None)

    class STSChatKitServer(ChatKitServer[dict]):
        """
        STS AI CEO ChatKit Server.

        Implements the respond method to generate AI responses using OpenAI's
        chat completions API with streaming.
        """

        def __init__(self, store: InMemoryChatKitStore):
            super().__init__(store=store)
            self._system_prompt = """You are STS AI CEO, an intelligent business assistant.
You help users with:
- Business strategy and planning
- Data analysis and insights
- Decision-making support
- Market research and competitive analysis
- Workflow optimization

Be professional, concise, and helpful. Provide actionable advice when possible.
Respond in the same language the user uses."""

        async def respond(
            self,
            thread: ThreadMetadata,
            input_user_message: UserMessageItem | None,
            context: dict,
        ) -> AsyncIterator[ThreadStreamEvent]:
            """Generate AI response using OpenAI chat completions with streaming."""

            client = get_openai_client()

            # Build conversation history
            messages = [{"role": "system", "content": self._system_prompt}]

            # Load previous messages from thread
            page = await self.store.load_thread_items(
                thread.id, after=None, limit=20, order="asc", context=context
            )

            for item in page.data:
                if hasattr(item, "content") and item.content:
                    if isinstance(item, UserMessageItem):
                        # User message
                        text_content = ""
                        for content in item.content:
                            if hasattr(content, "text"):
                                text_content += content.text
                        if text_content:
                            messages.append({"role": "user", "content": text_content})
                    elif isinstance(item, AssistantMessageItem):
                        # Assistant message
                        text_content = ""
                        for content in item.content:
                            if hasattr(content, "text"):
                                text_content += content.text
                        if text_content:
                            messages.append({"role": "assistant", "content": text_content})

            # Add the current user message
            if input_user_message and input_user_message.content:
                user_text = ""
                for content in input_user_message.content:
                    if hasattr(content, "text"):
                        user_text += content.text
                if user_text:
                    messages.append({"role": "user", "content": user_text})

            # Generate response using OpenAI
            try:
                response = await client.chat.completions.create(
                    model="gpt-4o",
                    messages=messages,
                    stream=True,
                    max_tokens=2048,
                    temperature=0.7,
                )

                # Collect streamed response
                full_response = ""
                async for chunk in response:
                    if chunk.choices and chunk.choices[0].delta.content:
                        full_response += chunk.choices[0].delta.content

                # Yield the complete response as a ThreadItemDoneEvent
                yield ThreadItemDoneEvent(
                    item=AssistantMessageItem(
                        thread_id=thread.id,
                        id=self.store.generate_item_id("message", thread, context),
                        created_at=datetime.now(),
                        content=[AssistantMessageContent(text=full_response)],
                    ),
                )

            except Exception as e:
                # Return error message
                error_message = f"Error generating response: {str(e)}" if settings.is_development else "Sorry, I encountered an error. Please try again."
                yield ThreadItemDoneEvent(
                    item=AssistantMessageItem(
                        thread_id=thread.id,
                        id=self.store.generate_item_id("message", thread, context),
                        created_at=datetime.now(),
                        content=[AssistantMessageContent(text=error_message)],
                    ),
                )

    # Create global ChatKit server instance
    _chatkit_store = InMemoryChatKitStore()
    _chatkit_server = STSChatKitServer(store=_chatkit_store)

    @router.post("")
    @router.post("/")
    async def chatkit_endpoint(request: Request) -> Response:
        """
        Main ChatKit endpoint.

        All ChatKit requests go to this single endpoint.
        The server routes each request internally.
        """
        try:
            body = await request.body()
            result = await _chatkit_server.process(body, context={})

            if isinstance(result, StreamingResult):
                return StreamingResponse(
                    result,
                    media_type="text/event-stream",
                    headers={
                        "Cache-Control": "no-cache",
                        "Connection": "keep-alive",
                        "X-Accel-Buffering": "no",
                    },
                )

            # NonStreamingResult.json is bytes
            return Response(
                content=result.json,
                media_type="application/json",
            )
        except Exception as e:
            import traceback
            print(f"ChatKit error: {e}")
            traceback.print_exc()
            return Response(
                content=f'{{"error": "{str(e)}"}}',
                media_type="application/json",
                status_code=500,
            )

else:
    # Fallback if chatkit SDK is not available
    @router.post("")
    @router.post("/")
    async def chatkit_endpoint_fallback(request: Request) -> Response:
        """ChatKit SDK not available."""
        return Response(
            content='{"error": "ChatKit SDK not installed. Please install openai-chatkit package."}',
            media_type="application/json",
            status_code=503,
        )


@router.get("/config")
async def get_chatkit_config(
    user: OptionalUser,
) -> dict[str, Any]:
    """
    Get ChatKit configuration for the frontend.
    """
    return {
        "mode": "self-hosted",
        "endpoint": "/api/v1/chatkit",
        "features": {
            "voice": False,  # Not supported in self-hosted mode
            "text": True,
            "tools": False,  # Can be enabled later
        },
        "branding": {
            "assistant_name": "STS AI CEO",
            "theme": "dark",
        },
        "sdk_available": CHATKIT_AVAILABLE,
    }
