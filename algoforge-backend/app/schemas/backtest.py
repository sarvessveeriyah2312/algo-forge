import uuid
from datetime import date, datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.backtest import BacktestStatusEnum


class BacktestRunCreate(BaseModel):
    strategy_id: uuid.UUID
    instrument: str = Field(..., min_length=1, max_length=50)
    timeframe: str = Field(..., min_length=1, max_length=10)
    date_from: date
    date_to: date
    initial_capital: float = Field(default=10000.0, ge=100.0)
    spread: float = Field(default=0.0, ge=0.0)
    commission: float = Field(default=0.0, ge=0.0)
    slippage: float = Field(default=0.0, ge=0.0)


class BacktestRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    strategy_id: uuid.UUID
    instrument: str
    timeframe: str
    date_from: date
    date_to: date
    initial_capital: float
    spread: float
    commission: float
    slippage: float
    status: BacktestStatusEnum

    # Stats
    net_profit: Optional[float] = None
    total_trades: Optional[int] = None
    win_rate: Optional[float] = None
    profit_factor: Optional[float] = None
    max_drawdown: Optional[float] = None
    sharpe_ratio: Optional[float] = None
    expectancy: Optional[float] = None
    equity_curve: Optional[list[Any]] = None
    log_output: Optional[str] = None
    error_message: Optional[str] = None

    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime


class BacktestRunList(BaseModel):
    items: list[BacktestRunResponse]
    total: int
    page: int
    page_size: int
