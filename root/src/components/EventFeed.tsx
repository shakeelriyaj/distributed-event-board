import { useEffect, useState, useCallback } from 'react'
import { useJetstream, type JetstreamEvent } from '../atproto/jetstream'
import { SourceBadge } from './SourceBadge'
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
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/events');
      if (!response.ok) throw new Error('Failed to fetch global events');
      const records = await response.json();
      setEvents(records);
    } catch (err) {
      console.error("Failed to load global feed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJetstreamEvent = useCallback((event: JetstreamEvent) => {
    // Jetstream can send different kinds of messages (e.g. 'identity', 'account')
    // and sometimes 'commit' might be missing in non-commit events.
    if (event.kind !== 'commit' || !event.commit) return;

    const { did, commit } = event;
    const { operation, collection, rkey, record, cid } = commit;
    const uri = `at://${did}/${collection}/${rkey}`;

    setEvents((prevEvents) => {
      if (operation === 'create') {
        // Avoid duplicates if we already have it
        if (prevEvents.some((e) => e.uri === uri)) return prevEvents;
        
        const newEvent = {
          uri,
          cid,
          value: record,
        };
        // Add to the top of the feed
        return [newEvent, ...prevEvents];
      }

      if (operation === 'update') {
        return prevEvents.map((e) => 
          e.uri === uri ? { ...e, value: record, cid } : e
        );
      }

      if (operation === 'delete') {
        return prevEvents.filter((e) => e.uri !== uri);
      }

      return prevEvents;
    });
  }, []);

  // Listen for real-time updates via Jetstream
  useJetstream(handleJetstreamEvent);

  // Run once when the component mounts
  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div style={{ marginTop: '24px' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h2 style={{ margin: 0, color: '#333' }}>Demo / mock event feed</h2>
            <SourceBadge variant="mock-feed" />
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b', maxWidth: '640px', lineHeight: 1.5 }}>
            This panel is <strong>not</strong> ATProto AppView discovery. It loads a local{' '}
            <code style={{ fontSize: '11px' }}>localhost:3000</code> JSON API and optionally merges Jetstream
            commits for class demos. Your real persisted events live under <strong>My PDS Events</strong> above.
          </p>
        </div>
        <button
          type="button"
          onClick={loadEvents}
          style={{ padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading mock feed…</p>
      ) : events.length === 0 ? (
        <p>No rows from the mock API yet (server may be offline).</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
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
  );
};