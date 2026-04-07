import csv
import sqlite3
from pathlib import Path
from typing import Dict

DATA_PATH = Path(__file__).parent / "data" / "containers.csv"
DB_PATH   = Path(__file__).parent / "data" / "actions.db"

# In-memory store: equipment_id -> record dict
_records: Dict[str, dict] = {}


def _conn() -> sqlite3.Connection:
    con = sqlite3.connect(str(DB_PATH))
    con.execute(
        "CREATE TABLE IF NOT EXISTS actions "
        "(equipment_id TEXT PRIMARY KEY, action TEXT NOT NULL)"
    )
    con.commit()
    return con


def load():
    global _records
    with open(DATA_PATH, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            eq_id   = row["equipment_id"]
            overage = max(int(row["actual_dwell_days"]) - int(row["contract_free_days"]), 0)
            cost    = round(overage * float(row["daily_rate_usd"]), 2)
            _records[eq_id] = {
                **row,
                "contract_free_days": int(row["contract_free_days"]),
                "actual_dwell_days":  int(row["actual_dwell_days"]),
                "daily_rate_usd":     float(row["daily_rate_usd"]),
                "overage_days":       overage,
                "accrued_cost":       cost,
            }


def get_all() -> list[dict]:
    con = _conn()
    saved = {row[0]: row[1] for row in con.execute("SELECT equipment_id, action FROM actions")}
    con.close()
    return [{**rec, "action": saved.get(eq_id)} for eq_id, rec in _records.items()]


def set_action(equipment_id: str, action: str) -> bool:
    if equipment_id not in _records:
        return False
    con = _conn()
    con.execute(
        "INSERT INTO actions (equipment_id, action) VALUES (?, ?) "
        "ON CONFLICT(equipment_id) DO UPDATE SET action=excluded.action",
        (equipment_id, action),
    )
    con.commit()
    con.close()
    return True
