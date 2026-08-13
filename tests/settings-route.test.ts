import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { describe, it } from 'node:test'
import type { SettingsScope } from '@deepseek-ai/dsh-settings'
import { createProxyHandler } from '../src/proxy.ts'
import type { DailyFortuneSettings } from '../src/schema.ts'

const defaults: DailyFortuneSettings = { mode: 'both', showReversed: true, quoteSource: 'zen' }

function scope(): SettingsScope<DailyFortuneSettings> {
  let value = { ...defaults }
  return {
    get: () => ({ ...value }),
    watch: () => () => {},
    update: async (patch) => { value = { ...value, ...patch } },
    replace: async (section) => { value = { ...defaults, ...section } },
  }
}

function request(method: string, url: string, body?: unknown): IncomingMessage {
  const chunks = body === undefined ? [] : [JSON.stringify(body)]
  return Object.assign(Readable.from(chunks), { method, url }) as unknown as IncomingMessage
}

function response(): { raw: ServerResponse; status: () => number; json: () => unknown } {
  let status = 0
  let body = ''
  const raw = {
    writeHead(next: number) { status = next; return this },
    end(chunk?: string) { body = chunk ?? '' },
  } as unknown as ServerResponse
  return { raw, status: () => status, json: () => JSON.parse(body) as unknown }
}

describe('plugin-owned settings route', () => {
  it('reads defaults without core allowlist support', async () => {
    const res = response()
    await createProxyHandler(scope())(request('GET', '/plugins/dsh-daily-fortune/api/settings'), res.raw)
    assert.equal(res.status(), 200)
    assert.deepEqual(res.json(), { ok: true, section: defaults })
  })

  it('validates and persists a complete section', async () => {
    const settings = scope()
    const res = response()
    const next: DailyFortuneSettings = { mode: 'tarot', showReversed: false, quoteSource: 'advice' }
    await createProxyHandler(settings)(
      request('POST', '/plugins/dsh-daily-fortune/api/settings', next),
      res.raw,
    )
    assert.equal(res.status(), 200)
    assert.deepEqual(res.json(), { ok: true, section: next })
    assert.deepEqual(settings.get(), next)
  })

  it('rejects invalid settings without reaching an upstream', async () => {
    const res = response()
    await createProxyHandler(scope())(
      request('POST', '/plugins/dsh-daily-fortune/api/settings', { ...defaults, mode: 'invalid' }),
      res.raw,
    )
    assert.equal(res.status(), 400)
  })
})
