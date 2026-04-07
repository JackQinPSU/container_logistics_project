import { useEffect, useState, useMemo } from 'react'
import { ContainerRecord, Summary } from './types'
import { fetchAnomalies, fetchSummary } from './api'
import KPICards from './components/KPICards'
import FilterBar from './components/FilterBar'
import AnomalyTable from './components/AnomalyTable'
import DetailPanel from './components/DetailPanel'

export default function App() {
  const [records, setRecords]   = useState<ContainerRecord[]>([])
  const [summary, setSummary]   = useState<Summary | null>(null)
  const [selected, setSelected] = useState<ContainerRecord | null>(null)
  const [locFilter, setLocFilter]   = useState('')
  const [custFilter, setCustFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetchAnomalies(), fetchSummary()])
      .then(([recs, sum]) => { setRecords(recs); setSummary(sum) })
      .catch(() => setError('Could not reach the backend. Make sure the server is running on port 8000.'))
      .finally(() => setLoading(false))
  }, [])

  const locations = useMemo(() => [...new Set(records.map(r => r.pickup_location))].sort(), [records])
  const customers = useMemo(() => [...new Set(records.map(r => r.customer_id))].sort(), [records])

  const filtered = useMemo(() => records.filter(r =>
    (!locFilter || r.pickup_location === locFilter) &&
    (!custFilter || r.customer_id === custFilter)
  ), [records, locFilter, custFilter])

  const handleActionDone = (id: string, action: string) => {
    setRecords(prev => prev.map(r => r.equipment_id === id ? { ...r, action } : r))
    setSelected(prev => prev?.equipment_id === id ? { ...prev, action } : prev)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 32px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: '#6b7280', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
            Operations Console
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#f9fafb' }}>
            Container Dwell & Cost Anomaly Console
          </h1>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
            Anomaly queue · sorted by accrued cost descending
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#6b7280', fontSize: 14 }}>
            Loading...
          </div>
        )}

        {error && (
          <div style={{
            background: '#1c0a0a', border: '1px solid #7f1d1d', borderRadius: 8,
            padding: '16px 20px', color: '#f87171', fontSize: 14, marginBottom: 24,
          }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {summary && <KPICards s={summary} />}
            <FilterBar
              locations={locations} customers={customers}
              locFilter={locFilter} custFilter={custFilter}
              onLoc={setLocFilter} onCust={setCustFilter}
            />
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
              Showing {filtered.length} flagged records
            </div>
            <AnomalyTable records={filtered} onSelect={setSelected} selected={selected} />
          </>
        )}
      </div>

      {selected && (
        <DetailPanel
          record={selected}
          onClose={() => setSelected(null)}
          onActionDone={handleActionDone}
        />
      )}
    </div>
  )
}
