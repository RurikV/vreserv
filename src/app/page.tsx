import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n';

export default function Index() {
  // Redirect root to the default locale to avoid 404 at /
  redirect(`/${defaultLocale}`);
}
