const BASE = 'http://localhost:8000'

export const fetchAnomalies = (): Promise<any[]> =>
  fetch(`${BASE}/anomalies`).then(r => {
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
    return r.json()
  })

export const fetchSummary = (): Promise<any> =>
  fetch(`${BASE}/summary`).then(r => {
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
    return r.json()
  })

export interface AipSuggestion {
  recommended_action: string
  confidence: string
  reasoning: string
  draft_notice: string
}

export const fetchSuggestion = async (equipment_id: string): Promise<AipSuggestion> => {
  const r = await fetch(`${BASE}/aip/suggest/${equipment_id}`)
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
  return r.json()
}

export const postAction = async (equipment_id: string, action: string): Promise<void> => {
  const r = await fetch(`${BASE}/records/${equipment_id}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  })
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
}
