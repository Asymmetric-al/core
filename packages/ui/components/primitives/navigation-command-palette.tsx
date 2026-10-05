"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "../shadcn/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../shadcn/command";
import { Kbd } from "../shadcn/kbd";

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

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.repeat ||
        event.altKey ||
        event.shiftKey ||
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== "k"
      )
        return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest(
            'input, textarea, select, [contenteditable]:not([contenteditable="false"])',
          ))
      )
        return;

      const popup =
        target instanceof HTMLElement
          ? target.closest(
              '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]',
            )
          : null;
      if (popup && popup !== inputRef.current?.closest('[role="dialog"]'))
        return;

      event.preventDefault();
      if (open) setOpen(false);
      else openSearch();
    };
    // Local workspace handlers receive the shortcut before this global listener.
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [open, openSearch]);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        aria-label={triggerLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-keyshortcuts="Control+k Meta+k"
        onClick={openSearch}
      >
        <Search aria-hidden data-icon="inline-start" />
        <span>Search</span>
        <span className="hidden md:inline-flex" aria-hidden>
          <Kbd>Ctrl/⌘ K</Kbd>
        </span>
      </Button>
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
