import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.indicator import IndicatorCategoryEnum

CATEGORY_DISPLAY: dict[IndicatorCategoryEnum, str] = {
    IndicatorCategoryEnum.TREND:      "Trend",
    IndicatorCategoryEnum.MOMENTUM:   "Momentum",
    IndicatorCategoryEnum.VOLATILITY: "Volatility",
    IndicatorCategoryEnum.VOLUME:     "Volume",
    IndicatorCategoryEnum.ICT:        "ICT Concepts",
}


class IndicatorBase(BaseModel):
    slug: str = Field(..., min_length=1, max_length=100)
    name: str = Field(..., min_length=1, max_length=255)
    category: IndicatorCategoryEnum
    parameters: list[Any] = Field(default_factory=list)
    description: Optional[str] = None
    sort_order: int = 0


class IndicatorCreate(IndicatorBase):
    pass


class IndicatorResponse(IndicatorBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime


class IndicatorPublicResponse(BaseModel):
    """Frontend-facing shape matching IndicatorMetadata in types/indicator.ts."""
    model_config = ConfigDict(from_attributes=True)

    id: str          # slug — frontend uses this as the indicator key
    name: str
    category: str    # display string: 'Trend', 'Momentum', etc.
    description: str
    parameters: list[Any]

    @classmethod
    def from_orm_row(cls, row: Any) -> "IndicatorPublicResponse":
        return cls(
            id=row.slug,
            name=row.name,
            category=CATEGORY_DISPLAY.get(row.category, row.category.value),
            description=row.description or "",
            parameters=row.parameters or [],
        )


class IndicatorList(BaseModel):
    items: list[IndicatorResponse]
    total: int
    page: int
    page_size: int
