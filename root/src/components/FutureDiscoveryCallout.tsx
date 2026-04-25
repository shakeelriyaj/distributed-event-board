import { SourceBadge } from './SourceBadge'

export function FutureDiscoveryCallout() {
  return (
    <section
      style={{
        marginTop: '28px',
        padding: '14px 16px',
        borderRadius: '10px',
        border: '1px dashed #cbd5e1',
        background: '#f8fafc',
      }}
      aria-label="Future AppView discovery (not implemented)"
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', color: '#475569' }}>Cross-user discovery</h3>
        <SourceBadge variant="future-appview" />
      </div>
      <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
        Ranked feeds, search, and “everyone’s events” need an AppView or indexer over the network. This placeholder
        exists so the UI does not confuse the mock feed with that future layer.
      </p>
    </section>
  )
}
