"""Volume indicators implemented with pandas/numpy."""
import numpy as np
import pandas as pd


def obv(df: pd.DataFrame) -> pd.Series:
    """On-Balance Volume."""
    close = df["close"]
    volume = df["volume"]

    direction = np.sign(close.diff()).fillna(0)
    obv_val = (direction * volume).cumsum()
    return obv_val.rename("obv")


def cmf(df: pd.DataFrame, period: int = 20) -> pd.Series:
    """
    Chaikin Money Flow.

    CMF = SUM(Money Flow Volume, n) / SUM(Volume, n)
    Money Flow Multiplier = ((close - low) - (high - close)) / (high - low)
    Money Flow Volume = MFM * volume
    """
    high = df["high"]
    low = df["low"]
    close = df["close"]
    volume = df["volume"]

    denom = (high - low).replace(0, np.nan)
    mfm = ((close - low) - (high - close)) / denom
    mfv = mfm * volume

    cmf_val = mfv.rolling(window=period).sum() / volume.rolling(window=period).sum().replace(0, np.nan)
    return cmf_val.rename("cmf")
