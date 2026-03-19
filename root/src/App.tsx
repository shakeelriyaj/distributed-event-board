import { EventForm } from './components/EventForm'
import { EventFeed } from './components/EventFeed';

function App() {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#0070ff' }}>📍 Community Event Board</h1>
        <p style={{ color: '#666' }}>Decentralized & Powered by AT Protocol</p>
      </header>

      <main>
        <EventForm />
        <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />
        <EventFeed />
      </main>
      
      <footer style={{ marginTop: '50px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
        Connected to: {import.meta.env.VITE_ATP_IDENTIFIER}
      </footer>
    </div>
  )
}

export default App