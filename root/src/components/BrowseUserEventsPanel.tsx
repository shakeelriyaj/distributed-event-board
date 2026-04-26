import { useState } from 'react'
import { EventCard } from './EventCard'
import { listRepoEventRecords } from '../lib/events/listRepoEventRecords'
import { parseAtUri } from '../lib/events/atUri'
import { getCurrentSessionSnapshot } from '../lib/atproto/session'
import { resolveDidToPds } from '../lib/identity/resolveDidToPds'
import { resolveHandleToDid } from '../lib/identity/resolveHandleToDid'
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
    <section
      style={{
        marginTop: '22px',
        padding: '14px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        background: '#fafafa',
      }}
    >
      <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>Browse User Events (by handle)</h3>
      <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#64748b', lineHeight: 1.45 }}>
        Reading @handle&apos;s PDS directly via AT Protocol. No central server involved. This is not a discovery feed -
        you must know the handle.
      </p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="@alice.bsky.social or did:plc:..."
          style={{ flex: '1 1 280px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        <button
          type="button"
          onClick={onBrowse}
          disabled={loading || !input.trim()}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: 'none',
            background: '#0f172a',
            color: '#fff',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Browsing…' : 'Browse'}
        </button>
      </div>

      {resolvedDid && (
        <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#475569', wordBreak: 'break-all' }}>
          <strong>Resolved DID:</strong> {resolvedDid}
        </p>
      )}
      {resolvedPds && (
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#475569', wordBreak: 'break-all' }}>
          <strong>Resolved PDS:</strong> {resolvedPds}
        </p>
      )}

      {error && (
        <p style={{ marginTop: '10px', fontSize: '13px', color: '#b91c1c' }} role="alert">
          {error}
        </p>
      )}

      {resolvedDid && !error && (
        <div style={{ marginTop: '12px' }}>
          {records.length === 0 ? (
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              No public org.community.event records found for this repo.
            </p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '10px' }}>
              {records.map((r) => (
                <li key={r.uri}>
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
                        ? `Source: from @${resolvedHandle}'s PDS directly`
                        : "Source: from handle's PDS directly"
                    }
                  />
                  <CrossRepoRecordGlassBox
                    uri={r.uri}
                    cid={r.cid}
                    resolvedHandle={resolvedHandle}
                    resolvedPds={resolvedPds}
                    sessionDid={sessionDid}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
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
    <div
      style={{
        marginTop: '8px',
        border: foreign ? '1px solid #f59e0b' : '1px solid #dbeafe',
        background: foreign ? '#fffbeb' : '#f8fafc',
        borderRadius: '8px',
        padding: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
        <strong style={{ fontSize: '12px', color: '#0f172a' }}>Cross-repo protocol metadata</strong>
        {foreign ? (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '999px',
              padding: '2px 8px',
              color: '#92400e',
              border: '1px solid #fcd34d',
              background: '#fef3c7',
            }}
          >
            Foreign repo
          </span>
        ) : null}
      </div>
      <dl style={{ margin: 0, fontSize: '12px', color: '#334155' }}>
        <div><dt style={{ fontWeight: 600 }}>repo DID:</dt><dd style={{ margin: 0, wordBreak: 'break-all' }}>{parsed.repo}</dd></div>
        <div><dt style={{ fontWeight: 600 }}>handle:</dt><dd style={{ margin: 0 }}>{resolvedHandle ? `@${resolvedHandle}` : '(unknown)'}</dd></div>
        <div><dt style={{ fontWeight: 600 }}>PDS:</dt><dd style={{ margin: 0, wordBreak: 'break-all' }}>{resolvedPds ?? '(unresolved)'}</dd></div>
        <div><dt style={{ fontWeight: 600 }}>collection:</dt><dd style={{ margin: 0 }}>{parsed.collection}</dd></div>
        <div><dt style={{ fontWeight: 600 }}>rkey:</dt><dd style={{ margin: 0 }}>{parsed.rkey}</dd></div>
        <div><dt style={{ fontWeight: 600 }}>AT URI:</dt><dd style={{ margin: 0, wordBreak: 'break-all' }}>{uri}</dd></div>
        <div><dt style={{ fontWeight: 600 }}>CID:</dt><dd style={{ margin: 0, wordBreak: 'break-all' }}>{cid}</dd></div>
        <div><dt style={{ fontWeight: 600 }}>your session DID:</dt><dd style={{ margin: 0, wordBreak: 'break-all' }}>{sessionDid ?? '(not logged in)'}</dd></div>
      </dl>
    </div>
  )
}
