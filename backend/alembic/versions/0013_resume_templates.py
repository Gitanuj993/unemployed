"""resume_templates + resumes.latex

Revision ID: 0013
Revises: 0012
Create Date: Sprint 10 — tailor the user's own LaTeX resume
"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "0013"
down_revision: Union[str, None] = "0012"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "resume_templates",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(200), nullable=False, server_default=""),
        sa.Column("source", sa.Text, nullable=False),
        sa.Column("is_default", sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.add_column("resumes", sa.Column("latex", sa.Text, nullable=False, server_default=""))


def downgrade() -> None:
    op.drop_column("resumes", "latex")
    op.drop_table("resume_templates")
