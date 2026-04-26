import { Link } from 'react-router-dom'

type StepStatus = 'implemented' | 'partial' | 'future'

type DemoStep = {
  id: number
  title: string
  status: StepStatus
  explanation: string
  route?: string
  routeLabel?: string
}

const STEPS: DemoStep[] = [
  {
    id: 1,
    title: 'Check current account/session',
    status: 'implemented',
    route: '/debug',
    routeLabel: 'Open Debug',
    explanation: 'Use the verification panel to confirm identifier, DID, and active session context.',
  },
  {
    id: 2,
    title: 'Validate org.community.event schema',
    status: 'implemented',
    route: '/events',
    routeLabel: 'Open Events',
    explanation: 'Show schema validation and remind viewers that record shape is constrained before writes.',
  },
  {
    id: 3,
    title: 'Create event record',
    status: 'implemented',
    route: '/create',
    routeLabel: 'Open Create',
    explanation: 'Publish via createRecord using the logged-in repo.',
  },
  {
    id: 4,
    title: 'Read event back from PDS',
    status: 'implemented',
    route: '/create',
    routeLabel: 'Stay on Create',
    explanation: 'Immediately read by known AT URI (getRecord) to prove persistence in your PDS.',
  },
  {
    id: 5,
    title: 'List My PDS Events',
    status: 'implemented',
    route: '/events',
    routeLabel: 'Back to Events',
    explanation: 'Use listRecords scoped to your session DID; this is one-repo listing, not global discovery.',
  },
  {
    id: 6,
      title: "Browse another user's events",
      status: 'implemented',
      route: '/events',
      routeLabel: 'Browse by handle',
      explanation:
        'Enter a handle. The app resolves their DID, contacts their PDS directly, and reads their org.community.event records. No server we control is involved in this request.',
    },
    {
      id: 7,
    title: 'Open event detail page',
    status: 'implemented',
    route: '/events',
    routeLabel: 'Use “View details”',
    explanation: 'Open /events/:encodedAtUri from an EventCard to show User View vs Protocol View.',
  },
  {
      id: 8,
    title: 'Explain why cross-user discovery needs AppView/indexer',
    status: 'partial',
    route: '/debug',
    routeLabel: 'Open Debug',
    explanation: 'Architecture callouts are present; full cross-user discovery is intentionally not implemented yet.',
  },
  {
      id: 9,
    title: 'Show future protocol intents: RSVP/Repost/Follow',
    status: 'partial',
    route: '/debug',
    routeLabel: 'Open Debug',
    explanation: 'Intent mappings and sample record shapes exist as static guidance; write flows remain future work.',
  },
]

function statusStyle(status: StepStatus) {
  if (status === 'implemented') return { bg: '#ecfdf5', border: '#6ee7b7', color: '#065f46', label: 'Implemented' }
  if (status === 'partial') return { bg: '#fffbeb', border: '#fcd34d', color: '#92400e', label: 'Partial' }
  return { bg: '#f1f5f9', border: '#cbd5e1', color: '#475569', label: 'Future' }
}

export function DemoWalkthroughPage() {
  return (
    <section style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff' }}>
      <h2 style={{ margin: '0 0 8px', color: '#0f172a' }}>Guided walkthrough</h2>
      <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
        Use this ordered script during demos so the story is consistent: session → validation → write → read-back →
        list (my PDS) → list (their PDS) → detail → architecture boundaries → future intents.
      </p>

      <ol style={{ margin: 0, paddingLeft: '20px', display: 'grid', gap: '10px' }}>
        {STEPS.map((step) => {
          const s = statusStyle(step.status)
          return (
            <li key={step.id}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px', background: '#fafafa' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <strong style={{ color: '#0f172a' }}>{step.title}</strong>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '999px',
                      background: s.bg,
                      color: s.color,
                      border: `1px solid ${s.border}`,
                    }}
                  >
                    {s.label}
                  </span>
                  {step.route ? (
                    <Link
                      to={step.route}
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        textDecoration: 'none',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        color: '#0f172a',
                        background: '#fff',
                      }}
                    >
                      {step.routeLabel ?? `Go to ${step.route}`}
                    </Link>
                  ) : null}
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.45 }}>{step.explanation}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
