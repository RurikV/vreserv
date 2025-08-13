"use client";

import { Link, usePathname, useRouter } from "@/navigation";
import { useState, useCallback, useMemo, useTransition } from "react";
import { MenuIcon } from "lucide-react";
import { Poppins } from "next/font/google";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from 'next-intl';

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/language-selector";

import { NavbarSidebar } from "./navbar-sidebar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

interface NavbarItemProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: (href: string) => void;
  disabled?: boolean;
}

const NavbarItem = ({
  href,
  children,
  isActive,
  onClick,
  disabled = false,
}: NavbarItemProps) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Prevent default link behavior and event bubbling
    e.preventDefault();
    e.stopPropagation();
    
    // Execute navigation immediately without delays
    if (onClick && !disabled) {
      onClick(href);
    }
  }, [href, onClick, disabled]);

  return (
    <Button
      variant="outline"
      className={cn(
        "bg-transparent hover:bg-transparent rounded-full hover:border-primary border-transparent px-3.5 text-lg cursor-pointer",
        isActive && "bg-black text-white hover:bg-black hover:text-white",
        disabled && "opacity-50 cursor-not-allowed",
      )}
      onClick={handleClick}
      type="button"
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

export const Navbar = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const baseItems = useMemo(() => ([
    { href: "/", children: t('navigation.home') },
    { href: "/about", children: t('navigation.about') },
    { href: "/features", children: t('navigation.features') },
    { href: "/pricing", children: t('navigation.pricing') },
    { href: "/contact", children: t('navigation.contact') },
  ]), [t]);

  const navbarItems = useMemo(() => baseItems, [baseItems]);

  const trpc = useTRPC();
  const session = useQuery(trpc.auth.session.queryOptions());

  const handleNavigation = useCallback((href: string) => {
    // Robust navigation with error handling and retry logic
    startTransition(() => {
      try {
        // Always use push for consistent behavior across all routes
        router.push(href);
      } catch (error) {
        // Fallback: try window location as last resort
        console.warn('Router navigation failed, using window.location fallback:', error);
        window.location.href = href;
      }
    });
  }, [router]);

  const handleSidebarToggle = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleSidebarOpenChange = useCallback((open: boolean) => {
    setIsSidebarOpen(open);
  }, []);

  const currentPath = typeof pathname === 'function'
    ? (pathname as (opts?: { locale?: string }) => string)()
    : (pathname as string);

  return (
    <nav className="h-20 flex border-b justify-between font-medium bg-white">
      <Link href="/" className="pl-6 flex items-center">
        <span className={cn("text-5xl font-semibold", poppins.className)}>
          reserv
        </span>
      </Link>

      <NavbarSidebar
        items={navbarItems}
        open={isSidebarOpen}
        onOpenChange={handleSidebarOpenChange}
        onNavigate={handleNavigation}
        isNavigating={isPending}
      />

      <div className="items-center gap-4 hidden lg:flex">
        {navbarItems.map((item) => (
          <NavbarItem
            key={item.href}
            href={item.href}
            isActive={currentPath === item.href}
            onClick={handleNavigation}
            disabled={isPending}
          >
            {item.children}
          </NavbarItem>
        ))}
        <LanguageSelector />
      </div>

      {session.data?.user ? (
        <div className="hidden lg:flex">
          <Button
            className="border-l border-t-0 border-b-0 border-r-0 px-12 h-full rounded-none bg-black text-white hover:bg-pink-400 hover:text-black transition-colors text-lg"
            onClick={() => handleNavigation("/admin")}
            disabled={isPending}
            type="button"
          >
            {t('auth.dashboard')}
          </Button>
        </div>
      ) : (
        <div className="hidden lg:flex">
          <Button
            variant="secondary"
            className="border-l border-t-0 border-b-0 border-r-0 px-12 h-full rounded-none bg-white hover:bg-pink-400 transition-colors text-lg"
            onClick={() => handleNavigation(`/sign-in`) }
            disabled={isPending}
            type="button"
          >
            {t('auth.login')}
          </Button>
          <Button
            className="border-l border-t-0 border-b-0 border-r-0 px-12 h-full rounded-none bg-black text-white hover:bg-pink-400 hover:text-black transition-colors text-lg"
            onClick={() => handleNavigation(`/sign-up`)}
            disabled={isPending}
            type="button"
          >
            {t('auth.signup')}
          </Button>
        </div>
      )}

      <div className="flex lg:hidden items-center justify-center">
        <Button
          variant="ghost"
          className="size-12 border-transparent bg-white"
          onClick={handleSidebarToggle}
        >
          <MenuIcon />
        </Button>
      </div>
    </nav>
  );
};
