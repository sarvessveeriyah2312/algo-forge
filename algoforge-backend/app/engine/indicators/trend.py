"""Trend indicators implemented with pandas/numpy."""
import numpy as np
import pandas as pd


def ema(series: pd.Series, period: int) -> pd.Series:
    """Exponential moving average."""
    return series.ewm(span=period, adjust=False).mean()


def sma(series: pd.Series, period: int) -> pd.Series:
    """Simple moving average."""
    return series.rolling(window=period).mean()


def vwap(df: pd.DataFrame) -> pd.Series:
    """
    Rolling daily VWAP.

    Expects columns: time (datetime index or column), close, volume.
    Groups by date and computes cumulative VWAP within each day.
    """
    df = df.copy()

    if not isinstance(df.index, pd.DatetimeIndex):
        if "time" in df.columns:
            df.index = pd.to_datetime(df["time"])
        else:
            raise ValueError("DataFrame must have a DatetimeIndex or a 'time' column")

    df["_date"] = df.index.date
    df["_tp"] = (df["high"] + df["low"] + df["close"]) / 3
    df["_cum_tp_vol"] = df.groupby("_date")["_tp"].transform(lambda x: (x * df.loc[x.index, "volume"]).cumsum())
    df["_cum_vol"] = df.groupby("_date")["volume"].transform("cumsum")
    result = df["_cum_tp_vol"] / df["_cum_vol"].replace(0, np.nan)
    return result.rename("vwap")


def anchored_vwap(df: pd.DataFrame, anchor_index: int) -> pd.Series:
    """
    Anchored VWAP from a specific bar index forward.

    Returns a Series with NaN before anchor_index and VWAP from anchor onward.
    """
    df = df.copy()
    tp = (df["high"] + df["low"] + df["close"]) / 3
    cum_tp_vol = (tp * df["volume"]).iloc[anchor_index:].cumsum()
    cum_vol = df["volume"].iloc[anchor_index:].cumsum().replace(0, np.nan)
    avwap = cum_tp_vol / cum_vol
    result = pd.Series(np.nan, index=df.index, name="anchored_vwap")
    result.iloc[anchor_index:] = avwap.values
    return result


def supertrend(df: pd.DataFrame, period: int = 10, multiplier: float = 3.0) -> pd.DataFrame:
    """
    Supertrend indicator.

    Returns a DataFrame with columns:
    - supertrend: the supertrend line value
    - direction: 1 for uptrend, -1 for downtrend
    """
    df = df.copy()
    high = df["high"]
    low = df["low"]
    close = df["close"]

    # True Range
    hl = high - low
    hc = (high - close.shift(1)).abs()
    lc = (low - close.shift(1)).abs()
    tr = pd.concat([hl, hc, lc], axis=1).max(axis=1)

    # ATR
    atr_val = tr.ewm(span=period, adjust=False).mean()

    # Basic upper/lower bands
    hl2 = (high + low) / 2
    upper_band = hl2 + multiplier * atr_val
    lower_band = hl2 - multiplier * atr_val

    # Finalise bands iteratively
    final_upper = upper_band.copy()
    final_lower = lower_band.copy()

    for i in range(1, len(df)):
        final_upper.iloc[i] = (
            upper_band.iloc[i]
            if upper_band.iloc[i] < final_upper.iloc[i - 1] or close.iloc[i - 1] > final_upper.iloc[i - 1]
            else final_upper.iloc[i - 1]
        )
        final_lower.iloc[i] = (
            lower_band.iloc[i]
            if lower_band.iloc[i] > final_lower.iloc[i - 1] or close.iloc[i - 1] < final_lower.iloc[i - 1]
            else final_lower.iloc[i - 1]
        )

    supertrend_line = pd.Series(np.nan, index=df.index, name="supertrend")
    direction = pd.Series(1, index=df.index, name="direction")

    for i in range(1, len(df)):
        if close.iloc[i] <= final_upper.iloc[i]:
            supertrend_line.iloc[i] = final_upper.iloc[i]
            direction.iloc[i] = -1
        else:
            supertrend_line.iloc[i] = final_lower.iloc[i]
            direction.iloc[i] = 1

    return pd.DataFrame({"supertrend": supertrend_line, "direction": direction})
