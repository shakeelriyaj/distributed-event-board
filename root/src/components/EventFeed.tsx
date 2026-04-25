import { useEffect, useState, useCallback } from 'react'
import { useJetstream, type JetstreamEvent } from '../atproto/jetstream'
import { SourceBadge } from './SourceBadge'

function eventWhen(value: Record<string, unknown> | undefined): string | null {
  if (!value) return null
  const startsAt = value.startsAt
  if (typeof startsAt === 'string') return startsAt
  const eventDate = value.eventDate
  if (typeof eventDate === 'string') return eventDate
  return null
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
            <div 
              key={evt.uri} 
              style={{ 
                border: '1px solid #ddd', 
                padding: '20px', 
                borderRadius: '10px', 
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', color: '#0070ff' }}>{evt.value.title}</h3>
              <p style={{ margin: '0 0 15px 0', color: '#555', lineHeight: '1.4' }}>
                {evt.value.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
                <span>📍 {evt.value.location || 'Remote/TBD'}</span>
                <span>
                  📅{' '}
                  {(() => {
                    const when = eventWhen(evt.value)
                    return when ? new Date(when).toLocaleString() : '—'
                  })()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};