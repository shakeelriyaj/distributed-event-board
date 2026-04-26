import { EVENT_RECORD_TYPE } from '../../types/event'
import { getAtprotoClient } from '../atproto/client'
import type { ListedEventRecord } from './listEventRecords'

export type ListRepoEventRecordsInput = {
  limit?: number
  cursor?: string
}

export type ListRepoEventRecordsResult = {
  records: ListedEventRecord[]
  cursor?: string
}

const DEFAULT_LIMIT = 20

export async function listRepoEventRecords(
  did: string,
  opts: ListRepoEventRecordsInput = {},
): Promise<ListRepoEventRecordsResult> {
  const repoDid = did.trim()
  if (!repoDid) {
    throw new Error('DID is empty.')
  }

  const agent = getAtprotoClient()
  const response = await agent.com.atproto.repo.listRecords({
    repo: repoDid,
    collection: EVENT_RECORD_TYPE,
    limit: opts.limit ?? DEFAULT_LIMIT,
    cursor: opts.cursor,
  })

  const records = (response.data.records ?? []).map((r) => ({
    uri: r.uri,
    cid: r.cid,
    value: r.value,
  }))

  return {
    records,
    cursor: response.data.cursor ?? undefined,
  }
}
