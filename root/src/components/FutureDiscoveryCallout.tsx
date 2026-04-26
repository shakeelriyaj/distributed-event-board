import { SourceBadge } from './SourceBadge'

export function FutureDiscoveryCallout() {
  return (
    <section className="en-section" aria-label="Future AppView discovery">
      <div className="en-panel en-panel--dashed">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800 }}>Cross-user discovery</h3>
          <SourceBadge variant="future-appview" />
        </div>
        <p style={{ fontSize: 13, color: 'var(--en-text-soft)', lineHeight: 1.55 }}>
          Ranked feeds, search, and "everyone's events" need an AppView or indexer over the network. This
          placeholder exists so the UI does not confuse the mock feed with that future layer.
        </p>
      </div>
    </section>
  )
}
