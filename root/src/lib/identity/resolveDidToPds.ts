import { getAtprotoClient } from '../atproto/client'

function asObject(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : null
}

export async function resolveDidToPds(did: string): Promise<string | null> {
  const normalized = did.trim()
  if (!normalized) return null
  const agent = getAtprotoClient()
  const res = await agent.com.atproto.identity.resolveDid({ did: normalized })
  const didDoc = asObject(res.data.didDoc)
  if (!didDoc) return null
  const services = didDoc.service
  if (!Array.isArray(services)) return null

  for (const s of services) {
    const entry = asObject(s)
    if (!entry) continue
    const type = entry.type
    const endpoint = entry.serviceEndpoint
    if (type === 'AtprotoPersonalDataServer' && typeof endpoint === 'string') {
      return endpoint
    }
  }
  return null
}
