import React, { useState } from 'react'
import { parseAtUri, type ParsedAtUri } from '../lib/events/atUri'
import { createEventRecord } from '../lib/events/createEventRecord'
import { createEventRecordDraft } from '../lib/events/createEventRecordDraft'
import { readEventRecord, type ReadEventRecordResult } from '../lib/events/readEventRecord'
import { validateEventRecord } from '../lib/events/validateEventRecord'

type PersistedReadBack = {
  createUri: string
  createCid: string
  parsed: ParsedAtUri
  fromPds: ReadEventRecordResult
}

export const EventForm = () => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [startsAt, setStartsAt] = useState(() =>
    new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
  )
  const [endsAt, setEndsAt] = useState('')

  const [persisted, setPersisted] = useState<PersistedReadBack | null>(null)
  const [readBackError, setReadBackError] = useState<string | null>(null)

  const [manualUri, setManualUri] = useState('')
  const [manualLoading, setManualLoading] = useState(false)
  const [manualResult, setManualResult] = useState<ReadEventRecordResult | null>(null)
  const [manualParsed, setManualParsed] = useState<ParsedAtUri | null>(null)
  const [manualError, setManualError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setReadBackError(null)
    setPersisted(null)

    const formData = new FormData(e.currentTarget)
    const input = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
      location: (formData.get('location') as string) || undefined,
    }

    try {
      const draft = createEventRecordDraft(input)
      const validation = validateEventRecord(draft)
      if (!validation.valid) {
        setMessage(`❌ Validation failed: ${validation.errors.join(' ')}`)
        return
      }

      const created = await createEventRecord(draft)
      setMessage(`✅ Event Published! URI: ${created.uri} at ${new Date().toLocaleTimeString()}!`)

      try {
        const parsed = parseAtUri(created.uri)
        const fromPds = await readEventRecord(created.uri)
        setPersisted({
          createUri: created.uri,
          createCid: created.cid,
          parsed,
          fromPds,
        })
      } catch (err) {
        setReadBackError(err instanceof Error ? err.message : 'Read-back failed')
      }
    } catch (err) {
      setMessage(`❌ Error: ${err instanceof Error ? err.message : 'Failed to post'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleManualRead = async () => {
    setManualLoading(true)
    setManualError(null)
    setManualResult(null)
    setManualParsed(null)
    try {
      const parsed = parseAtUri(manualUri.trim())
      const fromPds = await readEventRecord(manualUri.trim())
      setManualParsed(parsed)
      setManualResult(fromPds)
    } catch (err) {
      setManualError(err instanceof Error ? err.message : 'Failed to read record')
    } finally {
      setManualLoading(false)
    }
  }

  return (
    <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
      <h3 style={{ marginTop: 0 }}>New Post</h3>
      <p style={{ margin: '-6px 0 12px', fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
        Real PDS path: this form uses <code style={{ fontSize: '11px' }}>createRecord</code> on your session repo,
        then <code style={{ fontSize: '11px' }}>getRecord</code> for read-back. It is not the mock feed below.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          name="title"
          placeholder="What's happening?"
          required
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <textarea
          name="description"
          placeholder="Add some details..."
          required
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', minHeight: '80px' }}
        />
        <input
          name="startsAt"
          type="datetime-local"
          required
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <input
          name="endsAt"
          type="datetime-local"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <input
          name="location"
          placeholder="Location (Optional)"
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px',
            borderRadius: '6px',
            border: 'none',
            background: '#0070ff',
            color: 'white',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Publishing...' : 'Post to Board'}
        </button>
      </form>
      {message && <p style={{ marginTop: '10px', fontSize: '13px', color: '#555' }}>{message}</p>}

      {persisted && (
        <section
          style={{
            marginTop: '18px',
            padding: '14px',
            borderRadius: '10px',
            border: '1px solid #dbeafe',
            background: '#f0f7ff',
          }}
        >
          <h4 style={{ margin: '0 0 8px', color: '#0f172a' }}>Read back from PDS (known AT URI)</h4>
          <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#475569', lineHeight: 1.45 }}>
            {"This proves the record exists in the user's PDS. Discovery requires an AppView/indexer, which comes later."}
          </p>
          <dl style={{ margin: 0, fontSize: '13px', color: '#334155' }}>
            <div style={{ marginBottom: '6px' }}>
              <dt style={{ fontWeight: 600 }}>AT URI</dt>
              <dd style={{ margin: 0, wordBreak: 'break-all' }}>{persisted.createUri}</dd>
            </div>
            <div style={{ marginBottom: '6px' }}>
              <dt style={{ fontWeight: 600 }}>CID (createRecord)</dt>
              <dd style={{ margin: 0, wordBreak: 'break-all' }}>{persisted.createCid}</dd>
            </div>
            <div style={{ marginBottom: '6px' }}>
              <dt style={{ fontWeight: 600 }}>CID (getRecord)</dt>
              <dd style={{ margin: 0, wordBreak: 'break-all' }}>{persisted.fromPds.cid}</dd>
            </div>
            <div style={{ marginBottom: '6px' }}>
              <dt style={{ fontWeight: 600 }}>Repo (DID)</dt>
              <dd style={{ margin: 0 }}>{persisted.parsed.repo}</dd>
            </div>
            <div style={{ marginBottom: '6px' }}>
              <dt style={{ fontWeight: 600 }}>Collection</dt>
              <dd style={{ margin: 0 }}>{persisted.parsed.collection}</dd>
            </div>
            <div style={{ marginBottom: '6px' }}>
              <dt style={{ fontWeight: 600 }}>rkey</dt>
              <dd style={{ margin: 0 }}>{persisted.parsed.rkey}</dd>
            </div>
          </dl>
          <p style={{ margin: '10px 0 4px', fontWeight: 600, fontSize: '13px' }}>Raw stored record (value)</p>
          <pre
            style={{
              margin: 0,
              padding: '10px',
              borderRadius: '8px',
              background: '#fff',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
              overflow: 'auto',
              maxHeight: '220px',
            }}
          >
            {JSON.stringify(persisted.fromPds.value, null, 2)}
          </pre>
        </section>
      )}

      {readBackError && (
        <p style={{ marginTop: '10px', fontSize: '13px', color: '#b91c1c' }}>Read-back error: {readBackError}</p>
      )}

      <section
        style={{
          marginTop: '22px',
          padding: '14px',
          borderRadius: '10px',
          border: '1px solid #e5e7eb',
          background: '#fff',
        }}
      >
        <h4 style={{ margin: '0 0 8px', color: '#0f172a' }}>Read by known AT URI (manual)</h4>
        <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#64748b', lineHeight: 1.45 }}>
          Paste an AT URI you already know (for example from a successful create). This is not search or discovery.
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            value={manualUri}
            onChange={(e) => setManualUri(e.target.value)}
            placeholder="at://did:plc:…/org.community.event/…"
            style={{ flex: '1 1 240px', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <button
            type="button"
            onClick={handleManualRead}
            disabled={manualLoading || !manualUri.trim()}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: '#0f172a',
              color: '#fff',
              cursor: manualLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {manualLoading ? 'Reading…' : 'Read Record'}
          </button>
        </div>
        {manualError && (
          <p style={{ marginTop: '10px', fontSize: '13px', color: '#b91c1c' }}>Error: {manualError}</p>
        )}
        {manualResult && manualParsed && (
          <div style={{ marginTop: '12px' }}>
            <dl style={{ margin: 0, fontSize: '13px', color: '#334155' }}>
              <div style={{ marginBottom: '6px' }}>
                <dt style={{ fontWeight: 600 }}>AT URI</dt>
                <dd style={{ margin: 0, wordBreak: 'break-all' }}>{manualUri.trim()}</dd>
              </div>
              <div style={{ marginBottom: '6px' }}>
                <dt style={{ fontWeight: 600 }}>CID (getRecord)</dt>
                <dd style={{ margin: 0, wordBreak: 'break-all' }}>{manualResult.cid}</dd>
              </div>
              <div style={{ marginBottom: '6px' }}>
                <dt style={{ fontWeight: 600 }}>Repo</dt>
                <dd style={{ margin: 0 }}>{manualParsed.repo}</dd>
              </div>
              <div style={{ marginBottom: '6px' }}>
                <dt style={{ fontWeight: 600 }}>Collection</dt>
                <dd style={{ margin: 0 }}>{manualParsed.collection}</dd>
              </div>
              <div style={{ marginBottom: '6px' }}>
                <dt style={{ fontWeight: 600 }}>rkey</dt>
                <dd style={{ margin: 0 }}>{manualParsed.rkey}</dd>
              </div>
            </dl>
            <p style={{ margin: '10px 0 4px', fontWeight: 600, fontSize: '13px' }}>Raw stored record (value)</p>
            <pre
              style={{
                margin: 0,
                padding: '10px',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '220px',
              }}
            >
              {JSON.stringify(manualResult.value, null, 2)}
            </pre>
          </div>
        )}
      </section>
    </div>
  )
}
