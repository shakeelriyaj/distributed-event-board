import { getAtprotoClient } from './client'
import { getAtprotoConfig } from './config'

export type IdentitySnapshot = {
  inputIdentifier: string
  resolvedDidFromHandle?: string
  sessionDid?: string
  sessionHandle?: string
  activeService: string
}

export async function resolveIdentity() {
  const config = getAtprotoConfig()
  const agent = getAtprotoClient()
  const inputIdentifier = config.identifier

  let resolvedDidFromHandle: string | undefined
  if (inputIdentifier && !inputIdentifier.startsWith('did:')) {
    const res = await agent.com.atproto.identity.resolveHandle({ handle: inputIdentifier })
    resolvedDidFromHandle = res.data.did
  }

  return {
    inputIdentifier,
    resolvedDidFromHandle,
    sessionDid: agent.session?.did,
    sessionHandle: agent.session?.handle,
    activeService: config.service,
  } satisfies IdentitySnapshot
}
