import React, { useState } from 'react';
import { silentPublishEvent } from '../atproto/events';

export const EventForm = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      eventDate: new Date(formData.get('date') as string).toISOString(),
      location: formData.get('location') as string || undefined,
    };

    try {
      const uri = await silentPublishEvent(data);
      setMessage(`✅ Event Published! URI: ${uri}`);
    } catch (err) {
      setMessage(`❌ Error: ${err instanceof Error ? err.message : 'Failed to post'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <h2>Create New Event</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input name="title" placeholder="Event Title" required />
        <textarea name="description" placeholder="Description" required />
        <input name="date" type="datetime-local" required />
        <input name="location" placeholder="Location (Optional)" />
        <button type="submit" disabled={loading}>
          {loading ? 'Publishing...' : 'Post to AT Protocol'}
        </button>
      </form>
      {message && <p style={{ fontSize: '12px', wordBreak: 'break-all' }}>{message}</p>}
    </div>
  );
};