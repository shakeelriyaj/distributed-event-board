import { describe, expect, it, vi } from 'vitest'
import { getCurrentSessionSnapshot } from './session'

vi.mock('./config', () => ({
  getAtprotoConfig: () => ({
    service: 'https://bsky.social',
    identifier: 'alice.test',
    password: 'secret',
  }),
  assertAtprotoConfig: vi.fn(),
}))

vi.mock('./client', () => ({
  getAtprotoClient: () => ({
    session: null,
  }),
}))

describe('getCurrentSessionSnapshot', () => {
  it('returns a safe null state before login', () => {
    const snapshot = getCurrentSessionSnapshot()
    expect(snapshot).toBeNull()
  })
})
