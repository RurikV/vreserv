"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/navigation';
import { Globe } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { locales, type Locale } from '@/i18n';

const languageNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
  et: 'Eesti',
  ru: 'Русский'
};

const languageFlags: Record<Locale, string> = {
  en: '🇺🇸',
  fr: '🇫🇷',
  it: '🇮🇹',
  et: '🇪🇪',
  ru: '🇷🇺'
};

interface LanguageSelectorProps {
  onLanguageChange?: () => void;
}

export function LanguageSelector({ onLanguageChange }: LanguageSelectorProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const switchLanguage = (newLocale: Locale) => {
    // Use next-intl's locale-aware router to switch locales reliably
    // pathname from createNavigation is always a string (current path)
    try {
      router.push(pathname, { locale: newLocale });
    } finally {
      setIsOpen(false);
      // Call the optional callback (e.g., to close mobile sidebar)
      if (onLanguageChange) {
        onLanguageChange();
      }
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2 text-sm font-medium"
        >
          <Globe className="h-4 w-4 mr-1" />
          <span className="mr-1">{languageFlags[locale]}</span>
          {languageNames[locale]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[150px]">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLanguage(loc)}
            className={`flex items-center space-x-2 ${
              loc === locale ? 'bg-accent' : ''
            }`}
          >
            <span>{languageFlags[loc]}</span>
            <span>{languageNames[loc]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}