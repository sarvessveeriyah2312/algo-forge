import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.trade import ExitReasonEnum, TradeDirectionEnum


class TradeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    backtest_run_id: uuid.UUID
    trade_number: int
    open_time: datetime
    close_time: datetime
    instrument: str
    direction: TradeDirectionEnum
    entry_price: float
    exit_price: float
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    lot_size: float
    pips: float
    profit: float
    running_balance: float
    exit_reason: ExitReasonEnum


class TradeList(BaseModel):
    items: list[TradeResponse]
    total: int
    page: int
    page_size: int
