import { useEffect, useMemo, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { useParams } from 'react-router-dom'
import { parseAtUri } from '../lib/events/atUri'
import { readEventRecord, type ReadEventRecordResult } from '../lib/events/readEventRecord'
import { SourceBadge } from './SourceBadge'

type ViewMode = 'user' | 'protocol'

function asStringField(value: unknown, key: string): string | null {
  if (!value || typeof value !== 'object') return null
  const maybe = (value as Record<string, unknown>)[key]
  return typeof maybe === 'string' ? maybe : null
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
        if (!cancelled) {
          setRecord(result)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to read record')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
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
    <section style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>Event detail</h2>
        <SourceBadge variant="pds-list-records" />
      </div>
      <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>
        Read by known AT URI, not discovery.
      </p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setMode('user')}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: mode === 'user' ? '1px solid #3b82f6' : '1px solid #cbd5e1',
            background: mode === 'user' ? '#eff6ff' : '#f8fafc',
            color: '#0f172a',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          User View
        </button>
        <button
          type="button"
          onClick={() => setMode('protocol')}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: mode === 'protocol' ? '1px solid #3b82f6' : '1px solid #cbd5e1',
            background: mode === 'protocol' ? '#eff6ff' : '#f8fafc',
            color: '#0f172a',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Protocol View
        </button>
      </div>

      {loading ? (
        <p style={{ margin: 0, color: '#475569' }}>Loading record from PDS…</p>
      ) : null}

      {!loading && error ? (
        <p role="alert" style={{ margin: 0, color: '#b91c1c' }}>
          {error}
        </p>
      ) : null}

      {!loading && !error && record && mode === 'user' ? (
        <div style={{ display: 'grid', gap: '8px', color: '#334155' }}>
          <h3 style={{ margin: '2px 0 4px', color: '#0f172a' }}>{title}</h3>
          {description ? <p style={{ margin: 0 }}>{description}</p> : null}
          <p style={{ margin: 0 }}>
            <strong>Starts:</strong> {startsAt ?? 'Not set'}
          </p>
          {endsAt ? (
            <p style={{ margin: 0 }}>
              <strong>Ends:</strong> {endsAt}
            </p>
          ) : null}
          {location ? (
            <p style={{ margin: 0 }}>
              <strong>Location:</strong> {location}
            </p>
          ) : null}
        </div>
      ) : null}

      {!loading && !error && record && mode === 'protocol' ? (
        <div>
          <div style={{ display: 'grid', gap: '6px', color: '#334155', fontSize: '13px' }}>
            <p style={{ margin: 0, wordBreak: 'break-all' }}>
              <strong>AT URI:</strong> {record.uri}
            </p>
            <p style={{ margin: 0, wordBreak: 'break-all' }}>
              <strong>CID:</strong> {record.cid}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Repo DID:</strong> {parsed?.repo ?? 'Unknown'}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Collection:</strong> {parsed?.collection ?? 'Unknown'}
            </p>
            <p style={{ margin: 0 }}>
              <strong>rkey:</strong> {parsed?.rkey ?? 'Unknown'}
            </p>
          </div>
          <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => copyValue(record.uri, setCopyUriStatus, 'Copy URI')}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#0f172a',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {copyUriStatus}
            </button>
            <button
              type="button"
              onClick={() => copyValue(record.cid, setCopyCidStatus, 'Copy CID')}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#0f172a',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {copyCidStatus}
            </button>
          </div>
          <p style={{ margin: '12px 0 6px', fontWeight: 600, color: '#0f172a' }}>Raw stored JSON</p>
          <pre
            style={{
              margin: 0,
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              fontSize: '12px',
              overflow: 'auto',
              maxHeight: '280px',
            }}
          >
            {JSON.stringify(record.value, null, 2)}
          </pre>
        </div>
      ) : null}
    </section>
  )
}
