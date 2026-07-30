"""job_requirements + job_embeddings + matches

Revision ID: 0003
Revises: 0002
Create Date: Sprint 3
"""
from typing import Sequence, Union

import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

from alembic import op

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Same dimension as kb_chunks: jobs and KB must share one vector space.
EMBEDDING_DIM = 384


def upgrade() -> None:
    op.create_table(
        "job_requirements",
        sa.Column(
            "job_id",
            sa.Integer,
            sa.ForeignKey("jobs.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column(
            "required_skills",
            sa.dialects.postgresql.ARRAY(sa.String),
            nullable=False,
            server_default=sa.text("'{}'"),
        ),
        sa.Column(
            "preferred_skills",
            sa.dialects.postgresql.ARRAY(sa.String),
            nullable=False,
            server_default=sa.text("'{}'"),
        ),
        sa.Column(
            "responsibilities",
            sa.dialects.postgresql.ARRAY(sa.String),
            nullable=False,
            server_default=sa.text("'{}'"),
        ),
        sa.Column("seniority", sa.String(40), nullable=False, server_default=""),
        sa.Column("min_years", sa.Integer, nullable=False, server_default="0"),
        sa.Column("confidence", sa.Float, nullable=False, server_default="0"),
        sa.Column("source_hash", sa.String(64), nullable=False, server_default=""),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )

    op.create_table(
        "job_embeddings",
        sa.Column(
            "job_id",
            sa.Integer,
            sa.ForeignKey("jobs.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("embedding", Vector(EMBEDDING_DIM), nullable=False),
        sa.Column("source_hash", sa.String(64), nullable=False, server_default=""),
    )

    op.create_table(
        "matches",
        sa.Column(
            "job_id",
            sa.Integer,
            sa.ForeignKey("jobs.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("score", sa.Float, nullable=False, server_default="0"),
        sa.Column("f_semantic", sa.Float, nullable=False, server_default="0"),
        sa.Column("f_keyword", sa.Float, nullable=False, server_default="0"),
        sa.Column("f_required_cov", sa.Float, nullable=False, server_default="0"),
        sa.Column("f_preferred_cov", sa.Float, nullable=False, server_default="0"),
        sa.Column("confidence", sa.Float, nullable=False, server_default="0"),
        sa.Column("hard_filtered", sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("filter_reason", sa.String(200), nullable=False, server_default=""),
        sa.Column(
            "why",
            sa.dialects.postgresql.JSONB,
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column(
            "computed_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_matches_score", "matches", ["score"])


def downgrade() -> None:
    op.drop_index("ix_matches_score", table_name="matches")
    op.drop_table("matches")
    op.drop_table("job_embeddings")
    op.drop_table("job_requirements")
