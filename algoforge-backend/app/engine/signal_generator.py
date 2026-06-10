"""
Signal generator — parses strategy condition blocks into executable callables.

Condition block format:
{
    "indicator": "RSI",
    "params": {"period": 14},
    "operator": "LESS_THAN",
    "value": 30,          # for scalar comparisons
    "target": "EMA",      # for cross comparisons (optional)
    "target_params": {"period": 200},  # for cross comparisons (optional)
    "logic": "AND"        # "AND" | "OR"
}

Supported operators:
    CROSS_ABOVE, CROSS_BELOW, GREATER_THAN, LESS_THAN, BETWEEN, EQUALS
"""
from __future__ import annotations

import logging
from typing import Callable

import pandas as pd

logger = logging.getLogger(__name__)

# Supported operators
OPERATORS = {
    "CROSS_ABOVE",
    "CROSS_BELOW",
    "GREATER_THAN",
    "LESS_THAN",
    "BETWEEN",
    "EQUALS",
}


def _col_name(indicator: str, params: dict) -> str:
    """Build a column name like RSI_14 or EMA_50."""
    if not params:
        return indicator.upper()
    param_str = "_".join(str(v) for v in params.values())
    return f"{indicator.upper()}_{param_str}"


def get_indicator_value(
    indicators_df: pd.DataFrame,
    indicator: str,
    params: dict,
    idx: int,
) -> float | None:
    """
    Look up a precomputed indicator value by name+params at index idx.

    Returns None if the column is missing or value is NaN.
    """
    col = _col_name(indicator, params)
    if col not in indicators_df.columns:
        # Try without params suffix
        if indicator.upper() in indicators_df.columns:
            col = indicator.upper()
        else:
            logger.warning("Indicator column '%s' not found in DataFrame", col)
            return None
    val = indicators_df[col].iloc[idx]
    if pd.isna(val):
        return None
    return float(val)


def _evaluate_condition(
    condition: dict,
    idx: int,
    indicators_df: pd.DataFrame,
) -> bool:
    """Evaluate a single condition at bar idx."""
    indicator = condition.get("indicator", "")
    params = condition.get("params", {})
    operator = condition.get("operator", "")
    value = condition.get("value")
    target = condition.get("target")
    target_params = condition.get("target_params", {})

    current_val = get_indicator_value(indicators_df, indicator, params, idx)
    if current_val is None:
        return False

    if operator in ("CROSS_ABOVE", "CROSS_BELOW"):
        if idx == 0:
            return False

        prev_val = get_indicator_value(indicators_df, indicator, params, idx - 1)
        if prev_val is None:
            return False

        if target:
            # Cross relative to another indicator
            target_current = get_indicator_value(indicators_df, target, target_params, idx)
            target_prev = get_indicator_value(indicators_df, target, target_params, idx - 1)
            if target_current is None or target_prev is None:
                return False
            if operator == "CROSS_ABOVE":
                return prev_val <= target_prev and current_val > target_current
            else:  # CROSS_BELOW
                return prev_val >= target_prev and current_val < target_current
        else:
            # Cross relative to scalar value
            ref = float(value) if value is not None else 0.0
            if operator == "CROSS_ABOVE":
                return prev_val <= ref and current_val > ref
            else:  # CROSS_BELOW
                return prev_val >= ref and current_val < ref

    elif operator == "GREATER_THAN":
        ref = float(value) if value is not None else 0.0
        return current_val > ref

    elif operator == "LESS_THAN":
        ref = float(value) if value is not None else 0.0
        return current_val < ref

    elif operator == "EQUALS":
        ref = float(value) if value is not None else 0.0
        return abs(current_val - ref) < 1e-9

    elif operator == "BETWEEN":
        if not isinstance(value, (list, tuple)) or len(value) < 2:
            return False
        return float(value[0]) <= current_val <= float(value[1])

    logger.warning("Unknown operator: %s", operator)
    return False


def parse_conditions(conditions: list[dict]) -> Callable[[int, pd.DataFrame], bool]:
    """
    Parse a list of condition dicts into a callable.

    Returns a function (bar_idx: int, indicators_df: pd.DataFrame) -> bool.
    Conditions with logic="OR" are combined with OR; all others default to AND.

    Evaluation order:
    - AND groups are AND-ed together.
    - Any OR condition forms its own group evaluated with OR against the overall result.
    """

    def evaluate(bar_idx: int, indicators_df: pd.DataFrame) -> bool:
        if not conditions:
            return False

        # Split into AND chain and OR-branching
        # Simple left-to-right evaluation: maintain running result,
        # apply AND/OR as specified by the logic field of each condition.
        result: bool | None = None

        for cond in conditions:
            logic = cond.get("logic", "AND").upper()
            cond_result = _evaluate_condition(cond, bar_idx, indicators_df)

            if result is None:
                result = cond_result
            elif logic == "OR":
                result = result or cond_result
            else:  # AND
                result = result and cond_result

        return bool(result)

    return evaluate
