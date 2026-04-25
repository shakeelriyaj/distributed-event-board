import { getAtprotoClient } from '../atproto/client'
import { loginAndGetSession } from '../atproto/session'
import { parseAtUri } from './atUri'

export type ReadEventRecordResult = {
  uri: string
  cid: string
  value: unknown
}

/**
 * Read a single org.community.event (or any) record by known AT URI from the user's PDS.
 * Requires an authenticated session (same as createRecord).
 */
export async function readEventRecord(uri: string): Promise<ReadEventRecordResult> {
  const { repo, collection, rkey } = parseAtUri(uri)

  await loginAndGetSession()
  const agent = getAtprotoClient()

  const response = await agent.com.atproto.repo.getRecord({
    repo,
    collection,
    rkey,
  })

  const data = response.data
  const outUri = data.uri ?? uri
  const outCid = data.cid
  if (!outCid) {
    throw new Error('getRecord returned no CID.')
  }
  return {
    uri: outUri,
    cid: outCid,
    value: data.value,
  }
}
