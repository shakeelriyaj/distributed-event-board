import { useMemo, useState } from 'react'

type IntentKey = 'rsvp' | 'repost' | 'follow'

type IntentSpec = {
  label: string
  collection: string
  exampleRecord: Record<string, unknown>
}

const INTENTS: Record<IntentKey, IntentSpec> = {
  rsvp: {
    label: 'RSVP',
    collection: 'org.community.event.rsvp',
    exampleRecord: {
      $type: 'org.community.event.rsvp',
      eventUri: 'at://did:plc:host/org.community.event/3k-example',
      attendee: 'did:plc:viewer',
      status: 'going',
      createdAt: '2026-04-25T19:00:00.000Z',
    },
  },
  repost: {
    label: 'Repost',
    collection: 'app.bsky.feed.repost',
    exampleRecord: {
      $type: 'app.bsky.feed.repost',
      subject: {
        uri: 'at://did:plc:host/org.community.event/3k-example',
        cid: 'bafyexamplecid',
      },
      createdAt: '2026-04-25T19:00:00.000Z',
    },
  },
  follow: {
    label: 'Follow',
    collection: 'app.bsky.graph.follow',
    exampleRecord: {
      $type: 'app.bsky.graph.follow',
      subject: 'did:plc:eventorganizer',
      createdAt: '2026-04-25T19:00:00.000Z',
    },
  },
}

export function ProtocolIntentPanel() {
  const [active, setActive] = useState<IntentKey | null>(null)
  const current = useMemo(() => (active ? INTENTS[active] : null), [active])

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Protocol intents</h2>
      <p style={{ fontSize: 13, color: 'var(--en-text-soft)', marginBottom: 14, lineHeight: 1.5 }}>
        Preview the ATProto collection and sample record shape for each social action.
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(Object.keys(INTENTS) as IntentKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={'en-btn en-btn--sm ' + (active === key ? 'en-btn--primary' : '')}
          >
            {INTENTS[key].label}
          </button>
        ))}
      </div>

      {current && (
        <div role="dialog" aria-label={`${current.label} mapping`} className="en-panel en-panel--info" style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800 }}>{current.label}</h3>
            <button type="button" className="en-btn en-btn--sm" onClick={() => setActive(null)}>
              Close
            </button>
          </div>
          <div className="en-meta-row" style={{ marginTop: 0 }}>
            <span>
              <strong>collection</strong> <code>{current.collection}</code>
            </span>
            <span>
              <span className="en-chip en-chip--warn">Not implemented</span>
            </span>
          </div>
          <h4 style={{ margin: '12px 0 6px', fontSize: 13, color: 'var(--en-text-soft)' }}>Example record</h4>
          <pre className="en-pre">{JSON.stringify(current.exampleRecord, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
