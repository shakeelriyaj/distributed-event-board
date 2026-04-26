import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAtprotoConfig } from '../lib/atproto/config'
import { getCurrentSessionSnapshot } from '../lib/atproto/session'
import { parseAtUri, type ParsedAtUri } from '../lib/events/atUri'
import { createEventRecord } from '../lib/events/createEventRecord'
import { createEventRecordDraft } from '../lib/events/createEventRecordDraft'
import {
  addRecentEventUri,
  clearRecentEventUris,
  getRecentEventUris,
  removeRecentEventUri,
} from '../lib/events/recentEventUris'
import { deleteEventRecordAndCleanupRecent } from '../lib/events/deleteEventRecord'
import { readEventRecord, type ReadEventRecordResult } from '../lib/events/readEventRecord'
import { validateEventRecord } from '../lib/events/validateEventRecord'

type PersistedReadBack = {
  createUri: string
  createCid: string
  parsed: ParsedAtUri
  fromPds: ReadEventRecordResult
}

export const EventForm = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [startsAt, setStartsAt] = useState(() =>
    new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
  )
  const [endsAt, setEndsAt] = useState('')
  const [confirmWrite, setConfirmWrite] = useState(false)

  const [persisted, setPersisted] = useState<PersistedReadBack | null>(null)
  const [readBackError, setReadBackError] = useState<string | null>(null)

  const [manualUri, setManualUri] = useState('')
  const [manualLoading, setManualLoading] = useState(false)
  const [manualResult, setManualResult] = useState<ReadEventRecordResult | null>(null)
  const [manualParsed, setManualParsed] = useState<ParsedAtUri | null>(null)
  const [manualError, setManualError] = useState<string | null>(null)
  const [recentUris, setRecentUris] = useState<string[]>(() => getRecentEventUris())
  const [recentDeleteError, setRecentDeleteError] = useState<string | null>(null)
  const [recentDeletingUri, setRecentDeletingUri] = useState<string | null>(null)
  const config = getAtprotoConfig()
  const session = getCurrentSessionSnapshot()
  const refreshRecentUris = () => setRecentUris(getRecentEventUris())

  const handleDeleteRecent = async (uri: string) => {
    const typed = window.prompt('Type DELETE to remove this record from your PDS:')
    if (typed !== 'DELETE') return
    setRecentDeletingUri(uri)
    setRecentDeleteError(null)
    try {
      await deleteEventRecordAndCleanupRecent(uri)
      refreshRecentUris()
      setMessage(`🗑️ Deleted record: ${uri}`)
    } catch (e) {
      setRecentDeleteError(e instanceof Error ? e.message : 'Failed to delete record')
    } finally {
      setRecentDeletingUri(null)
    }
  }

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
      addRecentEventUri(created.uri)
      refreshRecentUris()
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
      <section
        style={{
          marginBottom: '12px',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #fde68a',
          background: '#fffbeb',
          color: '#78350f',
        }}
      >
        <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600 }}>
          This writes a real org.community.event record to the configured account/PDS.
        </p>
        <p style={{ margin: '0 0 4px', fontSize: '12px' }}>
          <strong>Identifier:</strong> {config.identifier || '(not configured)'}
        </p>
        <p style={{ margin: '0 0 4px', fontSize: '12px', wordBreak: 'break-all' }}>
          <strong>Service:</strong> {config.service}
        </p>
        <p style={{ margin: 0, fontSize: '12px' }}>
          <strong>Session DID:</strong> {session?.did ?? 'Not logged in yet'}
        </p>
      </section>
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
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#334155',
            padding: '8px 10px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            background: '#fff',
          }}
        >
          <input
            type="checkbox"
            required
            checked={confirmWrite}
            onChange={(e) => setConfirmWrite(e.target.checked)}
          />
          I understand this writes to a real PDS.
        </label>
        <button
          type="submit"
          disabled={loading || !confirmWrite}
          style={{
            padding: '12px',
            borderRadius: '6px',
            border: 'none',
            background: '#0070ff',
            color: 'white',
            fontWeight: 'bold',
            cursor: loading || !confirmWrite ? 'not-allowed' : 'pointer',
            opacity: loading || !confirmWrite ? 0.65 : 1,
          }}
        >
          {loading ? 'Publishing...' : 'Post to Board'}
        </button>
      </form>
      {message && <p style={{ marginTop: '10px', fontSize: '13px', color: '#555' }}>{message}</p>}

      <section
        style={{
          marginTop: '16px',
          padding: '14px',
          borderRadius: '10px',
          border: '1px solid #e5e7eb',
          background: '#fff',
        }}
      >
        <h4 style={{ margin: '0 0 8px', color: '#0f172a' }}>Recent Local Writes</h4>
        <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#64748b', lineHeight: 1.45 }}>
          Browser-local convenience list of recently created AT URIs. This is not discovery.
        </p>
        {recentUris.length === 0 ? (
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>No recent local writes saved yet.</p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '8px' }}>
            {recentUris.map((uri) => (
              <li
                key={uri}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px',
                  background: '#f8fafc',
                }}
              >
                <div style={{ fontSize: '12px', color: '#334155', wordBreak: 'break-all', marginBottom: '6px' }}>{uri}</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(uri)
                      } catch {
                        // Keep panel simple; ignore clipboard failures.
                      }
                    }}
                    style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
                  >
                    Copy URI
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/events/${encodeURIComponent(uri)}`)}
                    style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
                  >
                    Open detail
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      removeRecentEventUri(uri)
                      refreshRecentUris()
                    }}
                    style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fff1f2' }}
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRecent(uri)}
                    disabled={recentDeletingUri === uri}
                    style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fff1f2' }}
                  >
                    {recentDeletingUri === uri ? 'Deleting…' : 'Delete from PDS'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {recentDeleteError && (
          <p style={{ marginTop: '8px', fontSize: '13px', color: '#b91c1c' }} role="alert">
            Delete error: {recentDeleteError}
          </p>
        )}
        <div style={{ marginTop: '10px' }}>
          <button
            type="button"
            onClick={() => {
              clearRecentEventUris()
              refreshRecentUris()
            }}
            disabled={recentUris.length === 0}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              cursor: recentUris.length === 0 ? 'not-allowed' : 'pointer',
              opacity: recentUris.length === 0 ? 0.6 : 1,
            }}
          >
            Clear all
          </button>
        </div>
      </section>

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

      {persisted && (
        <section
          style={{
            marginTop: '14px',
            padding: '14px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            background: '#fff',
          }}
        >
          <h4 style={{ margin: '0 0 8px', color: '#0f172a' }}>Protocol lifecycle timeline</h4>
          <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#64748b', lineHeight: 1.45 }}>
            End-to-end path for this event record after submit.
          </p>
          <ol style={{ margin: 0, paddingLeft: '20px', display: 'grid', gap: '8px' }}>
            <li>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', background: '#f8fafc' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>DONE - Draft built</div>
                <div style={{ fontSize: '12px', color: '#475569' }}>Draft record assembled from form input.</div>
              </div>
            </li>
            <li>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', background: '#f8fafc' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>
                  DONE - Validated against org.community.event
                </div>
                <div style={{ fontSize: '12px', color: '#475569' }}>
                  Collection: <code style={{ fontSize: '11px' }}>{persisted.parsed.collection}</code>
                </div>
              </div>
            </li>
            <li>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', background: '#f8fafc' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>DONE - createRecord sent to PDS</div>
                <div style={{ fontSize: '12px', color: '#475569' }}>
                  Repo DID: <code style={{ fontSize: '11px' }}>{persisted.parsed.repo}</code>
                </div>
              </div>
            </li>
            <li>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', background: '#f8fafc' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>DONE - URI + CID returned</div>
                <div style={{ fontSize: '12px', color: '#475569', wordBreak: 'break-all' }}>
                  URI: <code style={{ fontSize: '11px' }}>{persisted.createUri}</code>
                </div>
                <div style={{ fontSize: '12px', color: '#475569', wordBreak: 'break-all' }}>
                  CID: <code style={{ fontSize: '11px' }}>{persisted.createCid}</code>
                </div>
              </div>
            </li>
            <li>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', background: '#f8fafc' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>DONE - getRecord read back from PDS</div>
                <div style={{ fontSize: '12px', color: '#475569', wordBreak: 'break-all' }}>
                  CID (getRecord): <code style={{ fontSize: '11px' }}>{persisted.fromPds.cid}</code>
                </div>
              </div>
            </li>
            <li>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', background: '#f8fafc' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>
                  DONE - Record can appear in My PDS Events via listRecords
                </div>
                <div style={{ fontSize: '12px', color: '#475569' }}>
                  Use the My PDS Events panel to list this repo collection after publish.
                </div>
              </div>
            </li>
            <li>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', background: '#f8fafc' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400e' }}>
                  FUTURE - Cross-user discovery requires AppView/indexer
                </div>
                <div style={{ fontSize: '12px', color: '#475569' }}>
                  Not implemented in this app yet; current flow is write/read/list for known repo(s).
                </div>
              </div>
            </li>
          </ol>
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
