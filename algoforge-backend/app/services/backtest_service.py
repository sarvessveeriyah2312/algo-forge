"""Backtest service — creates runs, dispatches background tasks, saves results."""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import BackgroundTasks, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.engine.backtest_engine import BacktestConfig, BacktestEngine
from app.models.backtest import BacktestRun, BacktestStatusEnum
from app.models.strategy import Strategy
from app.models.trade import ExitReasonEnum, Trade, TradeDirectionEnum
from app.schemas.backtest import BacktestRunCreate
from app.services.mt5_service import mt5_service

logger = logging.getLogger(__name__)


async def create_backtest_run(
    db: AsyncSession,
    data: BacktestRunCreate,
    background_tasks: BackgroundTasks,
) -> BacktestRun:
    """Create a BacktestRun record and queue the background task."""
    # Verify strategy exists
    strat_result = await db.execute(select(Strategy).where(Strategy.id == data.strategy_id))
    strategy = strat_result.scalar_one_or_none()
    if strategy is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Strategy '{data.strategy_id}' not found.",
        )

    run = BacktestRun(
        id=uuid.uuid4(),
        strategy_id=data.strategy_id,
        instrument=data.instrument,
        timeframe=data.timeframe,
        date_from=data.date_from,
        date_to=data.date_to,
        initial_capital=data.initial_capital,
        spread=data.spread,
        commission=data.commission,
        slippage=data.slippage,
        status=BacktestStatusEnum.PENDING,
    )

    db.add(run)
    await db.commit()
    await db.refresh(run)

    # Build strategy dict for the background task (avoid lazy-loading issues)
    strategy_dict = {
        "id": str(strategy.id),
        "name": strategy.name,
        "instrument": strategy.instrument,
        "timeframe": strategy.timeframe,
        "direction": strategy.direction.value,
        "entry_conditions": strategy.entry_conditions or [],
        "exit_conditions": strategy.exit_conditions or [],
        "risk_per_trade": strategy.risk_per_trade,
        "max_daily_drawdown": strategy.max_daily_drawdown,
    }

    config_dict = {
        "initial_capital": data.initial_capital,
        "spread": data.spread,
        "commission": data.commission,
        "slippage": data.slippage,
        "instrument": data.instrument,
        "timeframe": data.timeframe,
        "date_from": data.date_from,
        "date_to": data.date_to,
    }

    background_tasks.add_task(
        _run_backtest_task,
        run_id=run.id,
        strategy=strategy_dict,
        config=config_dict,
    )

    return run


async def get_backtest_run(db: AsyncSession, run_id: uuid.UUID) -> BacktestRun:
    """Fetch a single BacktestRun by ID."""
    result = await db.execute(select(BacktestRun).where(BacktestRun.id == run_id))
    run = result.scalar_one_or_none()
    if run is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"BacktestRun '{run_id}' not found.",
        )
    return run


async def list_backtest_runs(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    strategy_id: Optional[uuid.UUID] = None,
) -> tuple[list[BacktestRun], int]:
    """Return paginated list of backtest runs."""
    query = select(BacktestRun)
    count_query = select(func.count()).select_from(BacktestRun)

    if strategy_id is not None:
        query = query.where(BacktestRun.strategy_id == strategy_id)
        count_query = count_query.where(BacktestRun.strategy_id == strategy_id)

    query = query.order_by(BacktestRun.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    count_result = await db.execute(count_query)
    return list(result.scalars().all()), count_result.scalar_one()


async def get_trades(
    db: AsyncSession,
    run_id: uuid.UUID,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[Trade], int]:
    """Return paginated list of trades for a backtest run."""
    # Verify run exists
    await get_backtest_run(db, run_id)

    query = (
        select(Trade)
        .where(Trade.backtest_run_id == run_id)
        .order_by(Trade.trade_number)
    )
    count_query = (
        select(func.count()).select_from(Trade).where(Trade.backtest_run_id == run_id)
    )
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    count_result = await db.execute(count_query)
    return list(result.scalars().all()), count_result.scalar_one()


async def delete_backtest_run(db: AsyncSession, run_id: uuid.UUID) -> bool:
    """Delete a backtest run and all its trades."""
    run = await get_backtest_run(db, run_id)
    await db.delete(run)
    await db.commit()
    return True


async def cancel_backtest_run(db: AsyncSession, run_id: uuid.UUID) -> BacktestRun:
    """Cancel a PENDING or RUNNING backtest run."""
    run = await get_backtest_run(db, run_id)
    if run.status not in (BacktestStatusEnum.PENDING, BacktestStatusEnum.RUNNING):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel a run with status '{run.status.value}'.",
        )
    run.status = BacktestStatusEnum.FAILED
    run.error_message = "Cancelled by user."
    run.completed_at = datetime.now(tz=timezone.utc)

    db.add(run)
    await db.commit()
    await db.refresh(run)
    return run


# ──────────────────────────────────────────────
# Background task
# ──────────────────────────────────────────────

async def _run_backtest_task(
    run_id: uuid.UUID,
    strategy: dict,
    config: dict,
) -> None:
    """
    Background task that executes the backtest.

    Opens its own DB session (cannot reuse the request session which is closed).
    """
    async with AsyncSessionLocal() as db:
        try:
            # ── Mark as RUNNING ──
            result = await db.execute(select(BacktestRun).where(BacktestRun.id == run_id))
            run = result.scalar_one_or_none()
            if run is None:
                logger.error("BacktestRun %s not found in background task.", run_id)
                return

            if run.status == BacktestStatusEnum.FAILED:
                logger.info("BacktestRun %s was cancelled, skipping.", run_id)
                return

            run.status = BacktestStatusEnum.RUNNING
            run.started_at = datetime.now(tz=timezone.utc)
            db.add(run)
            await db.commit()

            # ── Fetch OHLCV data ──
            from datetime import datetime as _dt
            date_from = config["date_from"]
            date_to = config["date_to"]

            # Convert date to datetime if needed
            if not isinstance(date_from, _dt):
                date_from = _dt.combine(date_from, _dt.min.time()).replace(tzinfo=timezone.utc)
            if not isinstance(date_to, _dt):
                date_to = _dt.combine(date_to, _dt.max.time()).replace(tzinfo=timezone.utc)

            ohlcv = await mt5_service.get_rates(
                symbol=config["instrument"],
                timeframe=config["timeframe"],
                date_from=date_from,
                date_to=date_to,
            )

            if ohlcv is None or len(ohlcv) == 0:
                raise ValueError("No OHLCV data returned for the specified date range.")

            logger.info(
                "BacktestRun %s: fetched %d bars for %s %s",
                run_id, len(ohlcv), config["instrument"], config["timeframe"],
            )

            # ── Run engine ──
            bt_config = BacktestConfig(
                initial_capital=config["initial_capital"],
                spread=config["spread"],
                commission=config["commission"],
                slippage=config["slippage"],
                risk_per_trade=strategy.get("risk_per_trade", 1.0),
                max_daily_drawdown=strategy.get("max_daily_drawdown", 5.0),
            )

            engine = BacktestEngine(strategy=strategy, ohlcv=ohlcv, config=bt_config)
            bt_result = engine.run()

            # ── Save trades ──
            trades_to_insert = []
            for tr in bt_result.trades:
                direction_enum = (
                    TradeDirectionEnum.LONG if tr.direction == "LONG" else TradeDirectionEnum.SHORT
                )
                exit_map = {
                    "TP": ExitReasonEnum.TP,
                    "SL": ExitReasonEnum.SL,
                    "SIGNAL": ExitReasonEnum.SIGNAL,
                    "EOD": ExitReasonEnum.EOD,
                }
                exit_enum = exit_map.get(tr.exit_reason, ExitReasonEnum.SIGNAL)

                # Ensure timezone-aware datetimes
                open_time = tr.open_time
                close_time = tr.close_time
                if hasattr(open_time, "tzinfo") and open_time.tzinfo is None:
                    open_time = open_time.replace(tzinfo=timezone.utc)
                if hasattr(close_time, "tzinfo") and close_time.tzinfo is None:
                    close_time = close_time.replace(tzinfo=timezone.utc)

                trade_obj = Trade(
                    id=uuid.uuid4(),
                    backtest_run_id=run_id,
                    trade_number=tr.trade_number,
                    open_time=open_time,
                    close_time=close_time,
                    instrument=tr.instrument,
                    direction=direction_enum,
                    entry_price=tr.entry_price,
                    exit_price=tr.exit_price,
                    stop_loss=tr.stop_loss,
                    take_profit=tr.take_profit,
                    lot_size=tr.lot_size,
                    pips=tr.pips,
                    profit=tr.profit,
                    running_balance=tr.running_balance,
                    exit_reason=exit_enum,
                )
                trades_to_insert.append(trade_obj)

            db.add_all(trades_to_insert)
            await db.commit()

            # ── Update run with stats ──
            run.status = BacktestStatusEnum.COMPLETED
            run.completed_at = datetime.now(tz=timezone.utc)
            run.net_profit = bt_result.net_profit
            run.total_trades = bt_result.total_trades
            run.win_rate = bt_result.win_rate
            run.profit_factor = bt_result.profit_factor
            run.max_drawdown = bt_result.max_drawdown
            run.sharpe_ratio = bt_result.sharpe_ratio
            run.expectancy = bt_result.expectancy
            run.equity_curve = bt_result.equity_curve
            run.log_output = "\n".join(bt_result.log_lines)
            run.error_message = None

            db.add(run)
            await db.commit()

            logger.info(
                "BacktestRun %s completed. Trades: %d | Net P&L: %.2f",
                run_id, bt_result.total_trades, bt_result.net_profit,
            )

        except Exception as exc:
            logger.error("BacktestRun %s failed: %s", run_id, exc, exc_info=True)
            try:
                async with AsyncSessionLocal() as err_db:
                    err_result = await err_db.execute(
                        select(BacktestRun).where(BacktestRun.id == run_id)
                    )
                    err_run = err_result.scalar_one_or_none()
                    if err_run:
                        err_run.status = BacktestStatusEnum.FAILED
                        err_run.error_message = str(exc)[:900]
                        err_run.completed_at = datetime.now(tz=timezone.utc)
                        err_db.add(err_run)
                        await err_db.commit()
            except Exception as inner_exc:
                logger.error(
                    "Failed to update BacktestRun %s with error status: %s",
                    run_id, inner_exc,
                )
