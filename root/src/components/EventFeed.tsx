import { useEffect, useState, useCallback } from 'react'
import { useJetstream, type JetstreamEvent } from '../atproto/jetstream'
import { EventCard } from './EventCard'

function eventWhen(value: Record<string, unknown> | undefined): string | null {
  if (!value) return null
  const startsAt = value.startsAt
  if (typeof startsAt === 'string') return startsAt
  const eventDate = value.eventDate
  if (typeof eventDate === 'string') return eventDate
  return null
}

function eventTitle(value: Record<string, unknown> | undefined): string {
  if (!value) return '(no title)'
  const title = value.title
  return typeof title === 'string' ? title : '(no title)'
}

function eventLocation(value: Record<string, unknown> | undefined): string | null {
  if (!value) return null
  const location = value.location
  return typeof location === 'string' ? location : null
}

function eventRsvpCount(value: Record<string, unknown> | undefined): number | null {
  if (!value) return null
  const count = value.rsvpCount
  return typeof count === 'number' ? count : null
}

function eventHost(uri: string | undefined, value: Record<string, unknown> | undefined): string | null {
  if (value) {
    const hostHandle = value.hostHandle
    if (typeof hostHandle === 'string') return hostHandle
    const hostDid = value.hostDid
    if (typeof hostDid === 'string') return hostDid
  }
  if (!uri || !uri.startsWith('at://')) return null
  const parts = uri.slice('at://'.length).split('/').filter(Boolean)
  return parts[0] ?? null
}

export const EventFeed = () => {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [live, setLive] = useState(true)

  const loadEvents = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:3000/api/events')
      if (!response.ok) throw new Error('Failed to fetch global events')
      const records = await response.json()
      setEvents(records)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed')
    } finally {
      setLoading(false)
    }
  }

  const handleJetstreamEvent = useCallback((event: JetstreamEvent) => {
    if (event.kind !== 'commit' || !event.commit) return

    const { did, commit } = event
    const { operation, collection, rkey, record, cid } = commit
    const uri = `at://${did}/${collection}/${rkey}`

    setEvents((prev) => {
      if (operation === 'create') {
        if (prev.some((e) => e.uri === uri)) return prev
        return [{ uri, cid, value: record }, ...prev]
      }
      if (operation === 'update') {
        return prev.map((e) => (e.uri === uri ? { ...e, value: record, cid } : e))
      }
      if (operation === 'delete') {
        return prev.filter((e) => e.uri !== uri)
      }
      return prev
    })
  }, [])

  useJetstream(handleJetstreamEvent)

  useEffect(() => {
    loadEvents()
  }, [])

  return (
    <div>
      <section
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '14px 24px',
          borderBottom: '1px solid var(--en-line)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={'en-livedot ' + (live ? '' : 'en-livedot--off')} aria-hidden />
          <span
            style={{
              fontSize: 12,
              fontFamily: 'var(--en-font-mono)',
              color: 'var(--en-text-soft)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {live ? 'Live · jetstream' : 'Paused'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            className="en-btn en-btn--sm"
            onClick={() => setLive((v) => !v)}
            aria-label="Toggle live updates"
          >
            {live ? 'Pause' : 'Resume'}
          </button>
          <button type="button" className="en-btn en-btn--sm" onClick={loadEvents} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </section>

      {error ? (
        <div className="en-section">
          <div className="en-toast en-toast--danger">Couldn't load mock feed: {error}</div>
        </div>
      ) : null}

      {loading && events.length === 0 ? (
        <div className="en-section">
          <div className="en-stack">
            {[0, 1, 2].map((i) => (
              <div key={i} className="en-post">
                <div className="en-avatar" style={{ background: '#e7eef1' }} />
                <div style={{ width: '100%' }}>
                  <div className="en-skeleton" style={{ width: '40%' }} />
                  <div className="en-skeleton" style={{ width: '70%', height: 16, marginTop: 10 }} />
                  <div className="en-skeleton" style={{ width: '90%', marginTop: 10 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="en-empty">
          <div className="en-empty__title">No events streaming yet</div>
          <div className="en-empty__sub">
            Posts from the org.community.event collection will appear here in real time.
          </div>
        </div>
      ) : (
        <div>
          {events.map((evt) => (
            <EventCard
              key={evt.uri ?? `${eventTitle(evt.value)}-${eventWhen(evt.value) ?? 'na'}`}
              title={eventTitle(evt.value)}
              startsAt={eventWhen(evt.value)}
              location={eventLocation(evt.value)}
              host={eventHost(evt.uri, evt.value)}
              rsvpCount={eventRsvpCount(evt.value)}
              uri={typeof evt.uri === 'string' ? evt.uri : undefined}
              cid={typeof evt.cid === 'string' ? evt.cid : undefined}
              sourceVariant="mock-feed"
            />
          ))}
        </div>
      )}
    </div>
  )
}
