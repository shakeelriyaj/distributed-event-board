import { useCallback, useState } from 'react'
import { listMyEventRecords, type ListedEventRecord } from '../lib/events/listEventRecords'

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
      <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>My events (this repo only)</h3>
      <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b', lineHeight: 1.45 }}>
        Lists up to 20 <code style={{ fontSize: '11px' }}>org.community.event</code> records from your
        session DID via <code style={{ fontSize: '11px' }}>com.atproto.repo.listRecords</code>. This is not
        cross-user discovery and does not use an AppView or indexer.
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
                return (
                <li
                  key={r.uri}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    background: '#fff',
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>{recordTitle(r.value)}</div>
                  {starts && (
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                      startsAt: {starts}
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: '#94a3b8', wordBreak: 'break-all' }}>{r.uri}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', wordBreak: 'break-all', marginTop: '4px' }}>
                    cid: {r.cid}
                  </div>
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
