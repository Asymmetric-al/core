"use client";

import { createBrowserClient } from "@asym/database/supabase";
import { CircleCheck } from "lucide-react";
import * as React from "react";

import { Button } from "../shadcn/button";

/**
 * Ends every other signed-in session for this account (a lost phone, a
 * shared computer) and keeps this one.
 */
export function SignOutOtherSessions() {
  const [state, setState] = React.useState<
    "idle" | "working" | "done" | "error"
  >("idle");

  const handleClick = async () => {
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
    </div>
  );
}
