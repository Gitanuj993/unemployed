"""initial schema: candidate_profile + kb_chunks

Revision ID: 0001
Revises:
Create Date: Sprint 1
"""
from typing import Sequence, Union

import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Embedding dimension is pinned here on purpose: a migration is a point-in-time
# snapshot. If the model changes dimension later, that is a new migration.
EMBEDDING_DIM = 384


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.create_table(
        "candidate_profile",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(200), nullable=False, server_default=""),
        sa.Column("email", sa.String(200), nullable=False, server_default=""),
        sa.Column("phone", sa.String(50), nullable=False, server_default=""),
        sa.Column("location", sa.String(200), nullable=False, server_default=""),
        sa.Column(
            "links",
            sa.dialects.postgresql.JSONB,
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column("summary", sa.Text, nullable=False, server_default=""),
    )

    op.create_table(
        "kb_chunks",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("type", sa.String(40), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("context", sa.String(300), nullable=True),
        sa.Column("company", sa.String(200), nullable=True),
        sa.Column("date_range", sa.String(100), nullable=True),
        sa.Column("accomplishment", sa.Text, nullable=False),
        sa.Column(
            "technologies",
            sa.dialects.postgresql.ARRAY(sa.String),
            nullable=False,
            server_default=sa.text("'{}'"),
        ),
        sa.Column(
            "skills",
            sa.dialects.postgresql.ARRAY(sa.String),
            nullable=False,
            server_default=sa.text("'{}'"),
        ),
        sa.Column("impact", sa.Text, nullable=True),
        sa.Column("embedding", Vector(EMBEDDING_DIM), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    # No vector index yet: with a personal KB (tens of chunks) an exact
    # sequential scan is instant AND perfectly accurate. Add an HNSW index
    # later only if the KB grows enough to need it.


def downgrade() -> None:
    op.drop_table("kb_chunks")
    op.drop_table("candidate_profile")
    op.execute("DROP EXTENSION IF EXISTS vector")
