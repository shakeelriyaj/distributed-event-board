import { useCallback, useState } from 'react'
import { deleteEventRecordAndCleanupRecent } from '../lib/events/deleteEventRecord'
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
  const [limit, setLimit] = useState<10 | 20 | 50>(20)
  const [deletingUri, setDeletingUri] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const mergeUniqueByUri = (incoming: ListedEventRecord[]) => {
    const seen = new Set<string>()
    return incoming.filter((r) => {
      if (seen.has(r.uri)) return false
      seen.add(r.uri)
      return true
    })
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setDeleteError(null)
    try {
      const out = await listMyEventRecords({ limit })
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
  }, [limit])

  const loadMore = useCallback(async () => {
    if (!cursor) return
    setLoading(true)
    setError(null)
    setDeleteError(null)
    try {
      const out = await listMyEventRecords({ limit, cursor })
      setRepoDid(out.repoDid)
      setRecords((prev) => mergeUniqueByUri([...prev, ...out.records]))
      setCursor(out.cursor)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load more records')
    } finally {
      setLoading(false)
    }
  }, [cursor, limit])

  const handleDelete = useCallback(async (uri: string) => {
    const typed = window.prompt('Type DELETE to confirm removing this record from your PDS:')
    if (typed !== 'DELETE') return
    setDeletingUri(uri)
    setDeleteError(null)
    try {
      await deleteEventRecordAndCleanupRecent(uri)
      setRecords((prev) => prev.filter((r) => r.uri !== uri))
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Failed to delete record')
    } finally {
      setDeletingUri(null)
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
        Lists <code style={{ fontSize: '11px' }}>org.community.event</code> records from your
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
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ fontSize: '12px', color: '#475569' }}>
          Limit:{' '}
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value) as 10 | 20 | 50)}
            style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
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
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <p style={{ marginTop: '12px', fontSize: '13px', color: '#b91c1c' }} role="alert">
          {error}
        </p>
      )}
      {deleteError && (
        <p style={{ marginTop: '8px', fontSize: '13px', color: '#b91c1c' }} role="alert">
          Delete error: {deleteError}
        </p>
      )}

      {repoDid !== null && !error && (
        <div style={{ marginTop: '14px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#475569' }}>
            <strong>Repo:</strong> <span style={{ wordBreak: 'break-all' }}>{repoDid}</span>
          </p>
          <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#475569' }}>
            <strong>Count:</strong> {records.length}
          </p>
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
                    <div style={{ marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(r.uri)}
                        disabled={deletingUri === r.uri}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #fecaca',
                          background: '#fff1f2',
                          color: '#9f1239',
                          cursor: deletingUri === r.uri ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {deletingUri === r.uri ? 'Deleting…' : 'Delete from my PDS'}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          {cursor ? (
            <div style={{ marginTop: '10px' }}>
              <button
                type="button"
                onClick={loadMore}
                disabled={loading}
                style={{
                  padding: '7px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#0f172a',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Loading…' : 'Load More'}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
