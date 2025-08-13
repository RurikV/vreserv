import { cache } from 'react'

// Minimal local reimplementation of @payloadcms/next getNavPrefs to avoid deep import issues.
// Returns the nav preferences for the current user or null if not available.
export const getNavPrefs = cache(async (req: {
  user?: { collection?: string; id?: string };
  payload?: { find?: (...args: unknown[]) => Promise<{ docs?: { value?: unknown }[] }> };
}) => {
  if (!req?.user?.collection) return null

  const find = req?.payload?.find
  if (typeof find !== 'function') return null

  const res = await find.call(req.payload, {
    collection: 'payload-preferences',
    depth: 0,
    limit: 1,
    pagination: false,
    req,
    where: {
      and: [
        { key: { equals: 'nav' } },
        { 'user.relationTo': { equals: req.user.collection } },
        { 'user.value': { equals: req?.user?.id } },
      ],
    },
  })

  return res?.docs?.[0]?.value ?? null
})
