import { getAtprotoClient } from '../atproto/client'

export async function resolveHandleToDid(handle: string): Promise<string> {
  const normalized = handle.trim().replace(/^@/, '')
  if (!normalized) {
    throw new Error('Handle is empty.')
  }
  if (normalized.startsWith('did:')) {
    return normalized
  }

  const agent = getAtprotoClient()
  try {
    const response = await agent.resolveHandle({ handle: normalized })
    const did = response?.data?.did
    if (!did) {
      throw new Error(`Handle not found: ${normalized}`)
    }
    return did
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    throw new Error(`Handle not found: ${normalized}. ${msg}`)
  }
}
