# COSCO Container Anomaly Console

An operations dashboard for monitoring shipping container dwell-time overages and accrued detention costs. Flags containers that exceed their free-time contract window, surfaces accrued cost, and lets operations staff dispatch dispute or priority-return actions — with optional AI-suggested moves via Palantir AIP.

## Stack

| Layer | Tech |
|---|---|
| Backend | Python · FastAPI · SQLite |
| Frontend | React 18 · TypeScript · Vite |
| AI/Data | Palantir Foundry Ontology API · AIP Logic |

## Features

- KPI cards: total records, flagged count, total accrued cost, highest single overage
- Filterable anomaly table sorted by accrued cost descending
- Detail panel with overage summary and one-click action dispatch (dispute / priority return)
- Actions persist across server restarts via SQLite
- Palantir AIP integration: pull anomaly objects from Foundry ontology and request LLM-suggested moves

## Setup

**Backend**
```bash
cd backend
pip install -r requirements.txt
# copy .env.example to .env and fill in your Palantir credentials
uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Palantir AIP

Set the following in `backend/.env`:

```
PALANTIR_HOST=https://yourstack.palantirfoundry.com
PALANTIR_TOKEN=<bearer token>
PALANTIR_ONTOLOGY=ri.ontology.main.ontology.<rid>
AIP_OBJECT_TYPE=<object type RID or API name>
AIP_ACTION_TYPE=<action type RID or API name>
```

Endpoints:
- `GET /aip/anomalies` — anomaly objects from Foundry
- `GET /aip/suggest/{equipment_id}` — LLM-suggested action from AIP Logic

The app runs fully without AIP configured; those endpoints return a 502 with a descriptive error.
