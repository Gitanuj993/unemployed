"""jobs + ingestion_runs

Revision ID: 0002
Revises: 0001
Create Date: Sprint 2
"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "jobs",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("source", sa.String(40), nullable=False),
        sa.Column("external_id", sa.String(200), nullable=False),
        sa.Column("company", sa.String(200), nullable=False),
        sa.Column("title", sa.String(400), nullable=False),
        sa.Column("location", sa.String(300), nullable=False, server_default=""),
        sa.Column("remote", sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("description", sa.Text, nullable=False, server_default=""),
        sa.Column("apply_url", sa.String(1000), nullable=False, server_default=""),
        sa.Column("posted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "first_seen", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")
        ),
        sa.Column(
            "last_seen", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")
        ),
        sa.Column("status", sa.String(20), nullable=False, server_default="active"),
        sa.Column("content_hash", sa.String(64), nullable=False, server_default=""),
        sa.Column("fingerprint", sa.String(64), nullable=False, server_default=""),
        sa.UniqueConstraint("source", "external_id", name="uq_jobs_source_external_id"),
    )
    op.create_index("ix_jobs_status_posted_at", "jobs", ["status", "posted_at"])
    op.create_index("ix_jobs_fingerprint", "jobs", ["fingerprint"])

    op.create_table(
        "ingestion_runs",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("source", sa.String(40), nullable=False),
        sa.Column("company", sa.String(200), nullable=False, server_default=""),
        sa.Column(
            "started_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")
        ),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("jobs_seen", sa.Integer, nullable=False, server_default="0"),
        sa.Column("jobs_new", sa.Integer, nullable=False, server_default="0"),
        sa.Column("jobs_updated", sa.Integer, nullable=False, server_default="0"),
        sa.Column("jobs_expired", sa.Integer, nullable=False, server_default="0"),
        sa.Column("ok", sa.Boolean, nullable=False, server_default=sa.text("true")),
        sa.Column("error", sa.Text, nullable=True),
    )


def downgrade() -> None:
    op.drop_table("ingestion_runs")
    op.drop_index("ix_jobs_fingerprint", table_name="jobs")
    op.drop_index("ix_jobs_status_posted_at", table_name="jobs")
    op.drop_table("jobs")
