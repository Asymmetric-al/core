"use client";

import { Keyboard } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  ShortcutHint,
  listShortcuts,
  useShortcut,
  useShortcutHint,
} from "./shortcut";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../shadcn/dialog";
import { DropdownMenuItem } from "../shadcn/dropdown-menu";
import { Kbd } from "../shadcn/kbd";

export const SHORTCUT_HELP_KEYS = "shift+?";

type Listed = ReturnType<typeof listShortcuts>;

// How the mounted ShortcutHelp opens, so a menu item elsewhere in the shell
// opens that same dialog instead of a second one.
let showMounted: (() => void) | null = null;

// The mounted hosts, oldest first. The oldest owns Shift+?, so a page that
// mounts its own host inside a shell that has one still shows one list.
let hosts: readonly string[] = [];
const hostListeners = new Set<() => void>();
function setHosts(next: readonly string[]) {
  hosts = next;
  for (const listener of hostListeners) listener();
}
function subscribeToHosts(listener: () => void) {
  hostListeners.add(listener);
  return () => {
    hostListeners.delete(listener);
  };
}

// A menu or list keeps Shift+? for its own typing (typeahead).
const MENU_OR_LIST = '[role="menu"], [role="listbox"]';

/**
 * Shift+? lists the described shortcuts that would run where focus was, so
 * a region's keys show only from inside it. It also opens over a dialog,
 * sheet or popover, listing the keys that work there, and closes back into
 * it. Mount once per app shell, or on a page without one that registers
 * shortcuts; a second host stays inert while the first is mounted.
 * `ShortcutHelpMenuItem` opens it from an account or help menu.
 */
export function ShortcutHelp() {
  const id = useId();
  const owner = useSyncExternalStore(
    subscribeToHosts,
    () => hosts[0] === id,
    () => false,
  );
  useEffect(() => {
    setHosts([...hosts, id]);
    return () => setHosts(hosts.filter((host) => host !== id));
  }, [id]);

  const [open, setOpen] = useState(false);
  const [listed, setListed] = useState<Listed>([]);
  const listRef = useRef<HTMLUListElement>(null);

  // Read before the dialog opens, while focus is still where the reader was.
  const show = useCallback(() => {
    setListed(listShortcuts().filter((shortcut) => shortcut.description));
    setOpen(true);
  }, []);
  useEffect(() => {
    if (!owner) return;
    showMounted = show;
    return () => {
      if (showMounted === show) showMounted = null;
    };
  }, [owner, show]);

  useShortcut(
    owner ? SHORTCUT_HELP_KEYS : null,
    () => (open ? setOpen(false) : show()),
    {
      description: "Show keyboard shortcuts",
      overlay: listRef,
      allowInOverlay: true,
      when: () => !document.activeElement?.closest(MENU_OR_LIST),
    },
  );

  if (!owner) return null;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* data-shortcut-help (SHORTCUT_HELP_ATTRIBUTE): a popover under the help
          stays open for a press in it. */}
      <DialogContent scrollable data-shortcut-help="">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            The shortcuts that work where you are now.
          </DialogDescription>
        </DialogHeader>
        <ul ref={listRef} className="flex flex-col divide-y divide-border">
          {listed.map((shortcut, index) => (
            <li
              key={`${shortcut.keys}-${index}`}
              className="flex items-center justify-between gap-4 py-2 text-sm"
            >
              <span>{shortcut.description}</span>
              <span className="sr-only">{shortcut.ariaKeyshortcuts}</span>
              <Kbd aria-hidden="true">{shortcut.hint}</Kbd>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

/**
 * A "Keyboard shortcuts" item for an account or help menu, showing Shift+?.
 * It opens the shell's ShortcutHelp once the menu has closed and given focus
 * back, so the list shows what works there, as Shift+? from there would.
 */
export function ShortcutHelpMenuItem() {
  const { ariaKeyshortcuts } = useShortcutHint(SHORTCUT_HELP_KEYS);
  const [choice] = useState({ chosen: false });
  // The menu unmounts its items after it closes and returns focus in a
  // microtask; a task later, focus is back where the list should start.
  useEffect(
    () => () => {
      if (choice.chosen) setTimeout(() => showMounted?.(), 0);
    },
    [choice],
  );

  return (
    <DropdownMenuItem
      aria-keyshortcuts={ariaKeyshortcuts}
      onClick={() => {
        choice.chosen = true;
      }}
    >
      <Keyboard aria-hidden />
      Keyboard shortcuts
      <ShortcutHint keys={SHORTCUT_HELP_KEYS} className="ml-auto" />
    </DropdownMenuItem>
  );
}
