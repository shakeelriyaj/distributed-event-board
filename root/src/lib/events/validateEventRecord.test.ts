import { describe, expect, it } from 'vitest'
import { createEventRecordDraft } from './createEventRecordDraft'
import { validateEventRecord } from './validateEventRecord'

describe('event record validation', () => {
  it('accepts a valid draft', () => {
    const record = createEventRecordDraft(
      {
        title: 'ATProto Hack Night',
        description: 'Bring a laptop and build custom record experiments.',
        startsAt: '2026-06-01T18:00:00.000Z',
        endsAt: '2026-06-01T20:00:00.000Z',
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
        startsAt: 'bad-date',
        endsAt: '2026-05-01T09:00:00.000Z',
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
        'startsAt must be a valid ISO datetime string.',
        'createdAt must be a valid ISO datetime string.',
        'location must be <= 200 characters.',
      ]),
    )
  })

  it('rejects endsAt when not after startsAt', () => {
    const record = createEventRecordDraft(
      {
        title: 'Protocol Coffee',
        description: 'Discuss DID rotation.',
        startsAt: '2026-06-10T12:00:00.000Z',
        endsAt: '2026-06-10T12:00:00.000Z',
      },
      { createdAt: '2026-05-01T12:00:00.000Z' },
    )

    const result = validateEventRecord(record)
    expect(result.valid).toBe(false)
    if (result.valid) return
    expect(result.errors).toContain('endsAt must be after startsAt.')
  })
})
