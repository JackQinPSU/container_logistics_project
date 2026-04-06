import { ContainerRecord } from '../types'

const actionColor: Record<string, string> = {
  dispute: '#854d0e',
  priority_return: '#1e3a5f',
}
const actionLabel: Record<string, string> = {
  dispute: 'Dispute',
  priority_return: 'Priority Return',
}

interface Props {
  records: ContainerRecord[]
  onSelect: (r: ContainerRecord) => void
  selected: ContainerRecord | null
}

export default function AnomalyTable({ records, onSelect, selected }: Props) {
  const th: React.CSSProperties = {
    padding: '10px 14px', textAlign: 'left',
    fontSize: 11, color: '#6b7280', fontWeight: 600,
    borderBottom: '1px solid #1f2937', textTransform: 'uppercase', letterSpacing: 1
  }
  const td: React.CSSProperties = {
    padding: '10px 14px', fontSize: 13, color: '#d1d5db',
    borderBottom: '1px solid #1f2937'
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #1f2937' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#0f172a' }}>
            {['Equipment ID', 'Type', 'Size', 'Pickup Location', 'Customer',
              'Free Days', 'Dwell Days', 'Overage', 'Accrued Cost', 'Action'].map(h => (
              <th key={h} style={th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map(r => {
            const isSelected = selected?.equipment_id === r.equipment_id
            const rowBg = isSelected ? '#1e293b' : r.overage_days >= 30 ? '#1c1107' : 'transparent'
            return (
              <tr
                key={r.equipment_id}
                onClick={() => onSelect(r)}
                style={{ background: rowBg, cursor: 'pointer' }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#1f2937' }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = rowBg }}
              >
                <td style={{ ...td, fontFamily: 'monospace', color: '#60a5fa' }}>{r.equipment_id}</td>
                <td style={td}>{r.equipment_type}</td>
                <td style={td}>{r.size}</td>
                <td style={td}>{r.pickup_location}</td>
                <td style={{ ...td, fontFamily: 'monospace' }}>{r.customer_id}</td>
                <td style={td}>{r.contract_free_days}d</td>
                <td style={td}>{r.actual_dwell_days}d</td>
                <td style={{ ...td, color: r.overage_days >= 30 ? '#f87171' : '#fb923c', fontWeight: 600 }}>
                  +{r.overage_days}d
                </td>
                <td style={{ ...td, color: '#4ade80', fontWeight: 700 }}>
                  ${r.accrued_cost.toLocaleString()}
                </td>
                <td style={td}>
                  {r.action ? (
                    <span style={{
                      background: actionColor[r.action] || '#374151',
                      color: '#f9fafb', fontSize: 11, padding: '2px 8px',
                      borderRadius: 4, fontWeight: 600
                    }}>
                      {actionLabel[r.action] || r.action}
                    </span>
                  ) : <span style={{ color: '#4b5563' }}>—</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}