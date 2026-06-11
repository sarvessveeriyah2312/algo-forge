"""add_missing_backtest_stats_columns

Revision ID: a369190e3b57
Revises:
Create Date: 2026-06-11 11:35:46.227007+00:00

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a369190e3b57'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('backtest_runs', sa.Column('winning_trades', sa.Integer(), nullable=True))
    op.add_column('backtest_runs', sa.Column('losing_trades', sa.Integer(), nullable=True))
    op.add_column('backtest_runs', sa.Column('max_drawdown_pct', sa.Float(), nullable=True))
    op.add_column('backtest_runs', sa.Column('avg_trade_duration', sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column('backtest_runs', 'avg_trade_duration')
    op.drop_column('backtest_runs', 'max_drawdown_pct')
    op.drop_column('backtest_runs', 'losing_trades')
    op.drop_column('backtest_runs', 'winning_trades')
