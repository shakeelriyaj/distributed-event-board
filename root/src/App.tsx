import { useState } from 'react'
import { AtprotoVerificationPanel } from './components/AtprotoVerificationPanel'
import { EventSchemaValidationPanel } from './components/EventSchemaValidationPanel'
import { EventForm } from './components/EventForm'
import { EventFeed } from './components/EventFeed'
import { MyEventRecordsPanel } from './components/MyEventRecordsPanel'
import { ProtocolProgressPanel } from './components/ProtocolProgressPanel'
import { ProtocolIntentPanel } from './components/ProtocolIntentPanel'
import { FutureDiscoveryCallout } from './components/FutureDiscoveryCallout'
import { GlassBoxApp } from './glass-box/GlassBoxApp'
import './glass-box/glass-box.css'

type AppMode = 'lab' | 'events'

function App() {
  const [mode, setMode] = useState<AppMode>('lab')

  return (
    <div className="gb-appShell">
      <nav className="gb-appTabs" aria-label="Application mode">
        <button
          type="button"
          className={'gb-appTabs__btn ' + (mode === 'lab' ? 'gb-appTabs__btn--on' : '')}
          onClick={() => setMode('lab')}
        >
          Glass box lab
        </button>
        <button
          type="button"
          className={'gb-appTabs__btn ' + (mode === 'events' ? 'gb-appTabs__btn--on' : '')}
          onClick={() => setMode('events')}
        >
          Event board
        </button>
      </nav>

      {mode === 'lab' ? (
        <GlassBoxApp />
      ) : (
        <div className="gb-legacy">
          <header style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#0070ff' }}>Community Event Board</h1>
            <p style={{ color: '#666' }}>Decentralized & powered by AT Protocol</p>
          </header>
          <main>
            <ProtocolProgressPanel />
            <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />
            <ProtocolIntentPanel />
            <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />
            <AtprotoVerificationPanel />
            <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />
            <EventSchemaValidationPanel />
            <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />
            <EventForm />
            <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />
            <MyEventRecordsPanel />
            <FutureDiscoveryCallout />
            <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />
            <EventFeed />
          </main>
          <footer style={{ marginTop: '50px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
            Connected to: {import.meta.env.VITE_ATP_IDENTIFIER}
          </footer>
        </div>
      )}
    </div>
  )
}

export default App
