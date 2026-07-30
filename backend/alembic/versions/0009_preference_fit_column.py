"""matches.f_preference_fit

Revision ID: 0009
Revises: 0008
Create Date: Sprint 7

preference_fit became the fifth scoring feature but had no column, so the stored
breakdown did not match the formula that produced the score. This closes that gap
so every feature in the score is inspectable in the database.
"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "0009"
down_revision: Union[str, None] = "0008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "matches",
        sa.Column("f_preference_fit", sa.Float, nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("matches", "f_preference_fit")
