"""Async CRUD operations for Strategy model."""
from __future__ import annotations

import copy
import uuid
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.strategy import Strategy
from app.schemas.strategy import StrategyCreate, StrategyUpdate


async def get_strategies(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    is_active: Optional[bool] = None,
) -> tuple[list[Strategy], int]:
    """Return paginated list of strategies and total count."""
    query = select(Strategy)
    count_query = select(func.count()).select_from(Strategy)

    if is_active is not None:
        query = query.where(Strategy.is_active == is_active)
        count_query = count_query.where(Strategy.is_active == is_active)

    query = query.order_by(Strategy.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    count_result = await db.execute(count_query)

    strategies = result.scalars().all()
    total = count_result.scalar_one()
    return list(strategies), total


async def get_strategy(db: AsyncSession, strategy_id: uuid.UUID) -> Strategy:
    """Fetch a single strategy by ID. Raises 404 if not found."""
    result = await db.execute(select(Strategy).where(Strategy.id == strategy_id))
    strategy = result.scalar_one_or_none()
    if strategy is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Strategy with id '{strategy_id}' not found.",
        )
    return strategy


async def create_strategy(db: AsyncSession, data: StrategyCreate) -> Strategy:
    """Create a new strategy."""
    strategy = Strategy(
        id=uuid.uuid4(),
        name=data.name,
        description=data.description,
        instrument=data.instrument,
        timeframe=data.timeframe,
        direction=data.direction,
        session_filter=data.session_filter,
        risk_per_trade=data.risk_per_trade,
        max_daily_drawdown=data.max_daily_drawdown,
        entry_conditions=data.entry_conditions,
        exit_conditions=data.exit_conditions,
        filters=data.filters,
        is_active=data.is_active,
    )
    db.add(strategy)
    await db.commit()
    await db.refresh(strategy)
    return strategy


async def update_strategy(
    db: AsyncSession,
    strategy_id: uuid.UUID,
    data: StrategyUpdate,
) -> Strategy:
    """Update an existing strategy. Raises 404 if not found."""
    strategy = await get_strategy(db, strategy_id)
    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(strategy, field, value)

    db.add(strategy)
    await db.commit()
    await db.refresh(strategy)
    return strategy


async def delete_strategy(db: AsyncSession, strategy_id: uuid.UUID) -> bool:
    """Delete a strategy. Returns True on success, raises 404 if not found."""
    strategy = await get_strategy(db, strategy_id)
    await db.delete(strategy)
    await db.commit()
    return True


async def duplicate_strategy(db: AsyncSession, strategy_id: uuid.UUID) -> Strategy:
    """Duplicate a strategy with a new name."""
    original = await get_strategy(db, strategy_id)
    new_strategy = Strategy(
        id=uuid.uuid4(),
        name=f"{original.name} (Copy)",
        description=original.description,
        instrument=original.instrument,
        timeframe=original.timeframe,
        direction=original.direction,
        session_filter=copy.deepcopy(original.session_filter),
        risk_per_trade=original.risk_per_trade,
        max_daily_drawdown=original.max_daily_drawdown,
        entry_conditions=copy.deepcopy(original.entry_conditions),
        exit_conditions=copy.deepcopy(original.exit_conditions),
        filters=copy.deepcopy(original.filters),
        is_active=original.is_active,
    )
    db.add(new_strategy)
    await db.commit()
    await db.refresh(new_strategy)
    return new_strategy
