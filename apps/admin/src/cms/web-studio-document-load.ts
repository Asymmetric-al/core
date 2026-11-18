/**
 * Loads `href` as a new document, leaving nothing of the current Web Studio
 * document behind (AL-2675, council C1 and C12). Its own module so tests can
 * observe it: jsdom cannot navigate.
 *
 * Payload calls this only through the router adapter, for an address outside
 * Web Studio's pages. When the page holds unsaved changes, Payload's
 * leave-without-saving dialog has already asked the person and they chose to
 * leave; its `beforeunload` listener, still attached, would ask a second
 * time, so this one load stops it.
 */
export function loadDocument(
  href: string,
  { replace }: { replace: boolean },
): void {
  window.addEventListener(
    "beforeunload",
    (event) => event.stopImmediatePropagation(),
    { capture: true, once: true },
  );
  if (replace) window.location.replace(href);
  else window.location.assign(href);
}
