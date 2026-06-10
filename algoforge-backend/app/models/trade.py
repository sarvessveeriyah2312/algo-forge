import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TradeDirectionEnum(str, enum.Enum):
    LONG = "LONG"
    SHORT = "SHORT"


class ExitReasonEnum(str, enum.Enum):
    TP = "TP"
    SL = "SL"
    SIGNAL = "SIGNAL"
    EOD = "EOD"


class Trade(Base):
    __tablename__ = "trades"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    backtest_run_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("backtest_runs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    trade_number: Mapped[int] = mapped_column(Integer, nullable=False)
    open_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    close_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    instrument: Mapped[str] = mapped_column(String(50), nullable=False)
    direction: Mapped[TradeDirectionEnum] = mapped_column(
        Enum(TradeDirectionEnum, name="tradedirectionenum"), nullable=False
    )
    entry_price: Mapped[float] = mapped_column(Float, nullable=False)
    exit_price: Mapped[float] = mapped_column(Float, nullable=False)
    stop_loss: Mapped[float | None] = mapped_column(Float, nullable=True)
    take_profit: Mapped[float | None] = mapped_column(Float, nullable=True)
    lot_size: Mapped[float] = mapped_column(Float, nullable=False)
    pips: Mapped[float] = mapped_column(Float, nullable=False)
    profit: Mapped[float] = mapped_column(Float, nullable=False)
    running_balance: Mapped[float] = mapped_column(Float, nullable=False)
    exit_reason: Mapped[ExitReasonEnum] = mapped_column(
        Enum(ExitReasonEnum, name="exitreasonenum"), nullable=False
    )

    # Relationships
    backtest_run: Mapped["BacktestRun"] = relationship("BacktestRun", back_populates="trades")  # noqa: F821
