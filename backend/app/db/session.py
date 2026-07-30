"""Database engine, session factory, and the declarative Base.

All ORM models inherit from `Base`. `get_db` is a FastAPI dependency that yields
a session per request and always closes it.
"""
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings

# `pool_pre_ping` quietly checks a connection is alive before using it, so a
# Postgres restart during dev doesn't hand us a dead connection.
engine = create_engine(settings.database_url, pool_pre_ping=True, future=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    """Base class for all ORM models."""


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency: yields a DB session, guarantees it is closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
