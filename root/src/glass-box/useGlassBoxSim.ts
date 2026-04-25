import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GlassMessage, PipelineStage, ViewRole } from './types'
import { mockEncrypt } from './cryptoMock'

const STAGE_DELAYS_MS: Record<Exclude<PipelineStage, 'composer'>, number> = {
  pds: 520,
  jetstream: 780,
  appview: 640,
  ui: 480,
}

function nowIso() {
  return new Date().toISOString()
}

export function useGlassBoxSim() {
  const [myHandle, setMyHandle] = useState('@you.research')
  const [viewRole, setViewRole] = useState<ViewRole>('sender')
  const [messages, setMessages] = useState<GlassMessage[]>([])
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null)
  const [activeStage, setActiveStage] = useState<PipelineStage | null>(null)
  const timersRef = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }, [])

  useEffect(() => () => clearTimers(), [clearTimers])

  const sendMessage = useCallback(
    (plaintext: string, toHandle: string) => {
      const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const ciphertext = mockEncrypt(plaintext)
      const base: GlassMessage = {
        id,
        fromHandle: myHandle,
        toHandle,
        plaintext,
        ciphertext,
        stageTimestamps: { composer: nowIso() },
        pipelineHead: 'composer',
        delivered: false,
      }

      setMessages((prev) => [base, ...prev])
      setActiveMessageId(id)
      setActiveStage('composer')
      clearTimers()

      type Step = { stage: Exclude<PipelineStage, 'composer'> }
      const steps: Step[] = [
        { stage: 'pds' },
        { stage: 'jetstream' },
        { stage: 'appview' },
        { stage: 'ui' },
      ]

      let cumulativeMs = 380
      for (const { stage } of steps) {
        cumulativeMs += STAGE_DELAYS_MS[stage]
        const t = window.setTimeout(() => {
          setActiveStage(stage)
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== id) return m
              const delivered = stage === 'ui'
              return {
                ...m,
                pipelineHead: stage,
                stageTimestamps: { ...m.stageTimestamps, [stage]: nowIso() },
                delivered,
              }
            }),
          )
        }, cumulativeMs)
        timersRef.current.push(t)
      }

      const doneAt = cumulativeMs + 720
      const doneT = window.setTimeout(() => {
        setActiveMessageId((cur) => (cur === id ? null : cur))
        setActiveStage(null)
      }, doneAt)
      timersRef.current.push(doneT)
    },
    [clearTimers, myHandle],
  )

  const seedDemoThread = useCallback(() => {
    const samples: GlassMessage[] = [
      {
        id: 'seed_1',
        fromHandle: '@alice.lab',
        toHandle: myHandle,
        plaintext: 'Key rotation at 16:00 UTC — confirm receipt.',
        ciphertext: mockEncrypt('Key rotation at 16:00 UTC — confirm receipt.'),
        stageTimestamps: {
          composer: new Date(Date.now() - 120_000).toISOString(),
          pds: new Date(Date.now() - 119_000).toISOString(),
          jetstream: new Date(Date.now() - 118_200).toISOString(),
          appview: new Date(Date.now() - 117_400).toISOString(),
          ui: new Date(Date.now() - 116_800).toISOString(),
        },
        pipelineHead: 'ui',
        delivered: true,
      },
      {
        id: 'seed_2',
        fromHandle: myHandle,
        toHandle: '@bob.lab',
        plaintext: 'Observer should only see noise on the wire.',
        ciphertext: mockEncrypt('Observer should only see noise on the wire.'),
        stageTimestamps: {
          composer: new Date(Date.now() - 60_000).toISOString(),
          pds: new Date(Date.now() - 59_200).toISOString(),
          jetstream: new Date(Date.now() - 58_400).toISOString(),
          appview: new Date(Date.now() - 57_600).toISOString(),
          ui: new Date(Date.now() - 56_900).toISOString(),
        },
        pipelineHead: 'ui',
        delivered: true,
      },
    ]
    setMessages((prev) => [...samples, ...prev])
  }, [myHandle])

  const visibleMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) =>
        new Date(b.stageTimestamps.ui ?? b.stageTimestamps.composer ?? 0).getTime() -
        new Date(a.stageTimestamps.ui ?? a.stageTimestamps.composer ?? 0).getTime(),
    )
  }, [messages])

  return {
    myHandle,
    setMyHandle,
    viewRole,
    setViewRole,
    messages: visibleMessages,
    sendMessage,
    seedDemoThread,
    activeMessageId,
    activeStage,
  }
}
