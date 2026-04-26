import type { ReactNode } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { AtprotoVerificationPanel } from './components/AtprotoVerificationPanel'
import { CurrentAccountBanner } from './components/CurrentAccountBanner'
import { DemoWalkthroughPage } from './components/DemoWalkthroughPage'
import { EventDetailPage } from './components/EventDetailPage'
import { EventSchemaValidationPanel } from './components/EventSchemaValidationPanel'
import { EventForm } from './components/EventForm'
import { EventFeed } from './components/EventFeed'
import { MyEventRecordsPanel } from './components/MyEventRecordsPanel'
import { ProtocolProgressPanel } from './components/ProtocolProgressPanel'
import { ProtocolIntentPanel } from './components/ProtocolIntentPanel'
import { FutureDiscoveryCallout } from './components/FutureDiscoveryCallout'
import { SourceBadge } from './components/SourceBadge'
import './glass-box/glass-box.css'

function RouteShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="gb-legacy">
      <header style={{ marginBottom: '28px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#0070ff', marginBottom: '8px' }}>{title}</h1>
        <p style={{ color: '#666', margin: 0 }}>{subtitle}</p>
      </header>
      <main>
        <CurrentAccountBanner />
        {children}
      </main>
      <footer style={{ marginTop: '50px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
        Connected to: {import.meta.env.VITE_ATP_IDENTIFIER}
      </footer>
    </div>
  )
}

function App() {
  return (
    <div className="gb-appShell">
      <nav className="gb-appTabs" aria-label="Primary navigation">
        <NavLink
          to="/events"
          className={({ isActive }) => 'gb-appTabs__btn ' + (isActive ? 'gb-appTabs__btn--on' : '')}
        >
          Events
        </NavLink>
        <NavLink
          to="/create"
          className={({ isActive }) => 'gb-appTabs__btn ' + (isActive ? 'gb-appTabs__btn--on' : '')}
        >
          Create
        </NavLink>
        <NavLink
          to="/debug"
          className={({ isActive }) => 'gb-appTabs__btn ' + (isActive ? 'gb-appTabs__btn--on' : '')}
        >
          Debug
        </NavLink>
        <NavLink
          to="/demo"
          className={({ isActive }) => 'gb-appTabs__btn ' + (isActive ? 'gb-appTabs__btn--on' : '')}
        >
          Demo
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/events" replace />} />
        <Route
          path="/events"
          element={
            <RouteShell
              title="Community Event Board"
              subtitle="Real PDS data and clearly labeled non-discovery demo surfaces."
            >
              <EventSchemaValidationPanel />
              <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />
              <MyEventRecordsPanel />
              <FutureDiscoveryCallout />
              <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />
              <EventFeed />
            </RouteShell>
          }
        />
        <Route
          path="/events/:encodedAtUri"
          element={
            <RouteShell title="Event Detail" subtitle="Glass-box record view from your PDS using a known AT URI.">
              <EventDetailPage />
            </RouteShell>
          }
        />
        <Route
          path="/create"
          element={
            <RouteShell title="Create Event" subtitle="Publish records to your repo, then read them back by AT URI.">
              <EventForm />
            </RouteShell>
          }
        />
        <Route
          path="/debug"
          element={
            <RouteShell
              title="Protocol Debug"
              subtitle="Authentication, protocol progress, intent mapping, and source labeling."
            >
              <ProtocolProgressPanel />
              <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <SourceBadge variant="pds-list-records" />
                <SourceBadge variant="mock-feed" />
                <SourceBadge variant="future-appview" />
              </div>
              <hr style={{ margin: '20px 0 40px', border: '0', borderTop: '1px solid #eee' }} />
              <AtprotoVerificationPanel />
              <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />
              <ProtocolIntentPanel />
              <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />
              <FutureDiscoveryCallout />
            </RouteShell>
          }
        />
        <Route
          path="/demo"
          element={
            <RouteShell title="Demo Walkthrough" subtitle="Presentation script for the end-to-end glass-box flow.">
              <DemoWalkthroughPage />
            </RouteShell>
          }
        />
        <Route path="*" element={<Navigate to="/events" replace />} />
      </Routes>
    </div>
  )
}

export default App
