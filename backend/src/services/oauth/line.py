"""LINE OAuth Service for handling LINE Login."""

import secrets
from urllib.parse import urlencode

import httpx

from src.config import settings
from src.schemas import LineProfile, LineTokenResponse


class LineOAuthService:
    """Service for handling LINE OAuth authentication."""

    AUTH_URL = "https://access.line.me/oauth2/v2.1/authorize"
    TOKEN_URL = "https://api.line.me/oauth2/v2.1/token"
    PROFILE_URL = "https://api.line.me/v2/profile"
    VERIFY_URL = "https://api.line.me/oauth2/v2.1/verify"

    def __init__(self) -> None:
        self.channel_id = settings.line_channel_id
        self.channel_secret = settings.line_channel_secret
        self.redirect_uri = settings.line_redirect_uri

    def get_auth_url(self, state: str | None = None) -> tuple[str, str]:
        """Generate LINE OAuth authorization URL.

        Returns:
            Tuple of (auth_url, state)
        """
        if not state:
            state = secrets.token_urlsafe(32)

        params = {
            "response_type": "code",
            "client_id": self.channel_id,
            "redirect_uri": self.redirect_uri,
            "state": state,
            "scope": "profile openid email",
        }

        auth_url = f"{self.AUTH_URL}?{urlencode(params)}"
        return auth_url, state

    async def exchange_code_for_token(self, code: str) -> LineTokenResponse:
        """Exchange authorization code for access token.

        Args:
            code: Authorization code from LINE callback

        Returns:
            LineTokenResponse with access token and other details
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": self.redirect_uri,
                    "client_id": self.channel_id,
                    "client_secret": self.channel_secret,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            response.raise_for_status()
            data = response.json()

            return LineTokenResponse(
                access_token=data["access_token"],
                token_type=data.get("token_type", "Bearer"),
                refresh_token=data.get("refresh_token"),
                expires_in=data["expires_in"],
                scope=data.get("scope"),
                id_token=data.get("id_token"),
            )

    async def get_user_profile(self, access_token: str) -> LineProfile:
        """Get user profile from LINE.

        Args:
            access_token: LINE access token

        Returns:
            LineProfile with user information
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.PROFILE_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            response.raise_for_status()
            data = response.json()

            return LineProfile(
                userId=data["userId"],
                displayName=data["displayName"],
                pictureUrl=data.get("pictureUrl"),
                statusMessage=data.get("statusMessage"),
            )

    async def verify_access_token(self, access_token: str) -> dict:
        """Verify LINE access token.

        Args:
            access_token: LINE access token to verify

        Returns:
            Token verification response
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.VERIFY_URL,
                params={"access_token": access_token},
            )
            response.raise_for_status()
            return response.json()


# Singleton instance
line_oauth_service = LineOAuthService()
