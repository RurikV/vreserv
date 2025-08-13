// Minimal local reimplementation of Payload's initReq to avoid deep import issues.
// It provides just enough context for our Payload Admin provider-only layout.

export interface MinimalI18nConfig {
  fallbackLanguage?: string
  defaultLanguage?: string
  supportedLanguages?: Record<string, { translations?: Record<string, unknown> }>
  translations?: Record<string, unknown>
}

export interface MinimalConfig {
  i18n?: MinimalI18nConfig
  cookiePrefix?: string
  // Other fields may exist on the real Payload config but are not required here
  // They are intentionally omitted to keep this shim minimal.
}

export interface MinimalReq {
  i18n: {
    language: string
    dateFNSKey: string
    translations: Record<string, unknown>
    t: (key: string) => string
  }
  locale: string
  payload: {
    config: MinimalConfig
    importMap: Record<string, unknown>
    // minimal stub to prevent errors in code paths expecting payload.find
    find: (args: unknown) => Promise<{ docs: unknown[] }>
  }
  user?: unknown
}

export async function initReq({
  configPromise,
  importMap,
}: {
  configPromise: Promise<MinimalConfig> | MinimalConfig
  importMap: Record<string, unknown>
  key?: string
}): Promise<{
  languageCode: string
  permissions: unknown
  req: MinimalReq
}> {
  const resolvedConfig = (await Promise.resolve(configPromise)) as MinimalConfig

  const languageCode: string =
    resolvedConfig?.i18n?.fallbackLanguage ||
    resolvedConfig?.i18n?.defaultLanguage ||
    'en'

  const dateFNSKey = mapDateFnsKey(languageCode)

  const translations: Record<string, unknown> =
    resolvedConfig?.i18n?.supportedLanguages?.[languageCode]?.translations ||
    resolvedConfig?.i18n?.translations ||
    {}

  const req: MinimalReq = {
    i18n: {
      language: languageCode,
      dateFNSKey,
      translations,
      // minimal fallback translator to avoid runtime errors if accessed
      t: (key: string) => key,
    },
    locale: languageCode,
    payload: {
      config: resolvedConfig,
      importMap,
      // minimal stub to prevent errors in code paths expecting payload.find
      find: async () => ({ docs: [] }),
    },
    user: undefined,
  }

  const permissions: unknown = undefined

  return {
    languageCode,
    permissions,
    req,
  }
}

function mapDateFnsKey(code: string): string {
  const map: Record<string, string> = {
    en: 'enUS',
  }
  return map[code] || code
}
