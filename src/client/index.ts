/**
 * Browser half of the daily-fortune plugin: the conversation view tab, the
 * input-dock trigger, and the settings section. The two session-scope
 * registrations (view + dock) share one store handle, so the runtime hands
 * both the same per-session instance and dock clicks arrive at the view
 * even when the view mounts afterwards (the dock switches tabs first).
 */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: the settings.section slot type.
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
// Type-only: the conversation slot types ('conversation.view', 'conversation.input.dock').
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: the ctx.locale Context merge.
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { createFortuneUiStore } from './store.ts'
import { en, zh, type FortuneKey } from './locales.ts'
import { FortuneView, type FortuneViewInjected } from './FortuneView.tsx'
import { DockButton, type DockButtonInjected } from './DockButton.tsx'
import { SettingsSection, type SettingsSectionInjected } from './SettingsSection.tsx'
import { DailyFortuneSettingsScope } from './settings-api.ts'

export type { FortuneKey } from './locales.ts'
export type { DailyFortuneSettings, DailyFortuneMode, QuoteSource, QuotePayload } from '../schema.ts'
export type { SettingsSectionInjected } from './SettingsSection.tsx'
export type { FortuneViewInjected } from './FortuneView.tsx'
export type { DockButtonInjected } from './DockButton.tsx'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The daily-fortune surface's copy. */
    'daily-fortune': FortuneKey
  }
}

/** Dictionary namespace owned by this plugin. */
const NS = 'daily-fortune'

/** Required services: the slot registry, the wire pair, the settings scope, and copy. */
export const inject = ['slots', 'locale']

/**
 * Client plugin body: register the view tab, the dock trigger, and the
 * settings section.
 * @param ctx - client cordis context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'daily-fortune: dictionaries')

  // Registration-time text (tab/section labels) reads through the bound
  // translate as a thunk, so it follows the active locale without
  // re-registration.
  const t = ctx.locale.bind(NS)
  const settings = new DailyFortuneSettingsScope()
  ctx.effect(() => {
    void settings.load()
    return () => { settings.dispose() }
  }, 'daily-fortune: settings scope')
  const uiStore = createFortuneUiStore()

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'daily-fortune',
    order: 40,
    label: () => t('settings.label'),
    locale: NS,
    inject: (): SettingsSectionInjected => ({ settings }),
  }, SettingsSection))

  ctx.slots.inject('conversation.view', () => ctx.slots.register({
    name: 'conversation.view',
    id: 'daily-fortune',
    order: 20,
    label: () => t('view.tab'),
    locale: NS,
    store: uiStore,
    inject: (_sessionId, _actions): FortuneViewInjected => ({ settings }),
  }, FortuneView))

  ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
    name: 'conversation.input.dock',
    id: 'daily-fortune',
    order: 20,
    locale: NS,
    store: uiStore,
    inject: (_sessionId, actions): DockButtonInjected => ({
      onDraw: () => {
        // The dock button draws what the settings mode says: tarot-only
        // sessions request a tarot draw, everything else the Guan Yin ritual.
        const mode = settings.getSnapshot().value?.mode ?? 'both'
        if (mode === 'tarot') actions.requestTarotDraw()
        else actions.requestQianDraw()
        openFortuneTab()
      },
    }),
  }, DockButton))
}

/**
 * Switch to the fortune view tab. The active-view state lives in
 * ui-conversation's per-session chat store, which no public service
 * exposes, so the dock button activates the tab the same way a user does:
 * by clicking the rendered tab. The label always carries the 🔮 glyph.
 */
function openFortuneTab(): void {
  const tabs = document.querySelectorAll<HTMLElement>('[role="tab"]')
  for (const tab of tabs) {
    if (tab.textContent.includes('🔮')) {
      tab.click()
      return
    }
  }
}
