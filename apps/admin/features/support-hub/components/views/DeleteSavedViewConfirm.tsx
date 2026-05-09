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

  const handleDelete = async () => {
    if (!view) return;
    try {
      await deleteSavedView.mutateAsync({ id: view.id });
      toast.success("View deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete the view.",
      );
    } finally {
      onClose();
    }
  };

  return (
    <AlertDialog
      open={view !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
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
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
          >
            Delete view
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
