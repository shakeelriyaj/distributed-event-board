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
    <section
      style={{
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        background: '#fff',
      }}
    >
      <h2 style={{ margin: '0 0 8px', fontSize: '1.05rem', color: '#0f172a' }}>Protocol intent mapping</h2>
      <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b', lineHeight: 1.45 }}>
        Click an action to preview its ATProto collection and sample record shape.
      </p>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {(Object.keys(INTENTS) as IntentKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#0f172a',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {INTENTS[key].label}
          </button>
        ))}
      </div>

      {current && (
        <div
          role="dialog"
          aria-label={`${current.label} protocol mapping`}
          style={{
            marginTop: '14px',
            border: '1px solid #dbeafe',
            borderRadius: '10px',
            background: '#f0f7ff',
            padding: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '0.98rem', color: '#0f172a' }}>{current.label}</h3>
            <button
              type="button"
              onClick={() => setActive(null)}
              style={{
                border: '1px solid #cbd5e1',
                background: '#fff',
                borderRadius: '6px',
                padding: '4px 8px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
          <p style={{ margin: '10px 0 6px', fontSize: '12px', color: '#334155' }}>
            <strong>ATProto collection:</strong> <code>{current.collection}</code>
          </p>
          <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#b45309', fontWeight: 700 }}>
            Not implemented yet
          </p>
          <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#334155' }}>Example record JSON</p>
          <pre
            style={{
              margin: 0,
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #dbeafe',
              background: '#fff',
              fontSize: '12px',
              overflow: 'auto',
            }}
          >
            {JSON.stringify(current.exampleRecord, null, 2)}
          </pre>
        </div>
      )}
    </section>
  )
}
