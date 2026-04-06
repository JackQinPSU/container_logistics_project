const BASE = 'http://localhost:8000'

export const fetchAnomalies = () =>
  fetch(`${BASE}/anomalies`).then(r => r.json())

export const fetchSummary = () =>
  fetch(`${BASE}/summary`).then(r => r.json())

export const postAction = (equipment_id: string, action: string) =>
  fetch(`${BASE}/records/${equipment_id}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  }).then(r => r.json())