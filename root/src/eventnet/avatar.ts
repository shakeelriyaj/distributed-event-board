export function avatarInitial(value: string | null | undefined): string {
  if (!value) return '·'
  const cleaned = value.replace(/^@/, '').replace(/^did:[^:]+:/, '')
  const ch = cleaned.trim().charAt(0)
  return (ch || '·').toUpperCase()
}

// Monochrome only: solid black fill, white text. No hue.
export function avatarColor(_seed: string | null | undefined): string {
  return '#0a0a0a'
}

export function shortenDid(did: string | null | undefined, n = 12): string {
  if (!did) return ''
  if (did.length <= n + 4) return did
  return `${did.slice(0, n)}…${did.slice(-4)}`
}

export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return ''
  const t = new Date(iso).valueOf()
  if (Number.isNaN(t)) return ''
  const diff = (t - Date.now()) / 1000
  const abs = Math.abs(diff)
  const fmt = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  if (abs < 60) return fmt.format(Math.round(diff), 'second')
  if (abs < 3600) return fmt.format(Math.round(diff / 60), 'minute')
  if (abs < 86400) return fmt.format(Math.round(diff / 3600), 'hour')
  if (abs < 86400 * 7) return fmt.format(Math.round(diff / 86400), 'day')
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: new Date(iso).getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  })
}
