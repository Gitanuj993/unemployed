"""contacts + profile.college + preference locations

Revision ID: 0008
Revises: 0007
Create Date: Sprint 6 (outreach)
"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "0008"
down_revision: Union[str, None] = "0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "candidate_profile",
        sa.Column("college", sa.String(200), nullable=False, server_default=""),
    )
    op.add_column(
        "preferences",
        sa.Column(
            "preferred_locations",
            sa.dialects.postgresql.ARRAY(sa.String),
            nullable=False,
            server_default=sa.text("'{}'"),
        ),
    )
    op.add_column(
        "preferences",
        sa.Column("remote_ok", sa.Boolean, nullable=False, server_default=sa.text("true")),
    )

    op.create_table(
        "contacts",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column(
            "job_id", sa.Integer, sa.ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("category", sa.String(30), nullable=False),
        sa.Column("label", sa.String(120), nullable=False, server_default=""),
        sa.Column("search_url", sa.String(1000), nullable=False, server_default=""),
        sa.Column("draft", sa.Text, nullable=False, server_default=""),
        sa.Column("name", sa.String(200), nullable=False, server_default=""),
        sa.Column("profile_url", sa.String(1000), nullable=False, server_default=""),
        sa.Column("status", sa.String(20), nullable=False, server_default="todo"),
        sa.Column("notes", sa.Text, nullable=False, server_default=""),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_contacts_job_id", "contacts", ["job_id"])


def downgrade() -> None:
    op.drop_index("ix_contacts_job_id", table_name="contacts")
    op.drop_table("contacts")
    op.drop_column("preferences", "remote_ok")
    op.drop_column("preferences", "preferred_locations")
    op.drop_column("candidate_profile", "college")
