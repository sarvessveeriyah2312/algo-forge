"""Strategy CRUD + duplicate + MQL5 export endpoints."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CommonQueryParams, get_db, verify_api_key
from app.schemas.strategy import StrategyCreate, StrategyList, StrategyResponse, StrategyUpdate
from app.services import strategy_service
from app.services.mql5_generator import generate_ea

router = APIRouter(
    prefix="/strategies",
    tags=["Strategies"],
    dependencies=[Depends(verify_api_key)],
)


@router.get("/", response_model=StrategyList)
async def list_strategies(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    is_active: bool | None = Query(None, description="Filter by active status"),
    db: AsyncSession = Depends(get_db),
) -> StrategyList:
    """Return a paginated list of strategies."""
    strategies, total = await strategy_service.get_strategies(
        db, page=page, page_size=page_size, is_active=is_active
    )
    return StrategyList(items=strategies, total=total, page=page, page_size=page_size)


@router.post("/", response_model=StrategyResponse, status_code=status.HTTP_201_CREATED)
async def create_strategy(
    data: StrategyCreate,
    db: AsyncSession = Depends(get_db),
) -> StrategyResponse:
    """Create a new trading strategy."""
    strategy = await strategy_service.create_strategy(db, data)
    return strategy


@router.get("/{strategy_id}", response_model=StrategyResponse)
async def get_strategy(
    strategy_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> StrategyResponse:
    """Get a strategy by ID."""
    strategy = await strategy_service.get_strategy(db, strategy_id)
    return strategy


@router.put("/{strategy_id}", response_model=StrategyResponse)
async def update_strategy(
    strategy_id: uuid.UUID,
    data: StrategyUpdate,
    db: AsyncSession = Depends(get_db),
) -> StrategyResponse:
    """Update an existing strategy."""
    strategy = await strategy_service.update_strategy(db, strategy_id, data)
    return strategy


@router.delete("/{strategy_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
async def delete_strategy(
    strategy_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a strategy and all its associated backtest runs."""
    await strategy_service.delete_strategy(db, strategy_id)


@router.post("/{strategy_id}/duplicate", response_model=StrategyResponse, status_code=status.HTTP_201_CREATED)
async def duplicate_strategy(
    strategy_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> StrategyResponse:
    """Duplicate an existing strategy."""
    strategy = await strategy_service.duplicate_strategy(db, strategy_id)
    return strategy


@router.get("/{strategy_id}/export-mql5", response_class=PlainTextResponse)
async def export_mql5(
    strategy_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> PlainTextResponse:
    """Export a strategy as a compilable MQL5 Expert Advisor (.mq5) file."""
    strategy = await strategy_service.get_strategy(db, strategy_id)
    strategy_dict = {
        "id": str(strategy.id),
        "name": strategy.name,
        "description": strategy.description or "",
        "instrument": strategy.instrument,
        "timeframe": strategy.timeframe,
        "direction": strategy.direction.value,
        "session_filter": strategy.session_filter or [],
        "risk_per_trade": strategy.risk_per_trade,
        "max_daily_drawdown": strategy.max_daily_drawdown,
        "entry_conditions": strategy.entry_conditions or [],
        "exit_conditions": strategy.exit_conditions or [],
        "filters": strategy.filters or {},
    }
    ea_code = generate_ea(strategy_dict)
    return PlainTextResponse(
        content=ea_code,
        media_type="text/plain",
        headers={"Content-Disposition": f'attachment; filename="{strategy.name.replace(" ", "_")}.mq5"'},
    )
