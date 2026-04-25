export type PipelineStage = 'composer' | 'pds' | 'jetstream' | 'appview' | 'ui'

export type ViewRole = 'sender' | 'recipient' | 'observer'

export type GlassMessage = {
  id: string
  fromHandle: string
  toHandle: string
  plaintext: string
  ciphertext: string
  /** ISO time when message entered each stage (simulated) */
  stageTimestamps: Partial<Record<PipelineStage, string>>
  /** Last completed stage for pipeline highlight */
  pipelineHead: PipelineStage | null
  /** Fully indexed and visible in feed */
  delivered: boolean
}

export const PIPELINE_STAGES: { id: PipelineStage; label: string; blurb: string }[] = [
  { id: 'composer', label: 'Client', blurb: 'Encrypt locally before any network hop' },
  { id: 'pds', label: 'PDS repo', blurb: 'Public record committed (ciphertext + metadata)' },
  { id: 'jetstream', label: 'Jetstream', blurb: 'Global firehose carries the commit' },
  { id: 'appview', label: 'App View', blurb: 'Indexer materializes rows for the API' },
  { id: 'ui', label: 'UI', blurb: 'Your client reads API + decrypts if allowed' },
]
