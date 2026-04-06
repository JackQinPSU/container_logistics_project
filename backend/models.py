from pydantic import BaseModel
from typing import Optional

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
    # computed
    overage_days: int
    accrued_cost: float
    action: Optional[str] = None  # "dispute" | "priority_return" | None

class ActionRequest(BaseModel):
    action: str  # "dispute" | "priority_return"

class Summary(BaseModel):
    total_records: int
    flagged_records: int
    total_accrued_cost: float
    highest_cost_overage: float