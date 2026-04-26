const ROWS: { done: boolean; text: string }[] = [
  { done: true, text: 'Auth + DID' },
  { done: true, text: 'Lexicon + validation' },
  { done: true, text: 'createRecord' },
  { done: true, text: 'getRecord' },
  { done: true, text: 'listRecords' },
  { done: false, text: 'AppView discovery' },
  { done: false, text: 'RSVP / social records' },
  { done: false, text: 'Relay / firehose indexing' },
]

export function ProtocolProgressPanel() {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Protocol progress</h2>
      <p style={{ fontSize: 13, color: 'var(--en-text-soft)', marginBottom: 14, lineHeight: 1.5 }}>
        What this app implements today versus what still requires an AppView, social lexicons, or indexing
        infrastructure.
      </p>
      <ul className="en-progress">
        {ROWS.map((row) => (
          <li key={row.text}>
            <span
              className={`en-progress__check ${
                row.done ? 'en-progress__check--done' : 'en-progress__check--pending'
              }`}
              aria-hidden
            >
              {row.done ? '✓' : '·'}
            </span>
            <span style={{ color: row.done ? 'var(--en-text)' : 'var(--en-text-soft)' }}>{row.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
