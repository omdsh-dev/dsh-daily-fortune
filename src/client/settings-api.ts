/** Reactive settings scope backed by this plugin's same-origin Host route. */

import {
  createSnapshotStore, type SettingsScope, type SettingsScopeSnapshot, type SnapshotStore,
} from '@deepseek-ai/dsh-client-runtime/client'
import {
  DAILY_FORTUNE_API_PREFIX, type DailyFortuneSettings,
} from '../schema.ts'

const DEFAULTS: DailyFortuneSettings = Object.freeze({
  mode: 'both',
  showReversed: true,
  quoteSource: 'zen',
})

interface SettingsResponse {
  ok: boolean
  section: DailyFortuneSettings
}

/** Browser-side implementation of the standard settings-scope contract. */
export class DailyFortuneSettingsScope implements SettingsScope<DailyFortuneSettings> {
  private readonly store: SnapshotStore<SettingsScopeSnapshot<DailyFortuneSettings>>
  private tail: Promise<void> = Promise.resolve()
  private disposed = false
  private revision = 0

  constructor() {
    this.store = createSnapshotStore<SettingsScopeSnapshot<DailyFortuneSettings>>({
      status: 'loading',
      value: undefined,
      base: DEFAULTS,
      user: undefined,
      revision: undefined,
      writable: false,
      mode: 'host',
    })
  }

  getSnapshot(): SettingsScopeSnapshot<DailyFortuneSettings> {
    return this.store.getSnapshot()
  }

  subscribe(listener: () => void): () => void {
    return this.store.subscribe(listener)
  }

  load(): Promise<void> {
    return this.enqueue(async () => {
      try {
        this.accept((await requestSettings()).section)
      } catch {
        if (!this.disposed) {
          this.store.update((draft) => { draft.status = 'unavailable'; draft.writable = false })
        }
      }
    })
  }

  set(field: string, value: unknown): Promise<void> {
    return this.write(field, value)
  }

  unset(field: string): Promise<void> {
    return this.write(field, DEFAULTS[field as keyof DailyFortuneSettings])
  }

  dispose(): void {
    this.disposed = true
  }

  private write(field: string, value: unknown): Promise<void> {
    return this.enqueue(async () => {
      const current = this.getSnapshot().value ?? DEFAULTS
      const next = { ...current, [field]: value }
      try {
        this.accept((await requestSettings(next)).section)
      } catch {
        try {
          this.accept((await requestSettings()).section)
        } catch {
          // Preserve the last accepted section when recovery also fails.
        }
      }
    })
  }

  private enqueue(operation: () => Promise<void>): Promise<void> {
    if (this.disposed) return Promise.resolve()
    const task = this.tail.then(async () => {
      if (!this.disposed) await operation()
    })
    this.tail = task.catch(() => {})
    return task
  }

  private accept(section: DailyFortuneSettings): void {
    if (this.disposed) return
    this.revision += 1
    this.store.update((draft) => {
      draft.status = 'ready'
      draft.value = section
      draft.user = section
      draft.revision = this.revision
      draft.writable = true
    })
  }
}

async function requestSettings(section?: DailyFortuneSettings): Promise<SettingsResponse> {
  const response = await fetch(`${DAILY_FORTUNE_API_PREFIX}/settings`, section === undefined ? undefined : {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(section),
  })
  if (!response.ok) throw new Error(`daily-fortune settings ${String(response.status)}`)
  const payload = await response.json() as SettingsResponse
  if (!payload.ok || typeof payload.section !== 'object' || payload.section === null) {
    throw new Error('daily-fortune settings rejected')
  }
  return payload
}
