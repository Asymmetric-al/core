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
import { Button } from "@asym/ui/components/shadcn/button-component";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import { RotateCcw } from "lucide-react";
import { createContext, useContext, useId, useState } from "react";

import { useControl, type Control, type ControlState } from "./data";
import { Mono, StatusBadge, When, useConsole } from "./shared";
import {
  DESTRUCTIVE,
  actionKey,
  describeAction,
  type ControlAction,
  type ControlReceipt,
} from "../lib/factory";

const OUTCOME_LABEL: Record<ControlReceipt["outcome"], string> = {
  applied: "Applied",
  "already-applied": "Already applied",
  requested: "Requested, not yet observed",
  started: "Started",
  refused: "Refused",
  failed: "Not sent",
  unknown: "Outcome unknown",
  incomplete: "Incomplete",
};

const OUTCOME_BADGE: Record<ControlReceipt["outcome"], string> = {
  applied: "completed",
  "already-applied": "completed",
  requested: "waiting",
  started: "running",
  refused: "failed",
  failed: "failed",
  unknown: "INCONCLUSIVE",
  incomplete: "waiting",
};

/** The part of a control attempt a receipt needs (also satisfied by chat Apply). */
export type ReceiptSource = Pick<Control, "state" | "canRetry" | "retry">;

/** Requested → observed for one control attempt, announced politely. */
export function ReceiptView({ control }: { control: ReceiptSource }) {
  const { state } = control;
  return (
    <div aria-live="polite" className="min-w-0">
      <ReceiptBody state={state} control={control} />
    </div>
  );
}

function ReceiptBody({
  state,
  control,
}: {
  state: ControlState;
  control: ReceiptSource;
}) {
  if (state.phase === "idle") return null;
  if (state.phase === "running")
    return (
      <p role="status" className="flex items-center gap-2 text-sm">
        <Spinner aria-hidden="true" />
        Requested
        {state.requestId ? (
          <>
            {" "}
            · request <Mono>{state.requestId}</Mono>
          </>
        ) : null}
        … waiting for the factory to answer.
      </p>
    );
  if (state.phase === "error")
    return (
      <div
        role="alert"
        className="flex flex-col gap-2 rounded-lg border border-destructive p-3 text-sm"
      >
        <p className="font-medium">The control was not confirmed</p>
        <p className="break-words">{state.message}</p>
        {state.requestId ? (
          <p className="text-xs text-muted-foreground">
            Request <Mono>{state.requestId}</Mono>
          </p>
        ) : null}
        {control.canRetry ? <RetryButton control={control} /> : null}
      </div>
    );
  const { receipt } = state;
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge
          value={OUTCOME_BADGE[receipt.outcome]}
          label={OUTCOME_LABEL[receipt.outcome]}
        />
        <span className="font-medium">{receipt.label}</span>
      </div>
      <dl className="grid grid-cols-1 gap-1 sm:grid-cols-3">
        <dt className="text-muted-foreground">Requested</dt>
        <dd className="sm:col-span-2">
          <When value={receipt.requestedAt} /> ·{" "}
          <Mono>{receipt.requestId}</Mono>
        </dd>
        <dt className="text-muted-foreground">Factory answered</dt>
        <dd className="break-words sm:col-span-2">
          {receipt.message}
          {receipt.code ? (
            <span className="text-muted-foreground"> ({receipt.code})</span>
          ) : null}
        </dd>
        <dt className="text-muted-foreground">Observed after</dt>
        <dd className="break-words sm:col-span-2">
          {receipt.observed ? (
            <>
              {receipt.observed.summary}
              {receipt.observed.recorded === true
                ? " · the document records this request"
                : receipt.observed.recorded === false
                  ? " · the document does not record this request"
                  : ""}{" "}
              <span className="text-muted-foreground">
                (<When value={receipt.observed.at} />)
              </span>
            </>
          ) : (
            "The state could not be re-read; refresh before acting again."
          )}
        </dd>
      </dl>
      {control.canRetry ? <RetryButton control={control} /> : null}
    </div>
  );
}

function RetryButton({ control }: { control: ReceiptSource }) {
  return (
    <div>
      <Button size="sm" variant="outline" onClick={() => void control.retry()}>
        <RotateCcw aria-hidden="true" />
        Retry with the same request id
      </Button>
    </div>
  );
}

/**
 * A view that acts on its own read (the issue sheet, the run dialog) states
 * why that read cannot authorize a control right now (failed, stale or not
 * yet re-read), in addition to the global snapshot authority.
 */
const ViewAuthorityContext = createContext<string | null>(null);

export function ViewAuthority({
  reason,
  children,
}: {
  reason: string | null;
  children: React.ReactNode;
}) {
  return (
    <ViewAuthorityContext.Provider value={reason}>
      {children}
    </ViewAuthorityContext.Provider>
  );
}

/** Whether controls may act here, and why not. */
export function useAuthority() {
  const { authority, authorityReason } = useConsole();
  const viewReason = useContext(ViewAuthorityContext);
  return {
    allowed: authority && viewReason === null,
    /** The global reason is already shown in the connection banner. */
    global: !authority,
    reason: !authority ? authorityReason : viewReason,
  };
}

/**
 * One operator control with real effect. Destructive controls ask for an
 * explicit confirmation first; the receipt shows requested → observed.
 */
export function ControlButton({
  action,
  label,
  variant = "outline",
  disabled = false,
  disabledReason,
  confirmTitle,
  confirmBody,
}: {
  action: ControlAction;
  label?: string;
  variant?: "default" | "outline" | "secondary" | "destructive";
  disabled?: boolean;
  disabledReason?: string;
  confirmTitle?: string;
  confirmBody?: React.ReactNode;
}) {
  const { scope } = useConsole();
  const authority = useAuthority();
  const control = useControl(scope);
  const reasonId = useId();
  const [confirming, setConfirming] = useState(false);
  const destructive = DESTRUCTIVE.has(actionKey(action));
  const running = control.state.phase === "running";
  const blocked = disabled || !authority.allowed || running;
  // Losing authority (or the control becoming inapplicable) cancels an open
  // confirmation; it does not reopen when authority returns.
  if (confirming && blocked && !running) setConfirming(false);
  const reason =
    authority.reason ?? (disabled ? (disabledReason ?? null) : null);
  const text = label ?? describeAction(action);
  const go = async (confirmed: boolean) => {
    await control.run(action, { confirmed });
  };
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div>
        {/* Focusable while disabled: keyboard users can reach the control and
            its reason, and focus returns to it after a confirmation. */}
        <Button
          variant={
            destructive && variant === "outline" ? "destructive" : variant
          }
          size="sm"
          disabled={blocked}
          focusableWhenDisabled
          aria-describedby={
            reason && blocked && !running ? reasonId : undefined
          }
          onClick={() => {
            if (blocked) return;
            if (destructive) setConfirming(true);
            else void go(false);
          }}
        >
          {running ? <Spinner aria-hidden="true" /> : null}
          {text}
        </Button>
        {reason && blocked && !running ? (
          authority.global ? (
            <span id={reasonId} className="sr-only">
              Unavailable: {reason}
            </span>
          ) : (
            <p
              id={reasonId}
              className="mt-1 break-words text-xs text-muted-foreground"
            >
              {reason}
            </p>
          )
        ) : null}
      </div>
      <ReceiptView
        control={{
          state: control.state,
          retry: control.retry,
          canRetry: control.canRetry && authority.allowed,
        }}
      />
      {destructive ? (
        <AlertDialog open={confirming && !blocked} onOpenChange={setConfirming}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmTitle ?? `${text}?`}</AlertDialogTitle>
              <AlertDialogDescription>
                {confirmBody ??
                  "This takes effect through the factory's control seam. It never discards work, but it changes what the factory does next."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep things as they are</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={blocked}
                onClick={() => {
                  setConfirming(false);
                  if (blocked) return;
                  void go(true);
                }}
              >
                {text}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  );
}
