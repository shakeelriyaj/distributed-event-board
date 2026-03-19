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
      eventDate: new Date().toISOString(),
      location: formData.get('location') as string || undefined,
    };

    try {
      const uri = await silentPublishEvent(data);
      setMessage(`✅ Event Published! URI: ${uri} and ${new Date().toLocaleTimeString()}!`);
    } catch (err) {
      setMessage(`❌ Error: ${err instanceof Error ? err.message : 'Failed to post'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
      <h3 style={{ marginTop: 0 }}>New Post</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input 
          name="title" 
          placeholder="What's happening?" 
          required 
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <textarea 
          name="description" 
          placeholder="Add some details..." 
          required 
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', minHeight: '80px' }}
        />
        <input 
          name="location" 
          placeholder="Location (Optional)" 
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '12px', 
            borderRadius: '6px', 
            border: 'none', 
            background: '#0070ff', 
            color: 'white', 
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer' 
          }}
        >
          {loading ? 'Publishing...' : 'Post to Board'}
        </button>
      </form>
      {message && <p style={{ marginTop: '10px', fontSize: '13px', color: '#555' }}>{message}</p>}
    </div>
  );
};