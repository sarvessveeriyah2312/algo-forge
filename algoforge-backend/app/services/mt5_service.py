"""
MetaTrader5 service — wraps MT5 Python API with graceful degradation.

On non-Windows platforms (or when MetaTrader5 is not installed), all methods
return realistic mock / synthetic data so the rest of the application works.
"""
from __future__ import annotations

import logging
import random
from datetime import datetime, timedelta, timezone
from typing import Optional

import numpy as np
import pandas as pd
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

TIMEFRAME_MAP: dict[str, int] = {
    "M1": 1,
    "M5": 5,
    "M15": 15,
    "M30": 30,
    "H1": 16385,
    "H4": 16388,
    "D1": 16408,
    "W1": 32769,
    "MN1": 49153,
}

# Try importing MT5 — only available on Windows
try:
    import MetaTrader5 as _mt5  # type: ignore

    MT5_AVAILABLE = True
except ImportError:
    _mt5 = None  # type: ignore
    MT5_AVAILABLE = False
    logger.info("MetaTrader5 package not available — running in mock mode.")


class MT5ConnectionError(Exception):
    pass


class MT5Service:
    """Singleton service wrapping MetaTrader5 operations."""

    _instance: Optional["MT5Service"] = None
    _connected: bool = False

    # ──────────────────────────────────────────────
    # Singleton
    # ──────────────────────────────────────────────

    @classmethod
    def get_instance(cls) -> "MT5Service":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    # ──────────────────────────────────────────────
    # Connection
    # ──────────────────────────────────────────────

    async def initialize(
        self,
        login: int,
        password: str,
        server: str,
        path: str = "",
    ) -> dict:
        """Connect to MT5 terminal and return account info."""
        if not MT5_AVAILABLE:
            logger.warning("MT5 not available. Returning mock account info.")
            self._connected = True
            return self._mock_account_info()

        try:
            kwargs: dict = {"login": login, "password": password, "server": server}
            if path:
                kwargs["path"] = path

            if not _mt5.initialize(**kwargs):
                error = _mt5.last_error()
                raise MT5ConnectionError(f"MT5 initialize failed: {error}")

            self._connected = True
            account = _mt5.account_info()
            if account is None:
                raise MT5ConnectionError("Could not fetch account info after connecting.")

            return {
                "balance": account.balance,
                "equity": account.equity,
                "margin": account.margin,
                "free_margin": account.margin_free,
                "currency": account.currency,
                "leverage": account.leverage,
                "login": account.login,
                "server": account.server,
                "name": account.name,
            }
        except MT5ConnectionError:
            raise
        except Exception as exc:
            logger.error("Unexpected error connecting to MT5: %s", exc, exc_info=True)
            raise MT5ConnectionError(str(exc)) from exc

    async def shutdown(self) -> None:
        """Disconnect from MT5."""
        if MT5_AVAILABLE and self._connected:
            try:
                _mt5.shutdown()
            except Exception as exc:
                logger.warning("Error during MT5 shutdown: %s", exc)
        self._connected = False

    # ──────────────────────────────────────────────
    # Data retrieval
    # ──────────────────────────────────────────────

    async def get_rates(
        self,
        symbol: str,
        timeframe: str,
        date_from: datetime,
        date_to: datetime,
    ) -> pd.DataFrame:
        """Return OHLCV DataFrame. Falls back to synthetic data if MT5 unavailable."""
        if not self._connected:
            if not MT5_AVAILABLE:
                return self._generate_synthetic_ohlcv(symbol, timeframe, date_from, date_to)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="MT5 is not connected.",
            )

        if not MT5_AVAILABLE:
            return self._generate_synthetic_ohlcv(symbol, timeframe, date_from, date_to)

        try:
            tf_code = TIMEFRAME_MAP.get(timeframe.upper(), 16385)  # default H1
            rates = _mt5.copy_rates_range(symbol, tf_code, date_from, date_to)
            if rates is None or len(rates) == 0:
                logger.warning("No rates returned from MT5 for %s %s", symbol, timeframe)
                return self._generate_synthetic_ohlcv(symbol, timeframe, date_from, date_to)

            df = pd.DataFrame(rates)
            df["time"] = pd.to_datetime(df["time"], unit="s", utc=True)
            df.rename(columns={"tick_volume": "volume"}, inplace=True)
            return df[["time", "open", "high", "low", "close", "volume"]]
        except Exception as exc:
            logger.error("Error fetching rates from MT5: %s", exc, exc_info=True)
            return self._generate_synthetic_ohlcv(symbol, timeframe, date_from, date_to)

    async def get_symbol_info(self, symbol: str) -> dict:
        """Return symbol info dict."""
        if not MT5_AVAILABLE or not self._connected:
            return self._mock_symbol_info(symbol)

        try:
            info = _mt5.symbol_info(symbol)
            if info is None:
                return self._mock_symbol_info(symbol)
            return {
                "symbol": info.name,
                "description": info.description,
                "spread": info.spread,
                "digits": info.digits,
                "contract_size": info.trade_contract_size,
                "volume_min": info.volume_min,
                "volume_max": info.volume_max,
                "volume_step": info.volume_step,
                "trade_mode": info.trade_mode,
                "currency_base": info.currency_base,
                "currency_profit": info.currency_profit,
                "currency_margin": info.currency_margin,
                "point": info.point,
            }
        except Exception as exc:
            logger.error("Error fetching symbol info: %s", exc)
            return self._mock_symbol_info(symbol)

    async def get_account_info(self) -> dict:
        """Return account info dict."""
        if not self._connected:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="MT5 is not connected.",
            )
        if not MT5_AVAILABLE:
            return self._mock_account_info()

        try:
            account = _mt5.account_info()
            if account is None:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Could not retrieve account info.",
                )
            return {
                "balance": account.balance,
                "equity": account.equity,
                "margin": account.margin,
                "free_margin": account.margin_free,
                "currency": account.currency,
                "leverage": account.leverage,
                "login": account.login,
                "server": account.server,
                "name": account.name,
            }
        except HTTPException:
            raise
        except Exception as exc:
            logger.error("Error fetching account info: %s", exc)
            return self._mock_account_info()

    async def get_symbols(self) -> list[str]:
        """Return list of available symbols."""
        if not MT5_AVAILABLE or not self._connected:
            return ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD", "BTCUSD", "NASDAQ", "US30", "USDCAD", "AUDUSD"]

        try:
            symbols = _mt5.symbols_get()
            if symbols is None:
                return []
            return [s.name for s in symbols]
        except Exception as exc:
            logger.error("Error fetching symbols: %s", exc)
            return []

    async def get_server_time(self) -> datetime:
        """Return MT5 server time."""
        if not MT5_AVAILABLE or not self._connected:
            return datetime.now(tz=timezone.utc)

        try:
            tick = _mt5.symbol_info_tick("EURUSD")
            if tick:
                return datetime.fromtimestamp(tick.time, tz=timezone.utc)
            return datetime.now(tz=timezone.utc)
        except Exception:
            return datetime.now(tz=timezone.utc)

    def is_connected(self) -> bool:
        return self._connected

    # ──────────────────────────────────────────────
    # Mock / synthetic data helpers
    # ──────────────────────────────────────────────

    @staticmethod
    def _mock_account_info() -> dict:
        return {
            "balance": 10000.0,
            "equity": 10000.0,
            "margin": 0.0,
            "free_margin": 10000.0,
            "currency": "USD",
            "leverage": 100,
            "login": 0,
            "server": "Mock-Server",
            "name": "Mock Account",
        }

    @staticmethod
    def _mock_symbol_info(symbol: str) -> dict:
        return {
            "symbol": symbol,
            "description": f"{symbol} Mock",
            "spread": 10,
            "digits": 5,
            "contract_size": 100000.0,
            "volume_min": 0.01,
            "volume_max": 500.0,
            "volume_step": 0.01,
            "trade_mode": 4,
            "currency_base": symbol[:3] if len(symbol) >= 3 else "USD",
            "currency_profit": symbol[3:6] if len(symbol) >= 6 else "USD",
            "currency_margin": symbol[:3] if len(symbol) >= 3 else "USD",
            "point": 0.00001,
        }

    @staticmethod
    def _generate_synthetic_ohlcv(
        symbol: str,
        timeframe: str,
        date_from: datetime,
        date_to: datetime,
    ) -> pd.DataFrame:
        """Generate synthetic OHLCV data using a random walk."""
        logger.info("Generating synthetic OHLCV for %s %s", symbol, timeframe)

        tf_minutes_map = {
            "M1": 1, "M5": 5, "M15": 15, "M30": 30,
            "H1": 60, "H4": 240, "D1": 1440, "W1": 10080, "MN1": 43200,
        }
        tf_minutes = tf_minutes_map.get(timeframe.upper(), 60)
        interval = timedelta(minutes=tf_minutes)

        # Generate timestamp index
        current = date_from
        timestamps = []
        while current <= date_to:
            timestamps.append(current)
            current += interval

        if not timestamps:
            timestamps = [date_from + interval * i for i in range(500)]

        n = len(timestamps)
        np.random.seed(42)

        # Determine realistic starting price
        price_defaults = {
            "XAUUSD": 1950.0,
            "BTCUSD": 35000.0,
            "NASDAQ": 15000.0,
            "US30": 33000.0,
        }
        base_price = price_defaults.get(symbol.upper(), 1.1000)
        volatility = base_price * 0.001  # 0.1% per bar

        returns = np.random.normal(0, volatility, n)
        close_prices = base_price + np.cumsum(returns)
        close_prices = np.maximum(close_prices, base_price * 0.5)

        high_prices = close_prices + np.abs(np.random.normal(0, volatility * 0.5, n))
        low_prices = close_prices - np.abs(np.random.normal(0, volatility * 0.5, n))
        open_prices = np.roll(close_prices, 1)
        open_prices[0] = base_price

        df = pd.DataFrame(
            {
                "time": timestamps,
                "open": open_prices,
                "high": high_prices,
                "low": low_prices,
                "close": close_prices,
                "volume": np.random.randint(100, 10000, n).astype(float),
            }
        )
        df["time"] = pd.to_datetime(df["time"], utc=True)
        return df


# Module-level singleton
mt5_service: MT5Service = MT5Service.get_instance()
