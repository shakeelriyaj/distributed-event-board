export const EVENT_RECORD_TYPE = 'org.community.event' as const

export type EventRecord = {
  $type: typeof EVENT_RECORD_TYPE
  title: string
  description: string
  startsAt: string
  endsAt?: string
  location?: string
  createdAt: string
}

export type EventRecordDraftInput = {
  title: string
  description: string
  startsAt: string
  endsAt?: string
  location?: string
}

export type EventRecordValidationResult =
  | { valid: true; errors: [] }
  | { valid: false; errors: string[] }
