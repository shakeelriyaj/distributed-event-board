import { describe, expect, it, vi } from 'vitest'
import { deleteEventRecord, deleteEventRecordAndCleanupRecent } from './deleteEventRecord'

const deleteRecordMock = vi.fn()
const loginMock = vi.fn()
const removeRecentMock = vi.fn()

vi.mock('../atproto/session', () => ({
  loginAndGetSession: () => loginMock(),
}))

vi.mock('../atproto/client', () => ({
  getAtprotoClient: () => ({
    com: {
      atproto: {
        repo: {
          deleteRecord: deleteRecordMock,
        },
      },
    },
  }),
}))

vi.mock('./recentEventUris', () => ({
  removeRecentEventUri: (uri: string) => removeRecentMock(uri),
}))

describe('deleteEventRecord', () => {
  it('refuses delete outside current session DID', async () => {
    loginMock.mockResolvedValueOnce({
      did: 'did:plc:me',
      identifier: 'me.test',
      handle: 'me.test',
      service: 'https://example.com',
    })

    await expect(deleteEventRecord('at://did:plc:other/org.community.event/r1')).rejects.toThrow(
      'Refusing to delete record outside current session repo.',
    )
    expect(deleteRecordMock).not.toHaveBeenCalled()
  })

  it('calls deleteRecord with parsed args', async () => {
    loginMock.mockResolvedValueOnce({
      did: 'did:plc:me',
      identifier: 'me.test',
      handle: 'me.test',
      service: 'https://example.com',
    })
    deleteRecordMock.mockResolvedValueOnce({})

    const uri = 'at://did:plc:me/org.community.event/rkey123'
    const result = await deleteEventRecord(uri)

    expect(deleteRecordMock).toHaveBeenCalledWith({
      repo: 'did:plc:me',
      collection: 'org.community.event',
      rkey: 'rkey123',
    })
    expect(result.ok).toBe(true)
    expect(result.uri).toBe(uri)
  })

  it('removes from recent local writes after successful cleanup variant', async () => {
    loginMock.mockResolvedValueOnce({
      did: 'did:plc:me',
      identifier: 'me.test',
      handle: 'me.test',
      service: 'https://example.com',
    })
    deleteRecordMock.mockResolvedValueOnce({})
    const uri = 'at://did:plc:me/org.community.event/rkey456'

    await deleteEventRecordAndCleanupRecent(uri)
    expect(removeRecentMock).toHaveBeenCalledWith(uri)
  })

  it('propagates deleteRecord errors', async () => {
    loginMock.mockResolvedValueOnce({
      did: 'did:plc:me',
      identifier: 'me.test',
      handle: 'me.test',
      service: 'https://example.com',
    })
    deleteRecordMock.mockRejectedValueOnce(new Error('delete failed'))

    await expect(deleteEventRecord('at://did:plc:me/org.community.event/rerr')).rejects.toThrow('delete failed')
  })
})
