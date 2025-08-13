import {createNavigation} from 'next-intl/navigation';
import {locales} from './i18n';

// Export locale-aware navigation helpers to use across the app
export const {Link, usePathname, useRouter, redirect} = createNavigation({
  locales
});
