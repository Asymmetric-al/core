"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@asym/ui/components/shadcn/alert-dialog";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  toast,
  useConfig,
  useDocumentInfo,
  useForm,
  useLocale,
} from "@payloadcms/ui";
import { Undo2 } from "lucide-react";
import { formatAdminURL } from "payload/shared";
import { useState } from "react";

type RevertResponse = {
  doc?: Record<string, unknown>;
  message?: string;
  error?: string;
  errors?: Array<{ message?: string }>;
};

const REVERT_FAILED = "The document couldn't be reverted. Try again.";

function reloadDocument() {
  window.location.reload();
}

/**
 * "Revert to published" for the document action bar, shown only on a live
 * document with a newer draft that the viewer may edit.
 *
 * It does what Payload's `Status` element does: read the published version
 * and save it back over the draft, then reset the form to it. It reads
 * Payload's providers through the client barrel; the deep-imported `Status`
 * read separate provider modules, saw no document and never offered the
 * action.
 */
export function NativeRevertToPublished({
  onReverted = reloadDocument,
}: {
  /** After a successful revert; reloads the document view by default. */
  onReverted?: () => void;
} = {}) {
  const {
    id,
    collectionSlug,
    docPermissions,
    hasPublishedDoc,
    incrementVersionCount,
    isTrashed,
    setMostRecentVersionIsAutosaved,
    setUnpublishedVersionCount,
    unpublishedVersionCount,
  } = useDocumentInfo();
  const {
    config: {
      routes: { api },
    },
  } = useConfig();
  const { reset } = useForm();
  const locale = useLocale()?.code;
  const [pending, setPending] = useState(false);

  const changed =
    Boolean(hasPublishedDoc) && (unpublishedVersionCount ?? 0) > 0;
  if (
    !changed ||
    isTrashed ||
    !docPermissions?.update ||
    !collectionSlug ||
    id === undefined ||
    id === null
  ) {
    return null;
  }

  const revert = async () => {
    setPending(true);
    // A collection without localization has no locale to pass.
    const query = locale
      ? `locale=${locale}&fallback-locale=null&depth=0`
      : "depth=0";
    const url = formatAdminURL({
      apiRoute: api,
      path: `/${collectionSlug}/${id}?${query}`,
    });
    const headers = { "Content-Type": "application/json" };
    try {
      // Without `draft=true` Payload returns the published version.
      const publishedResponse = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers,
      });
      if (!publishedResponse.ok) {
        toast.error(REVERT_FAILED);
        return;
      }
      const published = await publishedResponse.json();
      const response = await fetch(url, {
        method: "PATCH",
        credentials: "include",
        headers,
        body: JSON.stringify(published),
      });
      const json = (await response.json().catch(() => ({}))) as RevertResponse;
      if (response.status === 200 && json.doc) {
        // As Payload's Status does: the form rebuilds from the published
        // document in the background while the bar updates at once.
        void reset(json.doc);
        toast.success(json.message ?? "Reverted to the published version.");
        incrementVersionCount();
        setMostRecentVersionIsAutosaved(false);
        setUnpublishedVersionCount(0);
        // Payload's document state (unpublished count, form, header) is
        // client state that a route refresh does not reset, so the view is
        // reloaded and every panel then describes the published version.
        onReverted();
        return;
      }
      toast.error(json.errors?.[0]?.message ?? json.error ?? REVERT_FAILED);
    } catch {
      toast.error(REVERT_FAILED);
    } finally {
      setPending(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button type="button" variant="ghost" size="sm" disabled={pending}>
            <Undo2 aria-hidden="true" />
            Revert to published
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revert to the published version?</AlertDialogTitle>
          <AlertDialogDescription>
            Discard the unpublished changes and restore what is live now. The
            draft stays in the version history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep draft</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              void revert();
            }}
          >
            Revert
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
