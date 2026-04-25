import { PIPELINE_STAGES } from './types'
import type { PipelineStage } from './types'

type Props = {
  activeStage: PipelineStage | null
  activeMessageId: string | null
}

export function PipelinePanel({ activeStage, activeMessageId }: Props) {
  return (
    <aside className="gb-panel gb-pipeline">
      <header className="gb-panel__head">
        <h2 className="gb-panel__title">System pipeline</h2>
        <p className="gb-panel__sub">
          Public transport, private meaning. Each hop is observable; content stays opaque off-device.
        </p>
      </header>

      <div className="gb-pipeline__track" aria-live="polite">
        {PIPELINE_STAGES.map((node, i) => {
          const idx = PIPELINE_STAGES.findIndex((s) => s.id === node.id)
          const head =
            activeStage != null ? PIPELINE_STAGES.findIndex((s) => s.id === activeStage) : -1
          const active = Boolean(activeMessageId && activeStage === node.id)
          const done = head !== -1 && head > idx

          return (
            <div key={node.id} className="gb-pipeline__stepWrap">
              {i > 0 && (
                <div
                  className={
                    'gb-pipeline__edge ' + (done || active ? 'gb-pipeline__edge--hot' : '')
                  }
                  aria-hidden
                />
              )}
              <div
                className={
                  'gb-pipeline__node ' +
                  (active ? 'gb-pipeline__node--pulse ' : '') +
                  (done ? 'gb-pipeline__node--done ' : '')
                }
              >
                <span className="gb-pipeline__dot" />
                <div>
                  <div className="gb-pipeline__label">{node.label}</div>
                  <div className="gb-pipeline__blurb">{node.blurb}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <footer className="gb-pipeline__legend">
        <span className="gb-chip gb-chip--public">Public path</span>
        <span className="gb-chip gb-chip--private">Decrypt local</span>
      </footer>
    </aside>
  )
}
