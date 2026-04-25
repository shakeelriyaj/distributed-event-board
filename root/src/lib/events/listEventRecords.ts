import { getAtprotoClient } from '../atproto/client'
import { loginAndGetSession } from '../atproto/session'
import { EVENT_RECORD_TYPE } from '../../types/event'

const LIST_LIMIT = 20

export type ListedEventRecord = {
  uri: string
  cid: string
  value: unknown
}

export type ListMyEventRecordsResult = {
  repoDid: string
  records: ListedEventRecord[]
  /** Present when more pages exist (not wired in UI yet). */
  cursor?: string
}

/**
 * Lists org.community.event records in the authenticated user's repo only.
 * Uses com.atproto.repo.listRecords — not cross-user discovery or an AppView.
 */
export async function listMyEventRecords(): Promise<ListMyEventRecordsResult> {
  const session = await loginAndGetSession()
  const agent = getAtprotoClient()

  const response = await agent.com.atproto.repo.listRecords({
    repo: session.did,
    collection: EVENT_RECORD_TYPE,
    limit: LIST_LIMIT,
  })

  const { records, cursor } = response.data
  return {
    repoDid: session.did,
    records: records.map((r) => ({
      uri: r.uri,
      cid: r.cid,
      value: r.value,
    })),
    cursor: cursor ?? undefined,
  }
}
