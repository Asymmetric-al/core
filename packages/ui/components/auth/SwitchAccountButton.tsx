"use client";

import { signOutClientSession } from "@asym/auth/client-session";
import { useId, useState, useTransition } from "react";

import { Button } from "@asym/ui/components/shadcn/button";

import type { ComponentProps } from "react";

/**
 * "Switch account" on a no-access page: signs the current account out so
 * another one can sign in. A plain link to /login would not work: the
 * sign-in screen sends a signed-in visitor straight on, which returns them
 * to the same refusal. Signing out loads /login as a new document; if it
 * fails, the reason is shown and the button can be pressed again.
 *
 * Mission Control's, the missionary workspace's and the donor app's no-access
 * pages render it (AL-2675, council round 2 on slice B, BR8).
 */
export function SwitchAccountButton({
  variant = "default",
}: {
  /** Primary where switching is the main way out, outline beside "Go to home". */
  variant?: ComponentProps<typeof Button>["variant"];
}) {
  const labelId = useId();
  const errorId = useId();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startSigningOut] = useTransition();

  const handleSwitchAccount = () => {
    setError(null);
    startSigningOut(async () => {
      await signOutClientSession({ notify: setError });
    });
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        onClick={handleSwitchAccount}
        disabled={isPending}
        focusableWhenDisabled={isPending}
        aria-labelledby={labelId}
        aria-describedby={error ? errorId : undefined}
      >
        <span id={labelId}>
          {isPending ? "Signing out…" : "Switch account"}
        </span>
      </Button>
      <span role="status" className="sr-only">
        {isPending ? "Signing out…" : ""}
      </span>
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="order-last w-full text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
    </>
  );
}
