import enum
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, Enum, Float, String, Text, func
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class DirectionEnum(str, enum.Enum):
    LONG = "LONG"
    SHORT = "SHORT"
    BOTH = "BOTH"


class Strategy(Base):
    __tablename__ = "strategies"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    instrument: Mapped[str] = mapped_column(String(50), nullable=False)
    timeframe: Mapped[str] = mapped_column(String(10), nullable=False)
    direction: Mapped[DirectionEnum] = mapped_column(
        Enum(DirectionEnum, name="directionenum"), nullable=False, default=DirectionEnum.BOTH
    )
    session_filter: Mapped[list[Any]] = mapped_column(JSON, nullable=False, default=list)
    risk_per_trade: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    max_daily_drawdown: Mapped[float] = mapped_column(Float, nullable=False, default=5.0)
    entry_conditions: Mapped[list[Any]] = mapped_column(JSON, nullable=False, default=list)
    exit_conditions: Mapped[list[Any]] = mapped_column(JSON, nullable=False, default=list)
    filters: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, onupdate=func.now()
    )

    # Relationships
    backtest_runs: Mapped[list["BacktestRun"]] = relationship(  # noqa: F821
        "BacktestRun", back_populates="strategy", cascade="all, delete-orphan"
    )
