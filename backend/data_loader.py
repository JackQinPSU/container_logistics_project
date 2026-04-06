import csv
from pathlib import Path
from typing import Dict
from models import ContainerRecord

DATA_PATH = Path(__file__).parent / "data" / "containers.csv"

# In-memory store: equipment_id -> record dict
_records: Dict[str, dict] = {}
# Action overrides: equipment_id -> action string
_actions: Dict[str, str] = {}

def load():
    global _records
    with open(DATA_PATH, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            eq_id = row["equipment_id"]
            overage = max(int(row["actual_dwell_days"]) - int(row["contract_free_days"]), 0)
            cost = round(overage * float(row["daily_rate_usd"]), 2)
            _records[eq_id] = {
                **row,
                "contract_free_days": int(row["contract_free_days"]),
                "actual_dwell_days": int(row["actual_dwell_days"]),
                "daily_rate_usd": float(row["daily_rate_usd"]),
                "overage_days": overage,
                "accrued_cost": cost,
                "action": None,
            }

def get_all() -> list[dict]:
    out = []
    for eq_id, rec in _records.items():
        r = dict(rec)
        r["action"] = _actions.get(eq_id)
        out.append(r)
    return out

def set_action(equipment_id: str, action: str) -> bool:
    if equipment_id not in _records:
        return False
    _actions[equipment_id] = action
    return True