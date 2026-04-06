interface Props {
  locations: string[]
  customers: string[]
  locFilter: string
  custFilter: string
  onLoc: (v: string) => void
  onCust: (v: string) => void
}

const sel: React.CSSProperties = {
  background: '#111827', color: '#d1d5db',
  border: '1px solid #374151', borderRadius: 6,
  padding: '6px 10px', fontSize: 13
}

export default function FilterBar({ locations, customers, locFilter, custFilter, onLoc, onCust }: Props) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
      <select style={sel} value={locFilter} onChange={e => onLoc(e.target.value)}>
        <option value="">All Locations</option>
        {locations.map(l => <option key={l}>{l}</option>)}
      </select>
      <select style={sel} value={custFilter} onChange={e => onCust(e.target.value)}>
        <option value="">All Customers</option>
        {customers.map(c => <option key={c}>{c}</option>)}
      </select>
    </div>
  )
}