"""
Database seeder — inserts default indicators and strategies if the DB is empty.

Run standalone:
    python seed.py

Or called automatically on startup via main.py.
"""
from __future__ import annotations

import asyncio
import logging
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# Seed data definitions
# ──────────────────────────────────────────────

INDICATORS_SEED = [
    {
        "name": "EMA",
        "category": "TREND",
        "parameters": {"period": 20},
        "description": "Exponential Moving Average — weights recent prices more heavily.",
    },
    {
        "name": "SMA",
        "category": "TREND",
        "parameters": {"period": 50},
        "description": "Simple Moving Average — equal-weight average of closing prices.",
    },
    {
        "name": "VWAP",
        "category": "TREND",
        "parameters": {},
        "description": "Volume Weighted Average Price — intraday fair value reference.",
    },
    {
        "name": "Supertrend",
        "category": "TREND",
        "parameters": {"period": 10, "multiplier": 3.0},
        "description": "Supertrend — trend direction indicator based on ATR bands.",
    },
    {
        "name": "RSI",
        "category": "MOMENTUM",
        "parameters": {"period": 14},
        "description": "Relative Strength Index — momentum oscillator (0–100).",
    },
    {
        "name": "MACD",
        "category": "MOMENTUM",
        "parameters": {"fast": 12, "slow": 26, "signal": 9},
        "description": "Moving Average Convergence/Divergence — trend-following momentum indicator.",
    },
    {
        "name": "Stochastic",
        "category": "MOMENTUM",
        "parameters": {"k_period": 14, "d_period": 3},
        "description": "Stochastic Oscillator — compares closing price to high-low range.",
    },
    {
        "name": "CCI",
        "category": "MOMENTUM",
        "parameters": {"period": 20},
        "description": "Commodity Channel Index — measures deviation from average price.",
    },
    {
        "name": "Williams %R",
        "category": "MOMENTUM",
        "parameters": {"period": 14},
        "description": "Williams %R — momentum indicator similar to stochastic (%R scale).",
    },
    {
        "name": "ATR",
        "category": "VOLATILITY",
        "parameters": {"period": 14},
        "description": "Average True Range — measures market volatility.",
    },
    {
        "name": "Bollinger Bands",
        "category": "VOLATILITY",
        "parameters": {"period": 20, "std_dev": 2.0},
        "description": "Bollinger Bands — volatility bands around a moving average.",
    },
    {
        "name": "Keltner Channel",
        "category": "VOLATILITY",
        "parameters": {"period": 20, "multiplier": 2.0},
        "description": "Keltner Channel — ATR-based volatility bands around EMA.",
    },
    {
        "name": "OBV",
        "category": "VOLUME",
        "parameters": {},
        "description": "On-Balance Volume — cumulative volume flow indicator.",
    },
    {
        "name": "CMF",
        "category": "VOLUME",
        "parameters": {"period": 20},
        "description": "Chaikin Money Flow — measures buying/selling pressure using volume.",
    },
    {
        "name": "FVG Detector",
        "category": "ICT",
        "parameters": {"min_gap_pips": 1.0},
        "description": "Fair Value Gap detector — identifies imbalance zones in price action.",
    },
]

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
    from app.models.indicator import Indicator, IndicatorCategoryEnum
    from app.models.strategy import Strategy, DirectionEnum

    # ── Indicators ──
    ind_count_result = await db.execute(
        select(Indicator).limit(1)
    )
    existing_indicator = ind_count_result.scalar_one_or_none()

    if existing_indicator is None:
        logger.info("Seeding indicators...")
        indicators_to_add = []
        for data in INDICATORS_SEED:
            ind_obj = Indicator(
                id=uuid.uuid4(),
                name=data["name"],
                category=IndicatorCategoryEnum(data["category"]),
                parameters=data["parameters"],
                description=data.get("description"),
            )
            indicators_to_add.append(ind_obj)
        try:
            async with db.begin():
                for ind_obj in indicators_to_add:
                    db.add(ind_obj)
            logger.info("Seeded %d indicators.", len(INDICATORS_SEED))
        except Exception as exc:
            logger.warning("Indicator seed failed (may already exist): %s", exc)
    else:
        logger.info("Indicators table already has data — skipping indicator seed.")

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
