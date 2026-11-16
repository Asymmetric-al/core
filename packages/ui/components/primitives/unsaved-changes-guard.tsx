"use client";

import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../shadcn/alert-dialog";

/** The link a plain left click would follow to another in-app page. */
function inAppLink(event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return null;
  }
  const link =
    event.target instanceof Element ? event.target.closest("a[href]") : null;
  if (
    !(link instanceof HTMLAnchorElement) ||
    link.target === "_blank" ||
    link.hasAttribute("download")
  ) {
    return null;
  }
  const url = new URL(link.href, window.location.href);
  const here = window.location;
  if (url.origin !== here.origin) return null;
  if (url.pathname === here.pathname && url.search === here.search) {
    return null;
  }
  return link;
}

/**
 * Asks before an in-app link would leave unsaved changes behind. Next.js
 * links skip navigation once a click is prevented, so the click is held here
 * and the same link is followed again if the person chooses to leave.
 */
export function UnsavedChangesGuard({
  when,
  description = "Your changes haven’t been saved and will be lost.",
}: {
  when: boolean;
  description?: string;
}) {
  const [pendingLink, setPendingLink] =
    React.useState<HTMLAnchorElement | null>(null);
  const leaving = React.useRef(false);

  React.useEffect(() => {
    if (!when) return;
    const holdNavigation = (event: MouseEvent) => {
      if (leaving.current) return;
      const link = inAppLink(event);
      if (!link) return;
      event.preventDefault();
      setPendingLink(link);
    };
    document.addEventListener("click", holdNavigation, true);
    return () => document.removeEventListener("click", holdNavigation, true);
  }, [when]);

  const leave = () => {
    const link = pendingLink;
    setPendingLink(null);
    if (!link?.isConnected) return;
    leaving.current = true;
    link.click();
    leaving.current = false;
  };

  return (
    <AlertDialog
      open={pendingLink !== null}
      onOpenChange={(open) => {
        if (!open) setPendingLink(null);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={leave}>
            Leave
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
