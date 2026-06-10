"""Async CRUD operations for Indicator model."""
from __future__ import annotations

import uuid
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.indicator import Indicator, IndicatorCategoryEnum
from app.schemas.indicator import IndicatorCreate


async def get_indicators(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    category: Optional[IndicatorCategoryEnum] = None,
) -> tuple[list[Indicator], int]:
    """Return paginated list of indicators and total count."""
    query = select(Indicator)
    count_query = select(func.count()).select_from(Indicator)

    if category is not None:
        query = query.where(Indicator.category == category)
        count_query = count_query.where(Indicator.category == category)

    query = query.order_by(Indicator.name)
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    count_result = await db.execute(count_query)

    indicators = result.scalars().all()
    total = count_result.scalar_one()
    return list(indicators), total


async def get_indicator(db: AsyncSession, indicator_id: uuid.UUID) -> Indicator:
    """Fetch a single indicator by ID. Raises 404 if not found."""
    result = await db.execute(select(Indicator).where(Indicator.id == indicator_id))
    indicator = result.scalar_one_or_none()
    if indicator is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Indicator with id '{indicator_id}' not found.",
        )
    return indicator


async def create_indicator(db: AsyncSession, data: IndicatorCreate) -> Indicator:
    """Create a new indicator."""
    indicator = Indicator(
        id=uuid.uuid4(),
        name=data.name,
        category=data.category,
        parameters=data.parameters,
        description=data.description,
    )
    db.add(indicator)
    await db.commit()
    await db.refresh(indicator)
    return indicator


async def get_categories(db: AsyncSession) -> list[dict]:
    """Return list of {category, count} dicts."""
    query = (
        select(Indicator.category, func.count(Indicator.id).label("count"))
        .group_by(Indicator.category)
        .order_by(Indicator.category)
    )
    result = await db.execute(query)
    rows = result.all()
    return [{"category": row.category.value, "count": row.count} for row in rows]
