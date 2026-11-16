"use client";

import { useEffect } from "react";

/**
 * Payload popup triggers drawn from a consumer's own element
 * (`buttonType="custom"`) that carry `aria-haspopup` but no role. Payload's
 * upload FileToolbar passes a `<span>` (the filename that opens "Replace
 * file"), so the trigger has no role that allows `aria-expanded` or
 * `aria-haspopup`. Elements with an implicit or explicit role are left alone.
 */
const ROLELESS_POPUP_TRIGGER =
  ":is(span, div).popup-button--custom[aria-haspopup]:not([role])";

function assignPopupTriggerRoles(root: ParentNode) {
  for (const trigger of root.querySelectorAll(ROLELESS_POPUP_TRIGGER)) {
    // Payload already makes it focusable and opens it on Enter and Space, so
    // it is a button in every way but its role.
    trigger.setAttribute("role", "button");
  }
}

/**
 * Gives Payload's roleless popup triggers inside `root` the button role,
 * including triggers Payload mounts later (an upload's toolbar appears once
 * its file loads). React never sets `role` on these triggers, so a re-render
 * keeps the attribute.
 */
export function usePopupTriggerRoles(root: HTMLElement | null) {
  useEffect(() => {
    if (!root) return;
    assignPopupTriggerRoles(root);
    const observer = new MutationObserver(() => assignPopupTriggerRoles(root));
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [root]);
}
