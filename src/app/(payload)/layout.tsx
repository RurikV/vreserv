/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD.
   It has been customized to avoid rendering a second <html>/<body> within the app root layout.
   Only the top-level app/layout.tsx should render <html> and <body> to prevent nested HTML errors. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions } from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './admin/importMap.js'
import './custom.scss'

// Deep imports to re-create Payload Admin providers without rendering <html>/<body>
import { ProgressBar, RootProvider } from '@payloadcms/ui'
import { getClientConfig } from '@payloadcms/ui/utilities/getClientConfig'
import { cookies as nextCookies } from 'next/headers'
import { getNavPrefs } from './lib/getNavPrefs'
import { getRequestTheme } from './lib/getRequestTheme'
import { initReq } from './lib/initReq'
import { NestProviders } from './lib/NestProviders'


type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = async ({ children }: Args) => {
  // Initialize request context similar to Payload RootLayout
  const {
    languageCode,
    permissions,
    req,
    req: { payload: { config: resolvedConfig } },
  } = await initReq({
    configPromise: config as any,
    importMap,
    key: 'RootLayout',
  })

  const theme = await getRequestTheme({
    config: resolvedConfig,
    cookies: undefined,
    headers: undefined,
  })


  const supportedLanguages = resolvedConfig?.i18n?.supportedLanguages ?? {}
  const languageOptions = Object.entries(supportedLanguages).reduce(
    (acc: Array<{ label: string; value: string }>, [language, languageConfig]: any) => {
      if (Object.prototype.hasOwnProperty.call(supportedLanguages, language)) {
        acc.push({
          label: languageConfig?.translations?.general?.thisLanguage ?? language,
          value: language,
        })
      }
      return acc
    },
    [] as Array<{ label: string; value: string }>,
  )

  async function switchLanguageServerAction(lang: string) {
    'use server'
    const cookies = await nextCookies()
    cookies.set({
      name: `${resolvedConfig.cookiePrefix || 'payload'}-lng`,
      path: '/',
      value: lang,
    })
  }

  const navPrefs = await getNavPrefs(req)

  const clientConfig = getClientConfig({
    config: resolvedConfig,
    i18n: req.i18n,
    importMap,
  })

  if (
    (clientConfig as any).localization &&
    (resolvedConfig as any).localization &&
    typeof (resolvedConfig as any).localization.filterAvailableLocales === 'function'
  ) {
    ;(clientConfig as any).localization.locales = (
      await (resolvedConfig as any).localization.filterAvailableLocales({
        locales: (resolvedConfig as any).localization.locales,
        req,
      })
    ).map((loc: any) => { const rest = { ...loc } as any; delete (rest as any).toString; return rest })

    ;(clientConfig as any).localization.localeCodes = (resolvedConfig as any).localization.locales.map(
      ({ code }: any) => code,
    )
  }

  // IMPORTANT: Do not render <html> or <body> here to avoid nested HTML.
  // Provide the required Payload admin context only.
  const providers = resolvedConfig?.admin?.components?.providers

  return (
    <>
      <RootProvider
        config={clientConfig as any}
        dateFNSKey={req.i18n.dateFNSKey}
        fallbackLang={resolvedConfig.i18n.fallbackLanguage}
        isNavOpen={navPrefs?.open ?? true}
        languageCode={languageCode as any}
        languageOptions={languageOptions as any}
        locale={req.locale as any}
        permissions={permissions as any}
        serverFunction={serverFunction}
        switchLanguageServerAction={switchLanguageServerAction as any}
        theme={theme as any}
        translations={req.i18n.translations as any}
        user={req.user as any}
      >
        <ProgressBar />
        {Array.isArray(providers) && providers.length > 0 ? (
          <NestProviders
            importMap={(req as any).payload.importMap}
            providers={providers}
            serverProps={{ i18n: req.i18n, payload: (req as any).payload, permissions, user: req.user }}
          >
            {children}
          </NestProviders>
        ) : (
          children
        )}
      </RootProvider>
      {/* Portal target used by Payload UI components */}
      <div id="portal" />
    </>
  )
}

export default Layout
