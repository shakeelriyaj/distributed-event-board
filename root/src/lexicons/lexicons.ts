/**
 * GENERATED CODE - DO NOT MODIFY
 */
import {
  type LexiconDoc,
  Lexicons,
  ValidationError,
  type ValidationResult,
} from '@atproto/lexicon'
import { is$typed, maybe$typed } from './util.js'

export const schemaDict = {
  OrgCommunityEvent: {
    lexicon: 1,
    id: 'org.community.event',
    defs: {
      main: {
        type: 'record',
        description: 'A decentralized local event or meetup record.',
        record: {
          type: 'object',
          required: ['title', 'description', 'eventDate', 'createdAt'],
          properties: {
            title: {
              type: 'string',
              maxLength: 100,
              description: 'The name of the event.',
            },
            description: {
              type: 'string',
              maxLength: 1000,
              description: "A detailed description of the event's purpose.",
            },
            eventDate: {
              type: 'string',
              format: 'datetime',
              description: 'The date and time the event starts (ISO 8601).',
            },
            location: {
              type: 'string',
              maxLength: 200,
              description: 'Physical location or digital link (Optional).',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description: 'The timestamp of when this record was created.',
            },
          },
        },
      },
    },
  },
} as const satisfies Record<string, LexiconDoc>
export const schemas = Object.values(schemaDict) satisfies LexiconDoc[]
export const lexicons: Lexicons = new Lexicons(schemas)

export function validate<T extends { $type: string }>(
  v: unknown,
  id: string,
  hash: string,
  requiredType: true,
): ValidationResult<T>
export function validate<T extends { $type?: string }>(
  v: unknown,
  id: string,
  hash: string,
  requiredType?: false,
): ValidationResult<T>
export function validate(
  v: unknown,
  id: string,
  hash: string,
  requiredType?: boolean,
): ValidationResult {
  return (requiredType ? is$typed : maybe$typed)(v, id, hash)
    ? lexicons.validate(`${id}#${hash}`, v)
    : {
        success: false,
        error: new ValidationError(
          `Must be an object with "${hash === 'main' ? id : `${id}#${hash}`}" $type property`,
        ),
      }
}

export const ids = {
  OrgCommunityEvent: 'org.community.event',
} as const
