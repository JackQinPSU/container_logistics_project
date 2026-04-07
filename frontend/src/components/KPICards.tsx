import { Summary } from '../types'

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0 })

export default function KPICards({ s }: { s: Summary }) {
  const cards = [
    { label: 'Total Records',        value: s.total_records.toLocaleString() },
    { label: 'Flagged (Overage)',    value: s.flagged_records.toLocaleString() },
    { label: 'Total Accrued Cost',   value: fmt(s.total_accrued_cost) },
    { label: 'Highest Single Overage', value: fmt(s.highest_cost_overage) },
  ]
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 16,
      marginBottom: 24,
    }}>
      {cards.map(c => (
        <div key={c.label} style={{
          background: '#111827', border: '1px solid #1f2937',
          borderRadius: 8, padding: '16px 20px',
        }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{c.label}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb' }}>{c.value}</div>
        </div>
      ))}
    </div>
  )
}
