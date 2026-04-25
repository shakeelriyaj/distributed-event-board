import { describe, expect, it, vi } from 'vitest'
import { resolveIdentity } from './identity'

const resolveHandleMock = vi.fn()

vi.mock('./config', () => ({
  getAtprotoConfig: () => ({
    service: 'https://bsky.social',
    identifier: 'not a valid handle',
    password: 'secret',
  }),
}))

vi.mock('./client', () => ({
  getAtprotoClient: () => ({
    session: null,
    com: {
      atproto: {
        identity: {
          resolveHandle: resolveHandleMock,
        },
      },
    },
  }),
}))

describe('resolveIdentity', () => {
  it('handles empty/invalid identifiers gracefully without crashing', async () => {
    resolveHandleMock.mockRejectedValueOnce(new Error('invalid handle'))

    await expect(resolveIdentity()).resolves.toMatchObject({
      inputIdentifier: 'not a valid handle',
      resolvedDidFromHandle: undefined,
      resolutionError: 'invalid handle',
    })
  })
})
