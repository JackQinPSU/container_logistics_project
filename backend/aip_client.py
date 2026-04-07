"""
Palantir AIP client.
Reads config from backend/.env (or environment variables).
"""

import os
import warnings
import httpx
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / ".env")

HOST        = os.environ.get("PALANTIR_HOST", "").rstrip("/")
TOKEN       = os.environ.get("PALANTIR_TOKEN", "")
ONTOLOGY    = os.environ.get("PALANTIR_ONTOLOGY", "")
OBJ_TYPE    = os.environ.get("AIP_OBJECT_TYPE", "")
FUNCTION_RID = os.environ.get("AIP_FUNCTION_RID", "")

if HOST and not HOST.startswith("http"):
    HOST = f"https://{HOST}"

ONTOLOGY_BASE = f"{HOST}/api/v2/ontologies/{ONTOLOGY}"
LOGIC_BASE    = f"{HOST}/api/v2/aipLogic/functions"

_missing = [k for k, v in {
    "PALANTIR_HOST": HOST,
    "PALANTIR_TOKEN": TOKEN,
    "PALANTIR_ONTOLOGY": ONTOLOGY,
    "AIP_FUNCTION_RID": FUNCTION_RID,
}.items() if not v]

if _missing:
    warnings.warn(f"AIP not fully configured — missing: {', '.join(_missing)}", stacklevel=1)


def _headers():
    return {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}


def get_aip_anomalies() -> list[dict]:
    """Fetch anomaly objects from the Foundry ontology."""
    if _missing:
        raise RuntimeError(f"AIP not configured — missing: {', '.join(_missing)}")
    url = f"{ONTOLOGY_BASE}/objects/{OBJ_TYPE}/search"
    payload = {
        "where": {"type": "gt", "field": "overageDays", "value": 0},
        "orderBy": {"fields": [{"field": "accruedCost", "direction": "DESC"}]},
        "pageSize": 200,
    }
    resp = httpx.post(url, headers=_headers(), json=payload, timeout=15)
    resp.raise_for_status()
    return resp.json().get("data", [])


def get_aip_suggestion(record: dict) -> dict:
    """
    Call ContainerDisputeAdvisor AIP Logic function.
    Returns dict with: recommended_action, confidence, reasoning, draft_notice
    """
    if _missing:
        raise RuntimeError(f"AIP not configured — missing: {', '.join(_missing)}")

    url = f"{LOGIC_BASE}/{FUNCTION_RID}/execute"
    payload = {
        "parameters": {
            "equipmentId":       record["equipment_id"],
            "equipmentType":     record["equipment_type"],
            "size":              record["size"],
            "customerId":        record["customer_id"],
            "pickupLocation":    record["pickup_location"],
            "returnLocation":    record["return_location"],
            "contractFreeDays":  record["contract_free_days"],
            "actualDwellDays":   record["actual_dwell_days"],
            "dailyRateUsd":      record["daily_rate_usd"],
            "overageDays":       record["overage_days"],
            "accruedCost":       record["accrued_cost"],
        }
    }
    resp = httpx.post(url, headers=_headers(), json=payload, timeout=30)
    resp.raise_for_status()

    # AIP Logic returns the function output under "result"
    result = resp.json().get("result", {})

    # The function returns a JSON string or object — handle both
    import json
    if isinstance(result, str):
        result = json.loads(result)

    return {
        "recommended_action": result.get("recommended_action", ""),
        "confidence":         result.get("confidence", ""),
        "reasoning":          result.get("reasoning", ""),
        "draft_notice":       result.get("draft_notice", ""),
    }
