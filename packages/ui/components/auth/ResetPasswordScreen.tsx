"use client";

import {
  getDefaultPostLoginPathForApp,
  type AppId,
} from "@asym/auth/demo-login";
import { PASSWORD_RECOVERY_PATHS } from "@asym/auth/password-recovery";
import { createBrowserClient } from "@asym/database/supabase";
import { KeyRound, LinkIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  AuthButton,
  AuthCard,
  AuthCardContent,
  AuthCardDescription,
  AuthCardHeader,
  AuthCardTitle,
  AuthInput,
  AuthLabel,
  AuthMark,
  AuthMessage,
  AuthShell,
} from "./auth-primitives";
import { ButtonLink } from "../shadcn/button";

/** Matches registration and the change-password form. */
const MIN_PASSWORD_LENGTH = 8;

export interface ResetPasswordScreenProps {
  appId: AppId;
  /**
   * The recovery the server read from the session (`readPasswordRecovery`),
   * or null when the session was not created by a recent recovery link.
   * `secondsLeft` is the time left in the recovery window when the page was
   * read; the form refuses to save after it.
   */
  recovery: { email: string | null; secondsLeft: number } | null;
  requestHref?: string;
  loginHref?: string;
}

type Field = "password" | "confirmation";

/** What stops the save, and the field at fault when there is one. */
type Problem =
  | { kind: "field"; field: Field; message: string }
  | { kind: "save"; message: string }
  | { kind: "expired" };

function validate(password: string, confirmation: string): Problem | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      kind: "field",
      field: "password",
      message: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }
  if (confirmation !== password) {
    return {
      kind: "field",
      field: "confirmation",
      message: "The passwords don’t match.",
    };
  }
  return null;
}

function toSaveErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "Your new password couldn’t be saved. Try again.";
}

/**
 * The last step of password recovery: the person chooses a new password and
 * continues to the app signed in. Offered only to a session that a recovery
 * link created; anything else gets an explanation and a way to ask for a new
 * link.
 */
export function ResetPasswordScreen({
  appId,
  recovery,
  requestHref = PASSWORD_RECOVERY_PATHS.request,
  loginHref = "/login",
}: ResetPasswordScreenProps) {
  if (!recovery) {
    return (
      <ExpiredRecoveryLink requestHref={requestHref} loginHref={loginHref} />
    );
  }

  return (
    <NewPasswordForm
      appId={appId}
      email={recovery.email}
      secondsLeft={recovery.secondsLeft}
      requestHref={requestHref}
    />
  );
}

function ExpiredRecoveryLink({
  requestHref,
  loginHref,
}: {
  requestHref: string;
  loginHref: string;
}) {
  return (
    <AuthShell>
      <AuthCard>
        <AuthCardHeader>
          <AuthMark icon={<LinkIcon />} />
          <AuthCardTitle>This link has expired</AuthCardTitle>
          <AuthCardDescription>
            A reset link works once, for a limited time, and only in the browser
            that asked for it. This one has expired, was already used, or was
            opened in a different browser.
          </AuthCardDescription>
        </AuthCardHeader>
        <AuthCardContent>
          <div className="flex flex-col gap-3">
            <ButtonLink render={<Link href={requestHref} />}>
              Send a new link
            </ButtonLink>
            <ButtonLink variant="ghost" render={<Link href={loginHref} />}>
              Back to sign in
            </ButtonLink>
          </div>
        </AuthCardContent>
      </AuthCard>
    </AuthShell>
  );
}

function NewPasswordForm({
  appId,
  email,
  secondsLeft,
  requestHref,
}: {
  appId: AppId;
  email: string | null;
  secondsLeft: number;
  requestHref: string;
}) {
  const { replace, refresh } = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");
  const [problem, setProblem] = React.useState<Problem | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const submissionInFlight = React.useRef(false);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const confirmationRef = React.useRef<HTMLInputElement>(null);
  // When the recovery window ends, on this browser's clock, counted from the
  // time left the server gave. The server checks the window only when the
  // page renders, so a form left open past it stops here.
  const deadline = React.useRef<number | null>(null);
  // The time left that the deadline was counted from. React runs this Effect
  // again when a page that Next kept hidden is shown again (back and forward,
  // a soft navigation away and back), with the same time left as before.
  // Counting again from then would start the window over, so the deadline is
  // set once for each value the server gives.
  const countedFrom = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (countedFrom.current === secondsLeft) return;
    countedFrom.current = secondsLeft;
    deadline.current = Date.now() + secondsLeft * 1000;
  }, [secondsLeft]);
  // Generated ids: a hidden, still-mounted earlier screen may use the same names.
  const passwordId = React.useId();
  const confirmationId = React.useId();
  const hintId = React.useId();
  const errorId = React.useId();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionInFlight.current) return;

    if (deadline.current !== null && Date.now() > deadline.current) {
      setProblem({ kind: "expired" });
      return;
    }

    const invalid = validate(password, confirmation);
    setProblem(invalid);
    if (invalid?.kind === "field") {
      const field =
        invalid.field === "password" ? passwordRef : confirmationRef;
      field.current?.focus();
      return;
    }

    submissionInFlight.current = true;
    setIsSaving(true);
    try {
      const supabase = createBrowserClient();
      const { error: saveError } = await supabase.auth.updateUser({
        password,
      });
      if (saveError) throw saveError;
      replace(getDefaultPostLoginPathForApp(appId));
      refresh();
    } catch (cause) {
      setProblem({ kind: "save", message: toSaveErrorMessage(cause) });
    } finally {
      submissionInFlight.current = false;
      setIsSaving(false);
    }
  };

  // Only the field at fault is marked invalid and points at the message.
  const fieldAtFault = problem?.kind === "field" ? problem.field : null;
  const describedBy = (field: Field, hint?: string) =>
    [hint, fieldAtFault === field ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <AuthShell>
      <AuthCard>
        <AuthCardHeader>
          <AuthMark icon={<KeyRound />} />
          <AuthCardTitle>Choose a new password</AuthCardTitle>
          <AuthCardDescription>
            {email
              ? `For ${email}. You’ll stay signed in after you save it.`
              : "You’ll stay signed in after you save it."}
          </AuthCardDescription>
        </AuthCardHeader>
        <AuthCardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <AuthLabel htmlFor={passwordId}>New password</AuthLabel>
              <AuthInput
                ref={passwordRef}
                id={passwordId}
                type="password"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={fieldAtFault === "password" ? true : undefined}
                aria-describedby={describedBy("password", hintId)}
                required
              />
              <p id={hintId} className="text-sm text-muted-foreground">
                At least {MIN_PASSWORD_LENGTH} characters. A short phrase works
                well.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <AuthLabel htmlFor={confirmationId}>
                Confirm new password
              </AuthLabel>
              <AuthInput
                ref={confirmationRef}
                id={confirmationId}
                type="password"
                autoComplete="new-password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                aria-invalid={
                  fieldAtFault === "confirmation" ? true : undefined
                }
                aria-describedby={describedBy("confirmation")}
                required
              />
            </div>

            {problem?.kind === "expired" ? (
              <AuthMessage id={errorId} tone="error">
                This link has expired: a new password can be chosen only for a
                limited time after the link is opened.{" "}
                <Link
                  href={requestHref}
                  className="font-medium underline underline-offset-4"
                >
                  Send a new link
                </Link>
              </AuthMessage>
            ) : problem ? (
              <AuthMessage id={errorId} tone="error">
                {problem.message}
              </AuthMessage>
            ) : null}

            <AuthButton type="submit" loading={isSaving}>
              Save new password
            </AuthButton>
          </form>
        </AuthCardContent>
      </AuthCard>
    </AuthShell>
  );
}
