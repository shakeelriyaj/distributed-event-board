import {
  EVENT_RECORD_TYPE,
  type EventRecord,
  type EventRecordValidationResult,
} from '../../types/event'

const TITLE_MAX = 100
const DESCRIPTION_MAX = 1000
const LOCATION_MAX = 200

function isIsoDate(input: string) {
  return !Number.isNaN(Date.parse(input))
}

function isNonEmptyString(input: unknown): input is string {
  return typeof input === 'string' && input.trim().length > 0
}

export function validateEventRecord(record: EventRecord): EventRecordValidationResult {
  const errors: string[] = []

  if (record.$type !== EVENT_RECORD_TYPE) {
    errors.push(`$type must be "${EVENT_RECORD_TYPE}".`)
  }

  if (!isNonEmptyString(record.title)) {
    errors.push('title is required.')
  } else if (record.title.length > TITLE_MAX) {
    errors.push(`title must be <= ${TITLE_MAX} characters.`)
  }

  if (!isNonEmptyString(record.description)) {
    errors.push('description is required.')
  } else if (record.description.length > DESCRIPTION_MAX) {
    errors.push(`description must be <= ${DESCRIPTION_MAX} characters.`)
  }

  if (!isNonEmptyString(record.startsAt)) {
    errors.push('startsAt is required.')
  } else if (!isIsoDate(record.startsAt)) {
    errors.push('startsAt must be a valid ISO datetime string.')
  }

  if (record.endsAt !== undefined) {
    if (!isNonEmptyString(record.endsAt)) {
      errors.push('endsAt must be a valid ISO datetime string when provided.')
    } else if (!isIsoDate(record.endsAt)) {
      errors.push('endsAt must be a valid ISO datetime string.')
    }
  }

  if (isIsoDate(record.startsAt) && record.endsAt && isIsoDate(record.endsAt)) {
    const start = new Date(record.startsAt)
    const end = new Date(record.endsAt)
    if (end <= start) {
      errors.push('endsAt must be after startsAt.')
    }
  }

  if (!isNonEmptyString(record.createdAt)) {
    errors.push('createdAt is required.')
  } else if (!isIsoDate(record.createdAt)) {
    errors.push('createdAt must be a valid ISO datetime string.')
  }

  if (record.location !== undefined) {
    if (typeof record.location !== 'string') {
      errors.push('location must be a string when provided.')
    } else if (record.location.length > LOCATION_MAX) {
      errors.push(`location must be <= ${LOCATION_MAX} characters.`)
    }
  }

  if (errors.length > 0) return { valid: false, errors }
  return { valid: true, errors: [] }
}
