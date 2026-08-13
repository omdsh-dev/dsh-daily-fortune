/**
 * Typed access to the two local static datasets (bundled into the client,
 * zero network):
 *
 * - `qian-100.json` — the 100 traditional Guan Yin lots (public-domain text;
 *   provenance recorded in the file's own `source` field).
 * - `tarot-fallback.json` — the 78-card Rider-Waite-Smith deck with upright
 *   and reversed meanings (text from tarotapi.dev, retrieved 2026-08-12).
 */

import qianRaw from '../data/qian-100.json'
import tarotRaw from '../data/tarot-fallback.json'
import { dateSeed, randomIndex, seededBool } from './seeder.ts'

/** One Guan Yin lot. */
export interface QianLot {
  id: number
  /** 上签 / 中签 / 下签 */
  grade: '上签' | '中签' | '下签'
  /** The historical story the lot is titled after (钟离成道 …). */
  title: string
  /** Four seven-character lines. */
  poem: [string, string, string, string]
  /** 签语 — one-sentence image reading. */
  meaning: string
  /** 解曰 — the four-character oracle verses. */
  interpretation: string
  /** The title story in prose. */
  story: string
}

/** One tarot card in the local deck. */
export interface TarotCard {
  key: string
  /** English name as served by tarotapi.dev. */
  name: string
  /** Conventional Chinese name (愚者 / 星币九 …). */
  cn: string
  type: 'major' | 'minor'
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles'
  number: number
  /** Roman numeral, majors only. */
  roman?: string
  meaningUp: string
  meaningRev: string
  desc: string
}

interface QianDataset { source: string; lots: QianLot[] }
interface TarotDataset { source: string; cards: TarotCard[] }

/** The 100 lots, indexed 0-99 (lot number = index + 1). */
export const QIAN_LOTS: readonly QianLot[] = (qianRaw as unknown as QianDataset).lots

/** Provenance note of the lot dataset (shown in the UI footer). */
export const QIAN_SOURCE: string = (qianRaw as unknown as QianDataset).source

/** The 78-card local deck. */
export const TAROT_CARDS: readonly TarotCard[] = (tarotRaw as unknown as TarotDataset).cards

/** Provenance note of the tarot dataset. */
export const TAROT_SOURCE: string = (tarotRaw as unknown as TarotDataset).source

/** Card lookup by key. */
const BY_KEY = new Map<string, TarotCard>(TAROT_CARDS.map(card => [card.key, card]))

/** One drawn tarot card with its orientation. */
export interface TarotDraw {
  card: TarotCard
  reversed: boolean
}

/** Suit → palette role used by the card face. */
export const SUIT_COLORS: Record<TarotCard['suit'] & string, string> = {
  wands: '#b3402a', // 权杖红
  cups: '#2f6db3', // 圣杯蓝
  pentacles: '#3f7d46', // 星币绿
  swords: '#6b4fa3', // 宝剑紫
}

/** Major arcana face color (indigo-violet). */
export const MAJOR_COLOR = '#5b3fa8'

/** Draw `count` distinct cards seeded by dateKey (deterministic per day). */
export function dailyTarotDraw(dateKey: string, count: number): TarotDraw[] {
  const deck = [...TAROT_CARDS]
  const draws: TarotDraw[] = []
  for (let i = 0; i < count; i++) {
    const index = (dateSeed(`${dateKey}#card${i}`) % deck.length)
    const card = deck.splice(index, 1)[0]
    if (card === undefined) break
    draws.push({ card, reversed: seededBool(dateKey, `rev${i}`) })
  }
  return draws
}

/** Draw `count` distinct random cards. */
export function randomTarotDraw(count: number, allowReversed: boolean): TarotDraw[] {
  const deck = [...TAROT_CARDS]
  const draws: TarotDraw[] = []
  for (let i = 0; i < count; i++) {
    const index = randomIndex(deck.length) - 1
    const card = deck.splice(index, 1)[0]
    if (card === undefined) break
    draws.push({ card, reversed: allowReversed && Math.random() < 0.5 })
  }
  return draws
}

/** Resolve one card for the online enrichment (tarotapi.dev search). */
export function findCard(name: string): TarotCard | undefined {
  return BY_KEY.get(name) ?? TAROT_CARDS.find(card => card.name === name)
}
