import React, { useEffect, useState, useCallback } from 'react';
import { fetchEvents } from '../atproto/events';
import { useJetstream, type JetstreamEvent } from '../atproto/jetstream';

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
    <div style={{ marginTop: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: '#333' }}>🗓️ Live Event Feed</h2>
        <button 
          onClick={loadEvents} 
          style={{ padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <p>📡 Fetching from AT Protocol...</p>
      ) : events.length === 0 ? (
        <p>No events found. Be the first to post!</p>
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
                <span>📅 {new Date(evt.value.eventDate).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};