"""project_ideas

Revision ID: 0010
Revises: 0009
Create Date: Sprint 7
"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "0010"
down_revision: Union[str, None] = "0009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "project_ideas",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column(
            "job_id", sa.Integer, sa.ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("title", sa.String(300), nullable=False, server_default=""),
        sa.Column("problem", sa.Text, nullable=False, server_default=""),
        sa.Column("what_to_build", sa.Text, nullable=False, server_default=""),
        sa.Column("why_it_impresses", sa.Text, nullable=False, server_default=""),
        sa.Column(
            "tech_stack",
            sa.dialects.postgresql.ARRAY(sa.String),
            nullable=False,
            server_default=sa.text("'{}'"),
        ),
        sa.Column(
            "covers_gaps",
            sa.dialects.postgresql.ARRAY(sa.String),
            nullable=False,
            server_default=sa.text("'{}'"),
        ),
        sa.Column("scope", sa.String(120), nullable=False, server_default=""),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_project_ideas_job_id", "project_ideas", ["job_id"])


def downgrade() -> None:
    op.drop_index("ix_project_ideas_job_id", table_name="project_ideas")
    op.drop_table("project_ideas")
