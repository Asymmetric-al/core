"use client";

import * as React from "react";

interface QuickActionsSlotProps {
  /** Phase 5 macros / canned-response palette mounts these nodes. */
  children?: React.ReactNode;
}

/**
 * Empty slot rendered inside the composer chrome. Phase 5 will pass children
 * (canned response launcher, macro picker, slash menu trigger) without
 * requiring any composer rewrite.
 */
export function QuickActionsSlot({ children }: QuickActionsSlotProps) {
  if (!children) return null;
  return <div className="flex items-center gap-1.5">{children}</div>;
}
