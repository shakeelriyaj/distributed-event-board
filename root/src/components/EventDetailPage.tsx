import { useEffect, useMemo, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { useParams } from 'react-router-dom'
import { parseAtUri } from '../lib/events/atUri'
import { readEventRecord, type ReadEventRecordResult } from '../lib/events/readEventRecord'
import { SourceBadge } from './SourceBadge'
import { avatarColor, avatarInitial, relativeTime, shortenDid } from '../eventnet/avatar'

type ViewMode = 'user' | 'protocol'

function asStringField(value: unknown, key: string): string | null {
  if (!value || typeof value !== 'object') return null
  const maybe = (value as Record<string, unknown>)[key]
  return typeof maybe === 'string' ? maybe : null
}

function formatExact(value?: string | null): string {
  if (!value) return 'Not set'
  const d = new Date(value)
  if (Number.isNaN(d.valueOf())) return value
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function EventDetailPage() {
  const { encodedAtUri } = useParams()
  const decodedUri = useMemo(() => {
    if (!encodedAtUri) return ''
    try {
      return decodeURIComponent(encodedAtUri)
    } catch {
      return '(invalid URI encoding)'
    }
  }, [encodedAtUri])

  const [mode, setMode] = useState<ViewMode>('user')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [record, setRecord] = useState<ReadEventRecordResult | null>(null)
  const [copyUriStatus, setCopyUriStatus] = useState('Copy URI')
  const [copyCidStatus, setCopyCidStatus] = useState('Copy CID')

  useEffect(() => {
    if (!decodedUri || decodedUri === '(invalid URI encoding)') {
      setLoading(false)
      setError('Route parameter is missing or invalid.')
      setRecord(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setRecord(null)

    readEventRecord(decodedUri)
      .then((result) => {
        if (!cancelled) setRecord(result)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to read record')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [decodedUri])

  const parsed = useMemo(() => {
    if (!record?.uri) return null
    try {
      return parseAtUri(record.uri)
    } catch {
      return null
    }
  }, [record?.uri])

  const title = asStringField(record?.value, 'title') ?? 'Untitled event'
  const description = asStringField(record?.value, 'description')
  const startsAt = asStringField(record?.value, 'startsAt')
  const endsAt = asStringField(record?.value, 'endsAt')
  const location = asStringField(record?.value, 'location')
  const host = parsed?.repo ?? null

  const copyValue = async (
    value: string | undefined,
    setLabel: Dispatch<SetStateAction<string>>,
    idle: string,
  ) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setLabel('Copied')
      setTimeout(() => setLabel(idle), 1000)
    } catch {
      setLabel('Copy failed')
      setTimeout(() => setLabel(idle), 1200)
    }
  }

  return (
    <article>
      <section className="en-section">
        {loading ? (
          <div className="en-empty">
            <div className="en-empty__sub">Loading record from PDS…</div>
          </div>
        ) : error ? (
          <div className="en-toast en-toast--danger" role="alert">{error}</div>
        ) : record ? (
          <>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div className="en-avatar en-avatar--lg" style={{ background: avatarColor(host || title) }}>
                {avatarInitial(host || title)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="en-post__head">
                  <span className="en-post__handle">{host ? shortenDid(host, 18) : 'Unknown'}</span>
                  {startsAt ? (
                    <>
                      <span className="en-post__dot">·</span>
                      <span className="en-post__meta">{relativeTime(startsAt)}</span>
                    </>
                  ) : null}
                  <span className="en-post__dot">·</span>
                  <SourceBadge variant="pds-list-records" />
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.4px', margin: '6px 0 8px' }}>
                  {title}
                </h1>
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  <button
                    type="button"
                    onClick={() => setMode('user')}
                    className={'en-btn en-btn--sm ' + (mode === 'user' ? 'en-btn--primary' : '')}
                  >
                    Reader
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('protocol')}
                    className={'en-btn en-btn--sm ' + (mode === 'protocol' ? 'en-btn--primary' : '')}
                  >
                    Protocol
                  </button>
                </div>

                {mode === 'user' ? (
                  <div className="en-stack">
                    {description ? (
                      <p style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--en-text)', whiteSpace: 'pre-wrap' }}>
                        {description}
                      </p>
                    ) : null}
                    <div className="en-meta-row">
                      <span>
                        <span className="en-meta-row__key">When</span> {formatExact(startsAt)}
                      </span>
                      {endsAt ? (
                        <span>
                          <span className="en-meta-row__key">Ends</span> {formatExact(endsAt)}
                        </span>
                      ) : null}
                      {location ? (
                        <span>
                          <span className="en-meta-row__key">Where</span> {location}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="en-stack">
                    <div className="en-panel">
                      <dl className="en-dl">
                        <dt>AT URI</dt>
                        <dd>{record.uri}</dd>
                        <dt>CID</dt>
                        <dd>{record.cid}</dd>
                        <dt>Repo DID</dt>
                        <dd>{parsed?.repo ?? 'Unknown'}</dd>
                        <dt>Collection</dt>
                        <dd>{parsed?.collection ?? 'Unknown'}</dd>
                        <dt>rkey</dt>
                        <dd>{parsed?.rkey ?? 'Unknown'}</dd>
                      </dl>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="en-btn en-btn--sm"
                        onClick={() => copyValue(record.uri, setCopyUriStatus, 'Copy URI')}
                      >
                        {copyUriStatus}
                      </button>
                      <button
                        type="button"
                        className="en-btn en-btn--sm"
                        onClick={() => copyValue(record.cid, setCopyCidStatus, 'Copy CID')}
                      >
                        {copyCidStatus}
                      </button>
                    </div>
                    <h4 style={{ margin: '4px 0', fontSize: 13, color: 'var(--en-text-soft)' }}>Raw stored JSON</h4>
                    <pre className="en-pre">{JSON.stringify(record.value, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </section>
    </article>
  )
}
