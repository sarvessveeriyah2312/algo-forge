"""ICT (Inner Circle Trader) concept indicators."""
import numpy as np
import pandas as pd


def detect_fvg(df: pd.DataFrame, min_gap_pips: float = 1.0) -> pd.DataFrame:
    """
    Detect Fair Value Gaps (FVG).

    A bullish FVG occurs when candle[i-1].high < candle[i+1].low (gap between i-1 high and i+1 low).
    A bearish FVG occurs when candle[i-1].low > candle[i+1].high.

    Returns DataFrame with columns:
    - fvg_bull: bool
    - fvg_bear: bool
    - fvg_top: float (top of the gap)
    - fvg_bottom: float (bottom of the gap)
    """
    n = len(df)
    fvg_bull = np.zeros(n, dtype=bool)
    fvg_bear = np.zeros(n, dtype=bool)
    fvg_top = np.full(n, np.nan)
    fvg_bottom = np.full(n, np.nan)

    high = df["high"].values
    low = df["low"].values
    # min gap in price units — approximate pips
    min_gap = min_gap_pips * 0.0001

    for i in range(1, n - 1):
        # Bullish FVG: previous high < next low
        gap = low[i + 1] - high[i - 1]
        if gap >= min_gap:
            fvg_bull[i] = True
            fvg_top[i] = low[i + 1]
            fvg_bottom[i] = high[i - 1]

        # Bearish FVG: previous low > next high
        gap_bear = low[i - 1] - high[i + 1]
        if gap_bear >= min_gap:
            fvg_bear[i] = True
            fvg_top[i] = low[i - 1]
            fvg_bottom[i] = high[i + 1]

    return pd.DataFrame(
        {
            "fvg_bull": fvg_bull,
            "fvg_bear": fvg_bear,
            "fvg_top": fvg_top,
            "fvg_bottom": fvg_bottom,
        },
        index=df.index,
    )


def detect_order_blocks(df: pd.DataFrame, lookback: int = 10) -> pd.DataFrame:
    """
    Detect Order Blocks.

    A bullish OB is the last bearish candle before a significant bullish move.
    A bearish OB is the last bullish candle before a significant bearish move.

    Returns DataFrame with columns:
    - ob_bull: bool
    - ob_bear: bool
    - ob_high: float
    - ob_low: float
    """
    n = len(df)
    ob_bull = np.zeros(n, dtype=bool)
    ob_bear = np.zeros(n, dtype=bool)
    ob_high = np.full(n, np.nan)
    ob_low = np.full(n, np.nan)

    close = df["close"].values
    open_ = df["open"].values
    high = df["high"].values
    low = df["low"].values

    for i in range(lookback, n):
        # Look for last bearish candle before bullish impulse
        window_close = close[i - lookback: i]
        window_open = open_[i - lookback: i]

        # Simple heuristic: find last bearish candle in lookback window
        for j in range(i - 1, i - lookback, -1):
            is_bearish = close[j] < open_[j]
            is_bullish_impulse = close[i] > high[j + 1: i + 1].max() if j + 1 < i else False

            if is_bearish and is_bullish_impulse:
                ob_bull[j] = True
                ob_high[j] = high[j]
                ob_low[j] = low[j]
                break

        # Look for last bullish candle before bearish impulse
        for j in range(i - 1, i - lookback, -1):
            is_bullish = close[j] > open_[j]
            is_bearish_impulse = close[i] < low[j + 1: i + 1].min() if j + 1 < i else False

            if is_bullish and is_bearish_impulse:
                ob_bear[j] = True
                ob_high[j] = high[j]
                ob_low[j] = low[j]
                break

    return pd.DataFrame(
        {
            "ob_bull": ob_bull,
            "ob_bear": ob_bear,
            "ob_high": ob_high,
            "ob_low": ob_low,
        },
        index=df.index,
    )


def detect_bos(df: pd.DataFrame, lookback: int = 10) -> pd.DataFrame:
    """
    Detect Break of Structure (BOS).

    A bullish BOS occurs when price closes above the previous swing high.
    A bearish BOS occurs when price closes below the previous swing low.

    Returns DataFrame with columns:
    - bos_bull: bool
    - bos_bear: bool
    """
    n = len(df)
    bos_bull = np.zeros(n, dtype=bool)
    bos_bear = np.zeros(n, dtype=bool)

    high = df["high"].values
    low = df["low"].values
    close = df["close"].values

    for i in range(lookback, n):
        prev_high = high[i - lookback: i].max()
        prev_low = low[i - lookback: i].min()

        if close[i] > prev_high:
            bos_bull[i] = True
        if close[i] < prev_low:
            bos_bear[i] = True

    return pd.DataFrame(
        {"bos_bull": bos_bull, "bos_bear": bos_bear},
        index=df.index,
    )


def detect_swing_highs_lows(
    df: pd.DataFrame,
    left_bars: int = 5,
    right_bars: int = 5,
) -> pd.DataFrame:
    """
    Detect swing highs and lows using a pivot-point approach.

    A swing high at bar i exists if high[i] is the highest of left_bars before
    and right_bars after bar i.
    A swing low at bar i exists if low[i] is the lowest of left_bars before
    and right_bars after bar i.

    Returns DataFrame with columns:
    - swing_high: bool
    - swing_low: bool
    """
    n = len(df)
    swing_high = np.zeros(n, dtype=bool)
    swing_low = np.zeros(n, dtype=bool)

    high = df["high"].values
    low = df["low"].values

    for i in range(left_bars, n - right_bars):
        left_h = high[i - left_bars: i]
        right_h = high[i + 1: i + right_bars + 1]
        if len(left_h) == left_bars and len(right_h) == right_bars:
            if high[i] >= left_h.max() and high[i] >= right_h.max():
                swing_high[i] = True

        left_l = low[i - left_bars: i]
        right_l = low[i + 1: i + right_bars + 1]
        if len(left_l) == left_bars and len(right_l) == right_bars:
            if low[i] <= left_l.min() and low[i] <= right_l.min():
                swing_low[i] = True

    return pd.DataFrame(
        {"swing_high": swing_high, "swing_low": swing_low},
        index=df.index,
    )


def detect_liquidity_sweeps(df: pd.DataFrame, swing_df: pd.DataFrame) -> pd.DataFrame:
    """
    Detect liquidity sweeps — bars where price briefly wicks through a prior swing high/low
    but closes back on the opposite side.

    Returns DataFrame with columns:
    - liq_sweep_bull: bool (swept a swing low then closed above)
    - liq_sweep_bear: bool (swept a swing high then closed below)
    """
    n = len(df)
    liq_sweep_bull = np.zeros(n, dtype=bool)
    liq_sweep_bear = np.zeros(n, dtype=bool)

    high = df["high"].values
    low = df["low"].values
    close = df["close"].values

    swing_high_prices = []
    swing_low_prices = []

    for i in range(n):
        # Accumulate known swing highs/lows up to this point
        if i > 0 and swing_df["swing_high"].iloc[i - 1]:
            swing_high_prices.append(df["high"].iloc[i - 1])
        if i > 0 and swing_df["swing_low"].iloc[i - 1]:
            swing_low_prices.append(df["low"].iloc[i - 1])

        if swing_low_prices:
            prev_swing_low = min(swing_low_prices[-5:])  # use recent 5 swing lows
            if low[i] < prev_swing_low and close[i] > prev_swing_low:
                liq_sweep_bull[i] = True

        if swing_high_prices:
            prev_swing_high = max(swing_high_prices[-5:])  # use recent 5 swing highs
            if high[i] > prev_swing_high and close[i] < prev_swing_high:
                liq_sweep_bear[i] = True

    return pd.DataFrame(
        {"liq_sweep_bull": liq_sweep_bull, "liq_sweep_bear": liq_sweep_bear},
        index=df.index,
    )
