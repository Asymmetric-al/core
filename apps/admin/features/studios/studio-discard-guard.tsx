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
import { useCallback, useEffect, useState } from "react";

export function useStudioDiscardGuard(dirty: boolean) {
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  useEffect(() => {
    if (!dirty) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [dirty]);

  const requestAction = useCallback(
    (action: () => void) => {
      if (dirty) setPendingAction(() => action);
      else action();
    },
    [dirty],
  );
  const cancel = useCallback(() => setPendingAction(null), []);
  const confirm = () => {
    setPendingAction(null);
    pendingAction?.();
  };
  return { pending: pendingAction !== null, requestAction, cancel, confirm };
}

export function StudioDiscardDialog({
  guard,
}: {
  guard: ReturnType<typeof useStudioDiscardGuard>;
}) {
  return (
    <AlertDialog
      open={guard.pending}
      onOpenChange={(open) => {
        if (!open) guard.cancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
          <AlertDialogDescription>
            Your changes have not been saved. Discard them to open another
            template or start again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={guard.cancel}>
            Keep editing
          </AlertDialogCancel>
          <AlertDialogAction onClick={guard.confirm}>
            Discard changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
