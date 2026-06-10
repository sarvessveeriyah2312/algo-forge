"""Backtest run endpoints."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, Query, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, verify_api_key
from app.schemas.backtest import BacktestRunCreate, BacktestRunList, BacktestRunResponse
from app.schemas.trade import TradeList
from app.services import backtest_service

router = APIRouter(
    prefix="/backtest",
    tags=["Backtest"],
    dependencies=[Depends(verify_api_key)],
)


@router.post(
    "/run",
    response_model=BacktestRunResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def run_backtest(
    data: BacktestRunCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> BacktestRunResponse:
    """Create a backtest run and queue it for background execution."""
    run = await backtest_service.create_backtest_run(db, data, background_tasks)
    return run


@router.get("/", response_model=BacktestRunList)
async def list_backtest_runs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    strategy_id: uuid.UUID | None = Query(None, description="Filter by strategy ID"),
    db: AsyncSession = Depends(get_db),
) -> BacktestRunList:
    """Return a paginated list of backtest runs."""
    runs, total = await backtest_service.list_backtest_runs(
        db, page=page, page_size=page_size, strategy_id=strategy_id
    )
    return BacktestRunList(items=runs, total=total, page=page, page_size=page_size)


@router.get("/{run_id}", response_model=BacktestRunResponse)
async def get_backtest_run(
    run_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> BacktestRunResponse:
    """Get a backtest run by ID."""
    run = await backtest_service.get_backtest_run(db, run_id)
    return run


@router.get("/{run_id}/trades", response_model=TradeList)
async def get_trades(
    run_id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
) -> TradeList:
    """Return paginated trades for a backtest run."""
    trades, total = await backtest_service.get_trades(db, run_id, page=page, page_size=page_size)
    return TradeList(items=trades, total=total, page=page, page_size=page_size)


@router.get("/{run_id}/equity-curve")
async def get_equity_curve(
    run_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    """Return the equity curve for a completed backtest run."""
    run = await backtest_service.get_backtest_run(db, run_id)
    return run.equity_curve or []


@router.get("/{run_id}/log", response_class=PlainTextResponse)
async def get_log(
    run_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> PlainTextResponse:
    """Return the text log output for a backtest run."""
    run = await backtest_service.get_backtest_run(db, run_id)
    log_text = run.log_output or "(no log available)"
    return PlainTextResponse(content=log_text, media_type="text/plain")


@router.delete("/{run_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
async def delete_backtest_run(
    run_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a backtest run and all its trades."""
    await backtest_service.delete_backtest_run(db, run_id)


@router.post("/{run_id}/cancel", response_model=BacktestRunResponse)
async def cancel_backtest_run(
    run_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> BacktestRunResponse:
    """Cancel a pending or running backtest run."""
    run = await backtest_service.cancel_backtest_run(db, run_id)
    return run
