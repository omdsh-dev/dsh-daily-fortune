/**
 * Durable settings shared by the Host schema registration and the browser
 * settings scope. This module deliberately imports nothing but schemastery:
 * the client bundle inlines it, while the Host entry re-exports it.
 */

import z from '@deepseek-ai/schemastery'

/** Settings namespace owned by the daily-fortune plugin. */
export const DAILY_FORTUNE_SETTINGS_NAMESPACE = 'dsh-daily-fortune'

/**
 * Same-origin proxy prefix registered by the Host half; the browser half
 * requests these paths directly. Single source of truth for both halves.
 */
export const DAILY_FORTUNE_API_PREFIX = '/plugins/dsh-daily-fortune/api'

/** Which fortune sections the tab shows (the dock button picks its draw by this). */
export const DAILY_FORTUNE_MODES = ['both', 'qian', 'tarot'] as const

/** Default mode when the user-settings document has no override. */
export type DailyFortuneMode = typeof DAILY_FORTUNE_MODES[number]

/** Upstream quote sources (each routed through the Host proxy). */
export const QUOTE_SOURCES = ['zen', 'stoic', 'advice'] as const

/** Quote source persisted by the settings section. */
export type QuoteSource = typeof QUOTE_SOURCES[number]

/** Durable daily-fortune settings section. */
export interface DailyFortuneSettings {
  /** Which sections render by default and which draw the dock button triggers. */
  mode: DailyFortuneMode
  /** Whether tarot draws may land reversed and show the reversed meaning. */
  showReversed: boolean
  /** Which upstream feeds the daily quote. */
  quoteSource: QuoteSource
}

/** Durable settings schema; also the wire envelope the browser scope validates against. */
export const DailyFortuneSettingsSchema: z<DailyFortuneSettings> = z.object({
  mode: z.union([...DAILY_FORTUNE_MODES]).default('both'),
  showReversed: z.boolean().default(true),
  quoteSource: z.union([...QUOTE_SOURCES]).default('zen'),
})

/** Wire payload of one quote answered by the Host proxy. */
export interface QuotePayload {
  text: string
  author: string
  source: QuoteSource
}
