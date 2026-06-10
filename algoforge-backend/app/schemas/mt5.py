from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class MT5StatusResponse(BaseModel):
    connected: bool
    account_info: Optional[dict[str, Any]] = None


class MT5ConnectRequest(BaseModel):
    login: int
    password: str
    server: str
    path: str = ""


class SymbolInfo(BaseModel):
    symbol: str
    description: str = ""
    spread: float = 0.0
    digits: int = 5
    contract_size: float = 100000.0
    volume_min: float = 0.01
    volume_max: float = 500.0
    volume_step: float = 0.01
    trade_mode: int = 0
    currency_base: str = ""
    currency_profit: str = ""
    currency_margin: str = ""
    point: float = 0.00001


class RatesResponse(BaseModel):
    symbol: str
    timeframe: str
    bars: list[dict[str, Any]]


class AccountInfo(BaseModel):
    balance: float = 0.0
    equity: float = 0.0
    margin: float = 0.0
    free_margin: float = 0.0
    currency: str = "USD"
    leverage: int = 100
    login: int = 0
    server: str = ""
    name: str = ""
