"""
Palantir AIP client using foundry-platform-sdk.
Reads config from backend/.env (or environment variables).
"""

import os
import json
import warnings
import httpx
import foundry_sdk
from foundry_sdk import UserTokenAuth
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / ".env")

HOST        = os.environ.get("PALANTIR_HOST", "").rstrip("/")
TOKEN       = os.environ.get("PALANTIR_TOKEN", "")
ONTOLOGY    = os.environ.get("PALANTIR_ONTOLOGY", "")
OBJ_TYPE    = os.environ.get("AIP_OBJECT_TYPE", "")

_missing = [k for k, v in {
    "PALANTIR_HOST": HOST,
    "PALANTIR_TOKEN": TOKEN,
}.items() if not v]

if _missing:
    warnings.warn(f"AIP not fully configured — missing: {', '.join(_missing)}", stacklevel=1)

_client = None

def _get_client() -> foundry_sdk.FoundryClient:
    global _client
    if _client is None:
        _client = foundry_sdk.FoundryClient(
            auth=UserTokenAuth(token=TOKEN),
            hostname=HOST,
        )
    return _client


def get_aip_anomalies() -> list[dict]:
    """Fetch anomaly objects from the Foundry ontology via raw REST."""
    if HOST and not HOST.startswith("http"):
        base = f"https://{HOST}"
    else:
        base = HOST
    url = f"{base}/api/v2/ontologies/{ONTOLOGY}/objects/{OBJ_TYPE}/search"
    headers = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
    payload = {
        "where": {"type": "eq", "field": "is_anomaly", "value": True},
        "orderBy": {"fields": [{"field": "overage_days", "direction": "DESC"}]},
        "pageSize": 200,
    }
    resp = httpx.post(url, headers=headers, json=payload, timeout=15)
    print(f"[AIP anomalies] {resp.status_code}: {resp.text[:200]}")
    resp.raise_for_status()
    return resp.json().get("data", [])


def get_aip_suggestion(record: dict) -> dict:
    """
    Call ContainerDisputeAdvisor via the Foundry SDK.
    Input param: containerRecord (primary key = equipment_id)
    Output: JSON string with recommended_action, confidence, reasoning, draft_notice
    """
    client = _get_client()
    print(f"[AIP] calling containerDisputeAdvisor with containerRecord={record['equipment_id']}")

    response = client.ontologies.Query.execute(
        ONTOLOGY,
        "containerDisputeAdvisor",
        parameters={"anomalies": record["equipment_id"]},
    )

    print(f"[AIP] raw response: {response}")

    # Output is a String — parse it as JSON
    output = response.value if hasattr(response, "value") else response
    if isinstance(output, str):
        output = json.loads(output, strict=False)

    return {
        "recommended_action": output.get("recommended_action", ""),
        "confidence":         output.get("confidence", ""),
        "reasoning":          output.get("reasoning", ""),
        "draft_notice":       output.get("draft_notice", ""),
    }
