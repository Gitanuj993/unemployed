"""preferences

Revision ID: 0006
Revises: 0005
Create Date: Sprint 5.5 (filtering)
"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "0006"
down_revision: Union[str, None] = "0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "preferences",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("max_years", sa.Integer, nullable=False, server_default="1"),
        sa.Column(
            "allowed_seniority",
            sa.dialects.postgresql.ARRAY(sa.String),
            nullable=False,
            server_default=sa.text("'{intern,entry}'"),
        ),
        sa.Column(
            "role_families",
            sa.dialects.postgresql.ARRAY(sa.String),
            nullable=False,
            server_default=sa.text("'{software,ai_ml,data,devops}'"),
        ),
    )


def downgrade() -> None:
    op.drop_table("preferences")
