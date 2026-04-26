import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addRecentEventUri,
  clearRecentEventUris,
  getRecentEventUris,
  removeRecentEventUri,
} from './recentEventUris'

describe('recentEventUris', () => {
  beforeEach(() => {
    const store = new Map<string, string>()
    const localStorageMock = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value)
      },
      removeItem: (key: string) => {
        store.delete(key)
      },
      clear: () => {
        store.clear()
      },
    }
    vi.stubGlobal('window', { localStorage: localStorageMock })
  })

  beforeEach(() => {
    clearRecentEventUris()
  })

  it('add/get works', () => {
    addRecentEventUri('at://did:plc:1/org.community.event/a')
    expect(getRecentEventUris()).toEqual(['at://did:plc:1/org.community.event/a'])
  })

  it('dedupes and keeps newest first', () => {
    addRecentEventUri('at://did:plc:1/org.community.event/a')
    addRecentEventUri('at://did:plc:1/org.community.event/b')
    addRecentEventUri('at://did:plc:1/org.community.event/a')
    expect(getRecentEventUris()).toEqual([
      'at://did:plc:1/org.community.event/a',
      'at://did:plc:1/org.community.event/b',
    ])
  })

  it('limits to 20', () => {
    for (let i = 0; i < 25; i += 1) {
      addRecentEventUri(`at://did:plc:test/org.community.event/${i}`)
    }
    const out = getRecentEventUris()
    expect(out).toHaveLength(20)
    expect(out[0]).toBe('at://did:plc:test/org.community.event/24')
    expect(out[19]).toBe('at://did:plc:test/org.community.event/5')
  })

  it('remove and clear work', () => {
    addRecentEventUri('at://did:plc:1/org.community.event/a')
    addRecentEventUri('at://did:plc:1/org.community.event/b')
    removeRecentEventUri('at://did:plc:1/org.community.event/a')
    expect(getRecentEventUris()).toEqual(['at://did:plc:1/org.community.event/b'])
    clearRecentEventUris()
    expect(getRecentEventUris()).toEqual([])
  })
})
