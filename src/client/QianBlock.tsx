/**
 * ① 观音灵签 block: the shaking tube ritual and the lot card.
 *
 * Phases: idle (tube) → shaking (1.2 s) → popping (a stick flies out,
 * 0.45 s) → revealed (the lot card). The draw result is computed only at
 * the reveal moment. Daily draws are calendar-deterministic (same day,
 * same lot); 「再摇一次」 switches to a crypto-random draw marked 非今日签.
 * The 近 7 日 badge row derives each day's lot from the date — no storage.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { Button, Pill } from '@deepseek-ai/dsh-client-ui-primitives'
import { QIAN_LOTS, type QianLot } from './data.ts'
import { QIAN_SLOT, QIAN_STICK } from './art.ts'
import { dailyIndex, dateString, randomIndex, recentDateKeys } from './seeder.ts'
import css from './QianBlock.module.css'

type Phase = 'idle' | 'shaking' | 'popping' | 'revealed'

/** The lot currently shown on the card, with its provenance. */
interface QianReveal {
  lot: QianLot
  /** true = calendar draw, false = random draw. */
  today: boolean
  /** Set when the card previews another date from the 近 7 日 row. */
  previewDay?: string
}

const SHAKE_MS = 1200
const POP_MS = 450

export interface QianBlockProps {
  /** Unconsumed dock-requested draws (requested minus handled). */
  pendingDraws: number
  /** Mark the dock requests handled (called after playing one draw). */
  consumeDraw: () => void
  t: TranslateNS<'daily-fortune'>
}

export function QianBlock({ pendingDraws, consumeDraw, t }: QianBlockProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [reveal, setReveal] = useState<QianReveal | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => () => {
    for (const id of timers.current) clearTimeout(id)
  }, [])

  const busy = phase === 'shaking' || phase === 'popping'

  /** Run the full ritual: shake → pop → reveal a lot. */
  const draw = useCallback((random: boolean) => {
    for (const id of timers.current) clearTimeout(id)
    timers.current = []
    setReveal(null)
    setPhase('shaking')
    timers.current.push(setTimeout(() => { setPhase('popping') }, SHAKE_MS))
    timers.current.push(setTimeout(() => {
      const dayKey = dateString(new Date())
      const number = random ? randomIndex(QIAN_LOTS.length) : dailyIndex(dayKey, QIAN_LOTS.length)
      const lot = QIAN_LOTS[number - 1]
      if (lot === undefined) {
        setPhase('idle')
        return
      }
      setReveal({ lot, today: !random })
      setPhase('revealed')
    }, SHAKE_MS + POP_MS))
  }, [])

  /** Preview another date's lot straight from the badge row (no animation). */
  const preview = useCallback((dayKey: string) => {
    const number = dailyIndex(dayKey, QIAN_LOTS.length)
    const lot = QIAN_LOTS[number - 1]
    if (lot === undefined) return
    for (const id of timers.current) clearTimeout(id)
    timers.current = []
    setReveal({ lot, today: dayKey === dateString(new Date()), previewDay: dayKey })
    setPhase('revealed')
  }, [])

  // Consume dock requests: on mount (the dock switched the tab first) and on
  // every new request. The handled counter lives in the shared store, so
  // remounting the view never replays a draw.
  useEffect(() => {
    if (pendingDraws > 0) {
      draw(false)
      consumeDraw()
    }
  }, [pendingDraws, draw, consumeDraw])

  const todayKey = dateString(new Date())
  const recent = recentDateKeys(7)

  return (
    <section className={css.qian} aria-label={t('qian.title')}>
      <div className={css.sectionHeader}>
        <h3>{t('qian.title')}</h3>
        {phase !== 'revealed' && (
          <Button size="sm" variant="ghost" onClick={() => { draw(false) }} disabled={busy}>
            {t('qian.draw')}
          </Button>
        )}
      </div>

      <div className={css.stage}>
        {phase === 'revealed' && reveal !== null ? (
          <div className={css.card}>
            <div className={css.cardTop}>
              <span className={css.lotNumber}>第 {reveal.lot.id} 签</span>
              <span className={clsx(css.grade, gradeClass(reveal.lot.grade))}>{reveal.lot.grade}</span>
              {reveal.previewDay !== undefined
                ? <Pill>{reveal.previewDay}</Pill>
                : reveal.today
                  ? <Pill active>{t('qian.today')}</Pill>
                  : <Pill>{t('qian.notToday')}</Pill>}
            </div>
            <div className={css.cardTitle}>{reveal.lot.title}</div>
            <div className={css.poem} aria-label={t('qian.poem')}>
              {reveal.lot.poem.map((line, index) => <p key={index}>{line}</p>)}
            </div>
            <div className={css.reading}>
              <div className={css.readingLabel}>{t('qian.interpretation')}</div>
              <p>{reveal.lot.meaning}</p>
              <p className={css.verses}>{reveal.lot.interpretation}</p>
            </div>
            <div className={css.story}>
              <div className={css.readingLabel}>{t('qian.story')} · {reveal.lot.title}</div>
              <p>{reveal.lot.story}</p>
            </div>
          </div>
        ) : (
          <div className={css.tubeArea}>
            <div
              className={clsx(css.tube, phase === 'shaking' && css.tubeShaking)}
              dangerouslySetInnerHTML={{ __html: QIAN_SLOT }}
            />
            {phase === 'popping' && (
              <div
                className={css.popStick}
                dangerouslySetInnerHTML={{ __html: QIAN_STICK }}
              />
            )}
            <div className={css.drawButton}>
              <Button variant="primary" onClick={() => { draw(false) }} disabled={busy}>
                {t('qian.draw')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {phase === 'revealed' && (
        <div className={css.cardActions}>
          <Button size="sm" variant="outline" onClick={() => { draw(true) }}>
            {t('qian.again')}
          </Button>
        </div>
      )}

      <div className={css.recent} aria-label={t('qian.recent')}>
        <span className={css.recentLabel}>{t('qian.recent')}</span>
        <div className={css.recentRow}>
          {recent.map((dayKey) => {
            const number = dailyIndex(dayKey, QIAN_LOTS.length)
            const lot = QIAN_LOTS[number - 1]
            const isToday = dayKey === todayKey
            return (
              <button
                key={dayKey}
                type="button"
                className={clsx(css.dayBadge, isToday && css.dayBadgeToday)}
                title={lot === undefined ? '' : `第 ${lot.id} 签 · ${lot.title}`}
                onClick={() => { preview(dayKey) }}
              >
                <span className={css.dayDate}>{dayKey.slice(5)}</span>
                <span className={css.dayGrade}>{lot === undefined ? '' : lot.grade}</span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/** Badge color per grade: 上签 red / 中签 gray / 下签 blue. */
function gradeClass(grade: QianLot['grade']): string | undefined {
  return grade === '上签' ? css.gradeShang : grade === '中签' ? css.gradeZhong : css.gradeXia
}
