import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SourceBadge, type SourceBadgeVariant } from './SourceBadge'
import { avatarColor, avatarInitial, relativeTime, shortenDid } from '../eventnet/avatar'

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

function formatExact(value?: string | null): string {
  if (!value) return 'Time not set'
  const d = new Date(value)
  if (Number.isNaN(d.valueOf())) return value
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function displayHost(host?: string | null): string {
  if (!host) return 'Unknown'
  if (host.startsWith('did:')) return shortenDid(host, 14)
  if (host.startsWith('@')) return host
  return host
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
  const hostDisplay = displayHost(host)
  const rel = relativeTime(startsAt)

  return (
    <article className="en-post">
      <div className="en-avatar" style={{ background: avatarColor(host || title) }}>
        {avatarInitial(host || title)}
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="en-post__head">
          <span className="en-post__handle">{hostDisplay}</span>
          {rel ? (
            <>
              <span className="en-post__dot">·</span>
              <span className="en-post__meta">{rel}</span>
            </>
          ) : null}
          {sourceVariant ? (
            <>
              <span className="en-post__dot">·</span>
              <SourceBadge variant={sourceVariant} labelOverride={sourceLabelOverride} />
            </>
          ) : null}
        </div>

        <h3 className="en-post__title">{title || '(untitled event)'}</h3>

        <div className="en-meta-row">
          <span>
            <span className="en-meta-row__key">When</span> {formatExact(startsAt)}
          </span>
          {location ? (
            <span>
              <span className="en-meta-row__key">Where</span> {location}
            </span>
          ) : null}
          <span>
            <span className="en-meta-row__key">RSVPs</span>{' '}
            {typeof rsvpCount === 'number' ? rsvpCount : '—'}
          </span>
        </div>

        {(uri || cid) ? (
          <div className="en-uribox">
            {uri ? (
              <div>
                <strong>uri</strong>
                {uri}
              </div>
            ) : null}
            {cid ? (
              <div style={{ marginTop: 2 }}>
                <strong>cid</strong>
                {cid}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="en-actions">
          {uri ? (
            <Link to={`/events/${encodedUri}`} className="en-actions__btn">
              View details
            </Link>
          ) : (
            <button type="button" disabled className="en-actions__btn">
              View details
            </button>
          )}
          {uri ? (
            <button type="button" onClick={onCopyUri} className="en-actions__btn">
              {copied ? 'Copied' : 'Copy URI'}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
