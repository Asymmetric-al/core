"use client";

import { readDocumentScopeForSend } from "@asym/database/document-scope";
import { createBrowserClient } from "@asym/database/supabase";
import { CircleCheck } from "lucide-react";
import * as React from "react";

import { Button } from "../shadcn/button";

/**
 * Ends every other signed-in session for this account (a lost phone, a
 * shared computer) and keeps this one.
 *
 * Auth requests do not pass the request wrappers, so a page rendered for one
 * person, after another signed in in another tab, would end the second
 * person's other sessions. When the document's scope is retired (its one
 * read; last read of the first release, L4), nothing is sent and the person
 * is asked to reload.
 */
export function SignOutOtherSessions() {
  const [state, setState] = React.useState<
    "idle" | "working" | "done" | "error" | "retired"
  >("idle");

  const handleClick = async () => {
    if (readDocumentScopeForSend().kind === "retired") {
      setState("retired");
      return;
    }
    setState("working");
    const { error } = await createBrowserClient().auth.signOut({
      scope: "others",
    });
    setState(error ? "error" : "done");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={state === "working"}
          focusableWhenDisabled
        >
          {state === "working" ? "Signing out…" : "Sign out other devices"}
        </Button>
        <p role="status" className="text-sm">
          {state === "done" ? (
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <CircleCheck className="size-4 text-success" aria-hidden />
              You’re signed out everywhere else.
            </span>
          ) : null}
        </p>
      </div>
      {state === "error" ? (
        <p role="alert" className="text-sm text-destructive">
          Other devices couldn’t be signed out. Try again.
        </p>
      ) : null}
      {state === "retired" ? (
        <p role="alert" className="text-sm text-destructive">
          This page was opened for a different sign-in. Reload the page, then
          try again.
        </p>
      ) : null}
    </div>
  );
}
