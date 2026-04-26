import { describe, expect, it, vi } from 'vitest'
import { listMyEventRecords } from './listEventRecords'

const listRecordsMock = vi.fn()
const loginMock = vi.fn()

vi.mock('../atproto/session', () => ({
  loginAndGetSession: () => loginMock(),
}))

vi.mock('../atproto/client', () => ({
  getAtprotoClient: () => ({
    com: {
      atproto: {
        repo: {
          listRecords: listRecordsMock,
        },
      },
    },
  }),
}))

describe('listMyEventRecords', () => {
  it('calls listRecords with provided limit', async () => {
    loginMock.mockResolvedValueOnce({
      service: 'https://example.com',
      identifier: 'user.test',
      did: 'did:plc:sessionrepo',
      handle: 'user.test',
    })
    listRecordsMock.mockResolvedValueOnce({
      data: {
        records: [
          {
            uri: 'at://did:plc:sessionrepo/org.community.event/rkey1',
            cid: 'bafy1',
            value: { $type: 'org.community.event', title: 'A' },
          },
        ],
        cursor: 'next-page',
      },
    })

    const result = await listMyEventRecords({ limit: 10 })

    expect(listRecordsMock).toHaveBeenCalledWith({
      repo: 'did:plc:sessionrepo',
      collection: 'org.community.event',
      limit: 10,
      cursor: undefined,
    })
    expect(result.repoDid).toBe('did:plc:sessionrepo')
    expect(result.cursor).toBe('next-page')
    expect(result.records).toEqual([
      {
        uri: 'at://did:plc:sessionrepo/org.community.event/rkey1',
        cid: 'bafy1',
        value: { $type: 'org.community.event', title: 'A' },
      },
    ])
  })

  it('calls listRecords with cursor when provided', async () => {
    loginMock.mockResolvedValueOnce({
      service: 'https://example.com',
      identifier: 'user.test',
      did: 'did:plc:sessionrepo',
      handle: 'user.test',
    })
    listRecordsMock.mockResolvedValueOnce({
      data: { records: [], cursor: undefined },
    })

    await listMyEventRecords({ cursor: 'abc-cursor' })

    expect(listRecordsMock).toHaveBeenCalledWith({
      repo: 'did:plc:sessionrepo',
      collection: 'org.community.event',
      limit: 20,
      cursor: 'abc-cursor',
    })
  })

  it('handles empty responses', async () => {
    loginMock.mockResolvedValueOnce({
      service: 'https://example.com',
      identifier: 'user.test',
      did: 'did:plc:sessionrepo',
      handle: 'user.test',
    })
    listRecordsMock.mockResolvedValueOnce({
      data: { records: [] },
    })

    const result = await listMyEventRecords()
    expect(result.records).toEqual([])
    expect(result.cursor).toBeUndefined()
  })
})
