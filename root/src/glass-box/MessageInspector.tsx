import type { GlassMessage } from './types'
import type { ViewRole } from './types'
import { resolveMessageBody } from './visibility'

type Props = {
  message: GlassMessage | null
  viewRole: ViewRole
  myHandle: string
  onClose: () => void
}

export function MessageInspector({ message, viewRole, myHandle, onClose }: Props) {
  if (!message) return null

  const body = resolveMessageBody(message, viewRole, myHandle)

  return (
    <div
      className="gb-drawerOverlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gb-inspector-title"
      onClick={onClose}
    >
      <div className="gb-drawer" onClick={(e) => e.stopPropagation()}>
        <header className="gb-drawer__head">
          <h2 id="gb-inspector-title" className="gb-drawer__title">
            Record inspector
          </h2>
          <button type="button" className="gb-iconBtn" onClick={onClose} aria-label="Close inspector">
            ×
          </button>
        </header>

        <div className="gb-drawer__section">
          <h3 className="gb-drawer__h">Public metadata</h3>
          <dl className="gb-dl">
            <div>
              <dt>From</dt>
              <dd className="mono">{message.fromHandle}</dd>
            </div>
            <div>
              <dt>To</dt>
              <dd className="mono">{message.toHandle}</dd>
            </div>
            <div>
              <dt>Record id</dt>
              <dd className="mono">{message.id}</dd>
            </div>
            <div>
              <dt>Pipeline</dt>
              <dd className="mono">{message.pipelineHead ?? '—'}</dd>
            </div>
          </dl>
        </div>

        <div className="gb-drawer__section">
          <h3 className="gb-drawer__h">Raw payload (ciphertext)</h3>
          <p className="gb-drawer__note">
            This is what any indexer or observer can persist: opaque bytes plus routing fields.
          </p>
          <pre className="gb-pre gb-pre--tight mono">{message.ciphertext}</pre>
        </div>

        <div className="gb-drawer__section">
          <h3 className="gb-drawer__h">Decrypted view</h3>
          {body.kind === 'plaintext' ? (
            <pre className="gb-pre gb-pre--soft">{body.text}</pre>
          ) : (
            <div className="gb-drawer__locked">
              <span className="gb-lock" aria-hidden>
                🔒
              </span>
              <p>{body.reason}</p>
            </div>
          )}
        </div>

        <div className="gb-drawer__section">
          <h3 className="gb-drawer__h">Stage timestamps (sim)</h3>
          <ul className="gb-miniList mono">
            {Object.entries(message.stageTimestamps).map(([k, v]) => (
              <li key={k}>
                <strong>{k}</strong>: {v}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
