import { useState } from 'react'
import { ContainerRecord } from '../types'
import { postAction, fetchSuggestion, AipSuggestion } from '../api'

interface Props {
  record: ContainerRecord
  onClose: () => void
  onActionDone: (id: string, action: string) => void
}

const confidenceColor: Record<string, string> = {
  High:   '#4ade80',
  Medium: '#fb923c',
  Low:    '#f87171',
}

export default function DetailPanel({ record: r, onClose, onActionDone }: Props) {
  const [saving, setSaving]         = useState(false)
  const [actError, setActError]     = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState<AipSuggestion | null>(null)
  const [loadingAip, setLoadingAip] = useState(false)
  const [aipError, setAipError]     = useState<string | null>(null)

  const panel: React.CSSProperties = {
    position: 'fixed', right: 0, top: 0, bottom: 0, width: 420,
    background: '#0f172a', borderLeft: '1px solid #1f2937',
    padding: 24, overflowY: 'auto', zIndex: 100,
  }

  const row = (label: string, val: string | number) => (
    <div key={label} style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#f9fafb', marginTop: 2 }}>{val}</div>
    </div>
  )

  const act = async (action: string) => {
    setSaving(true)
    setActError(null)
    try {
      await postAction(r.equipment_id, action)
      onActionDone(r.equipment_id, action)
    } catch {
      setActError('Failed to save action. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const askAip = async () => {
    setLoadingAip(true)
    setAipError(null)
    setSuggestion(null)
    try {
      const result = await fetchSuggestion(r.equipment_id)
      setSuggestion(result)
    } catch {
      setAipError('Could not reach AIP. Check that AIP_FUNCTION_RID is set and the token is valid.')
    } finally {
      setLoadingAip(false)
    }
  }

  const btn = (label: string, action: string, color: string) => (
    <button
      key={action}
      onClick={() => act(action)}
      disabled={saving}
      style={{
        background: saving ? '#374151' : color,
        color: '#fff', border: 'none', borderRadius: 6,
        padding: '8px 16px', cursor: saving ? 'not-allowed' : 'pointer',
        fontWeight: 600, fontSize: 13, marginRight: 8,
        opacity: saving ? 0.6 : 1,
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={panel}>
      {/* Header */}
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

      {/* Overage summary */}
      <div style={{ margin: '16px 0', padding: 12, background: '#1c1107', borderRadius: 8, border: '1px solid #92400e' }}>
        <div style={{ fontSize: 11, color: '#f59e0b', marginBottom: 4 }}>OVERAGE SUMMARY</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#f87171' }}>+{r.overage_days} days</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#4ade80', marginTop: 4 }}>
          ${r.accrued_cost.toLocaleString()} accrued
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>@ ${r.daily_rate_usd}/day</div>
      </div>

      {/* Current action badge */}
      {r.action && (
        <div style={{ marginBottom: 12, padding: '8px 12px', background: '#1f2937', borderRadius: 6, fontSize: 13, color: '#9ca3af' }}>
          Current action: <strong style={{ color: '#f9fafb' }}>{r.action}</strong>
        </div>
      )}

      {/* Action buttons */}
      {actError && (
        <div style={{ marginBottom: 10, padding: '8px 12px', background: '#1c0a0a', border: '1px solid #7f1d1d', borderRadius: 6, fontSize: 12, color: '#f87171' }}>
          {actError}
        </div>
      )}
      <div style={{ display: 'flex', marginBottom: 20 }}>
        {btn('Flag for Dispute', 'dispute', '#b45309')}
        {btn('Priority Return', 'priority_return', '#1d4ed8')}
      </div>

      {/* AIP suggestion */}
      <div style={{ borderTop: '1px solid #1f2937', paddingTop: 16 }}>
        <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          AI Advisor · ContainerDisputeAdvisor
        </div>

        <button
          onClick={askAip}
          disabled={loadingAip}
          style={{
            width: '100%', background: loadingAip ? '#1e3a5f' : '#1d4ed8',
            color: '#fff', border: 'none', borderRadius: 6,
            padding: '9px 0', cursor: loadingAip ? 'not-allowed' : 'pointer',
            fontWeight: 600, fontSize: 13, marginBottom: 12,
            opacity: loadingAip ? 0.7 : 1,
          }}
        >
          {loadingAip ? 'Asking AIP...' : 'Get AI Suggestion'}
        </button>

        {aipError && (
          <div style={{ padding: '8px 12px', background: '#1c0a0a', border: '1px solid #7f1d1d', borderRadius: 6, fontSize: 12, color: '#f87171' }}>
            {aipError}
          </div>
        )}

        {suggestion && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Recommended action + confidence */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#111827', borderRadius: 8, border: '1px solid #1f2937' }}>
              <div>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>RECOMMENDED ACTION</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f9fafb' }}>{suggestion.recommended_action}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>CONFIDENCE</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: confidenceColor[suggestion.confidence] || '#f9fafb' }}>
                  {suggestion.confidence}
                </div>
              </div>
            </div>

            {/* Reasoning */}
            <div style={{ padding: '10px 14px', background: '#111827', borderRadius: 8, border: '1px solid #1f2937' }}>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>REASONING</div>
              <div style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.6 }}>{suggestion.reasoning}</div>
            </div>

            {/* Draft notice */}
            <div style={{ padding: '10px 14px', background: '#0f1f0f', borderRadius: 8, border: '1px solid #14532d' }}>
              <div style={{ fontSize: 11, color: '#4ade80', marginBottom: 6 }}>DRAFT DISPUTE NOTICE</div>
              <div style={{ fontSize: 12, color: '#d1d5db', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {suggestion.draft_notice}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
