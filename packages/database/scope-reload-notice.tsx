"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from "react";

import {
  requestDocumentReload,
  type DocumentReloadCause,
} from "./document-reload-claim";

/**
 * What a scope guard renders in place of a page it must not show (council on
 * the joined release, JB2): no content of the wrong scope (the acceptance
 * line's "renders nothing and reloads"), but a status that assistive
 * technology announces while the document reloads, and a visible way out
 * (reload, or the app's home) when the bounded reload is refused or has not
 * happened after `STUCK_AFTER_MS`, as when the person pressed Stop or the
 * network is down.
 *
 * The look is the app's: `ScopeReloadViewProvider` takes a view built from
 * `@asym/ui` (`ScopeReloadNotices` there), which this package cannot import.
 * Without one, a plain view with the same content and roles renders.
 */

/** How long the notice waits for the reload before offering a way out. */
export const STUCK_AFTER_MS = 6_000;

export interface ScopeReloadViewProps {
  /** The reload was refused by its bound or has not happened: offer a way out. */
  stuck: boolean;
  /** Loads the current address again. */
  reload: () => void;
  /** The app's home, a page outside every scope. */
  homeHref: string;
}

const ScopeReloadViewContext =
  createContext<ComponentType<ScopeReloadViewProps> | null>(null);

/** Gives every scope guard below it the app's view of the notice. */
export const ScopeReloadViewProvider = ScopeReloadViewContext.Provider;

export const SCOPE_RELOAD_MESSAGES = {
  reloading: "Loading this page again…",
  stuck: "This page could not load again.",
} as const;

export function ScopeReloadNotice({
  requestReload = true,
  cause = "crossing",
  homeHref = "/",
}: {
  /**
   * Whether the notice asks for the reload itself. `TenantDocument` asks for
   * its own (it shows its error when the bound is reached).
   */
  requestReload?: boolean;
  /** Why the reload is asked for, which sets its bound (JR3). */
  cause?: DocumentReloadCause;
  homeHref?: string;
}) {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (requestReload && !requestDocumentReload(cause)) {
      setStuck(true);
      return;
    }
    const timer = window.setTimeout(() => setStuck(true), STUCK_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [requestReload, cause]);

  const View = useContext(ScopeReloadViewContext) ?? PlainScopeReloadView;
  return (
    <View
      stuck={stuck}
      reload={() => window.location.reload()}
      homeHref={homeHref}
    />
  );
}

/** The view without the app's components: the same content and roles. */
function PlainScopeReloadView({
  stuck,
  reload,
  homeHref,
}: ScopeReloadViewProps) {
  const reloadButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (stuck) reloadButton.current?.focus();
  }, [stuck]);
  return (
    <div data-scope-reload-notice="">
      <p role="status" aria-live="polite">
        {stuck ? SCOPE_RELOAD_MESSAGES.stuck : SCOPE_RELOAD_MESSAGES.reloading}
      </p>
      {stuck ? (
        <p>
          <button ref={reloadButton} type="button" onClick={reload}>
            Reload
          </button>{" "}
          <a href={homeHref}>Go to home</a>
        </p>
      ) : null}
    </div>
  );
}
