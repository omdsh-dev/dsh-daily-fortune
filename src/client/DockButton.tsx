/**
 * 「求一签」dock button in the conversation input strip. Clicking triggers
 * the draw configured by the settings mode and switches to the fortune tab.
 */

import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'

/** Business face injected into the dock entry. */
export interface DockButtonInjected {
  /** Trigger the configured draw, then open the fortune view tab. */
  onDraw: () => void
}

/** Full dock-button props: the input-zone runtime share plus copy and the injected verb. */
export type DockButtonProps = PropsRuntime<'conversation.input.dock'> & PropsLocale<'daily-fortune'> & DockButtonInjected

/** Render the dock trigger. */
export function DockButton({ onDraw, t }: DockButtonProps) {
  return (
    <Button size="sm" variant="outline" onClick={onDraw} title={t('dock.draw')}>
      <span aria-hidden="true">🔮</span>&nbsp;{t('dock.draw')}
    </Button>
  )
}
