"use client";

import {
  SCOPE_RELOAD_MESSAGES,
  ScopeReloadViewProvider,
  type ScopeReloadViewProps,
} from "@asym/database/scope-reload-notice";
import { useEffect, useRef, type ReactNode } from "react";

import { Button, ButtonLink } from "./shadcn/button";

/**
 * The app's view of the scope guards' reload notice (AL-2675, JB2): what a
 * page shows while a guard reloads the document instead of a page of the
 * wrong scope. A status that assistive technology announces, and, when the
 * bounded reload is refused or has not happened, a way out: reload, or the
 * app's home. Focus moves to the reload button then, so it is not lost on a
 * page whose content went away. Built from the existing Button components;
 * no style of its own beyond the semantic tokens.
 */
function ScopeReloadView({ stuck, reload, homeHref }: ScopeReloadViewProps) {
  const reloadButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (stuck) reloadButton.current?.focus();
  }, [stuck]);
  return (
    <div
      data-scope-reload-notice=""
      className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 py-8 text-center"
    >
      <p
        role="status"
        aria-live="polite"
        className="text-sm text-muted-foreground"
      >
        {stuck ? SCOPE_RELOAD_MESSAGES.stuck : SCOPE_RELOAD_MESSAGES.reloading}
      </p>
      {stuck ? (
        <div className="flex flex-wrap justify-center gap-2">
          <Button ref={reloadButton} type="button" onClick={reload}>
            Reload
          </Button>
          <ButtonLink variant="outline" href={homeHref}>
            Go to home
          </ButtonLink>
        </div>
      ) : null}
    </div>
  );
}

/** Gives every scope guard below it the app's view of the reload notice. */
export function ScopeReloadNotices({ children }: { children: ReactNode }) {
  return (
    <ScopeReloadViewProvider value={ScopeReloadView}>
      {children}
    </ScopeReloadViewProvider>
  );
}
