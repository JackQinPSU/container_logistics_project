import { ContainerRecord } from '../types'
import { postAction } from '../api'

interface Props {
  record: ContainerRecord
  onClose: () => void
  onActionDone: (id: string, action: string) => void
}

export default function DetailPanel({ record: r, onClose, onActionDone }: Props) {
  const panel: React.CSSProperties = {
    position: 'fixed', right: 0, top: 0, bottom: 0, width: 380,
    background: '#0f172a', borderLeft: '1px solid #1f2937',
    padding: 24, overflowY: 'auto', zIndex: 100
  }
  const row = (label: string, val: string | number) => (
    <div key={label} style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#f9fafb', marginTop: 2 }}>{val}</div>
    </div>
  )

  const act = async (action: string) => {
    await postAction(r.equipment_id, action)
    onActionDone(r.equipment_id, action)
  }

  const btn = (label: string, action: string, color: string) => (
    <button
      onClick={() => act(action)}
      style={{
        background: color, color: '#fff', border: 'none',
        borderRadius: 6, padding: '8px 16px', cursor: 'pointer',
        fontWeight: 600, fontSize: 13, marginRight: 8
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={panel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontFamily: 'monospace', color: '#60a5fa', fontWeight: 700 }}>{r.equipment_id}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 18 }}>✕</button>
      </div>

      {row('Equipment Type', `${r.equipment_type} — ${r.size}`)}
      {row('Customer', r.customer_id)}
      {row('Pickup Location', r.pickup_location)}
      {row('Return Location', r.return_location)}
      {row('Pickup Date', r.pickup_date)}
      {row('Return Date', r.return_date)}
      {row('Contract Free Days', `${r.contract_free_days} days`)}
      {row('Actual Dwell Days', `${r.actual_dwell_days} days`)}

      <div style={{ margin: '16px 0', padding: 12, background: '#1c1107', borderRadius: 8, border: '1px solid #92400e' }}>
        <div style={{ fontSize: 11, color: '#f59e0b', marginBottom: 4 }}>OVERAGE SUMMARY</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#f87171' }}>+{r.overage_days} days</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#4ade80', marginTop: 4 }}>
          ${r.accrued_cost.toLocaleString()} accrued
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
          @ ${r.daily_rate_usd}/day
        </div>
      </div>

      {r.action && (
        <div style={{ marginBottom: 12, padding: '8px 12px', background: '#1f2937', borderRadius: 6, fontSize: 13, color: '#9ca3af' }}>
          Current action: <strong style={{ color: '#f9fafb' }}>{r.action}</strong>
        </div>
      )}

      <div style={{ display: 'flex', marginTop: 8 }}>
        {btn('Flag for Dispute', 'dispute', '#b45309')}
        {btn('Priority Return', 'priority_return', '#1d4ed8')}
      </div>
    </div>
  )
}