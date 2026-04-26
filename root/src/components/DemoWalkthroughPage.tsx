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
    title: 'Check current account / session',
    status: 'implemented',
    route: '/debug',
    routeLabel: 'Open Lab',
    explanation: 'Use the verification panel to confirm identifier, DID, and active session context.',
  },
  {
    id: 2,
    title: 'Validate org.community.event schema',
    status: 'implemented',
    route: '/events',
    routeLabel: 'Open Home',
    explanation: 'Show schema validation and remind viewers that record shape is constrained before writes.',
  },
  {
    id: 3,
    title: 'Create event record',
    status: 'implemented',
    route: '/create',
    routeLabel: 'Open Compose',
    explanation: 'Publish via createRecord using the logged-in repo.',
  },
  {
    id: 4,
    title: 'Read event back from PDS',
    status: 'implemented',
    route: '/create',
    routeLabel: 'Stay on Compose',
    explanation: 'Immediately read by known AT URI (getRecord) to prove persistence in your PDS.',
  },
  {
    id: 5,
    title: 'List My PDS events',
    status: 'implemented',
    route: '/me',
    routeLabel: 'Open My Posts',
    explanation: 'Use listRecords scoped to your session DID; this is one-repo listing, not global discovery.',
  },
  {
    id: 6,
    title: "Browse another user's events",
    status: 'implemented',
    route: '/discover',
    routeLabel: 'Open Discover',
    explanation:
      'Enter a handle. The app resolves their DID, contacts their PDS directly, and reads their org.community.event records. No central server we control is involved.',
  },
  {
    id: 7,
    title: 'Open event detail page',
    status: 'implemented',
    route: '/events',
    routeLabel: 'Use "View details"',
    explanation: 'Open /events/:encodedAtUri from a card to switch between Reader and Protocol views.',
  },
  {
    id: 8,
    title: 'Explain why cross-user discovery needs an AppView',
    status: 'partial',
    route: '/debug',
    routeLabel: 'Open Lab',
    explanation: 'Architecture callouts are present; full cross-user discovery is intentionally not implemented yet.',
  },
  {
    id: 9,
    title: 'Show future protocol intents: RSVP / Repost / Follow',
    status: 'partial',
    route: '/debug',
    routeLabel: 'Open Lab',
    explanation: 'Intent mappings and sample record shapes exist as static guidance; write flows remain future work.',
  },
]

function statusChip(status: StepStatus) {
  if (status === 'implemented') return { cls: 'en-chip en-chip--success', label: 'Implemented' }
  if (status === 'partial') return { cls: 'en-chip en-chip--warn', label: 'Partial' }
  return { cls: 'en-chip en-chip--neutral', label: 'Future' }
}

export function DemoWalkthroughPage() {
  return (
    <section className="en-section">
      <div className="en-section__head">
        <h2 className="en-section__title">Guided walkthrough</h2>
      </div>
      <p className="en-section__sub">
        Use this script during demos so the story is consistent: session → validation → write → read-back →
        list (mine) → list (theirs) → detail → architecture boundaries → future intents.
      </p>

      <ol className="en-stepslist">
        {STEPS.map((step) => {
          const chip = statusChip(step.status)
          return (
            <li key={step.id} className="en-step">
              <div className="en-step__num">{step.id}</div>
              <div>
                <div className="en-step__head">
                  <span className="en-step__title">{step.title}</span>
                  <span className={chip.cls}>{chip.label}</span>
                  {step.route ? (
                    <Link to={step.route} className="en-btn en-btn--sm">
                      {step.routeLabel ?? `Go to ${step.route}`}
                    </Link>
                  ) : null}
                </div>
                <p className="en-step__expl">{step.explanation}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
