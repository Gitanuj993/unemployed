"""matches.tier

Revision ID: 0007
Revises: 0006
Create Date: two-tier scoring
"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "0007"
down_revision: Union[str, None] = "0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "matches",
        sa.Column("tier", sa.String(20), nullable=False, server_default="estimated"),
    )
    # Rows that already have an extracted score are full-tier.
    op.execute(
        "UPDATE matches SET tier = 'full' "
        "WHERE job_id IN (SELECT job_id FROM job_requirements)"
    )


def downgrade() -> None:
    op.drop_column("matches", "tier")
