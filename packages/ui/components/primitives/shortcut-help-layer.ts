/**
 * The attribute the Shift+? help puts on its popup, so overlays it opens over
 * can recognise a press inside it.
 */
export const SHORTCUT_HELP_ATTRIBUTE = "data-shortcut-help";

/**
 * Whether a popup is being closed by a press inside the open Shift+? help:
 * its popup, its Close button or its backdrop. The help opens over a
 * non-modal popover without joining that popover's floating tree, so Base UI
 * reports those presses to the popover as outside presses. Escape in the help
 * already closes only the help; a pointer should too.
 */
export function isPressInShortcutHelp({
  reason,
  event,
}: {
  reason: string;
  event?: Event;
}): boolean {
  if (reason !== "outside-press") return false;
  const target = event?.target;
  if (!(target instanceof Element)) return false;
  if (target.closest(`[${SHORTCUT_HELP_ATTRIBUTE}]`)) return true;
  // The backdrop sits beside the popup, inside the same dialog portal.
  const portal = target.closest('[data-slot="dialog-portal"]');
  return portal?.querySelector(`[${SHORTCUT_HELP_ATTRIBUTE}]`) != null;
}
