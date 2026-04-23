/**
 * GENERATED CODE - DO NOT MODIFY
 */
import {
  XrpcClient,
  type FetchHandler,
  type FetchHandlerOptions,
} from '@atproto/xrpc'
import type * as ComAtprotoRepoCreateRecord from '@atproto/api/dist/client/types/com/atproto/repo/createRecord.js'
import type * as ComAtprotoRepoDeleteRecord from '@atproto/api/dist/client/types/com/atproto/repo/deleteRecord.js'
import type * as ComAtprotoRepoGetRecord from '@atproto/api/dist/client/types/com/atproto/repo/getRecord.js'
import type * as ComAtprotoRepoListRecords from '@atproto/api/dist/client/types/com/atproto/repo/listRecords.js'
import type * as ComAtprotoRepoPutRecord from '@atproto/api/dist/client/types/com/atproto/repo/putRecord.js'
import { schemas } from './lexicons.js'
import { type OmitKey, type Un$Typed } from './util.js'
import * as OrgCommunityEvent from './types/org/community/event.js'

export * as OrgCommunityEvent from './types/org/community/event.js'

export class AtpBaseClient extends XrpcClient {
  org: OrgNS

  constructor(options: FetchHandler | FetchHandlerOptions) {
    super(options, schemas)
    this.org = new OrgNS(this)
  }

  /** @deprecated use `this` instead */
  get xrpc(): XrpcClient {
    return this
  }
}

export class OrgNS {
  _client: XrpcClient
  community: OrgCommunityNS

  constructor(client: XrpcClient) {
    this._client = client
    this.community = new OrgCommunityNS(client)
  }
}

export class OrgCommunityNS {
  _client: XrpcClient
  event: OrgCommunityEventRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.event = new OrgCommunityEventRecord(client)
  }
}

export class OrgCommunityEventRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: OrgCommunityEvent.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'org.community.event',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{ uri: string; cid: string; value: OrgCommunityEvent.Record }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'org.community.event',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<OrgCommunityEvent.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'org.community.event'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<OrgCommunityEvent.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'org.community.event'
    const res = await this._client.call(
      'com.atproto.repo.putRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'org.community.event', ...params },
      { headers },
    )
  }
}
