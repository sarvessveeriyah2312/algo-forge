import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.indicator import IndicatorCategoryEnum


class IndicatorBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category: IndicatorCategoryEnum
    parameters: dict[str, Any] = Field(default_factory=dict)
    description: Optional[str] = None


class IndicatorCreate(IndicatorBase):
    pass


class IndicatorResponse(IndicatorBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime


class IndicatorList(BaseModel):
    items: list[IndicatorResponse]
    total: int
    page: int
    page_size: int
