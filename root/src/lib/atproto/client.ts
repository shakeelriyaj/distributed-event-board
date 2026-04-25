import { AtpAgent } from '@atproto/api'
import { getAtprotoConfig } from './config'

let agentInstance: AtpAgent | null = null

export function getAtprotoClient() {
  if (agentInstance) return agentInstance

  const { service } = getAtprotoConfig()
  agentInstance = new AtpAgent({ service })
  return agentInstance
}
