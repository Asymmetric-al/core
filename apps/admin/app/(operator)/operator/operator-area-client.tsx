"use client";

import { signOutClientSession } from "@asym/auth/client-session";
import {
  readFactorState,
  removeFactor,
  startEnrolment,
  verifyCode,
  type FactorState,
  type VerifiedFactor,
} from "@asym/auth/operator-mfa";
import { Alert, AlertDescription } from "@asym/ui/components/shadcn/alert";
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
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  Field,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@asym/ui/components/shadcn/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@asym/ui/components/shadcn/input-otp";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";

import type { FormEvent } from "react";

const CODE_LENGTH = 6;
const VERIFIED_TEXT = "Your session is verified with a second factor.";
const REFUSED_TEXT =
  "The database did not confirm your operator session. Sign out and sign in again.";
const ENROLMENT_TEXT =
  "Operator actions need a second factor. Scan this code with an authenticator app, or enter the key by hand.";
const LOST_TEXT =
  "Ask the release owner to remove the lost factor and end your other sessions. You then set up a new authenticator here.";
const REMOVE_TEXT =
  "You will no longer be able to sign in to the operator area with this authenticator.";

type View = { kind: "loading" } | FactorState;

interface PendingEnrolment {
  factorId: string;
  qrCode: string;
  secret: string;
}

const RAW_SVG_PREFIX = "data:image/svg+xml;utf-8,";

function qrImageSource(qrCode: string): string {
  if (!qrCode.startsWith(RAW_SVG_PREFIX)) return qrCode.trim();
  const svg = qrCode.slice(RAW_SVG_PREFIX.length).trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function groupsOfFour(secret: string): string {
  return (secret.match(/.{1,4}/g) ?? []).join(" ");
}

function addedOn(createdAt: string): string {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime())
    ? createdAt
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function CodeField({
  id,
  labelledBy,
  value,
  onValueChange,
  disabled,
}: {
  id: string;
  labelledBy?: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <InputOTP
      id={id}
      length={CODE_LENGTH}
      autoComplete="one-time-code"
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      data-sentry-block=""
    >
      <InputOTPGroup>
        {Array.from({ length: CODE_LENGTH }, (_slot, index) => (
          <InputOTPSlot
            key={index}
            aria-labelledby={index === 0 ? labelledBy : undefined}
            aria-label={
              index === 0 ? undefined : `Digit ${index + 1} of ${CODE_LENGTH}`
            }
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}

function FailureAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

function EnrolmentPanel({
  mode,
  onVerified,
  onReread,
}: {
  mode: "first" | "another";
  onVerified: () => void;
  onReread: () => void;
}) {
  const [enrolment, setEnrolment] = useState<PendingEnrolment | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  const codeId = useId();
  const titleId = useId();

  async function start() {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setMessage(null);
    try {
      const result = await startEnrolment();
      if (result.ok) {
        setCode("");
        setEnrolment({
          factorId: result.factorId,
          qrCode: result.qrCode,
          secret: result.secret,
        });
      } else if (result.reread) {
        onReread();
      } else {
        setMessage(result.message);
      }
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enrolment || inFlight.current || code.length !== CODE_LENGTH) return;
    inFlight.current = true;
    setPending(true);
    setMessage(null);
    try {
      const result = await verifyCode(enrolment.factorId, code);
      if (result.ok) {
        setEnrolment(null);
        setCode("");
        onVerified();
      } else if (result.reread) {
        setEnrolment(null);
        setCode("");
        onReread();
      } else {
        setCode("");
        setMessage(result.message);
      }
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  async function cancel() {
    if (!enrolment || inFlight.current) return;
    const { factorId } = enrolment;
    inFlight.current = true;
    setEnrolment(null);
    setCode("");
    setMessage(null);
    setPending(true);
    try {
      const result = await removeFactor(factorId);
      if (!result.ok) {
        if (result.message) setMessage(result.message);
        if (result.reread) onReread();
      }
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  if (!enrolment && mode === "another") {
    return (
      <div className="flex flex-col gap-3">
        <div>
          <Button variant="outline" onClick={start} disabled={pending}>
            Add another authenticator
          </Button>
        </div>
        <FailureAlert message={message} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 id={titleId} className="text-lg font-semibold tracking-tight">
            Set up an authenticator
          </h2>
        </CardTitle>
        <CardDescription>{ENROLMENT_TEXT}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {enrolment ? (
          <form className="flex flex-col gap-6" onSubmit={submit}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <Image
                src={qrImageSource(enrolment.qrCode)}
                alt="QR code for your authenticator app"
                width={176}
                height={176}
                unoptimized
                data-sentry-block=""
                className="shrink-0 rounded-md border border-border bg-white p-2"
              />
              <FieldSet className="min-w-0 gap-2">
                <FieldLegend variant="label" className="mb-0">
                  Key
                </FieldLegend>
                <code
                  data-sentry-block=""
                  className="font-mono text-sm break-all text-foreground"
                >
                  {groupsOfFour(enrolment.secret)}
                </code>
              </FieldSet>
            </div>
            <Field>
              <FieldLabel htmlFor={codeId}>
                Enter the 6-digit code from the app
              </FieldLabel>
              <CodeField
                id={codeId}
                value={code}
                onValueChange={setCode}
                disabled={pending}
              />
            </Field>
            <FailureAlert message={message} />
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  disabled={pending || code.length !== CODE_LENGTH}
                >
                  Verify and continue
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancel}
                  disabled={pending}
                >
                  Cancel
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Verifying signs you out on your other devices.
              </p>
            </div>
          </form>
        ) : (
          <>
            <div>
              <Button onClick={start} disabled={pending}>
                Set up an authenticator
              </Button>
            </div>
            <FailureAlert message={message} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ChallengePanel({
  factorIds,
  onVerified,
  onReread,
  stopped,
}: {
  factorIds: string[];
  onVerified: () => void;
  onReread: () => void;
  stopped: () => boolean;
}) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const inFlight = useRef(false);
  const titleId = useId();
  const codeId = useId();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || code.length !== CODE_LENGTH || stopped()) return;
    inFlight.current = true;
    setPending(true);
    setMessage(null);
    try {
      let failure: string | null = null;
      for (const factorId of factorIds) {
        if (stopped()) return;
        const result = await verifyCode(factorId, code);
        if (result.ok) {
          setCode("");
          onVerified();
          return;
        }
        if (result.reread) {
          onReread();
          return;
        }
        failure = result.message;
        if (!result.mismatch) break;
      }
      if (stopped()) return;
      setCode("");
      setMessage(failure);
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 id={titleId} className="text-lg font-semibold tracking-tight">
            Enter your code
          </h2>
        </CardTitle>
        <CardDescription>
          Open your authenticator app and enter the current 6-digit code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <CodeField
            id={codeId}
            labelledBy={titleId}
            value={code}
            onValueChange={setCode}
            disabled={pending}
          />
          <FailureAlert message={message} />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="submit"
              disabled={pending || code.length !== CODE_LENGTH}
            >
              Verify
            </Button>
            <Button
              type="button"
              variant="link"
              aria-expanded={helpOpen}
              onClick={() => setHelpOpen((open) => !open)}
            >
              Lost your authenticator?
            </Button>
          </div>
          {helpOpen ? (
            <p className="text-sm text-muted-foreground">{LOST_TEXT}</p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}

function AreaPanel({
  factors,
  onChanged,
  signingOut,
}: {
  factors: VerifiedFactor[];
  onChanged: () => void;
  signingOut: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [target, setTarget] = useState<VerifiedFactor | null>(null);
  const [awaitingList, setAwaitingList] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const removing = useRef(false);
  const titleId = useId();
  const canRemove = factors.length >= 2 && !awaitingList;

  function askToRemove(factor: VerifiedFactor) {
    if (removing.current || awaitingList) return;
    setMessage(null);
    setTarget(factor);
    setDialogOpen(true);
  }

  async function confirmRemoval() {
    if (!target || removing.current || awaitingList) return;
    removing.current = true;
    setAwaitingList(true);
    setDialogOpen(false);
    setMessage(null);
    try {
      const result = await removeFactor(target.id);
      if (result.ok || result.reread) {
        onChanged();
        return;
      }
      setAwaitingList(false);
      setMessage(result.message);
    } finally {
      removing.current = false;
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Alert variant="success">
        <AlertDescription>{VERIFIED_TEXT}</AlertDescription>
      </Alert>
      <FailureAlert message={message} />
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 id={titleId} className="text-lg font-semibold tracking-tight">
              Authenticators
            </h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ItemGroup aria-labelledby={titleId} className="gap-2">
            {factors.map((factor) => (
              <Item key={factor.id} variant="outline" size="sm">
                <ItemContent>
                  <ItemTitle>{factor.friendlyName}</ItemTitle>
                  <ItemDescription>
                    Added {addedOn(factor.createdAt)}
                  </ItemDescription>
                </ItemContent>
                {canRemove ? (
                  <ItemActions>
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={`Remove ${factor.friendlyName}`}
                      onClick={() => askToRemove(factor)}
                    >
                      Remove
                    </Button>
                  </ItemActions>
                ) : null}
              </Item>
            ))}
          </ItemGroup>
        </CardContent>
      </Card>
      {signingOut ? null : (
        <EnrolmentPanel
          mode="another"
          onVerified={onChanged}
          onReread={onChanged}
        />
      )}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {target?.friendlyName ?? "this authenticator"}?
            </AlertDialogTitle>
            <AlertDialogDescription>{REMOVE_TEXT}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmRemoval}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StateBody({
  view,
  version,
  signingOut,
  isSigningOut,
  reread,
}: {
  view: FactorState;
  version: number;
  signingOut: boolean;
  isSigningOut: () => boolean;
  reread: () => void;
}) {
  switch (view.kind) {
    case "enrol":
      return signingOut ? null : (
        <EnrolmentPanel mode="first" onVerified={reread} onReread={reread} />
      );
    case "challenge":
      return signingOut ? null : (
        <ChallengePanel
          factorIds={view.factorIds}
          onVerified={reread}
          onReread={reread}
          stopped={isSigningOut}
        />
      );
    case "area":
      return (
        <AreaPanel
          key={version}
          factors={view.factors}
          onChanged={reread}
          signingOut={signingOut}
        />
      );
    case "refused":
      return (
        <Alert variant="destructive">
          <AlertDescription>{REFUSED_TEXT}</AlertDescription>
        </Alert>
      );
    case "failed":
      return (
        <div className="flex flex-col gap-3">
          <Alert variant="destructive">
            <AlertDescription>{view.message}</AlertDescription>
          </Alert>
          <div>
            <Button variant="outline" onClick={reread}>
              Try again
            </Button>
          </div>
        </div>
      );
  }
}

export function OperatorAreaClient() {
  const [view, setView] = useState<View>({ kind: "loading" });
  const [version, setVersion] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  const signingOutRef = useRef(false);
  const reads = useRef(0);

  const reread = useCallback(() => {
    reads.current += 1;
    const turn = reads.current;
    void readFactorState().then((next) => {
      if (turn !== reads.current) return;
      setView(next);
      setVersion((current) => current + 1);
    });
  }, []);

  const isSigningOut = useCallback(() => signingOutRef.current, []);

  useEffect(() => {
    reread();
  }, [reread]);

  async function signOut() {
    signingOutRef.current = true;
    flushSync(() => setSigningOut(true));
    const result = await signOutClientSession();
    if (!result.ok || !result.redirected) {
      signingOutRef.current = false;
      setSigningOut(false);
    }
  }

  if (view.kind === "loading") {
    return (
      <div className="flex max-w-xl flex-col gap-4" aria-busy="true">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <StateBody
        view={view}
        version={version}
        signingOut={signingOut}
        isSigningOut={isSigningOut}
        reread={reread}
      />
      <div>
        <Button variant="outline" onClick={signOut} disabled={signingOut}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
