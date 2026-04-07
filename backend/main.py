from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import Summary, ActionRequest
import data_loader
import aip_client

app = FastAPI(title="COSCO Anomaly Console")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    data_loader.load()

@app.get("/records")
def get_records():
    return data_loader.get_all()

@app.get("/anomalies")
def get_anomalies():
    records = [r for r in data_loader.get_all() if r["overage_days"] > 0]
    return sorted(records, key=lambda r: r["accrued_cost"], reverse=True)

@app.get("/summary", response_model=Summary)
def get_summary():
    all_rec = data_loader.get_all()
    flagged = [r for r in all_rec if r["overage_days"] > 0]
    costs = [r["accrued_cost"] for r in flagged]
    return Summary(
        total_records=len(all_rec),
        flagged_records=len(flagged),
        total_accrued_cost=round(sum(costs), 2),
        highest_cost_overage=round(max(costs, default=0), 2),
    )

@app.get("/aip/anomalies")
def get_aip_anomalies():
    """Pull anomaly records directly from Palantir AIP ontology."""
    try:
        return aip_client.get_aip_anomalies()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AIP error: {e}")

@app.get("/aip/suggest/{equipment_id}")
def get_aip_suggestion(equipment_id: str):
    """Call ContainerDisputeAdvisor AIP Logic function for a specific container."""
    records = data_loader.get_all()
    record = next((r for r in records if r["equipment_id"] == equipment_id), None)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    try:
        return aip_client.get_aip_suggestion(record)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AIP error: {e}")

@app.post("/records/{equipment_id}/action")
def post_action(equipment_id: str, body: ActionRequest):
    ok = data_loader.set_action(equipment_id, body.action)
    if not ok:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"equipment_id": equipment_id, "action": body.action}