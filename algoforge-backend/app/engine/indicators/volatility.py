"""Volatility indicators implemented with pandas/numpy."""
import numpy as np
import pandas as pd


def atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """Average True Range."""
    high = df["high"]
    low = df["low"]
    close = df["close"]

    hl = high - low
    hc = (high - close.shift(1)).abs()
    lc = (low - close.shift(1)).abs()
    tr = pd.concat([hl, hc, lc], axis=1).max(axis=1)

    atr_val = tr.ewm(com=period - 1, adjust=False).mean()
    return atr_val.rename("atr")


def bollinger_bands(
    series: pd.Series,
    period: int = 20,
    std_dev: float = 2.0,
) -> pd.DataFrame:
    """
    Bollinger Bands.

    Returns DataFrame with columns: upper, middle, lower.
    """
    middle = series.rolling(window=period).mean()
    std = series.rolling(window=period).std(ddof=0)
    upper = middle + std_dev * std
    lower = middle - std_dev * std
    return pd.DataFrame({"upper": upper, "middle": middle, "lower": lower})


def keltner_channel(
    df: pd.DataFrame,
    period: int = 20,
    multiplier: float = 2.0,
) -> pd.DataFrame:
    """
    Keltner Channel.

    Returns DataFrame with columns: upper, middle, lower.
    The middle line is the EMA of close; bands use ATR.
    """
    close = df["close"]
    middle = close.ewm(span=period, adjust=False).mean()
    atr_val = atr(df, period)
    upper = middle + multiplier * atr_val
    lower = middle - multiplier * atr_val
    return pd.DataFrame({"upper": upper, "middle": middle, "lower": lower})
