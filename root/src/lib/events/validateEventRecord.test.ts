import { describe, expect, it } from 'vitest'
import { createEventRecordDraft } from './createEventRecordDraft'
import { validateEventRecord } from './validateEventRecord'

describe('event record validation', () => {
  it('accepts a valid draft', () => {
    const record = createEventRecordDraft(
      {
        title: 'ATProto Hack Night',
        description: 'Bring a laptop and build custom record experiments.',
        eventDate: '2026-06-01T18:00:00.000Z',
        location: 'Queens',
      },
      { createdAt: '2026-05-01T12:00:00.000Z' },
    )

    const result = validateEventRecord(record)
    expect(result).toEqual({ valid: true, errors: [] })
  })

  it('rejects invalid required fields and bad datetime', () => {
    const record = createEventRecordDraft(
      {
        title: '',
        description: '',
        eventDate: 'bad-date',
        location: 'x'.repeat(220),
      },
      { createdAt: 'also-bad-date' },
    )

    const result = validateEventRecord(record)
    expect(result.valid).toBe(false)
    if (result.valid) return
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'title is required.',
        'description is required.',
        'eventDate must be a valid ISO datetime string.',
        'createdAt must be a valid ISO datetime string.',
        'location must be <= 200 characters.',
      ]),
    )
  })
})
