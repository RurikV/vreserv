import { Link } from "@/navigation";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookmarkCheckIcon, ListFilterIcon, SearchIcon } from "lucide-react";
import { useTranslations } from 'next-intl';

import { useTRPC } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { CategoriesSidebar } from "./categories-sidebar";

interface Props {
  disabled?: boolean;
  defaultValue?: string | undefined;
  onChange?: (value: string) => void;
}

export const SearchInput = ({
  disabled,
  defaultValue,
  onChange,
}: Props) => {
  const [searchValue, setSearchValue] = useState(defaultValue || "");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const trpc = useTRPC();
  const session = useQuery(trpc.auth.session.queryOptions());
  const t = useTranslations();

  // Keep latest onChange in a ref to avoid effect re-running due to identity changes
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Track the last emitted value to avoid duplicates
  const lastEmittedRef = useRef<string | undefined>(undefined);

  // Track the external defaultValue to suppress no-op emissions on mount/locale switch
  const defaultValueRef = useRef<string>(defaultValue || "");

  // Sync local state and defaultValueRef when defaultValue changes
  useEffect(() => {
    const next = defaultValue || "";
    defaultValueRef.current = next;
    setSearchValue(next);
  }, [defaultValue]);

  // Debounced emit only when the value actually differs from the external default
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Do not emit if value equals the current external default (initial mount / hydrate / locale switch)
      if (searchValue === defaultValueRef.current) return;
      if (lastEmittedRef.current === searchValue) return;
      lastEmittedRef.current = searchValue;
      onChangeRef.current?.(searchValue);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  return (
    <div className="flex items-center gap-2 w-full">
      <CategoriesSidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      <div className="relative w-full">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
        <Input 
          className="pl-8" 
          placeholder={t('search.placeholder')}
          disabled={disabled}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>
      <Button
        variant="elevated"
        className="size-12 shrink-0 flex lg:hidden"
        onClick={() => setIsSidebarOpen(true)}
      >
        <ListFilterIcon />
      </Button>
      {session.data?.user && (
        <Button
          asChild
          variant="elevated"
        >
          <Link prefetch href="/library">
            <BookmarkCheckIcon />
            {t('navigation.library')}
          </Link>
        </Button>
      )}
    </div>
  );
};
