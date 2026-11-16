"use client";

import * as React from "react";

interface QuickActionsSlotProps {
  children?: React.ReactNode;
}

/**
 * Wrapper for extra actions passed as the composer's `slots.beforeSend`;
 * renders nothing when empty. No caller passes any today: macros mount in
 * the editor footer (`ComposerMacros`) and canned responses open from `/` in the editor.
 */
export function QuickActionsSlot({ children }: QuickActionsSlotProps) {
  if (!children) return null;
  return <div className="flex items-center gap-1.5">{children}</div>;
}
