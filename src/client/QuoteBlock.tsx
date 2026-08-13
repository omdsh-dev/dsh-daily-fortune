/**
 * 每日一句 block: fetches the configured quote through the Host proxy.
 * `fresh=1` (the 换一句 button) bypasses the one-hour host cache, but the
 * host still throttles upstream refetches, so rapid clicks may repeat.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { Button, Pill } from '@deepseek-ai/dsh-client-ui-primitives'
import { DAILY_FORTUNE_API_PREFIX, type QuotePayload, type QuoteSource } from '../schema.ts'
import css from './QuoteBlock.module.css'

export interface QuoteBlockProps {
  /** Which upstream feeds the quote (settings-driven). */
  source: QuoteSource
  t: TranslateNS<'daily-fortune'>
}

export function QuoteBlock({ source, t }: QuoteBlockProps) {
  const [quote, setQuote] = useState<QuotePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const requestId = useRef(0)

  const load = useCallback((fresh: boolean) => {
    const id = ++requestId.current
    setLoading(true)
    setFailed(false)
    const suffix = fresh ? '&fresh=1' : ''
    fetch(`${DAILY_FORTUNE_API_PREFIX}/quote?source=${source}${suffix}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status))
        return response.json() as Promise<QuotePayload>
      })
      .then((payload) => {
        if (requestId.current !== id) return
        setQuote(payload)
        setLoading(false)
      })
      .catch(() => {
        if (requestId.current !== id) return
        setQuote(null)
        setFailed(true)
        setLoading(false)
      })
  }, [source])

  useEffect(() => { load(false) }, [load])

  return (
    <section className={css.quote} aria-label={t('quote.title')}>
      <div className={css.quoteHeader}>
        <h3>{t('quote.title')}</h3>
        <Button size="sm" variant="ghost" onClick={() => { load(true) }} disabled={loading}>
          {t('quote.next')}
        </Button>
      </div>
      {loading && !failed && <p className={css.quoteText} data-loading="true">…</p>}
      {failed && <p className={css.quoteText}>{t('quote.failed')}</p>}
      {!loading && !failed && quote !== null && (
        <div className={css.quoteBody}>
          <p className={css.quoteText}>{quote.text}</p>
          <div className={css.quoteMeta}>
            <Pill>{t(`quote.source.${quote.source}`)}</Pill>
            {quote.author !== '' && <span className={css.quoteAuthor}>— {quote.author}</span>}
          </div>
        </div>
      )}
    </section>
  )
}
