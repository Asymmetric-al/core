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
} from "@asym/ui/components/shadcn/alert-dialog";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import * as React from "react";
import { toast } from "sonner";

import { useDeleteSupportSavedView } from "../../hooks/use-support-mutations";

import type { SupportSavedView } from "../../types";

interface DeleteSavedViewConfirmProps {
  view: SupportSavedView | null;
  onClose: () => void;
}

/**
 * Confirms a destructive saved-view delete. The Phase 2 collection writer
 * removes the row in-memory; future Supabase swap reuses the same hook.
 */
export function DeleteSavedViewConfirm({
  view,
  onClose,
}: DeleteSavedViewConfirmProps) {
  const deleteSavedView = useDeleteSupportSavedView();
  const busyRef = React.useRef(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleDelete = async () => {
    if (!view || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await deleteSavedView.mutateAsync({ id: view.id });
      toast.success("View deleted.");
      onClose();
    } catch {
      setError("Could not delete the view. Try again.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  return (
    <AlertDialog
      open={view !== null}
      onOpenChange={(open) => {
        if (!open && !busyRef.current) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete saved view</AlertDialogTitle>
          <AlertDialogDescription>
            Remove <span className="font-medium">{view?.name}</span> from saved
            views? Anyone using it will lose the link.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={busy}
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
          >
            {busy ? <Spinner aria-hidden="true" /> : null}
            Delete view
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
