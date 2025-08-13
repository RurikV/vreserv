import React from 'react'
import { RenderServerComponent } from '@payloadcms/ui/elements/RenderServerComponent'

// Local replica of Payload's NestProviders to avoid deep import from @payloadcms/next
// It recursively wraps the provided provider components around the children.
interface NestProvidersProps {
  children: React.ReactNode
  importMap: Record<string, unknown>
  providers: unknown[]
  serverProps?: Record<string, unknown>
}

export function NestProviders({
  children,
  importMap,
  providers,
  serverProps,
}: NestProvidersProps): React.ReactNode {
  return RenderServerComponent({
    clientProps: {
      children:
        providers.length > 1 ? (
          <NestProviders
            importMap={importMap}
            providers={providers.slice(1)}
            serverProps={serverProps}
          >
            {children}
          </NestProviders>
        ) : (
          children
        ),
    },
    Component: providers[0] as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    importMap,
    serverProps,
  })
}
