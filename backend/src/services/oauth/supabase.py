"""Supabase Auth Service for handling all authentication providers.

This service provides unified authentication through Supabase Auth:
- Email/Password registration and login
- Google OAuth (native Supabase provider)
- LINE OAuth (custom implementation that creates Supabase users)
"""

from typing import Any

import httpx

from src.config import settings


class SupabaseAuthService:
    """Service for handling Supabase authentication.

    All users are managed through Supabase Auth for unified user management.
    """

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

    # =========================================
    # Email/Password Authentication
    # =========================================

    async def sign_up_with_email(
        self,
        email: str,
        password: str,
        user_metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Register a new user with email and password.

        Args:
            email: User's email address
            password: User's password
            user_metadata: Additional user data (name, company, etc.)

        Returns:
            User data including id, email, and session tokens

        Raises:
            ValueError: If registration fails
        """
        async with httpx.AsyncClient() as client:
            payload: dict[str, Any] = {
                "email": email,
                "password": password,
            }
            if user_metadata:
                payload["data"] = user_metadata

            response = await client.post(
                f"{self.auth_url}/signup",
                headers=self._get_headers(),
                json=payload,
            )

            if response.status_code not in (200, 201):
                error_data = response.json()
                raise ValueError(error_data.get("msg", "Registration failed"))

            return response.json()

    async def sign_in_with_email(
        self,
        email: str,
        password: str,
    ) -> dict[str, Any] | None:
        """Sign in a user with email and password.

        Args:
            email: User's email address
            password: User's password

        Returns:
            Session data including access_token, refresh_token, and user
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.auth_url}/token?grant_type=password",
                headers=self._get_headers(),
                json={
                    "email": email,
                    "password": password,
                },
            )

            if response.status_code != 200:
                return None

            return response.json()

    # =========================================
    # Admin API (requires service_role_key)
    # =========================================

    async def admin_create_user(
        self,
        email: str | None = None,
        password: str | None = None,
        user_metadata: dict[str, Any] | None = None,
        app_metadata: dict[str, Any] | None = None,
        email_confirm: bool = True,
    ) -> dict[str, Any]:
        """Create a user using Admin API (for OAuth providers like LINE).

        This bypasses email confirmation and creates the user directly.

        Args:
            email: User's email (optional for OAuth users)
            password: Password (optional, will be auto-generated if not provided)
            user_metadata: User profile data (name, avatar_url, etc.)
            app_metadata: App-specific metadata (provider info, etc.)
            email_confirm: Whether to mark email as confirmed

        Returns:
            Created user data

        Raises:
            ValueError: If user creation fails
        """
        async with httpx.AsyncClient() as client:
            payload: dict[str, Any] = {
                "email_confirm": email_confirm,
            }
            if email:
                payload["email"] = email
            if password:
                payload["password"] = password
            if user_metadata:
                payload["user_metadata"] = user_metadata
            if app_metadata:
                payload["app_metadata"] = app_metadata

            response = await client.post(
                f"{self.auth_url}/admin/users",
                headers=self._get_headers(use_service_role=True),
                json=payload,
            )

            if response.status_code not in (200, 201):
                error_data = response.json()
                raise ValueError(error_data.get("msg", "Failed to create user"))

            return response.json()

    async def admin_get_user_by_id(self, user_id: str) -> dict[str, Any] | None:
        """Get user by Supabase user ID using Admin API.

        Args:
            user_id: Supabase user ID

        Returns:
            User data or None if not found
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.auth_url}/admin/users/{user_id}",
                headers=self._get_headers(use_service_role=True),
            )

            if response.status_code != 200:
                return None

            return response.json()

    async def admin_get_user_by_email(self, email: str) -> dict[str, Any] | None:
        """Get user by email using Admin API.

        Args:
            email: User's email address

        Returns:
            User data or None if not found
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.auth_url}/admin/users",
                headers=self._get_headers(use_service_role=True),
                params={"filter": f"email eq '{email}'"},
            )

            if response.status_code != 200:
                return None

            data = response.json()
            users = data.get("users", [])
            return users[0] if users else None

    async def admin_update_user(
        self,
        user_id: str,
        user_metadata: dict[str, Any] | None = None,
        app_metadata: dict[str, Any] | None = None,
        email: str | None = None,
        password: str | None = None,
    ) -> dict[str, Any] | None:
        """Update user using Admin API.

        Args:
            user_id: Supabase user ID
            user_metadata: User profile data to update
            app_metadata: App-specific metadata to update
            email: New email (optional)
            password: New password (optional)

        Returns:
            Updated user data
        """
        async with httpx.AsyncClient() as client:
            payload: dict[str, Any] = {}
            if user_metadata:
                payload["user_metadata"] = user_metadata
            if app_metadata:
                payload["app_metadata"] = app_metadata
            if email:
                payload["email"] = email
            if password:
                payload["password"] = password

            response = await client.put(
                f"{self.auth_url}/admin/users/{user_id}",
                headers=self._get_headers(use_service_role=True),
                json=payload,
            )

            if response.status_code != 200:
                return None

            return response.json()

    async def admin_generate_link(
        self,
        email: str,
        link_type: str = "magiclink",
        password: str | None = None,
    ) -> dict[str, Any] | None:
        """Generate auth link for user (magic link, recovery, etc.).

        Args:
            email: User's email
            link_type: Type of link (magiclink, recovery, signup, invite)
            password: Password for signup link type

        Returns:
            Link data including the generated URL
        """
        async with httpx.AsyncClient() as client:
            payload: dict[str, Any] = {
                "email": email,
                "type": link_type,
            }
            if password and link_type == "signup":
                payload["password"] = password

            response = await client.post(
                f"{self.auth_url}/admin/generate_link",
                headers=self._get_headers(use_service_role=True),
                json=payload,
            )

            if response.status_code != 200:
                return None

            return response.json()

    # =========================================
    # Token & Session Management
    # =========================================

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
        use_public_url: bool = True,
    ) -> str:
        """Get OAuth URL for a provider.

        Args:
            provider: OAuth provider (google, github, etc.)
            redirect_to: URL to redirect after authentication
            use_public_url: Use public URL for browser redirects (default True)

        Returns:
            OAuth authorization URL
        """
        # Use public URL for browser redirects, internal URL for API calls
        base_url = settings.supabase_browser_url if use_public_url else self.supabase_url
        return (
            f"{base_url}/auth/v1/authorize"
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
