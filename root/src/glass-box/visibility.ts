import type { GlassMessage, ViewRole } from './types'
import { mockDecrypt } from './cryptoMock'

export type ResolvedBody =
  | { kind: 'plaintext'; text: string }
  | { kind: 'locked'; reason: string }

export function resolveMessageBody(
  msg: GlassMessage,
  viewRole: ViewRole,
  myHandle: string,
): ResolvedBody {
  if (viewRole === 'observer') {
    return {
      kind: 'locked',
      reason:
        'Observer role: transport is public — you only see ciphertext and routing metadata.',
    }
  }
  if (viewRole === 'sender') {
    if (msg.fromHandle === myHandle) {
      return { kind: 'plaintext', text: msg.plaintext }
    }
    return {
      kind: 'locked',
      reason: 'Sender lens: you only read cleartext for messages you authored.',
    }
  }
  // recipient
  if (msg.toHandle === myHandle) {
    const d = mockDecrypt(msg.ciphertext)
    if (d) return { kind: 'plaintext', text: d }
    return { kind: 'locked', reason: 'Unable to decode (mock key mismatch).' }
  }
  return {
    kind: 'locked',
    reason: 'Recipient lens: this message is not addressed to your handle.',
  }
}
