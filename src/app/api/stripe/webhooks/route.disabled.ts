/**
 * This file intentionally disables the duplicate Stripe webhook route at /api/stripe/webhooks.
 * The active implementation lives at /src/app/(app)/api/stripe/webhooks/route.ts.
 *
 * Keeping this file (without exporting any HTTP handlers) preserves context while
 * preventing Next.js from registering a conflicting route and keeps ESLint quiet.
 */

export const STRIPE_WEBHOOK_ROUTE_DISABLED = true;
