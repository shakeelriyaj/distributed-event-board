import { getAtprotoClient } from './client'
import { assertAtprotoConfig, getAtprotoConfig } from './config'

export type SessionSnapshot = {
  service: string
  identifier: string
  did: string
  handle: string
  accessJwtPrefix?: string
}

export async function loginAndGetSession() {
  const config = getAtprotoConfig()
  assertAtprotoConfig(config)

  const agent = getAtprotoClient()
  await agent.login({
    identifier: config.identifier,
    password: config.password,
  })

  const session = agent.session
  if (!session) throw new Error('ATProto login succeeded but no session was returned.')

  return {
    service: config.service,
    identifier: config.identifier,
    did: session.did,
    handle: session.handle,
    accessJwtPrefix: session.accessJwt?.slice(0, 16),
  } satisfies SessionSnapshot
}

export function getCurrentSessionSnapshot() {
  const config = getAtprotoConfig()
  const session = getAtprotoClient().session
  if (!session) return null

  return {
    service: config.service,
    identifier: config.identifier,
    did: session.did,
    handle: session.handle,
    accessJwtPrefix: session.accessJwt?.slice(0, 16),
  } satisfies SessionSnapshot
}
