"""Momentum indicators implemented with pandas/numpy."""
import numpy as np
import pandas as pd


def rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """Relative Strength Index."""
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.ewm(com=period - 1, adjust=False).mean()
    avg_loss = loss.ewm(com=period - 1, adjust=False).mean()

    rs = avg_gain / avg_loss.replace(0, np.nan)
    rsi_val = 100 - (100 / (1 + rs))
    return rsi_val.rename("rsi")


def macd(
    series: pd.Series,
    fast: int = 12,
    slow: int = 26,
    signal: int = 9,
) -> pd.DataFrame:
    """
    MACD indicator.

    Returns DataFrame with columns: macd, signal, histogram.
    """
    ema_fast = series.ewm(span=fast, adjust=False).mean()
    ema_slow = series.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line

    return pd.DataFrame(
        {"macd": macd_line, "signal": signal_line, "histogram": histogram}
    )


def stochastic(
    df: pd.DataFrame,
    k_period: int = 14,
    d_period: int = 3,
) -> pd.DataFrame:
    """
    Stochastic Oscillator.

    Returns DataFrame with columns: k, d.
    """
    lowest_low = df["low"].rolling(window=k_period).min()
    highest_high = df["high"].rolling(window=k_period).max()
    denom = (highest_high - lowest_low).replace(0, np.nan)
    k = 100 * (df["close"] - lowest_low) / denom
    d = k.rolling(window=d_period).mean()
    return pd.DataFrame({"k": k, "d": d})


def cci(df: pd.DataFrame, period: int = 20) -> pd.Series:
    """Commodity Channel Index."""
    tp = (df["high"] + df["low"] + df["close"]) / 3
    ma = tp.rolling(window=period).mean()
    # Mean deviation
    md = tp.rolling(window=period).apply(lambda x: np.mean(np.abs(x - x.mean())), raw=True)
    cci_val = (tp - ma) / (0.015 * md.replace(0, np.nan))
    return cci_val.rename("cci")


def williams_r(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """Williams %R oscillator."""
    highest_high = df["high"].rolling(window=period).max()
    lowest_low = df["low"].rolling(window=period).min()
    denom = (highest_high - lowest_low).replace(0, np.nan)
    wr = -100 * (highest_high - df["close"]) / denom
    return wr.rename("williams_r")


def adx(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """
    Average Directional Index (ADX).

    Measures trend strength on a 0-100 scale.
    Values < 25 indicate a ranging/sideways market (good for mean reversion).
    Values > 25 indicate a trending market.
    """
    high = df["high"]
    low = df["low"]
    close = df["close"]

    # True Range
    hl = high - low
    hc = (high - close.shift(1)).abs()
    lc = (low - close.shift(1)).abs()
    tr = pd.concat([hl, hc, lc], axis=1).max(axis=1)

    # Directional Movement
    up_move = high.diff()
    down_move = -low.diff()
    plus_dm = up_move.where((up_move > down_move) & (up_move > 0), 0.0)
    minus_dm = down_move.where((down_move > up_move) & (down_move > 0), 0.0)

    # Wilder's smoothing (com = period-1 is equivalent to Wilder's EMA)
    tr_smooth = tr.ewm(com=period - 1, adjust=False).mean()
    plus_dm_s = plus_dm.ewm(com=period - 1, adjust=False).mean()
    minus_dm_s = minus_dm.ewm(com=period - 1, adjust=False).mean()

    plus_di = 100 * plus_dm_s / tr_smooth.replace(0, np.nan)
    minus_di = 100 * minus_dm_s / tr_smooth.replace(0, np.nan)

    di_sum = (plus_di + minus_di).replace(0, np.nan)
    dx = 100 * (plus_di - minus_di).abs() / di_sum

    adx_val = dx.ewm(com=period - 1, adjust=False).mean()
    return adx_val.rename("adx")
