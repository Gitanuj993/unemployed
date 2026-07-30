"""preferences.region + companies table

Revision ID: 0011
Revises: 0010
Create Date: generalization for other regions and arbitrary companies
"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "0011"
down_revision: Union[str, None] = "0010"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "preferences",
        sa.Column("region", sa.String(20), nullable=False, server_default="india"),
    )

    op.create_table(
        "companies",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("source", sa.String(40), nullable=False),
        sa.Column("token", sa.String(200), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("matched_jobs", sa.Integer, nullable=False, server_default="0"),
        sa.Column("enabled", sa.Boolean, nullable=False, server_default=sa.text("true")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.UniqueConstraint("source", "token", name="uq_companies_source_token"),
    )


def downgrade() -> None:
    op.drop_table("companies")
    op.drop_column("preferences", "region")
