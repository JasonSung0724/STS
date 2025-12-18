"""
ChatKit API endpoints.

Provides endpoints for ChatKit client authentication and message handling.
"""

from typing import Any

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from openai import OpenAI

from src.api.v1.deps import CurrentUser, Database
from src.config import settings
from src.services.chatkit import get_chatkit_server

router = APIRouter()

# OpenAI client for session management
_openai_client = OpenAI(api_key=settings.openai_api_key)


@router.post("/session")
async def create_chatkit_session(
    current_user: CurrentUser,
) -> dict[str, str]:
    """
    Create a ChatKit client session.

    This generates a client_secret token that the frontend uses
    to authenticate with ChatKit.

    Returns:
        Dict with client_secret for ChatKit initialization
    """
    # Create a session token for ChatKit
    # In production, you might want to use Agent Builder workflow IDs
    # For now, we create a simple session

    # Generate client secret using OpenAI's session API
    # Note: This requires the ChatKit workflow to be set up in OpenAI
    try:
        # For custom backend integration, we generate our own token
        # based on user authentication
        import secrets
        import hashlib
        import time

        # Create a signed token for this session
        timestamp = str(int(time.time()))
        user_id = current_user.id
        secret_base = f"{user_id}:{timestamp}:{settings.jwt_secret}"
        client_secret = hashlib.sha256(secret_base.encode()).hexdigest()[:32]

        return {
            "client_secret": client_secret,
            "user_id": user_id,
            "expires_in": 3600,  # 1 hour
        }
    except Exception as e:
        # Fallback: generate a random token
        return {
            "client_secret": secrets.token_hex(16),
            "user_id": current_user.id,
            "expires_in": 3600,
        }


@router.post("/respond")
async def chatkit_respond(
    request: Request,
    current_user: CurrentUser,
    db: Database,
) -> StreamingResponse:
    """
    Handle ChatKit message requests with streaming response.

    This endpoint receives messages from ChatKit and streams
    responses using Server-Sent Events (SSE).
    """
    body = await request.json()
    messages = body.get("messages", [])

    chatkit_server = get_chatkit_server()

    async def generate():
        """Generate SSE events from ChatKit server."""
        context = {"user": current_user, "db": db}

        async for event in chatkit_server.respond(messages, context):
            # Format as SSE
            event_data = event.model_dump_json() if hasattr(event, "model_dump_json") else str(event)
            yield f"data: {event_data}\n\n"

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


@router.get("/config")
async def get_chatkit_config(
    current_user: CurrentUser,
) -> dict[str, Any]:
    """
    Get ChatKit configuration for the frontend.

    Returns configuration needed to initialize ChatKit on the client.
    """
    return {
        "api_endpoint": "/api/v1/chatkit/respond",
        "session_endpoint": "/api/v1/chatkit/session",
        "features": {
            "tools": True,
            "streaming": True,
            "attachments": False,  # TODO: Enable when file upload is ready
        },
        "branding": {
            "assistant_name": "STS AI CEO",
            "assistant_avatar": None,
            "theme": "light",
        },
    }
