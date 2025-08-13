"use client";

import { useCallback } from "react";
import { useTranslations } from 'next-intl';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavbarItem {
  href: string;
  children: React.ReactNode;
}

interface Props {
  items: NavbarItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (href: string) => void;
  isNavigating?: boolean;
}

export const NavbarSidebar = ({
  items,
  open,
  onOpenChange,
  onNavigate,
  isNavigating = false,
}: Props) => {
  const t = useTranslations();

  const handleItemClick = useCallback((href: string) => {
    if (onNavigate) {
      onNavigate(href);
    }
    onOpenChange(false);
  }, [onNavigate, onOpenChange]);


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="p-0 transition-none"
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle>
            {t('navigation.menu')}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex flex-col overflow-y-auto h-full pb-2">
          {items.map((item) => (
            <button
              key={item.href}
              className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleItemClick(item.href)}
              disabled={isNavigating}
              type="button"
            >
              {item.children}
            </button>
          ))}
          <div className="border-t">
            <button 
              onClick={() => handleItemClick('/sign-in')}
              disabled={isNavigating}
              type="button"
              className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('auth.login')}
            </button>
            <button 
              onClick={() => handleItemClick('/sign-up')}
              disabled={isNavigating}
              type="button"
              className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('auth.signup')}
            </button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
