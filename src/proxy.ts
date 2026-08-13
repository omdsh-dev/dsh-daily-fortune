/**
 * Same-origin proxy routes for the daily-fortune browser half. The client
 * bundle can only request same-origin paths, so the Host forwards the two
 * remote families here:
 *
 * - `GET /plugins/dsh-daily-fortune/api/quote?source=zen|stoic|advice`
 *   One quote per source, cached for one hour (zenquotes' free tier is
 *   rate-limited; stoic.tekloon.net is a single shared endpoint). `fresh=1`
 *   refetches upstream, but at most once per 30 s per source.
 * - `GET /plugins/dsh-daily-fortune/api/tarot/search?q=<card name>`
 *   Fresh upright/reversed text from tarotapi.dev; the browser half only
 *   uses it to enrich the local fallback deck, so failures are non-fatal.
 *
 * No keys, no auth; every upstream is free. Failures answer 502 so the
 * browser half can fall back to its local data instead of guessing.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { SettingsScope } from '@deepseek-ai/dsh-settings'
import {
  DAILY_FORTUNE_API_PREFIX, DailyFortuneSettingsSchema, QUOTE_SOURCES,
  type DailyFortuneSettings, type QuotePayload, type QuoteSource,
} from './schema.ts'

/** Narrow a query value to a known quote source. */
function asQuoteSource(value: string | null): QuoteSource | undefined {
  return QUOTE_SOURCES.find(source => source === value)
}

/** Parsers for the three upstream quote sources. */
const QUOTE_UPSTREAMS: Record<QuoteSource, { url: string; parse: (json: unknown) => QuotePayload | undefined }> = {
  zen: {
    url: 'https://zenquotes.io/api/random',
    // [ { q, a, h }, ... ]
    parse(json) {
      const list = json as { q?: unknown; a?: unknown }[]
      const first = list[0]
      if (first === undefined || typeof first.q !== 'string') return undefined
      return { text: first.q, author: typeof first.a === 'string' ? first.a : '', source: 'zen' }
    },
  },
  stoic: {
    url: 'https://stoic.tekloon.net/stoic-quote',
    // { data: { author, quote } }
    parse(json) {
      const data = (json as { data?: { author?: unknown; quote?: unknown } }).data
      if (data === undefined || typeof data.quote !== 'string') return undefined
      return { text: data.quote, author: typeof data.author === 'string' ? data.author : '', source: 'stoic' }
    },
  },
  advice: {
    url: 'https://api.adviceslip.com/advice',
    // { slip: { id, advice } }
    parse(json) {
      const slip = (json as { slip?: { advice?: unknown } }).slip
      if (slip === undefined || typeof slip.advice !== 'string') return undefined
      return { text: slip.advice, author: '', source: 'advice' }
    },
  },
}

const TAROT_SEARCH_URL = 'https://tarotapi.dev/api/v1/cards/search'
const QUOTE_CACHE_TTL_MS = 60 * 60 * 1000
/** Minimum interval between upstream refetches for one source (fresh=1 requests). */
const QUOTE_FRESH_COOLDOWN_MS = 30_000
const UPSTREAM_TIMEOUT_MS = 12_000
const MAX_BODY_BYTES = 32 * 1024

/** Mount this plugin's prefix route.
 * @returns the node http handler owning the full response lifecycle.
 */
export function createProxyHandler(
  settings: SettingsScope<DailyFortuneSettings>,
): (req: IncomingMessage, res: ServerResponse) => void | Promise<void> {
  const quoteCache = new Map<QuoteSource, { at: number; payload: QuotePayload }>()

  return async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://x')
    const relative = url.pathname.startsWith(`${DAILY_FORTUNE_API_PREFIX}/`)
      ? url.pathname.slice(DAILY_FORTUNE_API_PREFIX.length)
      : url.pathname
    if (relative === '/settings' && req.method === 'GET') {
      answer(res, 200, { ok: true, section: settings.get() })
      return
    }
    if (relative === '/settings' && req.method === 'POST') {
      await handleSettingsWrite(req, res, settings)
      return
    }
    if (req.method !== 'GET') {
      answer(res, 405, { error: 'method not allowed' })
      return
    }
    if (relative.startsWith('/quote')) {
      await handleQuote(url, res, quoteCache)
      return
    }
    if (relative.startsWith('/tarot/search')) {
      await handleTarotSearch(url, res)
      return
    }
    answer(res, 404, { error: 'not found' })
  }
}

/** Persist a complete settings section through the plugin-owned route. */
async function handleSettingsWrite(
  req: IncomingMessage,
  res: ServerResponse,
  settings: SettingsScope<DailyFortuneSettings>,
): Promise<void> {
  try {
    const raw = await readJsonBody(req)
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      answer(res, 400, { ok: false, error: 'expected a JSON settings section' })
      return
    }
    const section = DailyFortuneSettingsSchema(raw as DailyFortuneSettings)
    await settings.replace(section)
    answer(res, 200, { ok: true, section: settings.get() })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    answer(res, message === 'request body too large' ? 413 : 400, { ok: false, error: message })
  }
}

/** Parse one bounded JSON request body. */
async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array)
    size += buffer.length
    if (size > MAX_BODY_BYTES) throw new Error('request body too large')
    chunks.push(buffer)
  }
  const text = Buffer.concat(chunks).toString('utf8')
  return text.trim() === '' ? undefined : JSON.parse(text) as unknown
}

/** Answer one quote: one-hour per-source cache, parse, then relay. */
async function handleQuote(
  url: URL,
  res: ServerResponse,
  cache: Map<QuoteSource, { at: number; payload: QuotePayload }>,
): Promise<void> {
  const source = asQuoteSource(url.searchParams.get('source'))
  if (source === undefined) {
    answer(res, 400, { error: `unknown quote source ${String(url.searchParams.get('source'))}` })
    return
  }
  const upstream = QUOTE_UPSTREAMS[source]
  const fresh = url.searchParams.get('fresh') === '1'
  const cached = cache.get(source)
  // Serve the cache while it is warm; a fresh request also honors a short
  // cooldown so repeated 换一句 clicks cannot hammer the free upstreams.
  if (cached !== undefined) {
    const age = Date.now() - cached.at
    if (age < QUOTE_CACHE_TTL_MS && (!fresh || age < QUOTE_FRESH_COOLDOWN_MS)) {
      answer(res, 200, cached.payload)
      return
    }
  }
  try {
    const json = await fetchJson(upstream.url)
    const payload = upstream.parse(json)
    if (payload === undefined) throw new Error('unexpected upstream payload')
    cache.set(source, { at: Date.now(), payload })
    answer(res, 200, payload)
  } catch (error) {
    console.warn(`daily-fortune: quote upstream ${source} failed:`, error)
    if (cached !== undefined) {
      answer(res, 200, cached.payload)
      return
    }
    answer(res, 502, { error: 'upstream unavailable' })
  }
}

/** Relay a tarotapi.dev search result verbatim so the client can enrich its local deck. */
async function handleTarotSearch(url: URL, res: ServerResponse): Promise<void> {
  const q = url.searchParams.get('q')
  if (q === null || q.trim() === '') {
    answer(res, 400, { error: 'missing q' })
    return
  }
  try {
    const json = await fetchJson(`${TAROT_SEARCH_URL}?q=${encodeURIComponent(q)}`)
    answer(res, 200, json)
  } catch (error) {
    console.warn(`daily-fortune: tarot search "${q}" failed:`, error)
    answer(res, 502, { error: 'upstream unavailable' })
  }
}

/** Fetch one JSON document from an upstream with a hard timeout. */
async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) })
  if (!response.ok) throw new Error(`upstream ${url} answered ${response.status}`)
  return response.json() as Promise<unknown>
}

/** Write one JSON answer and end the response. */
function answer(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
  })
  res.end(JSON.stringify(body))
}
