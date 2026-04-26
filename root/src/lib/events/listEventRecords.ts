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
  cursor?: string
}

export type ListMyEventRecordsInput = {
  limit?: number
  cursor?: string
}

/**
 * Lists org.community.event records in the authenticated user's repo only.
 * Uses com.atproto.repo.listRecords — not cross-user discovery or an AppView.
 */
export async function listMyEventRecords(input: ListMyEventRecordsInput = {}): Promise<ListMyEventRecordsResult> {
  const session = await loginAndGetSession()
  const agent = getAtprotoClient()
  const limit = input.limit ?? LIST_LIMIT

  const response = await agent.com.atproto.repo.listRecords({
    repo: session.did,
    collection: EVENT_RECORD_TYPE,
    limit,
    cursor: input.cursor,
  })

  const { records, cursor } = response.data
  const normalized = (records ?? []).map((r) => ({
    uri: r.uri,
    cid: r.cid,
    value: r.value,
  }))

  return {
    repoDid: session.did,
    records: normalized,
    cursor: cursor ?? undefined,
  }
}
