from pydantic import BaseModel
from typing import Literal, Optional


class ContainerRecord(BaseModel):
    equipment_id: str
    equipment_type: str
    size: str
    pickup_location: str
    return_location: str
    contract_free_days: int
    actual_dwell_days: int
    daily_rate_usd: float
    customer_id: str
    pickup_date: str
    return_date: str
    status: str
    overage_days: int
    accrued_cost: float
    missing_rate: bool = False
    missing_return: bool = False
    action: Optional[str] = None
    actioned_at: Optional[str] = None
    ai_recommended: Optional[str] = None


class ActionRequest(BaseModel):
    action: Literal["dispute", "priority_return"]
    ai_recommended: Optional[str] = None  # what AIP suggested before operator acted


class Summary(BaseModel):
    total_records: int
    flagged_records: int
    total_accrued_cost: float
    highest_cost_overage: float
