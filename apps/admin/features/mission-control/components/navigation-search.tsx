"use client";

import { getNavItemsByRole, type Role } from "@asym/config/navigation";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@asym/ui/components/shadcn/command";
import { Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export function MissionControlNavigationSearch({
  role,
  onNavigate,
}: {
  role: Role;
  onNavigate: (href: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const returnFocus = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const items = getNavItemsByRole(role);

  const openSearch = useCallback((origin: HTMLElement | null) => {
    returnFocus.current = origin;
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
          target.closest("input, textarea, select, [contenteditable]"))
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
      if (open) {
        setOpen(false);
        return;
      }
      openSearch(
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null,
      );
    };
    // Support's container and Care's document listeners own their local keys
    // first. The window listener sees their preventDefault before acting.
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [open, openSearch]);

  return (
    <>
      <div className="hidden w-56 sm:block">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          aria-label="Open Mission Control search"
          aria-keyshortcuts="Control+k Meta+k"
          onClick={(event) => openSearch(event.currentTarget)}
        >
          <Search aria-hidden />
          <span className="text-sm text-muted-foreground">Search…</span>
          <kbd
            className="pointer-events-none ml-auto select-none rounded border bg-muted px-1.5 font-mono text-xs font-medium"
            aria-hidden
          >
            Ctrl/⌘ K
          </kbd>
        </Button>
      </div>
      <div className="sm:hidden">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Open Mission Control search"
          aria-keyshortcuts="Control+k Meta+k"
          onClick={(event) => openSearch(event.currentTarget)}
        >
          <Search aria-hidden />
        </Button>
      </div>
      <CommandDialog
        title="Mission Control navigation"
        description="Search the pages available to your role."
        commandLabel="Search Mission Control pages"
        open={open}
        onOpenChange={setOpen}
        onOpenChangeComplete={(isOpen) => {
          if (!isOpen && returnFocus.current?.isConnected)
            returnFocus.current.focus();
        }}
      >
        <CommandInput
          ref={inputRef}
          aria-label="Search Mission Control pages"
          placeholder="Search pages…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No matching pages. Try another page name.</CommandEmpty>
          <CommandGroup heading="Pages">
            {items.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.title} ${item.href}`}
                onSelect={() => {
                  setOpen(false);
                  onNavigate(item.href);
                }}
              >
                <item.icon aria-hidden />
                {item.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
