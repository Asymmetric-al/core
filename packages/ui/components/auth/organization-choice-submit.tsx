"use client";

import { useFormStatus } from "react-dom";

import { Button } from "../shadcn/button";
import { Spinner } from "../shadcn/spinner";

import type { ReactNode } from "react";

/**
 * The submit button of one Web Studio chooser option. While its choice is
 * posted it shows a spinner, is marked busy and unavailable, and takes no
 * second press, so a slow answer never looks like a dead button (AL-2675,
 * council C11). It stays focusable meanwhile, so keyboard focus is not
 * dropped as it would be from a disabled button (council round 2): it is
 * marked `aria-disabled` and refuses the press itself, because the shared
 * Button never keeps a disabled submit button focusable.
 */
export function OrganizationChoiceSubmit({
  children,
}: {
  children: ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      className="w-full"
      aria-disabled={pending || undefined}
      aria-busy={pending || undefined}
      onClick={(event) => {
        if (pending) event.preventDefault();
      }}
    >
      {pending ? <Spinner aria-hidden="true" data-icon="inline-start" /> : null}
      {children}
    </Button>
  );
}
