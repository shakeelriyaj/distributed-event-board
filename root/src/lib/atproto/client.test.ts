import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAtprotoAgent, resetAtprotoAgentForTests } from './client'

const constructorSpy = vi.fn()

vi.mock('@atproto/api', () => {
  class AtpAgent {
    session = null
    com = { atproto: { identity: { resolveHandle: vi.fn() } } }

    constructor(options: { service: string }) {
      constructorSpy(options)
    }
  }

  return { AtpAgent }
})

describe('createAtprotoAgent', () => {
  beforeEach(() => {
    resetAtprotoAgentForTests()
    constructorSpy.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('creates/reuses an agent for the configured service', () => {
    vi.stubEnv('VITE_ATP_SERVICE', 'https://my-pds.example')
    vi.stubEnv('VITE_ATP_IDENTIFIER', '')
    vi.stubEnv('VITE_ATP_PASSWORD', '')

    const a = createAtprotoAgent()
    const b = createAtprotoAgent()

    expect(a).toBe(b)
    expect(constructorSpy).toHaveBeenCalledTimes(1)
    expect(constructorSpy).toHaveBeenCalledWith({ service: 'https://my-pds.example' })
  })
})
