import { useCallback, useState } from 'react'
import { listMyEventRecords, type ListedEventRecord } from '../lib/events/listEventRecords'
import { SourceBadge } from './SourceBadge'
import { EventCard } from './EventCard'

function recordTitle(value: unknown): string {
  if (value && typeof value === 'object' && 'title' in value && typeof (value as { title: unknown }).title === 'string') {
    return (value as { title: string }).title
  }
  return '(no title)'
}

function recordStartsAt(value: unknown): string | null {
  if (value && typeof value === 'object' && 'startsAt' in value) {
    const s = (value as { startsAt: unknown }).startsAt
    return typeof s === 'string' ? s : null
  }
  return null
}

function recordLocation(value: unknown): string | null {
  if (value && typeof value === 'object' && 'location' in value) {
    const s = (value as { location: unknown }).location
    return typeof s === 'string' ? s : null
  }
  return null
}

function recordRsvpCount(value: unknown): number | null {
  if (value && typeof value === 'object' && 'rsvpCount' in value) {
    const n = (value as { rsvpCount: unknown }).rsvpCount
    return typeof n === 'number' ? n : null
  }
  return null
}

export const MyEventRecordsPanel = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [repoDid, setRepoDid] = useState<string | null>(null)
  const [records, setRecords] = useState<ListedEventRecord[]>([])
  const [cursor, setCursor] = useState<string | undefined>(undefined)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const out = await listMyEventRecords()
      setRepoDid(out.repoDid)
      setRecords(out.records)
      setCursor(out.cursor)
    } catch (e) {
      setRepoDid(null)
      setRecords([])
      setCursor(undefined)
      setError(e instanceof Error ? e.message : 'Failed to list records')
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <section
      style={{
        marginTop: '22px',
        padding: '14px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        background: '#fafafa',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <h3 style={{ margin: 0, color: '#0f172a' }}>My PDS Events</h3>
        <SourceBadge variant="pds-list-records" />
      </div>
      <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b', lineHeight: 1.45 }}>
        Lists up to 20 <code style={{ fontSize: '11px' }}>org.community.event</code> records from your
        session DID via <code style={{ fontSize: '11px' }}>com.atproto.repo.listRecords</code>. This is not
        cross-user discovery and does not use an AppView or indexer.
      </p>
      <p
        style={{
          margin: '0 0 12px',
          padding: '10px 12px',
          fontSize: '12px',
          color: '#334155',
          lineHeight: 1.5,
          background: '#f1f5f9',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        }}
      >
        <strong>Architecture:</strong> listRecords only reads one repo. Cross-user discovery requires an
        AppView/indexer.
      </p>
      <button
        type="button"
        onClick={load}
        disabled={loading}
        style={{
          padding: '8px 14px',
          borderRadius: '6px',
          border: 'none',
          background: '#0070ff',
          color: '#fff',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Loading…' : 'Load my events'}
      </button>

      {error && (
        <p style={{ marginTop: '12px', fontSize: '13px', color: '#b91c1c' }} role="alert">
          {error}
        </p>
      )}

      {repoDid !== null && !error && (
        <div style={{ marginTop: '14px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#475569' }}>
            <strong>Repo:</strong> <span style={{ wordBreak: 'break-all' }}>{repoDid}</span>
          </p>
          {cursor && (
            <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#94a3b8' }}>
              More results available (cursor returned; pagination not implemented in this pass).
            </p>
          )}
          {records.length === 0 ? (
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>No event records in this collection.</p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {records.map((r) => {
                const starts = recordStartsAt(r.value)
                const location = recordLocation(r.value)
                const rsvpCount = recordRsvpCount(r.value)
                return (
                  <li key={r.uri}>
                    <EventCard
                      title={recordTitle(r.value)}
                      startsAt={starts}
                      location={location}
                      host={repoDid}
                      rsvpCount={rsvpCount}
                      uri={r.uri}
                      cid={r.cid}
                      sourceVariant="pds-list-records"
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}
