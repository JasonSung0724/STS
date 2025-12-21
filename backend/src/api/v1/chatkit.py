"""
ChatKit API endpoints.

Provides endpoints for ChatKit client authentication and message handling.
"""

import hashlib
import secrets
import time
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Header, Request
from fastapi.responses import StreamingResponse
from openai import OpenAI
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.v1.deps import CurrentUser, Database, get_current_user
from src.config import settings
from src.db import get_db
from src.models import User
from src.services.chatkit import get_chatkit_server

router = APIRouter()

# OpenAI client for session management
_openai_client = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None


async def get_optional_user(
    authorization: Annotated[str | None, Header()] = None,
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Get current user if authenticated, None otherwise (for dev mode)."""
    if not authorization or not authorization.startswith("Bearer "):
        # In development, allow unauthenticated access
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


@router.post("/session")
async def create_chatkit_session(
    user: OptionalUser,
) -> dict[str, Any]:
    """
    Create a ChatKit client session.

    This generates a client_secret token that the frontend uses
    to authenticate with ChatKit.

    In development mode, allows unauthenticated access with a demo user.

    Returns:
        Dict with client_secret for ChatKit initialization
    """
    # Create a session token for ChatKit
    timestamp = str(int(time.time()))

    if user:
        # Authenticated user
        user_id = str(user.id)
    else:
        # Development mode: use demo user
        user_id = "demo-user"

    try:
        # Create a signed token for this session
        secret_base = f"{user_id}:{timestamp}:{settings.jwt_secret}"
        client_secret = hashlib.sha256(secret_base.encode()).hexdigest()[:32]

        return {
            "client_secret": client_secret,
            "user_id": user_id,
            "expires_in": 3600,  # 1 hour
        }
    except Exception:
        # Fallback: generate a random token
        return {
            "client_secret": secrets.token_hex(16),
            "user_id": user_id,
            "expires_in": 3600,
        }


@router.post("/respond")
async def chatkit_respond(
    request: Request,
    user: OptionalUser,
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
        context = {"user": user, "db": db}

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
    user: OptionalUser,
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
