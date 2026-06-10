"""Risk management utilities."""
from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


def calculate_lot_size(
    balance: float,
    risk_pct: float,
    entry: float,
    sl: float,
    pip_value: float,
    contract_size: float = 100000.0,
) -> float:
    """
    Calculate lot size based on percentage risk.

    Args:
        balance: Account balance in account currency.
        risk_pct: Risk per trade as a percentage (e.g. 1.0 = 1%).
        entry: Entry price.
        sl: Stop-loss price.
        pip_value: Value of one pip in account currency per standard lot.
        contract_size: Contract size (default 100,000 for forex).

    Returns:
        Lot size rounded to 2 decimal places, minimum 0.01.
    """
    if sl == 0.0 or entry == 0.0:
        return 0.01
    if pip_value <= 0:
        pip_value = 10.0  # fallback USD pip value for 1 standard lot

    risk_amount = balance * (risk_pct / 100.0)
    sl_distance = abs(entry - sl)

    if sl_distance == 0:
        return 0.01

    # Convert sl_distance to pips (assume 5-digit quotes: 1 pip = 0.0001)
    # For instruments like USDJPY where pip = 0.01 this is an approximation.
    pip_size = 0.0001 if entry > 0.1 else 0.01
    sl_pips = sl_distance / pip_size

    if sl_pips == 0:
        return 0.01

    lot_size = risk_amount / (sl_pips * pip_value)
    lot_size = max(0.01, round(lot_size, 2))
    return lot_size


def calculate_rr_ratio(entry: float, sl: float, tp: float) -> float:
    """
    Calculate risk-to-reward ratio.

    Returns ratio as a positive float. E.g., 2.0 means 2:1 RR.
    Returns 0.0 if SL or TP distance is zero.
    """
    sl_distance = abs(entry - sl)
    tp_distance = abs(tp - entry)
    if sl_distance == 0:
        return 0.0
    return round(tp_distance / sl_distance, 2)


def validate_drawdown(current_drawdown: float, max_allowed: float) -> bool:
    """
    Check whether current drawdown is within the allowed limit.

    Args:
        current_drawdown: Current drawdown as a positive percentage (e.g. 3.5 = 3.5%).
        max_allowed: Maximum allowed drawdown percentage.

    Returns:
        True if within limit, False if exceeded.
    """
    return current_drawdown < max_allowed


def calculate_daily_pnl(trades: list[dict]) -> float:
    """
    Sum profits for all provided trades (typically trades for one day).

    Args:
        trades: List of trade dicts, each with a 'profit' key.

    Returns:
        Total profit/loss.
    """
    return sum(float(t.get("profit", 0.0)) for t in trades)
