import { describe, expect, it, vi } from 'vitest'
import { createEventRecord } from './createEventRecord'

const createRecordMock = vi.fn()
const loginMock = vi.fn()

vi.mock('../atproto/session', () => ({
  loginAndGetSession: () => loginMock(),
}))

vi.mock('../atproto/client', () => ({
  getAtprotoClient: () => ({
    com: {
      atproto: {
        repo: {
          createRecord: createRecordMock,
        },
      },
    },
  }),
}))

describe('createEventRecord', () => {
  it('calls com.atproto.repo.createRecord with validated event record', async () => {
    loginMock.mockResolvedValueOnce({ did: 'did:plc:abc123' })
    createRecordMock.mockResolvedValueOnce({
      data: {
        uri: 'at://did:plc:abc123/org.community.event/xyz',
        cid: 'bafy123',
      },
    })

    const record = {
      $type: 'org.community.event' as const,
      title: 'Neighborhood Meetup',
      description: 'Bring snacks.',
      startsAt: '2026-06-01T10:00:00.000Z',
      endsAt: '2026-06-01T11:00:00.000Z',
      createdAt: '2026-05-01T10:00:00.000Z',
    }

    const data = await createEventRecord(record)
    expect(createRecordMock).toHaveBeenCalledWith({
      repo: 'did:plc:abc123',
      collection: 'org.community.event',
      record,
    })
    expect(data).toEqual({
      uri: 'at://did:plc:abc123/org.community.event/xyz',
      cid: 'bafy123',
    })
  })
})
