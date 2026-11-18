"use client";

import { reloadDocument } from "@asym/database/document-reload";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@asym/ui/components/shadcn/alert-dialog";

import {
  dismissWebStudioRefusal,
  useWebStudioRefusalNotice,
} from "./web-studio-refusal-notice";
import { WEB_STUDIO_REFUSAL_MESSAGES } from "../../../cms/auth/web-studio-refusal";

import type { WebStudioRefusal } from "../../../cms/auth/web-studio-refusal";

const TITLES: Record<WebStudioRefusal, string> = {
  no_session: "Your session has ended",
  no_selection: "Choose an organization first",
  scope_mismatch: "This page belongs to another organization",
};

/**
 * Asks the person to reload once a Web Studio REST call is refused (AL-2675,
 * council C2), on any screen, including those where Payload shows no error
 * of its own, such as a bulk action. It opens once per document; "Not now"
 * keeps the page so the person can copy what they typed, and nothing was
 * saved. Reloading takes them to sign-in, the chooser or the organization
 * now chosen, as the proxy decides.
 */
export function WebStudioRefusalDialog() {
  const refusal = useWebStudioRefusalNotice();
  if (refusal === null) return null;

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open) dismissWebStudioRefusal();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{TITLES[refusal]}</AlertDialogTitle>
          <AlertDialogDescription>
            {WEB_STUDIO_REFUSAL_MESSAGES[refusal]}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Not now</AlertDialogCancel>
          <AlertDialogAction onClick={() => reloadDocument()}>
            Reload
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
