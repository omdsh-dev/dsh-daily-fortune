/**
 * 设置页「每日一签」section: default mode, reversed-reading toggle, and the
 * daily quote source. Every control writes through the settings scope, so
 * choices land in the durable Host document and apply live.
 */

import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client'
import { Pill } from '@deepseek-ai/dsh-client-ui-primitives'
import type { DailyFortuneMode, DailyFortuneSettings, QuoteSource } from '../schema.ts'
import { useSettingsValue } from './store.ts'
import css from './SettingsSection.module.css'

/** Business face injected into the section entry. */
export interface SettingsSectionInjected {
  settings: SettingsScope<DailyFortuneSettings>
}

/** Full section props: the settings-shell owner share, copy, and the injected scope. */
export type SettingsSectionProps =
  PropsRuntime<'settings.section'> & PropsLocale<'daily-fortune'> & SettingsSectionInjected

const MODES: readonly { id: DailyFortuneMode; key: 'settings.mode.both' | 'settings.mode.qian' | 'settings.mode.tarot' }[] = [
  { id: 'both', key: 'settings.mode.both' },
  { id: 'qian', key: 'settings.mode.qian' },
  { id: 'tarot', key: 'settings.mode.tarot' },
]

const SOURCES: readonly { id: QuoteSource; key: 'quote.source.zen' | 'quote.source.stoic' | 'quote.source.advice' }[] = [
  { id: 'zen', key: 'quote.source.zen' },
  { id: 'stoic', key: 'quote.source.stoic' },
  { id: 'advice', key: 'quote.source.advice' },
]

export function SettingsSection({ settings, t }: SettingsSectionProps) {
  const value = useSettingsValue(settings)
  const mode = value?.mode ?? 'both'
  const showReversed = value?.showReversed ?? true
  const quoteSource = value?.quoteSource ?? 'zen'

  return (
    <div className={css.section}>
      <div className={css.group}>
        <label className={css.label}>{t('settings.mode')}</label>
        <div className={css.pillRow}>
          {MODES.map(option => (
            <Pill key={option.id} active={mode === option.id} onClick={() => { void settings.set('mode', option.id) }}>
              {t(option.key)}
            </Pill>
          ))}
        </div>
      </div>

      <div className={css.group}>
        <label className={css.label}>{t('settings.showReversed')}</label>
        <div className={css.toggleRow}>
          <button
            type="button"
            role="switch"
            aria-checked={showReversed}
            className={css.toggle}
            onClick={() => { void settings.set('showReversed', !showReversed) }}
          >
            <span className={css.toggleKnob} />
          </button>
          <span className={css.hint}>{t('settings.showReversed.hint')}</span>
        </div>
      </div>

      <div className={css.group}>
        <label className={css.label}>{t('settings.quoteSource')}</label>
        <div className={css.pillRow}>
          {SOURCES.map(option => (
            <Pill key={option.id} active={quoteSource === option.id} onClick={() => { void settings.set('quoteSource', option.id) }}>
              {t(option.key)}
            </Pill>
          ))}
        </div>
      </div>
    </div>
  )
}
