import { describe, expect, it } from 'vitest'
import { parseAtUri } from './atUri'

describe('parseAtUri', () => {
  it('parses a valid AT URI', () => {
    const uri = 'at://did:plc:abc123/org.community.event/3jz7q'
    expect(parseAtUri(uri)).toEqual({
      repo: 'did:plc:abc123',
      collection: 'org.community.event',
      rkey: '3jz7q',
    })
  })

  it('rejects invalid scheme', () => {
    expect(() => parseAtUri('https://example.com/x')).toThrow(/expected scheme/)
  })

  it('rejects missing collection or rkey', () => {
    expect(() => parseAtUri('at://did:plc:abc123')).toThrow(/expected at:\/\//)
    expect(() => parseAtUri('at://did:plc:abc123/org.community.event')).toThrow(/expected at:\/\//)
  })
})
