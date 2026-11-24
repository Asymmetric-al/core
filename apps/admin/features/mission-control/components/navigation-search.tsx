"use client";

import {
  getNavItemsByRole,
  type NavItem,
  type NavSubItem,
  type Role,
} from "@asym/config/navigation";
import {
  useShortcut,
  useShortcutHint,
} from "@asym/ui/components/primitives/shortcut";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@asym/ui/components/shadcn/command";
import { Kbd } from "@asym/ui/components/shadcn/kbd";
import { Search } from "lucide-react";
import { useCallback, useRef, useState } from "react";

const SEARCH_SHORTCUT = "mod+k";

export function MissionControlNavigationSearch({
  role,
  capabilities,
  onNavigate,
}: {
  role: Role;
  capabilities?: readonly string[];
  onNavigate: (href: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const returnFocus = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const items: (NavItem & { keywords?: readonly string[] })[] =
    getNavItemsByRole(role, capabilities);
  const shortcut = useShortcutHint(SEARCH_SHORTCUT);

  const openSearch = useCallback((origin: HTMLElement | null) => {
    returnFocus.current = origin;
    setQuery("");
    setOpen(true);
  }, []);

  // Support's container and Care's document handlers take their own keys
  // first; typing and other dialogs or menus keep theirs too.
  useShortcut(
    SEARCH_SHORTCUT,
    () => {
      if (open) {
        setOpen(false);
        return;
      }
      openSearch(
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null,
      );
    },
    { description: "Search Mission Control pages", overlay: inputRef },
  );

  return (
    <>
      <div className="hidden w-60 sm:block">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          aria-label="Open Mission Control search"
          aria-keyshortcuts={shortcut.ariaKeyshortcuts}
          onClick={(event) => openSearch(event.currentTarget)}
        >
          <span className="flex flex-1 items-center gap-2 text-muted-foreground">
            <Search aria-hidden className="size-4" />
            Search pages…
          </span>
          <Kbd aria-hidden>{shortcut.text}</Kbd>
        </Button>
      </div>
      <div className="sm:hidden">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Open Mission Control search"
          aria-keyshortcuts={shortcut.ariaKeyshortcuts}
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
            {items.flatMap((item) => [
              <CommandItem
                key={item.id}
                value={`${item.title} ${item.href}`}
                keywords={[...(item.keywords ?? [])]}
                onSelect={() => {
                  setOpen(false);
                  onNavigate(item.href);
                }}
              >
                <item.icon aria-hidden />
                {item.title}
              </CommandItem>,
              // A module's sub-pages, except the one that is the module home.
              ...(item.items ?? [])
                .filter((sub) => sub.href !== item.href)
                .map((sub: NavSubItem & { keywords?: readonly string[] }) => (
                  <CommandItem
                    key={sub.id}
                    value={`${item.title} ${sub.title} ${sub.href}`}
                    keywords={[...(sub.keywords ?? [])]}
                    onSelect={() => {
                      setOpen(false);
                      onNavigate(sub.href);
                    }}
                  >
                    <item.icon aria-hidden />
                    <span>{`${item.title} › ${sub.title}`}</span>
                  </CommandItem>
                )),
            ])}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
