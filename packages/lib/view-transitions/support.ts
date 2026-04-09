/** Client-only: true when the document can run document.startViewTransition (Chromium 111+, Safari 18.2+, Firefox 144+). */
export function clientDocumentSupportsViewTransitions(): boolean {
  if (typeof document === "undefined") {
    return false;
  }
  return typeof document.startViewTransition === "function";
}
