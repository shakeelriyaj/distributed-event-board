const ROWS: { done: boolean; text: string }[] = [
  { done: true, text: 'Auth + DID' },
  { done: true, text: 'Lexicon + validation' },
  { done: true, text: 'createRecord' },
  { done: true, text: 'getRecord' },
  { done: true, text: 'listRecords' },
  { done: false, text: 'AppView discovery' },
  { done: false, text: 'RSVP/social records' },
  { done: false, text: 'relay/firehose indexing' },
]

export function ProtocolProgressPanel() {
  return (
    <section
      style={{
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        background: 'linear-gradient(180deg, #f8fafc 0%, #fff 100%)',
        marginBottom: '8px',
      }}
      aria-labelledby="protocol-progress-heading"
    >
      <h2 id="protocol-progress-heading" style={{ margin: '0 0 12px', fontSize: '1.1rem', color: '#0f172a' }}>
        Protocol progress
      </h2>
      <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
        What this app implements today versus what still requires an AppView, social lexicons, or indexing
        infrastructure.
      </p>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '13px', color: '#334155' }}>
        {ROWS.map((row) => (
          <li
            key={row.text}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 0',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <span style={{ width: '1.25rem', flexShrink: 0 }} aria-hidden>
              {row.done ? '✅' : '❌'}
            </span>
            <span>{row.text}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
