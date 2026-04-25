import type { EventRecord } from '../../types/event'
import { getAtprotoClient } from '../atproto/client'
import { loginAndGetSession } from '../atproto/session'

export async function createEventRecord(record: EventRecord) {
  const session = await loginAndGetSession()
  const agent = getAtprotoClient()

  const response = await agent.com.atproto.repo.createRecord({
    repo: session.did,
    collection: record.$type,
    record,
  })

  return response.data
}
