"""Indicator CRUD endpoints."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, verify_api_key
from app.models.indicator import IndicatorCategoryEnum
from app.schemas.indicator import IndicatorCreate, IndicatorList, IndicatorResponse
from app.services import indicator_service

router = APIRouter(
    prefix="/indicators",
    tags=["Indicators"],
    dependencies=[Depends(verify_api_key)],
)


@router.get("/categories")
async def get_categories(
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    """Return indicator categories with counts.

    NOTE: This route MUST be declared before /{indicator_id} to avoid UUID
    parsing errors when the literal string 'categories' is passed.
    """
    categories = await indicator_service.get_categories(db)
    return categories


@router.get("/", response_model=IndicatorList)
async def list_indicators(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: IndicatorCategoryEnum | None = Query(None, description="Filter by category"),
    db: AsyncSession = Depends(get_db),
) -> IndicatorList:
    """Return a paginated list of indicators."""
    indicators, total = await indicator_service.get_indicators(
        db, page=page, page_size=page_size, category=category
    )
    return IndicatorList(items=indicators, total=total, page=page, page_size=page_size)


@router.get("/{indicator_id}", response_model=IndicatorResponse)
async def get_indicator(
    indicator_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> IndicatorResponse:
    """Get an indicator by ID."""
    indicator = await indicator_service.get_indicator(db, indicator_id)
    return indicator


@router.post("/", response_model=IndicatorResponse, status_code=status.HTTP_201_CREATED)
async def create_indicator(
    data: IndicatorCreate,
    db: AsyncSession = Depends(get_db),
) -> IndicatorResponse:
    """Create a new indicator definition."""
    indicator = await indicator_service.create_indicator(db, data)
    return indicator
