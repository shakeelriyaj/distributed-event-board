type DiagramVariant = 'current' | 'cross' | 'future'

type Step = { text: string; future?: boolean; arrow?: boolean }

function DiagramBlock({
  title,
  steps,
  variant,
}: {
  title: string
  steps: Step[]
  variant: DiagramVariant
}) {
  return (
    <section className="en-arch__col">
      <h3 className={`en-arch__title en-arch__title--${variant}`}>{title}</h3>
      <ol className="en-arch__list">
        {steps.map((step, i) => (
          <li
            key={`${step.text}-${i}`}
            data-future={step.future ? '' : undefined}
            data-arrow={step.arrow ? '' : undefined}
          >
            {step.text}
          </li>
        ))}
      </ol>
    </section>
  )
}

const cur: Step[] = [
  { text: 'Client' },
  { text: 'AtpAgent' },
  { text: 'Bluesky PDS · user repo' },
  { text: 'org.community.event collection' },
  { text: 'createRecord · getRecord · listRecords' },
  { text: 'EventNet UI' },
]
const cross: Step[] = [
  { text: 'Client' },
  { text: 'resolveHandle' },
  { text: 'Foreign PDS' },
  { text: 'listRecords' },
  { text: 'Render in feed' },
]
const future: Step[] = [
  { text: "Many users' PDSs", future: true },
  { text: 'Relay · Firehose', future: true },
  { text: 'AppView · indexer', future: true },
  { text: 'Search · ranked feed', future: true },
  { text: 'Global discovery UI', future: true },
]

export function ArchitectureDiagramPanel() {
  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Architecture</h2>
      <p style={{ fontSize: 13, color: 'var(--en-text-soft)', marginBottom: 16, lineHeight: 1.55 }}>
        The current app proves PDS persistence and repo-local listing. Cross-user discovery requires an indexing
        layer.
      </p>
      <div className="en-arch">
        <DiagramBlock title="Current" variant="current" steps={cur} />
        <DiagramBlock title="Cross-repo read" variant="cross" steps={cross} />
        <DiagramBlock title="Future" variant="future" steps={future} />
      </div>
    </div>
  )
}
