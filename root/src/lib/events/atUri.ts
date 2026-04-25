const AT_SCHEME = 'at://'

export type ParsedAtUri = {
  repo: string
  collection: string
  rkey: string
}

/**
 * Parse an AT URI of the form:
 *   at://<repo>/<collection>/<rkey>
 * where <collection> may contain slashes (NSID path segments).
 */
export function parseAtUri(uri: string): ParsedAtUri {
  if (typeof uri !== 'string' || !uri.trim()) {
    throw new Error('AT URI is empty.')
  }

  const trimmed = uri.trim()

  if (!trimmed.startsWith(AT_SCHEME)) {
    throw new Error(`Invalid AT URI: expected scheme "${AT_SCHEME}", got "${trimmed.slice(0, 12)}…"`)
  }

  const rest = trimmed.slice(AT_SCHEME.length)
  const segments = rest.split('/').filter(Boolean)

  if (segments.length < 3) {
    throw new Error(
      'Invalid AT URI: expected at://<repo>/<collection>/<rkey> with at least repo, collection, and rkey.',
    )
  }

  const repo = segments[0]!
  const rkey = segments[segments.length - 1]!
  const collection = segments.slice(1, -1).join('/')

  if (!repo) {
    throw new Error('Invalid AT URI: repo segment is missing.')
  }
  if (!collection) {
    throw new Error('Invalid AT URI: collection segment is missing.')
  }
  if (!rkey) {
    throw new Error('Invalid AT URI: record key (rkey) is missing.')
  }

  return { repo, collection, rkey }
}
