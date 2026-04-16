import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;
const JETSTREAM_URL = 'wss://jetstream1.us-east.bsky.network/subscribe?wantedCollections=org.community.event';

app.use(cors());
app.use(express.json());

// --- Database Setup ---
const db = new Database('events.db');

// Create the events table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    uri TEXT PRIMARY KEY,
    cid TEXT NOT NULL,
    did TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    eventDate TEXT NOT NULL,
    location TEXT,
    createdAt TEXT NOT NULL,
    indexedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const insertEvent = db.prepare(`
  INSERT OR REPLACE INTO events (uri, cid, did, title, description, eventDate, location, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const deleteEvent = db.prepare(`DELETE FROM events WHERE uri = ?`);

// --- Jetstream Consumer ---
function connectJetstream() {
  console.log('🔌 Indexer connecting to Jetstream...');
  const ws = new WebSocket(JETSTREAM_URL);

  ws.on('open', () => {
    console.log('✅ Indexer connected to Jetstream');
  });

  ws.on('message', (data: string) => {
    try {
      const event = JSON.parse(data);
      if (event.kind === 'commit' && event.commit.collection === 'org.community.event') {
        const { operation, rkey, record, cid } = event.commit;
        const did = event.did;
        const uri = `at://${did}/org.community.event/${rkey}`;

        if (operation === 'create' || operation === 'update') {
          console.log(`📥 Indexing event: ${record.title} by ${did}`);
          insertEvent.run(
            uri,
            cid,
            did,
            record.title,
            record.description,
            record.eventDate,
            record.location || null,
            record.createdAt
          );
        } else if (operation === 'delete') {
          console.log(`🗑️ Deleting event: ${uri}`);
          deleteEvent.run(uri);
        }
      }
    } catch (err) {
      console.error('❌ Error processing Jetstream message:', err);
    }
  });

  ws.on('close', () => {
    console.log('❌ Jetstream connection lost. Reconnecting in 5s...');
    setTimeout(connectJetstream, 5000);
  });

  ws.on('error', (err) => {
    console.error('⚠️ Jetstream error:', err);
    ws.terminate();
  });
}

connectJetstream();

// --- API Endpoints ---

// Get all events from the global index
app.get('/api/events', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM events ORDER BY eventDate DESC').all();
    // Map database rows back to the format the frontend expects
    const events = rows.map((row: any) => ({
      uri: row.uri,
      cid: row.cid,
      value: {
        title: row.title,
        description: row.description,
        eventDate: row.eventDate,
        location: row.location,
        createdAt: row.createdAt,
      }
    }));
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Indexer API running at http://localhost:${port}`);
});
