/**
 * Calendar-deterministic seeding for the daily draws. The Guan Yin lot and
 * the daily tarot card are functions of the local date only: the same day
 * always draws the same result, on any device, with no stored state.
 */

/** Local YYYY-MM-DD string for a Date (the local calendar, not UTC). */
export function dateString(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** The last `days` date keys ending today, oldest first. */
export function recentDateKeys(days: number, today = new Date()): string[] {
  const keys: string[] = []
  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset)
    keys.push(dateString(date))
  }
  return keys
}

/**
 * djb2 over a date key plus a murmur3-style avalanche finalizer: stable
 * across runs, platforms, and sessions. The finalizer matters — plain djb2
 * keeps adjacent dates adjacent (2026-08-12 → 89, 2026-08-13 → 90), which
 * would make the daily sequence trivially predictable.
 */
export function dateSeed(dateKey: string): number {
  let hash = 5381
  for (let i = 0; i < dateKey.length; i++) hash = ((hash << 5) + hash + dateKey.charCodeAt(i)) >>> 0
  hash ^= hash >>> 16
  hash = Math.imul(hash, 0x7feb352d)
  hash ^= hash >>> 15
  hash = Math.imul(hash, 0x846ca68b)
  hash ^= hash >>> 16
  return hash >>> 0
}

/** Daily lot number (1..count) for a date key. */
export function dailyIndex(dateKey: string, count: number): number {
  return (dateSeed(dateKey) % count) + 1
}

/** One seeded pick from `count` items for a date key and salt (for multi-card spreads). */
export function dailyPick(dateKey: string, salt: string, count: number): number {
  return (dateSeed(`${dateKey}#${salt}`) % count) + 1
}

/** Unbiased crypto-random index in [1, count] (rejection sampling). */
export function randomIndex(count: number): number {
  const range = Math.floor(0x1_0000_0000 / count) * count
  const buf = new Uint32Array(1)
  let value = 0
  do { crypto.getRandomValues(buf); value = buf[0] ?? 0 } while (value >= range)
  return (value % count) + 1
}

/** Seeded boolean (50/50) for the reversed card orientation. */
export function seededBool(dateKey: string, salt: string): boolean {
  return dateSeed(`${dateKey}#${salt}`) % 2 === 0
}
