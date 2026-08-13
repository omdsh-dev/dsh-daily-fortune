/**
 * ② 塔罗 block: daily card or three-card spread with a 3D flip reveal.
 *
 * The draw always comes from the local 78-card fallback deck (offline
 * friendly, calendar-seeded for the daily mode). After a draw, the block
 * quietly tries to refresh each card's upright text from tarotapi.dev
 * through the Host proxy; failures keep the local meanings and surface a
 * small note. Reversed orientation is a seeded coin per card, and the whole
 * card rotates 180° with a 逆位 badge.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import clsx from 'clsx'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { Button, Pill } from '@deepseek-ai/dsh-client-ui-primitives'
import {
  dailyTarotDraw, MAJOR_COLOR, randomTarotDraw, SUIT_COLORS,
  type TarotCard, type TarotDraw,
} from './data.ts'
import { TAROT_BACK } from './art.ts'
import { DAILY_FORTUNE_API_PREFIX } from '../schema.ts'
import { dateString } from './seeder.ts'
import css from './TarotBlock.module.css'

export type TarotMode = 'daily' | 'spread'

const SHUFFLE_MS = 600

const SPREAD_POSITIONS = ['past', 'present', 'future'] as const

export interface TarotBlockProps {
  mode: TarotMode
  onModeChange: (mode: TarotMode) => void
  /** Unconsumed dock-requested draws (requested minus handled). */
  pendingDraws: number
  /** Mark the dock requests handled (called after playing one draw). */
  consumeDraw: () => void
  /** Whether draws may land reversed (settings). */
  showReversed: boolean
  t: TranslateNS<'daily-fortune'>
}

export function TarotBlock({ mode, onModeChange, pendingDraws, consumeDraw, showReversed, t }: TarotBlockProps) {
  const [draws, setDraws] = useState<readonly TarotDraw[] | null>(null)
  const [revealed, setRevealed] = useState(0)
  const [shuffling, setShuffling] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [onlineNote, setOnlineNote] = useState<'none' | 'ok' | 'failed'>('none')
  const [overrides, setOverrides] = useState<Readonly<Record<string, string>>>({})
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => () => {
    for (const id of timers.current) clearTimeout(id)
  }, [])

  const place = useCallback((next: readonly TarotDraw[]) => {
    for (const id of timers.current) clearTimeout(id)
    timers.current = []
    setDraws(null)
    setRevealed(0)
    setExpanded(null)
    setShuffling(true)
    setOnlineNote('none')
    setOverrides({})
    // shuffle 0.6s, then lay the cards and flip them one by one (500ms each).
    timers.current.push(setTimeout(() => {
      setShuffling(false)
      setDraws(next)
      next.forEach((_, index) => {
        timers.current.push(setTimeout(() => { setRevealed(count => count + 1) }, 350 + index * 650))
      })
      void enrich(next)
    }, SHUFFLE_MS))
  }, [])

  const draw = useCallback((random: boolean) => {
    const count = mode === 'spread' ? 3 : 1
    const dayKey = dateString(new Date())
    const next = random
      ? randomTarotDraw(count, showReversed)
      : dailyTarotDraw(dayKey, count).map(draw => ({ card: draw.card, reversed: showReversed && draw.reversed }))
    place(next)
  }, [mode, place, showReversed])

  // Consume dock requests exactly like the qian block.
  useEffect(() => {
    if (pendingDraws > 0) {
      draw(false)
      consumeDraw()
    }
  }, [pendingDraws, draw, consumeDraw])

  /** Refresh upright text from tarotapi.dev for each drawn card (best effort). */
  const enrich = useCallback(async (next: readonly TarotDraw[]) => {
    const settled = await Promise.allSettled(next.map(async (draw) => {
      const response = await fetch(`${DAILY_FORTUNE_API_PREFIX}/tarot/search?q=${encodeURIComponent(draw.card.name)}`)
      if (!response.ok) throw new Error(String(response.status))
      const json = await response.json() as { cards?: { name_short?: string; meaning_up?: string }[] }
      const hit = json.cards?.[0]
      if (hit?.meaning_up === undefined || hit.name_short === undefined) throw new Error('no hit')
      return { key: hit.name_short, meaningUp: hit.meaning_up }
    }))
    const patch: Record<string, string> = {}
    for (const result of settled) {
      if (result.status === 'fulfilled') patch[result.value.key] = result.value.meaningUp
    }
    if (Object.keys(patch).length === 0) {
      setOnlineNote('failed')
      return
    }
    setOverrides(patch)
    setOnlineNote(settled.every(result => result.status === 'fulfilled') ? 'ok' : 'failed')
  }, [])

  const expandedDraw = draws !== null && expanded !== null ? draws[expanded] : undefined

  return (
    <section className={css.tarot} aria-label={t('tarot.title')}>
      <div className={css.sectionHeader}>
        <h3>{t('tarot.title')}</h3>
        <div className={css.modeRow}>
          <Pill active={mode === 'daily'} onClick={() => { onModeChange('daily') }}>{t('tarot.daily')}</Pill>
          <Pill active={mode === 'spread'} onClick={() => { onModeChange('spread') }}>{t('tarot.spread')}</Pill>
        </div>
      </div>

      <div className={clsx(css.table, shuffling && css.tableShuffling)}>
        {draws === null ? (
          <div className={css.deck} aria-hidden="true">
            {/* three stacked card backs for the shuffle pile */}
            <div className={clsx(css.deckCard, css.deckCardA)} dangerouslySetInnerHTML={{ __html: TAROT_BACK }} />
            <div className={clsx(css.deckCard, css.deckCardB)} dangerouslySetInnerHTML={{ __html: TAROT_BACK }} />
            <div className={clsx(css.deckCard, css.deckCardC)} dangerouslySetInnerHTML={{ __html: TAROT_BACK }} />
          </div>
        ) : (
          <div className={css.cards}>
            {draws.map((draw, index) => (
              <TarotCardFace
                key={`${draw.card.key}-${index}`}
                draw={draw}
                position={mode === 'spread' ? SPREAD_POSITIONS[index] ?? null : null}
                revealed={revealed > index}
                expanded={expanded === index}
                meaningOverride={overrides[draw.card.key]}
                t={t}
                onReveal={() => { setRevealed(count => Math.max(count, index + 1)) }}
                onToggleExpanded={() => { setExpanded(current => current === index ? null : index) }}
              />
            ))}
          </div>
        )}
      </div>

      {expandedDraw !== undefined && (
        <div className={css.expanded}>
          <p className={css.expandedDesc}>{expandedDraw.card.desc}</p>
          <p>
            <strong>{expandedDraw.reversed ? t('tarot.reversed') : t('tarot.upright')}</strong>
            {'：'}{expandedDraw.reversed ? expandedDraw.card.meaningRev : expandedDraw.card.meaningUp}
          </p>
          <p>
            <strong>{expandedDraw.reversed ? t('tarot.upright') : t('tarot.reversed')}</strong>
            {'：'}{expandedDraw.reversed ? expandedDraw.card.meaningUp : expandedDraw.card.meaningRev}
          </p>
        </div>
      )}

      <div className={css.tarotActions}>
        {draws === null ? (
          <Button variant="primary" onClick={() => { draw(false) }} disabled={shuffling}>
            {shuffling ? t('tarot.shuffle') : t('tarot.draw')}
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => { draw(true) }}>
            {t('tarot.redraw')}
          </Button>
        )}
        {onlineNote === 'failed' && <span className={css.onlineNote}>{t('tarot.fallbackNote')}</span>}
        {onlineNote === 'ok' && <span className={css.onlineNote}>{t('tarot.onlineNote')}</span>}
      </div>
    </section>
  )
}

interface TarotCardFaceProps {
  draw: TarotDraw
  position: 'past' | 'present' | 'future' | null
  revealed: boolean
  expanded: boolean
  meaningOverride: string | undefined
  t: TranslateNS<'daily-fortune'>
  onReveal: () => void
  onToggleExpanded: () => void
}

function TarotCardFace({
  draw, position, revealed, expanded, meaningOverride, t, onReveal, onToggleExpanded,
}: TarotCardFaceProps) {
  const { card, reversed } = draw
  const accent = card.type === 'major' ? MAJOR_COLOR : SUIT_COLORS[card.suit ?? 'wands']
  const meaning = meaningOverride ?? (reversed ? card.meaningRev : card.meaningUp)
  return (
    <div className={css.cardSlot}>
      <button
        type="button"
        style={{ '--card-accent': accent } as CSSProperties}
        className={clsx(css.cardButton, revealed && css.cardButtonRevealed)}
        onClick={() => {
          if (revealed) onToggleExpanded()
          else onReveal()
        }}
        aria-label={expanded ? t('tarot.collapse') : `${card.cn} ${card.name}`}
      >
        <div className={css.cardBack} aria-hidden="true" dangerouslySetInnerHTML={{ __html: TAROT_BACK }} />
        <div className={clsx(css.cardFace, reversed && css.cardFaceReversed)} aria-hidden={revealed ? undefined : 'true'}>
          <div className={css.cardFaceInner}>
            <div className={css.cardHead}>
              <span className={css.cardNumber}>{card.roman ?? card.number}</span>
              {card.suit !== undefined && <SuitIcon suit={card.suit} />}
            </div>
            <div className={css.cardCn}>{card.cn}</div>
            <div className={css.cardName}>{card.name}</div>
            <div className={css.cardMeaning}>{meaning}</div>
            {reversed && <span className={css.reversedBadge}>↻ {t('tarot.reversed')}</span>}
          </div>
        </div>
      </button>
      {position !== null && <div className={css.positionLabel}>{t(`tarot.${position}`)}</div>}
    </div>
  )
}

/** Tiny suit glyphs (16px stroke icons). */
function SuitIcon({ suit }: { suit: TarotCard['suit'] & string }) {
  switch (suit) {
    case 'cups': return (
      <svg viewBox="0 0 16 16" className={css.suitIcon} fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M3.2 5.2 H12.8 V11 C12.8 13.1 11.1 14.8 8.9 14.8 H7.1 C4.9 14.8 3.2 13.1 3.2 11 Z" />
        <path d="M5.6 5.2 C5.6 3.6 6.7 2.6 8 2.6 C9.3 2.6 10.4 3.6 10.4 5.2" />
      </svg>
    )
    case 'wands': return (
      <svg viewBox="0 0 16 16" className={css.suitIcon} fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M8 2.2 L9.6 14" />
        <path d="M6.4 3.4 C7 2.4 8.1 2.2 9.1 2.8 C9.7 3.2 9.9 3.6 9.6 4.2 C9.2 4.8 8 4.4 7.2 4.8 C6.5 5.2 6.1 4.4 6.4 3.4 Z" />
      </svg>
    )
    case 'swords': return (
      <svg viewBox="0 0 16 16" className={css.suitIcon} fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M8 1.4 L9.3 11.2 H6.7 Z" fill="currentColor" stroke="none" />
        <path d="M4.6 11.2 H11.4" />
        <path d="M8 11.2 V14" />
        <circle cx="8" cy="14" r="1.1" />
      </svg>
    )
    default: return (
      <svg viewBox="0 0 16 16" className={css.suitIcon} fill="none" stroke="currentColor" strokeWidth="1.3">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 2.6 L8.9 6.9 L13.2 7 L9.6 9.2 L10.6 13.4 L8 11 L5.4 13.4 L6.4 9.2 L2.8 7 L7.1 6.9 Z" />
      </svg>
    )
  }
}
