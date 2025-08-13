import { NuqsAdapter } from "nuqs/adapters/next/app"
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { TRPCReactProvider } from "@/trpc/client";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  // Ensure params are awaited per Next.js 15 dynamic API rules and extract locale
  const { locale } = await params;

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <NuqsAdapter>
        <TRPCReactProvider>
          {children}
        </TRPCReactProvider>
      </NuqsAdapter>
    </NextIntlClientProvider>
  );
}
