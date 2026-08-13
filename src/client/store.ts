/**
 * Browser stores for the daily-fortune plugin.
 *
 * `fortuneUiStore` is the shared in-memory handle registered under BOTH the
 * `conversation.view` entry and the `conversation.input.dock` entry. The
 * runtime resolves one instance per handle × session, so the dock button's
 * request counters are exactly the counters the view reads — including when
 * the dock click switched the tab first and the view mounts afterwards
 * (the view consumes any counter it has not handled yet, then marks it
 * handled so switching tabs never replays a draw).
 */

import { useSyncExternalStore } from 'react'
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client'
import type { DailyFortuneSettings } from '../schema.ts'

/** Shared dock ↔ view draw request ledger. */
export interface FortuneUiState {
  /** Dock-requested Guan Yin draws (monotonic counter). */
  qianDrawRequests: number
  /** Dock-requested tarot draws (monotonic counter). */
  tarotDrawRequests: number
  /** Latest qian request the view has consumed. */
  qianHandled: number
  /** Latest tarot request the view has consumed. */
  tarotHandled: number
}

/** Apply-time store identity: shared by the view and dock registrations, never persisted. */
export function createFortuneUiStore(): EngineStoreHandle<FortuneUiState, FortuneUiActions> {
  return defineStore({
    init: (): FortuneUiState => ({ qianDrawRequests: 0, tarotDrawRequests: 0, qianHandled: 0, tarotHandled: 0 }),
    actions: {
      requestQianDraw: (d) => { d.qianDrawRequests += 1 },
      requestTarotDraw: (d) => { d.tarotDrawRequests += 1 },
      markQianHandled: (d) => { d.qianHandled = d.qianDrawRequests },
      markTarotHandled: (d) => { d.tarotHandled = d.tarotDrawRequests },
    },
  })
}

/**
 * Declared action shape (draft-stripped callbacks arrive on props.actions).
 * A type alias rather than an interface: `ActionsDecl` requires an index
 * signature, which object literal types provide implicitly.
 */
export type FortuneUiActions = {
  requestQianDraw: (draft: FortuneUiState) => void
  requestTarotDraw: (draft: FortuneUiState) => void
  markQianHandled: (draft: FortuneUiState) => void
  markTarotHandled: (draft: FortuneUiState) => void
}

/**
 * Subscribe a component to the durable settings section.
 * @param scope - settings scope bound by the plugin's apply.
 * @returns the current section, or undefined while the namespace is loading.
 */
export function useSettingsValue(scope: SettingsScope<DailyFortuneSettings>): DailyFortuneSettings | undefined {
  // Arrow wrappers: the controller methods use `this`, so raw method references would break.
  const snapshot = useSyncExternalStore(
    listener => scope.subscribe(listener),
    () => scope.getSnapshot(),
  )
  return snapshot.value
}
