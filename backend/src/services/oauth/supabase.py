"""Supabase Auth Service for handling Google OAuth and other providers."""

from typing import Any

import httpx

from src.config import settings


class SupabaseAuthService:
    """Service for handling Supabase authentication."""

    def __init__(self) -> None:
        self.supabase_url = settings.supabase_url
        self.anon_key = settings.supabase_anon_key
        self.service_role_key = settings.supabase_service_role_key

    @property
    def auth_url(self) -> str:
        return f"{self.supabase_url}/auth/v1"

    def _get_headers(self, use_service_role: bool = False) -> dict[str, str]:
        """Get headers for Supabase API requests."""
        key = self.service_role_key if use_service_role else self.anon_key
        return {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        }

    async def get_user_from_token(self, access_token: str) -> dict[str, Any] | None:
        """Get user information from Supabase access token.

        Args:
            access_token: Supabase access token

        Returns:
            User data from Supabase or None if invalid
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.auth_url}/user",
                headers={
                    "apikey": self.anon_key,
                    "Authorization": f"Bearer {access_token}",
                },
            )

            if response.status_code != 200:
                return None

            return response.json()

    async def get_oauth_url(
        self,
        provider: str,
        redirect_to: str,
    ) -> str:
        """Get OAuth URL for a provider.

        Args:
            provider: OAuth provider (google, github, etc.)
            redirect_to: URL to redirect after authentication

        Returns:
            OAuth authorization URL
        """
        return (
            f"{self.supabase_url}/auth/v1/authorize"
            f"?provider={provider}"
            f"&redirect_to={redirect_to}"
        )

    async def exchange_code_for_session(
        self,
        code: str,
    ) -> dict[str, Any] | None:
        """Exchange auth code for session.

        Args:
            code: Authorization code from OAuth callback

        Returns:
            Session data including access_token and user
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.auth_url}/token?grant_type=pkce",
                headers=self._get_headers(),
                json={"auth_code": code},
            )

            if response.status_code != 200:
                return None

            return response.json()

    async def refresh_session(
        self,
        refresh_token: str,
    ) -> dict[str, Any] | None:
        """Refresh a session using refresh token.

        Args:
            refresh_token: Supabase refresh token

        Returns:
            New session data or None if invalid
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.auth_url}/token?grant_type=refresh_token",
                headers=self._get_headers(),
                json={"refresh_token": refresh_token},
            )

            if response.status_code != 200:
                return None

            return response.json()

    async def sign_out(self, access_token: str) -> bool:
        """Sign out a user.

        Args:
            access_token: User's access token

        Returns:
            True if successful
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.auth_url}/logout",
                headers={
                    "apikey": self.anon_key,
                    "Authorization": f"Bearer {access_token}",
                },
            )
            return response.status_code == 204


# Singleton instance
supabase_auth_service = SupabaseAuthService()
