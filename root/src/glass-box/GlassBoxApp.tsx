import { useState } from 'react'
import { MessageComposer } from './MessageComposer'
import { MessageFeed } from './MessageFeed'
import { MessageInspector } from './MessageInspector'
import { PipelinePanel } from './PipelinePanel'
import type { GlassMessage } from './types'
import type { ViewRole } from './types'
import { useGlassBoxSim } from './useGlassBoxSim'

const ROLES: { id: ViewRole; label: string; hint: string }[] = [
  { id: 'sender', label: 'Sender', hint: 'Read cleartext only for messages you sent.' },
  { id: 'recipient', label: 'Recipient', hint: 'Decrypt only messages addressed to your handle.' },
  { id: 'observer', label: 'Observer', hint: 'Indexer view: ciphertext + metadata only.' },
]

export function GlassBoxApp() {
  const sim = useGlassBoxSim()
  const [inspected, setInspected] = useState<GlassMessage | null>(null)
  const busy = sim.activeMessageId !== null

  return (
    <div className="gb-root">
      <header className="gb-hero">
        <div>
          <p className="gb-hero__eyebrow">Research lab · glass box</p>
          <h1 className="gb-hero__title">Public pipeline, private payload</h1>
          <p className="gb-hero__lead">
            Watch a record move from client encryption through PDS, Jetstream, and App View—then see how role changes what you are allowed to read.
          </p>
        </div>
        <div className="gb-hero__controls">
          <label className="gb-field gb-field--inline">
            <span className="gb-field__label">Your handle</span>
            <input
              className="gb-input"
              value={sim.myHandle}
              onChange={(e) => sim.setMyHandle(e.target.value)}
              disabled={busy}
            />
          </label>
          <div className="gb-role">
            <span className="gb-field__label">View as</span>
            <div className="gb-role__toggle" role="group" aria-label="Perspective">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={'gb-role__btn ' + (sim.viewRole === r.id ? 'gb-role__btn--on' : '')}
                  onClick={() => sim.setViewRole(r.id)}
                  title={r.hint}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <button type="button" className="gb-btn gb-btn--ghost" onClick={sim.seedDemoThread} disabled={busy}>
            Load demo thread
          </button>
        </div>
      </header>

      <div className="gb-grid">
        <MessageComposer onSend={sim.sendMessage} disabled={busy} />
        <MessageFeed
          messages={sim.messages}
          viewRole={sim.viewRole}
          myHandle={sim.myHandle}
          onInspect={setInspected}
        />
        <PipelinePanel activeStage={sim.activeStage} activeMessageId={sim.activeMessageId} />
      </div>

      {inspected && (
        <MessageInspector
          message={inspected}
          viewRole={sim.viewRole}
          myHandle={sim.myHandle}
          onClose={() => setInspected(null)}
        />
      )}
    </div>
  )
}
