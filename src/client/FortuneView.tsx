/**
 * 「🔮 今日一签」 conversation view tab: three stacked sections — the Guan
 * Yin lot ritual, the tarot table, and the daily quote — plus the data
 * provenance footer. Which sections render follows the durable settings.
 */

import { useState } from 'react'
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client'
import type { DailyFortuneSettings } from '../schema.ts'
import { QIAN_SOURCE, TAROT_SOURCE } from './data.ts'
import { useSettingsValue, type createFortuneUiStore } from './store.ts'
import { QianBlock } from './QianBlock.tsx'
import { TarotBlock, type TarotMode } from './TarotBlock.tsx'
import { QuoteBlock } from './QuoteBlock.tsx'
import css from './FortuneView.module.css'

/** Business face injected into the view entry. */
export interface FortuneViewInjected {
  /** The durable settings scope owned by this plugin. */
  settings: SettingsScope<DailyFortuneSettings>
}

/** Full view-tab props: the conversation view runtime share, the shared store, copy, and the settings face. */
export type FortuneViewProps =
  PropsRuntime<'conversation.view'> & PropsStore<ReturnType<typeof createFortuneUiStore>>
  & PropsLocale<'daily-fortune'> & FortuneViewInjected

export function FortuneView({ useStore, actions, settings, t }: FortuneViewProps) {
  const settingsValue = useSettingsValue(settings)
  const mode = settingsValue?.mode ?? 'both'
  const showReversed = settingsValue?.showReversed ?? true
  const quoteSource = settingsValue?.quoteSource ?? 'zen'
  const pendingQian = useStore(s => s.qianDrawRequests - s.qianHandled)
  const pendingTarot = useStore(s => s.tarotDrawRequests - s.tarotHandled)
  const [tarotMode, setTarotMode] = useState<TarotMode>('daily')

  return (
    <div className={css.view}>
      {(mode === 'both' || mode === 'qian') && (
        <QianBlock pendingDraws={pendingQian} consumeDraw={actions.markQianHandled} t={t} />
      )}
      {(mode === 'both' || mode === 'tarot') && (
        <TarotBlock
          mode={tarotMode}
          onModeChange={setTarotMode}
          pendingDraws={pendingTarot}
          consumeDraw={actions.markTarotHandled}
          showReversed={showReversed}
          t={t}
        />
      )}
      <QuoteBlock source={quoteSource} t={t} />
      <footer className={css.provenance}>
        <p>{QIAN_SOURCE}</p>
        <p>{TAROT_SOURCE}</p>
      </footer>
    </div>
  )
}
