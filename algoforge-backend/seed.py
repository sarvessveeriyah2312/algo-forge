"""
Database seeder — inserts default indicators and strategies if the DB is empty.

Run standalone:
    python seed.py

Or called automatically on startup via main.py.
"""
from __future__ import annotations

import asyncio
import logging

from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

STRATEGIES_SEED = [
    {
        "name": "RSI Mean Reversion",
        "description": "Buy oversold, sell overbought using RSI on XAUUSD H1.",
        "instrument": "XAUUSD",
        "timeframe": "H1",
        "direction": "BOTH",
        "session_filter": [],
        "risk_per_trade": 1.0,
        "max_daily_drawdown": 5.0,
        "entry_conditions": [
            {
                "indicator": "RSI",
                "params": {"period": 14},
                "operator": "LESS_THAN",
                "value": 30,
                "logic": "AND",
            }
        ],
        "exit_conditions": [
            {
                "indicator": "RSI",
                "params": {"period": 14},
                "operator": "GREATER_THAN",
                "value": 70,
                "logic": "AND",
            }
        ],
        "filters": {},
        "is_active": True,
    },
    {
        "name": "EMA Crossover + ATR Filter",
        "description": "Enter on EMA 50/200 crossover with ATR volatility confirmation on EURUSD H4.",
        "instrument": "EURUSD",
        "timeframe": "H4",
        "direction": "BOTH",
        "session_filter": ["London", "NewYork"],
        "risk_per_trade": 1.0,
        "max_daily_drawdown": 5.0,
        "entry_conditions": [
            {
                "indicator": "EMA",
                "params": {"period": 50},
                "operator": "CROSS_ABOVE",
                "target": "EMA",
                "target_params": {"period": 200},
                "logic": "AND",
            },
            {
                "indicator": "ATR",
                "params": {"period": 14},
                "operator": "GREATER_THAN",
                "value": 0.0005,
                "logic": "AND",
            },
        ],
        "exit_conditions": [
            {
                "indicator": "EMA",
                "params": {"period": 50},
                "operator": "CROSS_BELOW",
                "target": "EMA",
                "target_params": {"period": 200},
                "logic": "AND",
            }
        ],
        "filters": {"min_atr": 0.0005},
        "is_active": True,
    },
    {
        "name": "ICT FVG Retracement",
        "description": "Trade Fair Value Gap retraceme nts on XAUUSD M15 using ICT concepts.",
        "instrument": "XAUUSD",
        "timeframe": "M15",
        "direction": "BOTH",
        "session_filter": ["London", "NewYork"],
        "risk_per_trade": 0.5,
        "max_daily_drawdown": 3.0,
        "entry_conditions": [
            {
                "indicator": "FVG",
                "params": {"min_gap_pips": 1.0},
                "operator": "EQUALS",
                "value": 1,
                "logic": "AND",
            },
            {
                "indicator": "RSI",
                "params": {"period": 14},
                "operator": "BETWEEN",
                "value": [40, 60],
                "logic": "AND",
            },
        ],
        "exit_conditions": [
            {
                "indicator": "RSI",
                "params": {"period": 14},
                "operator": "GREATER_THAN",
                "value": 70,
                "logic": "OR",
            },
            {
                "indicator": "RSI",
                "params": {"period": 14},
                "operator": "LESS_THAN",
                "value": 30,
                "logic": "OR",
            },
        ],
        "filters": {"session": ["London", "NewYork"]},
        "is_active": True,
    },
]


# ──────────────────────────────────────────────
# Seeder function
# ──────────────────────────────────────────────

async def seed_database(db: AsyncSession) -> None:
    """
    Seed the database with default indicators and strategies.
    Only inserts if the tables are empty.
    """
    from app.models.strategy import Strategy, DirectionEnum

    # ── Indicators ── (handled by indicator_service.seed_indicators via init_db)
    from app.services.indicator_service import seed_indicators
    await seed_indicators(db)
    logger.info("Indicator seed delegated to indicator_service.")

    # ── Strategies ──
    strat_count_result = await db.execute(
        select(Strategy).limit(1)
    )
    existing_strategy = strat_count_result.scalar_one_or_none()

    if existing_strategy is None:
        logger.info("Seeding strategies...")
        strategies_to_add = []
        for data in STRATEGIES_SEED:
            strat_obj = Strategy(
                id=uuid.uuid4(),
                name=data["name"],
                description=data.get("description"),
                instrument=data["instrument"],
                timeframe=data["timeframe"],
                direction=DirectionEnum(data["direction"]),
                session_filter=data.get("session_filter", []),
                risk_per_trade=data["risk_per_trade"],
                max_daily_drawdown=data["max_daily_drawdown"],
                entry_conditions=data["entry_conditions"],
                exit_conditions=data["exit_conditions"],
                filters=data.get("filters", {}),
                is_active=data.get("is_active", True),
            )
            strategies_to_add.append(strat_obj)
        try:
            async with db.begin():
                for strat_obj in strategies_to_add:
                    db.add(strat_obj)
            logger.info("Seeded %d strategies.", len(STRATEGIES_SEED))
        except Exception as exc:
            logger.warning("Strategy seed failed (may already exist): %s", exc)
    else:
        logger.info("Strategies table already has data — skipping strategy seed.")


# ──────────────────────────────────────────────
# Standalone runner
# ──────────────────────────────────────────────

async def _main() -> None:
    """Run seed as a standalone script."""
    logging.basicConfig(level=logging.INFO)
    from app.core.database import AsyncSessionLocal, init_db
    await init_db()
    async with AsyncSessionLocal() as db:
        await seed_database(db)


if __name__ == "__main__":
    asyncio.run(_main())
