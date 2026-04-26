import { describe, expect, it, vi } from 'vitest'
import { listRepoEventRecords } from './listRepoEventRecords'

const listRecordsMock = vi.fn()

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

describe('listRepoEventRecords', () => {
  it('calls listRecords with passed DID (not session) and limit', async () => {
    listRecordsMock.mockResolvedValueOnce({ data: { records: [] } })
    await listRepoEventRecords('did:plc:other', { limit: 10 })
    expect(listRecordsMock).toHaveBeenCalledWith({
      repo: 'did:plc:other',
      collection: 'org.community.event',
      limit: 10,
      cursor: undefined,
    })
  })

  it('passes through cursor', async () => {
    listRecordsMock.mockResolvedValueOnce({ data: { records: [], cursor: 'next' } })
    const out = await listRepoEventRecords('did:plc:other', { cursor: 'abc' })
    expect(listRecordsMock).toHaveBeenCalledWith({
      repo: 'did:plc:other',
      collection: 'org.community.event',
      limit: 20,
      cursor: 'abc',
    })
    expect(out.cursor).toBe('next')
  })

  it('normalizes empty response', async () => {
    listRecordsMock.mockResolvedValueOnce({ data: { records: [] } })
    const out = await listRepoEventRecords('did:plc:other')
    expect(out.records).toEqual([])
    expect(out.cursor).toBeUndefined()
  })
})
