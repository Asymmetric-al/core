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

type FocusReturn = {
  opener: HTMLElement | null;
  fallbacks: (Element | null | undefined)[];
  confirmed: boolean;
};

// Skip what Base UI's tabbable() skips, so both paths pick the same target.
const TABBABLE = [
  "button:not([disabled])",
  "a[href]",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]",
]
  .map((selector) => `${selector}:not([tabindex="-1"])`)
  .join(", ");

function firstConnected(elements: FocusReturn["fallbacks"]) {
  return elements.find(
    (element): element is HTMLElement =>
      element instanceof HTMLElement && element.isConnected,
  );
}

// The list can also drop the row just after the dialog returned focus to its
// opener, which leaves focus on <body>; follow the row's neighbour then, until
// the person moves on.
function followRemovedOpener({ opener, fallbacks }: FocusReturn) {
  const stop = () => {
    observer.disconnect();
    document.removeEventListener("focusin", onFocusIn);
    document.removeEventListener("pointerdown", stop, true);
    document.removeEventListener("keydown", stop, true);
  };
  const onFocusIn = (event: FocusEvent) => {
    if (event.target !== opener) stop();
  };
  const observer = new MutationObserver(() => {
    if (opener?.isConnected) return;
    stop();
    const active = document.activeElement;
    if (active && active !== document.body) return;
    const container = firstConnected(fallbacks);
    const target = container?.matches(TABBABLE)
      ? container
      : container?.querySelector<HTMLElement>(TABBABLE);
    target?.focus();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener("focusin", onFocusIn);
  document.addEventListener("pointerdown", stop, true);
  document.addEventListener("keydown", stop, true);
  return stop;
}

function findOpener(click: MouseEvent | null): HTMLElement | null {
  // Safari does not focus a clicked button, so prefer the control whose click
  // is still being dispatched over whatever kept focus.
  if (
    click &&
    click.eventPhase !== Event.NONE &&
    click.target instanceof Element
  ) {
    const clicked = click.target.closest<HTMLElement>(
      "button, a[href], [tabindex]",
    );
    if (clicked) return clicked;
  }
  const active = document.activeElement;
  return active instanceof HTMLElement && active !== document.body
    ? active
    : null;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = React.useState<PendingRequest | null>(null);
  const [pending, setPending] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const busy = React.useRef(false);
  const lastClick = React.useRef<MouseEvent | null>(null);
  const focusReturn = React.useRef<FocusReturn>({
    opener: null,
    fallbacks: [],
    confirmed: false,
  });
  const stopFollowing = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    const onClick = (event: MouseEvent) => {
      lastClick.current = event;
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      stopFollowing.current?.();
    };
  }, []);

  const confirm = React.useCallback<Confirm>(
    (options) =>
      new Promise<boolean>((resolve) => {
        stopFollowing.current?.();
        const opener = findOpener(lastClick.current);
        const row = opener?.closest('li, [role="listitem"]');
        focusReturn.current = {
          opener,
          fallbacks: [
            row?.nextElementSibling,
            row?.previousElementSibling,
            opener?.closest('[role="region"], [role="dialog"]'),
          ],
          confirmed: false,
        };
        setFailed(false);
        setRequest({ ...options, resolve });
      }),
    [],
  );
  // A confirmed delete usually removes the opener's row before the dialog
  // closes, and Base UI would then fall back to whichever element an earlier
  // popup left behind. Base UI focuses the first tabbable inside the target.
  const finalFocus = React.useCallback((): HTMLElement | true => {
    const plan = focusReturn.current;
    if (plan.opener?.isConnected) {
      if (plan.confirmed) {
        stopFollowing.current?.();
        stopFollowing.current = followRemovedOpener(plan);
      }
      return plan.opener;
    }
    return firstConnected(plan.fallbacks) ?? true;
  }, []);
  const settle = (value: boolean) => {
    if (busy.current) return;
    focusReturn.current.confirmed = value;
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
      focusReturn.current.confirmed = true;
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
        <AlertDialogContent finalFocus={finalFocus}>
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
