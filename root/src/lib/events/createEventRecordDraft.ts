import { EVENT_RECORD_TYPE, type EventRecord, type EventRecordDraftInput } from '../../types/event'

type DraftOptions = {
  createdAt?: string
}

export function createEventRecordDraft(
  input: EventRecordDraftInput,
  options: DraftOptions = {},
): EventRecord {
  const draft: EventRecord = {
    $type: EVENT_RECORD_TYPE,
    title: input.title,
    description: input.description,
    eventDate: input.eventDate,
    createdAt: options.createdAt ?? new Date().toISOString(),
  }

  if (input.location && input.location.trim()) {
    draft.location = input.location
  }

  return draft
}
