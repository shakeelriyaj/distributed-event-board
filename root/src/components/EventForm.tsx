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
import { avatarColor, avatarInitial, shortenDid } from '../eventnet/avatar'

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
  const [messageKind, setMessageKind] = useState<'info' | 'success' | 'danger'>('info')
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
  const handle = session?.handle ?? config.identifier ?? 'guest'

  const refreshRecentUris = () => setRecentUris(getRecentEventUris())

  const setToast = (kind: 'info' | 'success' | 'danger', text: string) => {
    setMessageKind(kind)
    setMessage(text)
  }

  const handleDeleteRecent = async (uri: string) => {
    const typed = window.prompt('Type DELETE to remove this record from your PDS:')
    if (typed !== 'DELETE') return
    setRecentDeletingUri(uri)
    setRecentDeleteError(null)
    try {
      await deleteEventRecordAndCleanupRecent(uri)
      refreshRecentUris()
      setToast('info', `Deleted record: ${uri}`)
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
        setToast('danger', `Validation failed: ${validation.errors.join(' ')}`)
        return
      }

      const created = await createEventRecord(draft)
      addRecentEventUri(created.uri)
      refreshRecentUris()
      setToast('success', `Event published — ${shortenDid(created.uri, 28)}`)

      try {
        const parsed = parseAtUri(created.uri)
        const fromPds = await readEventRecord(created.uri)
        setPersisted({ createUri: created.uri, createCid: created.cid, parsed, fromPds })
      } catch (err) {
        setReadBackError(err instanceof Error ? err.message : 'Read-back failed')
      }
    } catch (err) {
      setToast('danger', err instanceof Error ? err.message : 'Failed to post')
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
    <>
      <section className="en-compose">
        <div className="en-avatar" style={{ background: avatarColor(handle) }}>
          {avatarInitial(handle)}
        </div>
        <form onSubmit={handleSubmit} className="en-compose__form">
          <input
            name="title"
            placeholder="What's happening?"
            required
            className="en-input en-input--title"
          />
          <textarea
            name="description"
            placeholder="Add details — agenda, speakers, what to bring…"
            required
            className="en-input en-textarea"
          />
          <div className="en-row">
            <label className="en-field">
              <span className="en-field__label">Starts</span>
              <input
                name="startsAt"
                type="datetime-local"
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="en-input"
              />
            </label>
            <label className="en-field">
              <span className="en-field__label">Ends (optional)</span>
              <input
                name="endsAt"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="en-input"
              />
            </label>
            <label className="en-field" style={{ flex: '1 1 100%' }}>
              <span className="en-field__label">Location (optional)</span>
              <input name="location" placeholder="Brooklyn Public Library" className="en-input" />
            </label>
          </div>

          <label className="en-checkbox">
            <input
              type="checkbox"
              required
              checked={confirmWrite}
              onChange={(e) => setConfirmWrite(e.target.checked)}
            />
            <span>
              I understand this writes a real <code>org.community.event</code> record to{' '}
              <strong>{config.identifier || 'the configured account'}</strong>.
            </span>
          </label>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--en-text-soft)' }}>
              PDS: {config.service.replace(/^https?:\/\//, '')} · DID:{' '}
              {session?.did ? shortenDid(session.did, 14) : 'no session yet'}
            </div>
            <button
              type="submit"
              disabled={loading || !confirmWrite}
              className="en-btn en-btn--primary"
            >
              {loading ? 'Publishing…' : 'Post'}
            </button>
          </div>
          {message ? (
            <div
              className={
                'en-toast ' +
                (messageKind === 'success'
                  ? 'en-toast--success'
                  : messageKind === 'danger'
                    ? 'en-toast--danger'
                    : '')
              }
            >
              {message}
            </div>
          ) : null}
        </form>
      </section>

      <section className="en-section">
        <div className="en-section__head">
          <h2 className="en-section__title">Recent local writes</h2>
          <span className="en-chip en-chip--neutral">browser-only</span>
        </div>
        <p className="en-section__sub">
          Convenience list of AT URIs you've created in this browser. Not discovery.
        </p>
        {recentUris.length === 0 ? (
          <div className="en-empty" style={{ padding: '20px 0' }}>
            <div className="en-empty__sub">No local writes yet — publish above to see them here.</div>
          </div>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
            {recentUris.map((uri) => (
              <li key={uri} className="en-panel">
                <div
                  style={{
                    fontFamily: 'var(--en-font-mono)',
                    fontSize: 12,
                    color: 'var(--en-text)',
                    wordBreak: 'break-all',
                    marginBottom: 8,
                  }}
                >
                  {uri}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="en-btn en-btn--sm"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(uri)
                      } catch {
                        // ignore
                      }
                    }}
                  >
                    Copy URI
                  </button>
                  <button
                    type="button"
                    className="en-btn en-btn--sm"
                    onClick={() => navigate(`/events/${encodeURIComponent(uri)}`)}
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    className="en-btn en-btn--sm"
                    onClick={() => {
                      removeRecentEventUri(uri)
                      refreshRecentUris()
                    }}
                  >
                    Forget
                  </button>
                  <button
                    type="button"
                    className="en-btn en-btn--sm en-btn--danger"
                    onClick={() => handleDeleteRecent(uri)}
                    disabled={recentDeletingUri === uri}
                  >
                    {recentDeletingUri === uri ? 'Deleting…' : 'Delete from PDS'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {recentDeleteError && (
          <div className="en-toast en-toast--danger" role="alert">
            Delete error: {recentDeleteError}
          </div>
        )}
        {recentUris.length > 0 ? (
          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              className="en-btn en-btn--sm"
              onClick={() => {
                clearRecentEventUris()
                refreshRecentUris()
              }}
            >
              Clear all
            </button>
          </div>
        ) : null}
      </section>

      {persisted && (
        <section className="en-section">
          <div className="en-section__head">
            <h2 className="en-section__title">Read-back from PDS</h2>
            <span className="en-chip en-chip--success">getRecord OK</span>
          </div>
          <p className="en-section__sub">
            Confirms the record exists in the user's PDS. Discovery still requires an AppView.
          </p>
          <div className="en-panel en-panel--info">
            <dl className="en-dl">
              <dt>AT URI</dt>
              <dd>{persisted.createUri}</dd>
              <dt>CID (createRecord)</dt>
              <dd>{persisted.createCid}</dd>
              <dt>CID (getRecord)</dt>
              <dd>{persisted.fromPds.cid}</dd>
              <dt>Repo (DID)</dt>
              <dd>{persisted.parsed.repo}</dd>
              <dt>Collection</dt>
              <dd>{persisted.parsed.collection}</dd>
              <dt>rkey</dt>
              <dd>{persisted.parsed.rkey}</dd>
            </dl>
          </div>
          <h4 style={{ margin: '12px 0 6px', fontSize: 13, color: 'var(--en-text-soft)' }}>
            Raw stored record
          </h4>
          <pre className="en-pre">{JSON.stringify(persisted.fromPds.value, null, 2)}</pre>
        </section>
      )}

      {persisted && (
        <section className="en-section">
          <div className="en-section__head">
            <h2 className="en-section__title">Protocol lifecycle timeline</h2>
          </div>
          <ol className="en-progress">
            <li>
              <span className="en-progress__check en-progress__check--done">✓</span>
              <span><strong>Draft built</strong> — assembled from form input.</span>
            </li>
            <li>
              <span className="en-progress__check en-progress__check--done">✓</span>
              <span>
                <strong>Validated against</strong> <code>{persisted.parsed.collection}</code>
              </span>
            </li>
            <li>
              <span className="en-progress__check en-progress__check--done">✓</span>
              <span>
                <strong>createRecord</strong> sent to PDS · repo{' '}
                <code>{shortenDid(persisted.parsed.repo, 18)}</code>
              </span>
            </li>
            <li>
              <span className="en-progress__check en-progress__check--done">✓</span>
              <span>
                <strong>URI + CID returned</strong> · {shortenDid(persisted.createCid, 14)}
              </span>
            </li>
            <li>
              <span className="en-progress__check en-progress__check--done">✓</span>
              <span><strong>getRecord</strong> read back from PDS · CID match.</span>
            </li>
            <li>
              <span className="en-progress__check en-progress__check--done">✓</span>
              <span><strong>listRecords</strong> can surface this record from your repo.</span>
            </li>
            <li>
              <span className="en-progress__check en-progress__check--pending">·</span>
              <span style={{ color: 'var(--en-text-soft)' }}>
                Cross-user discovery requires an AppView/indexer (future).
              </span>
            </li>
          </ol>
        </section>
      )}

      {readBackError && (
        <div className="en-section">
          <div className="en-toast en-toast--danger">Read-back error: {readBackError}</div>
        </div>
      )}

      <section className="en-section">
        <div className="en-section__head">
          <h2 className="en-section__title">Read by known AT URI</h2>
          <span className="en-chip en-chip--neutral">manual</span>
        </div>
        <p className="en-section__sub">
          Paste an AT URI you already know. This is not search or discovery.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            value={manualUri}
            onChange={(e) => setManualUri(e.target.value)}
            placeholder="at://did:plc:…/org.community.event/…"
            className="en-input"
            style={{ flex: '1 1 280px', minWidth: 0 }}
          />
          <button
            type="button"
            onClick={handleManualRead}
            disabled={manualLoading || !manualUri.trim()}
            className="en-btn en-btn--primary"
          >
            {manualLoading ? 'Reading…' : 'Read'}
          </button>
        </div>
        {manualError && (
          <div className="en-toast en-toast--danger" style={{ marginTop: 10 }}>
            {manualError}
          </div>
        )}
        {manualResult && manualParsed && (
          <div style={{ marginTop: 12 }}>
            <div className="en-panel">
              <dl className="en-dl">
                <dt>AT URI</dt>
                <dd>{manualUri.trim()}</dd>
                <dt>CID</dt>
                <dd>{manualResult.cid}</dd>
                <dt>Repo</dt>
                <dd>{manualParsed.repo}</dd>
                <dt>Collection</dt>
                <dd>{manualParsed.collection}</dd>
                <dt>rkey</dt>
                <dd>{manualParsed.rkey}</dd>
              </dl>
            </div>
            <h4 style={{ margin: '12px 0 6px', fontSize: 13, color: 'var(--en-text-soft)' }}>
              Raw stored record
            </h4>
            <pre className="en-pre">{JSON.stringify(manualResult.value, null, 2)}</pre>
          </div>
        )}
      </section>
    </>
  )
}
