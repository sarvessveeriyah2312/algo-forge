"""Results aggregation, comparison, and export endpoints."""
from __future__ import annotations

import csv
import io
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, verify_api_key
from app.models.backtest import BacktestRun, BacktestStatusEnum
from app.models.trade import Trade

router = APIRouter(
    prefix="/results",
    tags=["Results"],
    dependencies=[Depends(verify_api_key)],
)


@router.get("/summary")
async def get_summary(
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Return aggregate statistics across all completed backtest runs."""
    query = select(BacktestRun).where(BacktestRun.status == BacktestStatusEnum.COMPLETED)
    result = await db.execute(query)
    runs = result.scalars().all()

    if not runs:
        return {
            "total_runs": 0,
            "total_trades": 0,
            "avg_net_profit": 0.0,
            "avg_win_rate": 0.0,
            "avg_profit_factor": 0.0,
            "avg_max_drawdown": 0.0,
            "avg_sharpe_ratio": 0.0,
            "best_run_id": None,
            "worst_run_id": None,
        }

    total_trades = sum(r.total_trades or 0 for r in runs)
    net_profits = [r.net_profit or 0.0 for r in runs]
    win_rates = [r.win_rate or 0.0 for r in runs if r.win_rate is not None]
    profit_factors = [r.profit_factor or 0.0 for r in runs if r.profit_factor is not None]
    max_drawdowns = [r.max_drawdown or 0.0 for r in runs if r.max_drawdown is not None]
    sharpe_ratios = [r.sharpe_ratio or 0.0 for r in runs if r.sharpe_ratio is not None]

    n = len(runs)
    best_run = max(runs, key=lambda r: r.net_profit or 0.0, default=None)
    worst_run = min(runs, key=lambda r: r.net_profit or 0.0, default=None)

    return {
        "total_runs": n,
        "total_trades": total_trades,
        "avg_net_profit": round(sum(net_profits) / n, 2) if n else 0.0,
        "avg_win_rate": round(sum(win_rates) / len(win_rates), 2) if win_rates else 0.0,
        "avg_profit_factor": round(sum(profit_factors) / len(profit_factors), 2) if profit_factors else 0.0,
        "avg_max_drawdown": round(sum(max_drawdowns) / len(max_drawdowns), 2) if max_drawdowns else 0.0,
        "avg_sharpe_ratio": round(sum(sharpe_ratios) / len(sharpe_ratios), 2) if sharpe_ratios else 0.0,
        "best_run_id": str(best_run.id) if best_run else None,
        "worst_run_id": str(worst_run.id) if worst_run else None,
    }


@router.get("/compare")
async def compare_runs(
    ids: list[uuid.UUID] = Query(..., description="List of BacktestRun UUIDs to compare"),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    """Return side-by-side stats for a list of backtest run IDs."""
    if not ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one run ID must be provided.",
        )

    query = select(BacktestRun).where(BacktestRun.id.in_(ids))
    result = await db.execute(query)
    runs = result.scalars().all()

    run_map = {run.id: run for run in runs}
    comparison = []
    for run_id in ids:
        run = run_map.get(run_id)
        if run is None:
            comparison.append({"run_id": str(run_id), "error": "Not found"})
            continue
        comparison.append({
            "run_id": str(run.id),
            "strategy_id": str(run.strategy_id),
            "instrument": run.instrument,
            "timeframe": run.timeframe,
            "date_from": run.date_from.isoformat() if run.date_from else None,
            "date_to": run.date_to.isoformat() if run.date_to else None,
            "initial_capital": run.initial_capital,
            "status": run.status.value,
            "net_profit": run.net_profit,
            "total_trades": run.total_trades,
            "win_rate": run.win_rate,
            "profit_factor": run.profit_factor,
            "max_drawdown": run.max_drawdown,
            "sharpe_ratio": run.sharpe_ratio,
            "expectancy": run.expectancy,
            "created_at": run.created_at.isoformat() if run.created_at else None,
            "completed_at": run.completed_at.isoformat() if run.completed_at else None,
        })

    return comparison


@router.get("/export/{run_id}")
async def export_trades_csv(
    run_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    """Stream all trades for a backtest run as a CSV file."""
    # Verify run exists
    run_result = await db.execute(select(BacktestRun).where(BacktestRun.id == run_id))
    run = run_result.scalar_one_or_none()
    if run is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"BacktestRun '{run_id}' not found.",
        )

    trades_result = await db.execute(
        select(Trade)
        .where(Trade.backtest_run_id == run_id)
        .order_by(Trade.trade_number)
    )
    trades = trades_result.scalars().all()

    # Build CSV in memory
    output = io.StringIO()
    fieldnames = [
        "trade_number", "open_time", "close_time", "instrument", "direction",
        "entry_price", "exit_price", "stop_loss", "take_profit",
        "lot_size", "pips", "profit", "running_balance", "exit_reason",
    ]
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()

    for trade in trades:
        writer.writerow({
            "trade_number": trade.trade_number,
            "open_time": trade.open_time.isoformat() if trade.open_time else "",
            "close_time": trade.close_time.isoformat() if trade.close_time else "",
            "instrument": trade.instrument,
            "direction": trade.direction.value,
            "entry_price": trade.entry_price,
            "exit_price": trade.exit_price,
            "stop_loss": trade.stop_loss or "",
            "take_profit": trade.take_profit or "",
            "lot_size": trade.lot_size,
            "pips": trade.pips,
            "profit": trade.profit,
            "running_balance": trade.running_balance,
            "exit_reason": trade.exit_reason.value,
        })

    output.seek(0)
    filename = f"trades_run_{run_id}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
