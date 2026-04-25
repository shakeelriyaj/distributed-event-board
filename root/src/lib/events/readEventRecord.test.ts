import { describe, expect, it, vi } from 'vitest'
import { readEventRecord } from './readEventRecord'

const getRecordMock = vi.fn()
const loginMock = vi.fn()

vi.mock('../atproto/session', () => ({
  loginAndGetSession: () => loginMock(),
}))

vi.mock('../atproto/client', () => ({
  getAtprotoClient: () => ({
    com: {
      atproto: {
        repo: {
          getRecord: getRecordMock,
        },
      },
    },
  }),
}))

describe('readEventRecord', () => {
  it('calls getRecord with parsed repo/collection/rkey and returns normalized shape', async () => {
    loginMock.mockResolvedValueOnce(undefined)
    getRecordMock.mockResolvedValueOnce({
      data: {
        uri: 'at://did:plc:abc/org.community.event/3jz7q',
        cid: 'bafyREAD',
        value: { $type: 'org.community.event', title: 'x' },
      },
    })

    const inputUri = 'at://did:plc:abc/org.community.event/3jz7q'
    const result = await readEventRecord(inputUri)

    expect(getRecordMock).toHaveBeenCalledWith({
      repo: 'did:plc:abc',
      collection: 'org.community.event',
      rkey: '3jz7q',
    })
    expect(result).toEqual({
      uri: 'at://did:plc:abc/org.community.event/3jz7q',
      cid: 'bafyREAD',
      value: { $type: 'org.community.event', title: 'x' },
    })
  })
})
