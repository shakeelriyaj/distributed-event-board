import { useMemo, useState } from 'react'
import { createEventRecordDraft } from '../lib/events/createEventRecordDraft'
import { validateEventRecord } from '../lib/events/validateEventRecord'

const SAMPLE_INPUT = {
  title: 'ATProto NYC Meetup',
  description: 'Bring your protocol questions. We will walk through PDS, firehose, and app views.',
  startsAt: '2026-05-15T18:30:00.000Z',
  endsAt: '2026-05-15T20:30:00.000Z',
  location: 'Brooklyn Public Library',
}

const INVALID_SAMPLE_INPUT = {
  title: '',
  description: '',
  startsAt: 'not-a-date',
  endsAt: '2026-01-01T10:00:00.000Z',
  location: 'x'.repeat(220),
}

export const EventSchemaValidationPanel = () => {
  const [useInvalidSample, setUseInvalidSample] = useState(false)

  const record = useMemo(
    () => createEventRecordDraft(useInvalidSample ? INVALID_SAMPLE_INPUT : SAMPLE_INPUT),
    [useInvalidSample],
  )
  const validation = useMemo(() => validateEventRecord(record), [record])

  return (
    <section className="atp-verify">
      <div className="atp-verify__header">
        <h2>Event Schema Check (Pass 2)</h2>
        <p>Validates a draft org.community.event record locally before any network write.</p>
      </div>

      <div className="atp-verify__row">
        <button type="button" onClick={() => setUseInvalidSample((s) => !s)}>
          {useInvalidSample ? 'Use valid sample' : 'Use invalid sample'}
        </button>
        <span className="atp-verify__status">
          {validation.valid ? 'Valid sample record' : `Invalid sample (${validation.errors.length} issues)`}
        </span>
      </div>

      <div className="atp-verify__cards">
        <article className="atp-verify__card">
          <h3>Draft record</h3>
          <pre className="mono" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
            {JSON.stringify(record, null, 2)}
          </pre>
        </article>

        <article className="atp-verify__card">
          <h3>Validation result</h3>
          {validation.valid ? (
            <p>Record satisfies required schema fields and constraints.</p>
          ) : (
            <ul>
              {validation.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  )
}
