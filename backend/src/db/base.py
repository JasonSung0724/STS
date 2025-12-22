"""SQLAlchemy declarative base.

This module contains only the Base class to avoid circular imports
and prevent engine creation when importing Base for migrations.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """SQLAlchemy declarative base."""

    pass
