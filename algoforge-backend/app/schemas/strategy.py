import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.strategy import DirectionEnum


class StrategyBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    instrument: str = Field(..., min_length=1, max_length=50)
    timeframe: str = Field(..., min_length=1, max_length=10)
    direction: DirectionEnum = DirectionEnum.BOTH
    session_filter: list[Any] = Field(default_factory=list)
    risk_per_trade: float = Field(default=1.0, ge=0.01, le=100.0)
    max_daily_drawdown: float = Field(default=5.0, ge=0.1, le=100.0)
    entry_conditions: list[Any] = Field(default_factory=list)
    exit_conditions: list[Any] = Field(default_factory=list)
    filters: dict[str, Any] = Field(default_factory=dict)
    is_active: bool = True


class StrategyCreate(StrategyBase):
    pass


class StrategyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    instrument: Optional[str] = Field(None, min_length=1, max_length=50)
    timeframe: Optional[str] = Field(None, min_length=1, max_length=10)
    direction: Optional[DirectionEnum] = None
    session_filter: Optional[list[Any]] = None
    risk_per_trade: Optional[float] = Field(None, ge=0.01, le=100.0)
    max_daily_drawdown: Optional[float] = Field(None, ge=0.1, le=100.0)
    entry_conditions: Optional[list[Any]] = None
    exit_conditions: Optional[list[Any]] = None
    filters: Optional[dict[str, Any]] = None
    is_active: Optional[bool] = None


class StrategyResponse(StrategyBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None


class StrategyList(BaseModel):
    items: list[StrategyResponse]
    total: int
    page: int
    page_size: int
