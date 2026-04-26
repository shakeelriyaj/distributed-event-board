import { useCallback, useState } from 'react'
import { deleteEventRecordAndCleanupRecent } from '../lib/events/deleteEventRecord'
import { listMyEventRecords, type ListedEventRecord } from '../lib/events/listEventRecords'
import { EventCard } from './EventCard'
import { shortenDid } from '../eventnet/avatar'

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
  const [loaded, setLoaded] = useState(false)

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
      setLoaded(true)
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
    <>
      <section className="en-section">
        <div className="en-section__head">
          <h2 className="en-section__title">My PDS events</h2>
          <span className="en-srcbadge en-srcbadge--pds">PDS · listRecords</span>
        </div>
        <p className="en-section__sub">
          Records from your session DID via <code>com.atproto.repo.listRecords</code>. One repo, no AppView.
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: 13, color: 'var(--en-text-soft)', display: 'flex', gap: 6, alignItems: 'center' }}>
            Limit
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value) as 10 | 20 | 50)}
              className="en-input"
              style={{ width: 'auto', padding: '6px 8px' }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
          <button type="button" onClick={load} disabled={loading} className="en-btn en-btn--primary">
            {loading ? 'Loading…' : loaded ? 'Refresh' : 'Load my events'}
          </button>
          {repoDid ? (
            <span style={{ fontSize: 12, color: 'var(--en-text-soft)' }}>
              repo · {shortenDid(repoDid, 14)} · {records.length} records
            </span>
          ) : null}
        </div>
        {error && <div className="en-toast en-toast--danger" role="alert" style={{ marginTop: 10 }}>{error}</div>}
        {deleteError && <div className="en-toast en-toast--danger" role="alert" style={{ marginTop: 10 }}>{deleteError}</div>}
      </section>

      {repoDid !== null && !error && (
        <>
          {records.length === 0 ? (
            <div className="en-empty">
              <div className="en-empty__title">No records yet</div>
              <div className="en-empty__sub">Publish your first event from the Compose page.</div>
            </div>
          ) : (
            <div>
              {records.map((r) => (
                <div key={r.uri} style={{ position: 'relative' }}>
                  <EventCard
                    title={recordTitle(r.value)}
                    startsAt={recordStartsAt(r.value)}
                    location={recordLocation(r.value)}
                    host={repoDid}
                    rsvpCount={recordRsvpCount(r.value)}
                    uri={r.uri}
                    cid={r.cid}
                    sourceVariant="pds-list-records"
                  />
                  <div style={{ padding: '0 18px 10px', marginTop: -6 }}>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.uri)}
                      disabled={deletingUri === r.uri}
                      className="en-btn en-btn--sm en-btn--danger"
                    >
                      {deletingUri === r.uri ? 'Deleting…' : 'Delete from my PDS'}
                    </button>
                  </div>
                </div>
              ))}
              {cursor ? (
                <div style={{ padding: 18, textAlign: 'center' }}>
                  <button type="button" onClick={loadMore} disabled={loading} className="en-btn">
                    {loading ? 'Loading…' : 'Load more'}
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </>
      )}
    </>
  )
}
