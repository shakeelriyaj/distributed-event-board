function DiagramBlock({
  title,
  steps,
  accent,
}: {
  title: string
  steps: string[]
  accent: string
}) {
  return (
    <section
      style={{
        flex: '1 1 320px',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        background: '#fff',
        padding: '12px',
      }}
    >
      <h3 style={{ margin: '0 0 8px', color: accent, fontSize: '1rem' }}>{title}</h3>
      <ol style={{ margin: 0, paddingLeft: '18px', display: 'grid', gap: '5px', color: '#334155', fontSize: '13px' }}>
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  )
}

export function ArchitectureDiagramPanel() {
  return (
    <section
      style={{
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        background: 'linear-gradient(180deg, #f8fafc 0%, #fff 100%)',
      }}
      aria-labelledby="architecture-diagram-heading"
    >
      <h2 id="architecture-diagram-heading" style={{ margin: '0 0 10px', color: '#0f172a' }}>
        Architecture flow: current vs future
      </h2>
      <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
        The current app proves PDS persistence and repo-local listing. Cross-user discovery requires an indexing
        layer.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <DiagramBlock
          title="CURRENT IMPLEMENTED FLOW"
          accent="#166534"
          steps={[
            '✅ Client',
            '↓',
            '✅ AtpAgent',
            '↓',
            "✅ Bluesky PDS / user's repo",
            '↓',
            '✅ org.community.event collection',
            '↓',
            '✅ createRecord / getRecord / listRecords',
            '↓',
            '✅ UI cards + detail page',
          ]}
        />
        <DiagramBlock
          title="FUTURE DISCOVERY FLOW"
          accent="#92400e"
          steps={[
            "❌ Many users' PDSs (future)",
            '↓',
            '❌ Relay / Firehose (future)',
            '↓',
            '❌ AppView / Indexer (future)',
            '↓',
            '❌ Search + discovery feed (future)',
            '↓',
            '❌ Client UI global discovery (future)',
          ]}
        />
      </div>
    </section>
  )
}
