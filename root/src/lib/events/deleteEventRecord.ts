import { getAtprotoClient } from '../atproto/client'
import { loginAndGetSession } from '../atproto/session'
import { removeRecentEventUri } from './recentEventUris'
import { parseAtUri } from './atUri'

export type DeleteEventRecordResult = {
  ok: true
  uri: string
  repo: string
  collection: string
  rkey: string
}

export async function deleteEventRecord(uri: string): Promise<DeleteEventRecordResult> {
  const { repo, collection, rkey } = parseAtUri(uri)
  const session = await loginAndGetSession()
  if (repo !== session.did) {
    throw new Error('Refusing to delete record outside current session repo.')
  }

  const agent = getAtprotoClient()
  await agent.com.atproto.repo.deleteRecord({
    repo: session.did,
    collection,
    rkey,
  })

  return {
    ok: true,
    uri,
    repo,
    collection,
    rkey,
  }
}

export async function deleteEventRecordAndCleanupRecent(uri: string): Promise<DeleteEventRecordResult> {
  const result = await deleteEventRecord(uri)
  removeRecentEventUri(uri)
  return result
}
