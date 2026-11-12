"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Info } from "lucide-react";

import type * as React from "react";

/**
 * Says once, at the top of a settings page, which saved choices nothing uses
 * yet, so no description implies work that doesn't happen. A static note,
 * not a live alert.
 */
export function SettingsNotAppliedNote({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Alert variant="info" role="note">
      <Info aria-hidden="true" />
      <AlertTitle>Saved, not applied yet</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
