"use client";

import { Search } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { ShortcutHint, useShortcut, useShortcutHint } from "./shortcut";
import { Button } from "../shadcn/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../shadcn/command";

export interface NavigationCommandItem {
  label: string;
  href: string;
  keywords?: readonly string[];
}

export interface NavigationCommandPaletteProps {
  title: string;
  triggerLabel: string;
  items: readonly NavigationCommandItem[];
  onNavigate: (href: string) => void;
}

const SEARCH_SHORTCUT = "mod+k";

export function NavigationCommandPalette({
  title,
  triggerLabel,
  items,
  onNavigate,
}: NavigationCommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchLabel = `Search ${title.toLowerCase()}`;
  const openSearch = useCallback(() => {
    setQuery("");
    setOpen(true);
  }, []);

  // Typing, another dialog or menu, and local handlers keep the key.
  useShortcut(SEARCH_SHORTCUT, () => (open ? setOpen(false) : openSearch()), {
    description: searchLabel,
    overlay: inputRef,
  });
  const shortcut = useShortcutHint(SEARCH_SHORTCUT);

  return (
    <>
      {/* Icon-only on phones, so touch needs the 44px width the global
          coarse-pointer rule leaves out; `contents` adds no layout box. */}
      <span className="contents pointer-coarse:*:min-w-11">
        <Button
          variant="ghost"
          size="sm"
          aria-label={triggerLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-keyshortcuts={shortcut.ariaKeyshortcuts}
          onClick={openSearch}
        >
          <Search aria-hidden data-icon="inline-start" />
          {/* The accessible name comes from aria-label; the visible word yields
              its width to page context on narrow screens. */}
          <span className="max-sm:hidden">Search</span>
          <span className="hidden md:inline-flex">
            <ShortcutHint keys={SEARCH_SHORTCUT} />
          </span>
        </Button>
      </span>
      <CommandDialog
        title={title}
        description="Find a page in your workspace."
        commandLabel={searchLabel}
        open={open}
        onOpenChange={setOpen}
      >
        <CommandInput
          ref={inputRef}
          aria-label={searchLabel}
          placeholder="Search pages…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No matching pages. Try another page name.</CommandEmpty>
          <CommandGroup heading="Pages">
            {items.map((item) => (
              <CommandItem
                key={item.href}
                value={item.label}
                keywords={[item.href, ...(item.keywords ?? [])]}
                onSelect={() => {
                  setOpen(false);
                  onNavigate(item.href);
                }}
              >
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
