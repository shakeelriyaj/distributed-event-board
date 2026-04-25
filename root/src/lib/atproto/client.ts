import { AtpAgent } from '@atproto/api'
import { getAtprotoConfig } from './config'

let agentInstance: AtpAgent | null = null

export function createAtprotoAgent() {
  if (agentInstance) return agentInstance

  const { service } = getAtprotoConfig()
  agentInstance = new AtpAgent({ service })
  return agentInstance
}

export function getAtprotoClient() {
  return createAtprotoAgent()
}

export function resetAtprotoAgentForTests() {
  agentInstance = null
}
