import { afterEach, describe, expect, it, vi } from 'vitest'
import { assertAtprotoConfig, getAtprotoConfig } from './config'

describe('getAtprotoConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns default service URL when env is missing', () => {
    vi.stubEnv('VITE_ATP_SERVICE', '')
    vi.stubEnv('VITE_ATP_IDENTIFIER', '')
    vi.stubEnv('VITE_ATP_PASSWORD', '')

    const config = getAtprotoConfig()
    expect(config.service).toBe('https://bsky.social')
  })

  it('reads VITE_ATP_SERVICE when provided', () => {
    vi.stubEnv('VITE_ATP_SERVICE', 'https://example-pds.test')
    vi.stubEnv('VITE_ATP_IDENTIFIER', 'alice.test')
    vi.stubEnv('VITE_ATP_PASSWORD', 'pw')

    const config = getAtprotoConfig()
    expect(config.service).toBe('https://example-pds.test')
  })
})

describe('assertAtprotoConfig', () => {
  it('reports missing identifier/password clearly', () => {
    expect(() =>
      assertAtprotoConfig({
        service: 'https://bsky.social',
        identifier: '',
        password: '',
      }),
    ).toThrowError(/VITE_ATP_IDENTIFIER|VITE_ATP_PASSWORD/)
  })
})
