/**
 * Host registration for the daily-fortune plugin: the durable settings
 * namespace plus the same-origin settings/upstream route the browser half uses.
 * The browser half is discovered through the package `dsh.client` manifest.
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-host-webserver'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
import { createProxyHandler } from './proxy.ts'
import { DAILY_FORTUNE_API_PREFIX, DAILY_FORTUNE_SETTINGS_NAMESPACE, DailyFortuneSettingsSchema } from './schema.ts'

export {
  DAILY_FORTUNE_API_PREFIX, DAILY_FORTUNE_MODES, DAILY_FORTUNE_SETTINGS_NAMESPACE, DailyFortuneSettingsSchema, QUOTE_SOURCES,
} from './schema.ts'
export type { DailyFortuneMode, DailyFortuneSettings, QuoteSource } from './schema.ts'

/** Mounts the daily-fortune plugin.
 * @param ctx - Host context that may acquire settings and HTTP services.
 */
export function apply(ctx: Context): void {
  ctx.inject(['settings', 'webServer'], (host) => {
    const scope = host.settings.register(
      settingsNamespace(DAILY_FORTUNE_SETTINGS_NAMESPACE),
      DailyFortuneSettingsSchema,
    )
    host.effect(
      () => host.webServer.register({
        kind: 'prefix',
        path: DAILY_FORTUNE_API_PREFIX,
        handler: createProxyHandler(scope),
      }),
      'daily-fortune: HTTP routes',
    )
  })
}
