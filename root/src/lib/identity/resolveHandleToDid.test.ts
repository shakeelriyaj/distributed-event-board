import { describe, expect, it, vi } from 'vitest'
import { resolveHandleToDid } from './resolveHandleToDid'

const resolveHandleMock = vi.fn()

vi.mock('../atproto/client', () => ({
  getAtprotoClient: () => ({
    resolveHandle: resolveHandleMock,
  }),
}))

describe('resolveHandleToDid', () => {
  it('resolves a valid handle', async () => {
    resolveHandleMock.mockResolvedValueOnce({ data: { did: 'did:plc:abc123' } })
    const did = await resolveHandleToDid('alice.bsky.social')
    expect(resolveHandleMock).toHaveBeenCalledWith({ handle: 'alice.bsky.social' })
    expect(did).toBe('did:plc:abc123')
  })

  it('strips leading @', async () => {
    resolveHandleMock.mockResolvedValueOnce({ data: { did: 'did:plc:abc123' } })
    await resolveHandleToDid('@alice.bsky.social')
    expect(resolveHandleMock).toHaveBeenCalledWith({ handle: 'alice.bsky.social' })
  })

  it('throws readable error when handle not found', async () => {
    resolveHandleMock.mockRejectedValueOnce(new Error('not found'))
    await expect(resolveHandleToDid('missing.bsky.social')).rejects.toThrow('Handle not found: missing.bsky.social.')
  })
})
