import { withPayload } from "@payloadcms/next/withPayload";
import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      // Turbopack configuration
      rules: {
        // Configure any custom rules if needed
      },
    },
  },
};

// Ensure next-intl plugin is applied last to preserve i18n routing
export default withNextIntl(withPayload(nextConfig));
