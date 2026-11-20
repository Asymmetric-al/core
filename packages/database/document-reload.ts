/**
 * Loads the current address as a new document. Changing organization or
 * assignment is a full document load, which leaves no client, query or upload
 * state of the old scope behind (plan 5.2; ADR-0174 clause 7). Its own module
 * so tests can observe it: jsdom cannot navigate.
 */
export function reloadDocument(): void {
  window.location.reload();
}

/**
 * Loads `href` as a new document: what a navigation that crosses the tenant
 * segment's boundary does instead of a client-side transition (AL-2675,
 * council round 1).
 */
export function loadDocument(
  href: string,
  options: { replace?: boolean } = {},
): void {
  if (options.replace) window.location.replace(href);
  else window.location.assign(href);
}
