"""Async CRUD operations and seeding for Indicator model."""
from __future__ import annotations

import uuid
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.indicator import Indicator, IndicatorCategoryEnum
from app.schemas.indicator import IndicatorCreate, IndicatorPublicResponse

# ── Seed data ────────────────────────────────────────────────────────────────
# Mirrors INDICATORS_METADATA from the frontend — single source of truth.

_T  = IndicatorCategoryEnum.TREND
_M  = IndicatorCategoryEnum.MOMENTUM
_V  = IndicatorCategoryEnum.VOLATILITY
_VO = IndicatorCategoryEnum.VOLUME
_I  = IndicatorCategoryEnum.ICT

INDICATOR_SEED: list[dict] = [
    # ── Trend ────────────────────────────────────────────────────────────────
    {
        "slug": "ema", "name": "Exponential Moving Average (EMA)", "category": _T, "sort_order": 10,
        "description": "Calculates the exponential moving average of price over a specific window of trading periods, giving more weight to recent prices.",
        "parameters": [
            {"key": "period", "name": "Period", "type": "number", "default": 20},
            {"key": "source", "name": "Source", "type": "select", "default": "close", "options": ["close", "open", "high", "low", "hl2", "hlc3", "ohlc4"]},
        ],
    },
    {
        "slug": "sma", "name": "Simple Moving Average (SMA)", "category": _T, "sort_order": 11,
        "description": "An arithmetic moving average calculated by adding recent closing prices and then dividing by the number of time periods.",
        "parameters": [
            {"key": "period", "name": "Period", "type": "number", "default": 50},
            {"key": "source", "name": "Source", "type": "select", "default": "close", "options": ["close", "open", "high", "low"]},
        ],
    },
    {
        "slug": "vwap", "name": "Volume Weighted Average Price (VWAP)", "category": _T, "sort_order": 12,
        "description": "Provides the average price a security has traded at throughout the day, based on both volume and price.",
        "parameters": [
            {"key": "anchor", "name": "Anchor Period", "type": "select", "default": "Session", "options": ["Session", "Week", "Month", "Year"]},
        ],
    },
    {
        "slug": "supertrend", "name": "Supertrend", "category": _T, "sort_order": 13,
        "description": "A trend-following indicator based on Average True Range (ATR) that overlays buy and sell labels on the price action.",
        "parameters": [
            {"key": "atrPeriod", "name": "ATR Period", "type": "number", "default": 10},
            {"key": "multiplier", "name": "Multiplier", "type": "number", "default": 3},
        ],
    },
    {
        "slug": "vwap_upper_touch", "name": "VWAP Upper Band Touch", "category": _T, "sort_order": 14,
        "description": "Returns a signal (1.0) when the close price exceeds the upper VWAP standard deviation band, indicating a potential mean-reversion SHORT opportunity. Use in exit conditions or SHORT entry blocks.",
        "parameters": [
            {"key": "multiplier", "name": "Band Multiplier", "type": "number", "default": 1.5},
        ],
    },
    {
        "slug": "vwap_lower_touch", "name": "VWAP Lower Band Touch", "category": _T, "sort_order": 15,
        "description": "Returns a signal (1.0) when the close price falls below the lower VWAP standard deviation band, indicating a potential mean-reversion LONG opportunity. Use in entry conditions or LONG signal blocks.",
        "parameters": [
            {"key": "multiplier", "name": "Band Multiplier", "type": "number", "default": 1.5},
        ],
    },
    {
        "slug": "ichimoku", "name": "Ichimoku Cloud", "category": _T, "sort_order": 16,
        "description": "A comprehensive indicator that defines support/resistance, identifies trend direction, gauges momentum and provides trading signals.",
        "parameters": [
            {"key": "conversionLine", "name": "Conversion Line (Tenkan)", "type": "number", "default": 9},
            {"key": "baseLine", "name": "Base Line (Kijun)", "type": "number", "default": 26},
            {"key": "leadingSpanB", "name": "Leading Span B (Senkou B)", "type": "number", "default": 52},
            {"key": "displacement", "name": "Displacement", "type": "number", "default": 26},
        ],
    },
    # ── Momentum ─────────────────────────────────────────────────────────────
    {
        "slug": "rsi", "name": "Relative Strength Index (RSI)", "category": _M, "sort_order": 20,
        "description": "Measures the speed and change of price movements, ranging between 0 and 100 to identify overbought (>70) and oversold (<30) zones.",
        "parameters": [
            {"key": "period", "name": "Period", "type": "number", "default": 14},
            {"key": "overbought", "name": "Overbought Level", "type": "number", "default": 70},
            {"key": "oversold", "name": "Oversold Level", "type": "number", "default": 30},
        ],
    },
    {
        "slug": "macd", "name": "MACD (Moving Average Convergence Divergence)", "category": _M, "sort_order": 21,
        "description": "A trend-following momentum indicator that shows the relationship between two moving averages of a security’s price.",
        "parameters": [
            {"key": "fastLength", "name": "Fast Length", "type": "number", "default": 12},
            {"key": "slowLength", "name": "Slow Length", "type": "number", "default": 26},
            {"key": "signalLength", "name": "Signal Smoothing", "type": "number", "default": 9},
        ],
    },
    {
        "slug": "stochastic", "name": "Stochastic Oscillator", "category": _M, "sort_order": 22,
        "description": "Compares a specific closing price of a security to a range of its prices over a certain period of time.",
        "parameters": [
            {"key": "kPeriod", "name": "%K Period", "type": "number", "default": 14},
            {"key": "dPeriod", "name": "%D Period", "type": "number", "default": 3},
            {"key": "slowing", "name": "Slowing", "type": "number", "default": 3},
        ],
    },
    {
        "slug": "cci", "name": "Commodity Channel Index (CCI)", "category": _M, "sort_order": 23,
        "description": "An oscillator that measures a security’s variation from its statistical average to assess trend strength and speed.",
        "parameters": [
            {"key": "period", "name": "Period", "type": "number", "default": 20},
        ],
    },
    {
        "slug": "williams_r", "name": "Williams %R", "category": _M, "sort_order": 24,
        "description": "A momentum indicator that measures overbought and oversold levels, similar to the Stochastic, moving on a scale of -100 to 0.",
        "parameters": [
            {"key": "period", "name": "Period", "type": "number", "default": 14},
        ],
    },
    {
        "slug": "adx", "name": "Average Directional Index (ADX)", "category": _M, "sort_order": 25,
        "description": "Measures trend strength on a 0–100 scale. Values below 25 indicate a ranging/sideways market; values above 25 indicate a trending market. Use as a filter block to block mean-reversion entries when markets are trending.",
        "parameters": [
            {"key": "period", "name": "Period", "type": "number", "default": 14},
            {"key": "threshold", "name": "Trend Threshold", "type": "number", "default": 25},
        ],
    },
    # ── Volatility ────────────────────────────────────────────────────────────
    {
        "slug": "atr", "name": "Average True Range (ATR)", "category": _V, "sort_order": 30,
        "description": "Measures market volatility by decomposing the entire range of an asset price for that period.",
        "parameters": [
            {"key": "period", "name": "Period", "type": "number", "default": 14},
        ],
    },
    {
        "slug": "bollinger", "name": "Bollinger Bands", "category": _V, "sort_order": 31,
        "description": "An upper envelope, lower envelope, and central moving average line based on standard deviation of prices to denote expansion/squeeze.",
        "parameters": [
            {"key": "period", "name": "Period", "type": "number", "default": 20},
            {"key": "stdDev", "name": "StdDev Multiplier", "type": "number", "default": 2},
        ],
    },
    {
        "slug": "keltner", "name": "Keltner Channels", "category": _V, "sort_order": 32,
        "description": "Volatility-based envelopes that are set above and below an exponential moving average, bounded by ATR lines.",
        "parameters": [
            {"key": "emaPeriod", "name": "EMA Period", "type": "number", "default": 20},
            {"key": "atrPeriod", "name": "ATR Period", "type": "number", "default": 10},
            {"key": "multiplier", "name": "Multiplier", "type": "number", "default": 1.5},
        ],
    },
    # ── Volume ────────────────────────────────────────────────────────────────
    {
        "slug": "obv", "name": "On-Balance Volume (OBV)", "category": _VO, "sort_order": 40,
        "description": "Uses volume flow to predict changes in stock price, acting as a momentum indicator that correlates volume with breakouts.",
        "parameters": [],
    },
    {
        "slug": "cmf", "name": "Chaikin Money Flow (CMF)", "category": _VO, "sort_order": 41,
        "description": "Measures the amount of Money Flow Volume over a specific period, indicating accumulation and distribution behavior.",
        "parameters": [
            {"key": "period", "name": "Period", "type": "number", "default": 20},
        ],
    },
    # ── ICT Concepts ──────────────────────────────────────────────────────────
    {
        "slug": "fvg", "name": "Fair Value Gap (FVG)", "category": _I, "sort_order": 50,
        "description": "Identifies 3-candle price gaps where heavy structural interest left incomplete buy or sell side deliveries.",
        "parameters": [
            {"key": "minSizePips", "name": "Min Size (Pips)", "type": "number", "default": 5},
            {"key": "colorUnfilled", "name": "Highlight Gaps", "type": "boolean", "default": True},
        ],
    },
    {
        "slug": "orderblock", "name": "Order Block (OB)", "category": _I, "sort_order": 51,
        "description": "Pinpoints institutional trace areas where large limit buying/selling transactions occurred, establishing key support/resistance zones.",
        "parameters": [
            {"key": "lookback", "name": "Lookback Candles", "type": "number", "default": 200},
            {"key": "showMitigated", "name": "Show Mitigated OBs", "type": "boolean", "default": False},
        ],
    },
    {
        "slug": "liquidity", "name": "Liquidity Sweeps", "category": _I, "sort_order": 52,
        "description": "Tracks sweeps of high/low pools where stop losses are clustered, often indicating instant sharp market reversals.",
        "parameters": [
            {"key": "levelTimeframe", "name": "Swing Level", "type": "select", "default": "Daily", "options": ["Hourly", "Daily", "Weekly"]},
        ],
    },
    {
        "slug": "bos", "name": "Break of Structure (BOS)", "category": _I, "sort_order": 53,
        "description": "Identifies price breaks that align with the ongoing major structural trend line direction.",
        "parameters": [
            {"key": "bosMethod", "name": "BOS Confirmation", "type": "select", "default": "Candle Close", "options": ["Candle Close", "Wick Penetration"]},
        ],
    },
    {
        "slug": "mss", "name": "Market Structure Shift (MSS)", "category": _I, "sort_order": 54,
        "description": "Identifies the first break of structural highs or lows that hints at a fundamental trend reversal direction.",
        "parameters": [
            {"key": "lookbackBars", "name": "Swing Period", "type": "number", "default": 50},
        ],
    },
]


# ── Service functions ─────────────────────────────────────────────────────────

async def seed_indicators(db: AsyncSession) -> None:
    """Insert seed indicators if the table is empty. Idempotent."""
    count_result = await db.execute(select(func.count()).select_from(Indicator))
    if count_result.scalar_one() > 0:
        return

    for item in INDICATOR_SEED:
        db.add(Indicator(
            id=uuid.uuid4(),
            slug=item["slug"],
            name=item["name"],
            category=item["category"],
            parameters=item["parameters"],
            description=item["description"],
            sort_order=item["sort_order"],
        ))
    await db.commit()


async def get_all_indicators(db: AsyncSession) -> list[IndicatorPublicResponse]:
    """Return all indicators ordered by sort_order, mapped to the public shape."""
    result = await db.execute(select(Indicator).order_by(Indicator.sort_order, Indicator.name))
    rows = result.scalars().all()
    return [IndicatorPublicResponse.from_orm_row(r) for r in rows]


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

    query = query.order_by(Indicator.sort_order, Indicator.name)
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    count_result = await db.execute(count_query)

    return list(result.scalars().all()), count_result.scalar_one()


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
        slug=data.slug,
        name=data.name,
        category=data.category,
        parameters=data.parameters,
        description=data.description,
        sort_order=data.sort_order,
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
