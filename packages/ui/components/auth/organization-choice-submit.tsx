"use client";

import { useFormStatus } from "react-dom";

import { Button } from "../shadcn/button";
import { Spinner } from "../shadcn/spinner";

import type { ReactNode } from "react";

/**
 * The submit button of one Web Studio chooser option. While its choice is
 * posted it shows a spinner, is marked busy and takes no second press, so a
 * slow answer never looks like a dead button (AL-2675, council C11).
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
      disabled={pending}
      aria-busy={pending || undefined}
    >
      {pending ? <Spinner aria-hidden="true" data-icon="inline-start" /> : null}
      {children}
    </Button>
  );
}
