const RECENT_KEY = 'atproto.eventBoard.recentEventUris'
const MAX_RECENT = 20

function safeParse(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is string => typeof x === 'string')
  } catch {
    return []
  }
}

function readRecent(): string[] {
  if (typeof window === 'undefined' || !window.localStorage) return []
  return safeParse(window.localStorage.getItem(RECENT_KEY))
}

function writeRecent(uris: string[]) {
  if (typeof window === 'undefined' || !window.localStorage) return
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(uris))
}

export function getRecentEventUris(): string[] {
  return readRecent()
}

export function addRecentEventUri(uri: string) {
  const normalized = uri.trim()
  if (!normalized) return
  const existing = readRecent().filter((u) => u !== normalized)
  const next = [normalized, ...existing].slice(0, MAX_RECENT)
  writeRecent(next)
}

export function removeRecentEventUri(uri: string) {
  const normalized = uri.trim()
  if (!normalized) return
  const next = readRecent().filter((u) => u !== normalized)
  writeRecent(next)
}

export function clearRecentEventUris() {
  if (typeof window === 'undefined' || !window.localStorage) return
  window.localStorage.removeItem(RECENT_KEY)
}
