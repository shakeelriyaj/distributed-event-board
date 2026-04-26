import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SourceBadge, type SourceBadgeVariant } from './SourceBadge'

export type EventCardProps = {
  title: string
  startsAt?: string | null
  location?: string | null
  host?: string | null
  rsvpCount?: number | null
  uri?: string
  cid?: string
  sourceVariant?: SourceBadgeVariant
  sourceLabelOverride?: string
}

function formatWhen(value?: string | null): string {
  if (!value) return 'Time not set'
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return value
  return date.toLocaleString()
}

export function EventCard({
  title,
  startsAt,
  location,
  host,
  rsvpCount,
  uri,
  cid,
  sourceVariant,
  sourceLabelOverride,
}: EventCardProps) {
  const [copied, setCopied] = useState(false)

  const onCopyUri = async () => {
    if (!uri) return
    try {
      await navigator.clipboard.writeText(uri)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  const encodedUri = uri ? encodeURIComponent(uri) : ''

  return (
    <article
      style={{
        border: '1px solid #e2e8f0',
        padding: '14px',
        borderRadius: '10px',
        background: '#fff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <h3 style={{ margin: 0, color: '#0f172a' }}>{title || '(untitled event)'}</h3>
        {sourceVariant ? <SourceBadge variant={sourceVariant} labelOverride={sourceLabelOverride} /> : null}
      </div>

      <div style={{ marginTop: '8px', display: 'grid', gap: '4px', fontSize: '13px', color: '#334155' }}>
        <div>
          <strong>Time:</strong> {formatWhen(startsAt)}
        </div>
        {location ? (
          <div>
            <strong>Location:</strong> {location}
          </div>
        ) : null}
        <div>
          <strong>Host:</strong> {host || 'Unknown'}
        </div>
        <div>
          <strong>RSVPs:</strong> {typeof rsvpCount === 'number' ? rsvpCount : 'demo'}
        </div>
      </div>

      {uri ? (
        <p style={{ margin: '10px 0 0', fontSize: '11px', color: '#64748b', wordBreak: 'break-all' }}>
          <strong>AT URI:</strong> {uri}
        </p>
      ) : null}
      {cid ? (
        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#64748b', wordBreak: 'break-all' }}>
          <strong>CID:</strong> {cid}
        </p>
      ) : null}

      <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {uri ? (
          <Link
            to={`/events/${encodedUri}`}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#0f172a',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            View details
          </Link>
        ) : (
          <button
            type="button"
            disabled
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#94a3b8',
              fontSize: '12px',
            }}
          >
            View details
          </button>
        )}
        {uri ? (
          <button
            type="button"
            onClick={onCopyUri}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#0f172a',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {copied ? 'Copied' : 'Copy URI'}
          </button>
        ) : null}
      </div>
    </article>
  )
}
