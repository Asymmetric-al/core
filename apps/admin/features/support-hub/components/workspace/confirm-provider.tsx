"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@asym/ui/components/shadcn/alert-dialog";
import { Button } from "@asym/ui/components/shadcn/button";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import * as React from "react";

export type ConfirmOptions = {
  title: string;
  description?: string;
  /** The destructive action's label, e.g. "Delete label". */
  confirmLabel: string;
  action?: () => Promise<void>;
};

type Confirm = (options: ConfirmOptions) => Promise<boolean>;

// Outside the provider (isolated component tests) fall back to the browser
// prompt so callers keep one code path.
const ConfirmContext = React.createContext<Confirm>(async (options) => {
  if (typeof window === "undefined" || !window.confirm(options.title))
    return false;
  await options.action?.();
  return true;
});

/** Asks before a destructive Support Hub action, with an AlertDialog. */
export function useConfirm(): Confirm {
  return React.useContext(ConfirmContext);
}

type PendingRequest = ConfirmOptions & { resolve: (value: boolean) => void };

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = React.useState<PendingRequest | null>(null);
  const [pending, setPending] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const busy = React.useRef(false);
  const confirm = React.useCallback<Confirm>(
    (options) =>
      new Promise<boolean>((resolve) => {
        setFailed(false);
        setRequest({ ...options, resolve });
      }),
    [],
  );
  const settle = (value: boolean) => {
    if (busy.current) return;
    request?.resolve(value);
    setRequest(null);
  };

  const run = async () => {
    if (busy.current || !request) return;
    if (!request.action) {
      settle(true);
      return;
    }
    busy.current = true;
    setPending(true);
    setFailed(false);
    try {
      await request.action();
      request.resolve(true);
      setRequest(null);
    } catch {
      setFailed(true);
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog
        open={request !== null}
        onOpenChange={(open) => {
          if (!open) settle(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{request?.title}</AlertDialogTitle>
            {request?.description ? (
              <AlertDialogDescription>
                {request.description}
              </AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>
          {failed ? (
            <p role="alert" className="text-sm text-destructive">
              The deletion did not complete. Try again or cancel.
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() => void run()}
            >
              {pending ? (
                <Spinner aria-hidden="true" data-icon="inline-start" />
              ) : null}
              {request?.confirmLabel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}
