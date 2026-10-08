"use client";

import { signOutClientSession } from "@asym/auth/client-session";
import { Button } from "@asym/ui/components/shadcn/button";
import { useId, useState, useTransition } from "react";

export function SwitchAccountButton() {
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
        variant="outline"
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
          className="w-full text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
    </>
  );
}
