import { useState } from 'react'
import { EventCard } from './EventCard'
import { listRepoEventRecords } from '../lib/events/listRepoEventRecords'
import { parseAtUri } from '../lib/events/atUri'
import { getCurrentSessionSnapshot } from '../lib/atproto/session'
import { resolveDidToPds } from '../lib/identity/resolveDidToPds'
import { resolveHandleToDid } from '../lib/identity/resolveHandleToDid'
import { shortenDid } from '../eventnet/avatar'
import type { ListedEventRecord } from '../lib/events/listEventRecords'

function recordTitle(value: unknown): string {
  if (value && typeof value === 'object' && 'title' in value && typeof (value as { title: unknown }).title === 'string') {
    return (value as { title: string }).title
  }
  return '(no title)'
}

function recordStartsAt(value: unknown): string | null {
  if (value && typeof value === 'object') {
    const starts = (value as { startsAt?: unknown }).startsAt
    if (typeof starts === 'string') return starts
    const eventDate = (value as { eventDate?: unknown }).eventDate
    if (typeof eventDate === 'string') return eventDate
  }
  return null
}

function recordLocation(value: unknown): string | null {
  if (value && typeof value === 'object' && 'location' in value) {
    const s = (value as { location: unknown }).location
    return typeof s === 'string' ? s : null
  }
  return null
}

export function BrowseUserEventsPanel() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resolvedDid, setResolvedDid] = useState<string | null>(null)
  const [resolvedHandle, setResolvedHandle] = useState<string | null>(null)
  const [resolvedPds, setResolvedPds] = useState<string | null>(null)
  const [records, setRecords] = useState<ListedEventRecord[]>([])
  const sessionDid = getCurrentSessionSnapshot()?.did ?? null

  const onBrowse = async () => {
    const raw = input.trim()
    if (!raw) return
    setLoading(true)
    setError(null)
    setRecords([])
    setResolvedDid(null)
    setResolvedHandle(null)
    setResolvedPds(null)
    try {
      const did = raw.startsWith('did:') ? raw : await resolveHandleToDid(raw)
      const [out, pds] = await Promise.all([listRepoEventRecords(did, { limit: 20 }), resolveDidToPds(did)])
      setResolvedDid(did)
      setResolvedHandle(raw.startsWith('did:') ? null : raw.replace(/^@/, ''))
      setResolvedPds(pds)
      setRecords(out.records)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to browse user events')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section className="en-section">
        <div className="en-section__head">
          <h2 className="en-section__title">Browse a user</h2>
          <span className="en-srcbadge en-srcbadge--handle">Handle's PDS · direct</span>
        </div>
        <p className="en-section__sub">
          Resolves a handle to a DID, finds their PDS, and reads org.community.event from their repo. No central server.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="@alice.bsky.social or did:plc:..."
            className="en-input"
            style={{ flex: '1 1 280px', minWidth: 0 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onBrowse()
            }}
          />
          <button
            type="button"
            onClick={onBrowse}
            disabled={loading || !input.trim()}
            className="en-btn en-btn--primary"
          >
            {loading ? 'Browsing…' : 'Browse'}
          </button>
        </div>
        {(resolvedDid || resolvedPds) && !error ? (
          <div className="en-panel" style={{ marginTop: 12 }}>
            <dl className="en-dl">
              {resolvedHandle ? (
                <>
                  <dt>Handle</dt>
                  <dd>@{resolvedHandle}</dd>
                </>
              ) : null}
              {resolvedDid ? (
                <>
                  <dt>DID</dt>
                  <dd>{resolvedDid}</dd>
                </>
              ) : null}
              {resolvedPds ? (
                <>
                  <dt>PDS</dt>
                  <dd>{resolvedPds}</dd>
                </>
              ) : null}
            </dl>
          </div>
        ) : null}
        {error && (
          <div className="en-toast en-toast--danger" role="alert" style={{ marginTop: 10 }}>
            {error}
          </div>
        )}
      </section>

      {resolvedDid && !error && (
        <>
          {records.length === 0 ? (
            <div className="en-empty">
              <div className="en-empty__title">No events found</div>
              <div className="en-empty__sub">No public org.community.event records in this repo.</div>
            </div>
          ) : (
            <div>
              {records.map((r) => (
                <div key={r.uri}>
                  <EventCard
                    title={recordTitle(r.value)}
                    startsAt={recordStartsAt(r.value)}
                    location={recordLocation(r.value)}
                    host={resolvedHandle ? `@${resolvedHandle}` : resolvedDid}
                    uri={r.uri}
                    cid={r.cid}
                    sourceVariant="handle-pds-direct"
                    sourceLabelOverride={
                      resolvedHandle
                        ? `@${resolvedHandle}'s PDS · direct`
                        : "Handle's PDS · direct"
                    }
                  />
                  <div style={{ padding: '0 18px 14px', marginTop: -6 }}>
                    <CrossRepoRecordGlassBox
                      uri={r.uri}
                      cid={r.cid}
                      resolvedHandle={resolvedHandle}
                      resolvedPds={resolvedPds}
                      sessionDid={sessionDid}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}

export function isForeignRepo(repoDid: string | null | undefined, sessionDid: string | null | undefined): boolean {
  return Boolean(repoDid && sessionDid && repoDid !== sessionDid)
}

export function CrossRepoRecordGlassBox({
  uri,
  cid,
  resolvedHandle,
  resolvedPds,
  sessionDid,
}: {
  uri: string
  cid: string
  resolvedHandle: string | null
  resolvedPds: string | null
  sessionDid: string | null
}) {
  const parsed = parseAtUri(uri)
  const foreign = isForeignRepo(parsed.repo, sessionDid)

  return (
    <div className={'en-panel ' + (foreign ? 'en-panel--warn' : '')}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <strong style={{ fontSize: 13 }}>Cross-repo metadata</strong>
        {foreign ? <span className="en-chip en-chip--warn">Foreign repo</span> : null}
      </div>
      <dl className="en-dl">
        <dt>repo DID</dt>
        <dd>{parsed.repo}</dd>
        <dt>handle</dt>
        <dd>{resolvedHandle ? `@${resolvedHandle}` : '(unknown)'}</dd>
        <dt>PDS</dt>
        <dd>{resolvedPds ?? '(unresolved)'}</dd>
        <dt>collection</dt>
        <dd>{parsed.collection}</dd>
        <dt>rkey</dt>
        <dd>{parsed.rkey}</dd>
        <dt>AT URI</dt>
        <dd>{uri}</dd>
        <dt>CID</dt>
        <dd>{cid}</dd>
        <dt>your DID</dt>
        <dd>{sessionDid ? shortenDid(sessionDid, 22) : '(not logged in)'}</dd>
      </dl>
    </div>
  )
}
