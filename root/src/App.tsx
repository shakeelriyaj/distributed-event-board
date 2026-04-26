import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { AtprotoVerificationPanel } from './components/AtprotoVerificationPanel'
import { ArchitectureDiagramPanel } from './components/ArchitectureDiagramPanel'
import { BrowseUserEventsPanel } from './components/BrowseUserEventsPanel'
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
import { getAtprotoConfig } from './lib/atproto/config'
import { getCurrentSessionSnapshot, type SessionSnapshot } from './lib/atproto/session'
import { avatarColor, avatarInitial, shortenDid } from './eventnet/avatar'
import './glass-box/glass-box.css'
import './eventnet/eventnet.css'

type NavItem = { to: string; label: string }

const NAV_ITEMS: NavItem[] = [
  { to: '/events', label: 'Home' },
  { to: '/discover', label: 'Discover' },
  { to: '/me', label: 'My Posts' },
  { to: '/debug', label: 'Lab' },
  { to: '/demo', label: 'Walkthrough' },
]

function useSessionSnapshot(): SessionSnapshot | null {
  const [session, setSession] = useState<SessionSnapshot | null>(() => getCurrentSessionSnapshot())
  useEffect(() => {
    const sync = () => setSession(getCurrentSessionSnapshot())
    sync()
    const t = window.setInterval(sync, 1000)
    return () => window.clearInterval(t)
  }, [])
  return session
}

function Sidebar() {
  const session = useSessionSnapshot()
  const config = getAtprotoConfig()
  const handle = session?.handle ?? config.identifier ?? 'guest'
  const did = session?.did ?? null
  return (
    <aside className="en-sidebar" aria-label="Primary navigation">
      <Link to="/events" className="en-logo">
        <span className="en-logo__name">EventNet</span>
      </Link>
      <nav className="en-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              'en-nav__item ' + (isActive ? 'en-nav__item--active' : '')
            }
          >
            <span className="en-nav__dot" aria-hidden />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <Link to="/create" className="en-cta">
        Post Event
      </Link>
      <div className="en-sidebar__footer">
        <div className="en-userchip">
          <div className="en-avatar en-avatar--sm" style={{ background: avatarColor(handle) }}>
            {avatarInitial(handle)}
          </div>
          <div className="en-userchip__meta">
            <div className="en-userchip__name">{handle}</div>
            <div className="en-userchip__handle">{did ? shortenDid(did, 14) : 'no session'}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function RightRail() {
  const session = useSessionSnapshot()
  const config = getAtprotoConfig()
  const writes = config.identifier && config.password ? 'enabled' : 'unknown'
  return (
    <aside className="en-rail" aria-label="Account and reference">
      <section className="en-rail__card">
        <div className="en-rail__title">Your account</div>
        <div className="en-rail__row">
          <span className="en-rail__key">Handle</span>
          <span className="en-rail__val">{session?.handle ?? 'Not signed in'}</span>
        </div>
        <div className="en-rail__row">
          <span className="en-rail__key">DID</span>
          <span className="en-rail__val">{session?.did ? shortenDid(session.did, 16) : '—'}</span>
        </div>
        <div className="en-rail__row">
          <span className="en-rail__key">Service</span>
          <span className="en-rail__val">{config.service.replace(/^https?:\/\//, '')}</span>
        </div>
        <div className="en-rail__row">
          <span className="en-rail__key">Writes</span>
          <span className="en-rail__val">{writes}</span>
        </div>
      </section>

      <section className="en-rail__card">
        <div className="en-rail__title">About EventNet</div>
        <p style={{ fontSize: 13, color: 'var(--en-text-soft)', marginBottom: 8 }}>
          A glass-box ATProto client for community events. Records live in your PDS;
          discovery is honest about what is real vs future.
        </p>
        <div className="en-chips" style={{ marginTop: 4 }}>
          <span className="en-chip">org.community.event</span>
          <span className="en-chip en-chip--neutral">PDS native</span>
        </div>
      </section>

      <section className="en-rail__card">
        <div className="en-rail__title">Sources legend</div>
        <div className="en-stack en-stack--sm">
          <SourceBadge variant="pds-list-records" />
          <SourceBadge variant="handle-pds-direct" />
          <SourceBadge variant="mock-feed" />
          <SourceBadge variant="future-appview" />
        </div>
      </section>
    </aside>
  )
}

function PageHeader({
  title,
  subtitle,
  showBack,
}: {
  title: string
  subtitle?: string
  showBack?: boolean
}) {
  const navigate = useNavigate()
  return (
    <div className="en-pageheader">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {showBack ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="en-btn en-btn--sm"
            aria-label="Back"
            style={{ padding: '4px 12px', borderRadius: 999 }}
          >
            ←
          </button>
        ) : null}
        <div>
          <div className="en-pageheader__title">{title}</div>
          {subtitle ? <div className="en-pageheader__subtitle">{subtitle}</div> : null}
        </div>
      </div>
    </div>
  )
}

type HomeTab = 'feed' | 'lexicon'

function HomePage() {
  const [tab, setTab] = useState<HomeTab>('feed')
  return (
    <>
      <PageHeader title="Home" subtitle="Live community events from the org.community.event collection" />
      <div className="en-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'feed'}
          className={'en-tabs__btn ' + (tab === 'feed' ? 'en-tabs__btn--active' : '')}
          onClick={() => setTab('feed')}
        >
          For you
        </button>
        <button
          role="tab"
          aria-selected={tab === 'lexicon'}
          className={'en-tabs__btn ' + (tab === 'lexicon' ? 'en-tabs__btn--active' : '')}
          onClick={() => setTab('lexicon')}
        >
          Lexicon
        </button>
      </div>
      {tab === 'feed' ? <EventFeed /> : <EventSchemaValidationPanel />}
    </>
  )
}

function DiscoverPage() {
  return (
    <>
      <PageHeader title="Discover" subtitle="Read another user's PDS directly. No central server in the loop." />
      <BrowseUserEventsPanel />
      <FutureDiscoveryCallout />
    </>
  )
}

function MePage() {
  return (
    <>
      <PageHeader title="My Posts" subtitle="Your records via com.atproto.repo.listRecords on your DID." />
      <MyEventRecordsPanel />
    </>
  )
}

function CreatePage() {
  return (
    <>
      <PageHeader title="Compose" subtitle="Publish an event to your PDS, then read it back." showBack />
      <EventForm />
    </>
  )
}

function DebugPage() {
  return (
    <>
      <PageHeader title="Lab" subtitle="Connectivity, schema, and protocol mapping." />
      <section className="en-section">
        <ArchitectureDiagramPanel />
      </section>
      <section className="en-section">
        <ProtocolProgressPanel />
      </section>
      <section className="en-section">
        <AtprotoVerificationPanel />
      </section>
      <section className="en-section">
        <ProtocolIntentPanel />
      </section>
      <section className="en-section">
        <FutureDiscoveryCallout />
      </section>
    </>
  )
}

function DemoPage() {
  return (
    <>
      <PageHeader title="Walkthrough" subtitle="Demo script for the end-to-end glass-box flow." />
      <section className="en-section">
        <ArchitectureDiagramPanel />
      </section>
      <DemoWalkthroughPage />
    </>
  )
}

function DetailPage() {
  return (
    <>
      <PageHeader title="Event" subtitle="Read by known AT URI" showBack />
      <EventDetailPage />
    </>
  )
}

function MobileBar() {
  return (
    <nav className="en-mobilebar" aria-label="Mobile navigation">
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
          <div>{item.label}</div>
        </NavLink>
      ))}
    </nav>
  )
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="en-shell">
      <Sidebar />
      <main className="en-main">{children}</main>
      <RightRail />
      <MobileBar />
    </div>
  )
}

function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Navigate to="/events" replace />} />
        <Route path="/events" element={<HomePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/me" element={<MePage />} />
        <Route path="/events/:encodedAtUri" element={<DetailPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/debug" element={<DebugPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="*" element={<Navigate to="/events" replace />} />
      </Routes>
    </Shell>
  )
}

export default App
