import csv
import sqlite3
from datetime import datetime, date
from pathlib import Path
from typing import Dict

DATA_PATH = Path(__file__).parent / "data" / "containers.csv"
DB_PATH   = Path(__file__).parent / "data" / "actions.db"

_records: Dict[str, dict] = {}

# Normalise messy date strings into ISO format (or return as-is if unrecognised)
_DATE_FMTS = ["%Y-%m-%d", "%m/%d/%Y", "%d-%b-%Y"]

def _parse_date(raw: str) -> str:
    if not raw or not raw.strip():
        return ""
    for fmt in _DATE_FMTS:
        try:
            return datetime.strptime(raw.strip(), fmt).date().isoformat()
        except ValueError:
            continue
    return raw.strip()  # give up, keep as-is


def _conn() -> sqlite3.Connection:
    con = sqlite3.connect(str(DB_PATH))
    con.execute(
        "CREATE TABLE IF NOT EXISTS actions "
        "(equipment_id TEXT PRIMARY KEY, action TEXT NOT NULL, "
        "actioned_at TEXT, ai_recommended TEXT)"
    )
    # Migrate existing tables that predate audit columns
    for col in ("actioned_at", "ai_recommended"):
        try:
            con.execute(f"ALTER TABLE actions ADD COLUMN {col} TEXT")
        except sqlite3.OperationalError:
            pass
    con.commit()
    return con


def load():
    global _records
    skipped = 0
    with open(DATA_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            eq_id = row.get("equipment_id", "").strip()
            if not eq_id:
                skipped += 1
                continue

            # Safely parse numeric fields — missing/malformed daily_rate treated as 0
            try:
                contract_free = int(row["contract_free_days"])
                actual_dwell  = int(row["actual_dwell_days"])
            except (ValueError, KeyError):
                skipped += 1
                continue

            raw_rate = row.get("daily_rate_usd", "").strip()
            try:
                daily_rate = float(raw_rate) if raw_rate else 0.0
            except ValueError:
                daily_rate = 0.0

            overage = max(actual_dwell - contract_free, 0)
            cost    = round(overage * daily_rate, 2)

            _records[eq_id] = {
                **row,
                "contract_free_days": contract_free,
                "actual_dwell_days":  actual_dwell,
                "daily_rate_usd":     daily_rate,
                "pickup_date":        _parse_date(row.get("pickup_date", "")),
                "return_date":        _parse_date(row.get("return_date", "")),
                "overage_days":       overage,
                "accrued_cost":       cost,
                "missing_rate":       raw_rate == "",        # flag for pipeline transparency
                "missing_return":     row.get("return_date", "").strip() == "",
            }

    if skipped:
        print(f"[loader] skipped {skipped} malformed rows")
    print(f"[loader] loaded {len(_records)} records")


def get_all() -> list[dict]:
    con = _conn()
    saved = {
        row[0]: {
            "action":         row[1],
            "actioned_at":    row[2],
            "ai_recommended": row[3],
        }
        for row in con.execute(
            "SELECT equipment_id, action, actioned_at, ai_recommended FROM actions"
        )
    }
    con.close()
    empty = {"action": None, "actioned_at": None, "ai_recommended": None}
    return [{**rec, **saved.get(eq_id, empty)} for eq_id, rec in _records.items()]


def set_action(equipment_id: str, action: str, ai_recommended: str | None = None) -> bool:
    if equipment_id not in _records:
        return False
    timestamp = datetime.utcnow().isoformat(timespec="seconds") + "Z"
    con = _conn()
    con.execute(
        "INSERT INTO actions (equipment_id, action, actioned_at, ai_recommended) "
        "VALUES (?, ?, ?, ?) "
        "ON CONFLICT(equipment_id) DO UPDATE SET "
        "action=excluded.action, actioned_at=excluded.actioned_at, "
        "ai_recommended=excluded.ai_recommended",
        (equipment_id, action, timestamp, ai_recommended),
    )
    con.commit()
    con.close()
    return True
