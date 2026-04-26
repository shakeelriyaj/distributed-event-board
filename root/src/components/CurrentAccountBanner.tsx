import { useEffect, useMemo, useState } from 'react'
import { getAtprotoConfig } from '../lib/atproto/config'
import { getCurrentSessionSnapshot, type SessionSnapshot } from '../lib/atproto/session'

export function CurrentAccountBanner() {
  const config = useMemo(() => getAtprotoConfig(), [])
  const [session, setSession] = useState<SessionSnapshot | null>(() => getCurrentSessionSnapshot())

  useEffect(() => {
    const sync = () => setSession(getCurrentSessionSnapshot())
    sync()
    const timer = window.setInterval(sync, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const writesStatus = config.identifier && config.password ? 'enabled' : 'unknown'

  return (
    <section
      style={{
        marginBottom: '18px',
        padding: '12px 14px',
        borderRadius: '10px',
        border: '1px solid #dbeafe',
        background: '#f0f7ff',
      }}
      aria-label="Current account and PDS configuration"
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '12px', color: '#334155' }}>
        <span>
          <strong>Service:</strong> {config.service}
        </span>
        <span>
          <strong>Identifier:</strong> {config.identifier || '(not configured)'}
        </span>
        <span>
          <strong>Writes:</strong> {writesStatus}
        </span>
        <span>
          <strong>Handle:</strong> {session?.handle ?? 'Not logged in yet'}
        </span>
        <span>
          <strong>DID:</strong> {session?.did ?? 'Not logged in yet'}
        </span>
      </div>

      {!session ? (
        <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#475569' }}>
          Not logged in yet — session created on verification/create/list.
        </p>
      ) : null}
    </section>
  )
}
