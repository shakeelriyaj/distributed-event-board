import type { GlassMessage } from './types'
import type { ViewRole } from './types'
import { resolveMessageBody } from './visibility'

type Props = {
  messages: GlassMessage[]
  viewRole: ViewRole
  myHandle: string
  onInspect: (msg: GlassMessage) => void
}

export function MessageFeed({ messages, viewRole, myHandle, onInspect }: Props) {
  return (
    <section className="gb-panel gb-feed">
      <header className="gb-panel__head">
        <h2 className="gb-panel__title">App View feed</h2>
        <p className="gb-panel__sub">
          Rows materialized from the indexer API (simulated). Metadata is public; body visibility depends on your lens.
        </p>
      </header>

      <ul className="gb-feed__list">
        {messages.length === 0 && (
          <li className="gb-feed__empty">No records yet. Send a message to walk the pipeline.</li>
        )}
        {messages.map((msg) => {
          const body = resolveMessageBody(msg, viewRole, myHandle)
          const metaPublic = `${msg.fromHandle} → ${msg.toHandle}`

          return (
            <li key={msg.id} className={'gb-card ' + (!msg.delivered ? 'gb-card--pending' : '')}>
              <div className="gb-card__row">
                <span className="gb-chip gb-chip--dim">{msg.delivered ? 'Indexed' : 'In flight'}</span>
                <time className="gb-card__time" dateTime={msg.stageTimestamps.ui ?? msg.stageTimestamps.composer}>
                  {new Date(msg.stageTimestamps.ui ?? msg.stageTimestamps.composer ?? Date.now()).toLocaleTimeString(
                    [],
                    { hour: '2-digit', minute: '2-digit', second: '2-digit' },
                  )}
                </time>
              </div>
              <div className="gb-card__meta">{metaPublic}</div>
              <div className="gb-card__body">
                {body.kind === 'plaintext' ? (
                  <p className="gb-card__plain">{body.text}</p>
                ) : (
                  <div className="gb-card__locked">
                    <span className="gb-lock" aria-hidden>
                      🔒
                    </span>
                    <div>
                      <div className="gb-card__cipher mono">{msg.ciphertext.slice(0, 96)}…</div>
                      <div className="gb-card__hint">{body.reason}</div>
                    </div>
                  </div>
                )}
              </div>
              <button type="button" className="gb-btn gb-btn--ghost" onClick={() => onInspect(msg)}>
                Inspect record
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
