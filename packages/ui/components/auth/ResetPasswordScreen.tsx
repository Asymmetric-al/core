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
   * The recovery the server read from the session, or null when the session
   * was not created by a recent recovery link.
   */
  recovery: { email: string | null } | null;
  requestHref?: string;
  loginHref?: string;
}

function validate(password: string, confirmation: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (confirmation !== password) {
    return "The passwords don’t match.";
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

  return <NewPasswordForm appId={appId} email={recovery.email} />;
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
}: {
  appId: AppId;
  email: string | null;
}) {
  const { replace, refresh } = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const submissionInFlight = React.useRef(false);
  // Generated ids: a hidden, still-mounted earlier screen may use the same names.
  const passwordId = React.useId();
  const confirmationId = React.useId();
  const hintId = React.useId();
  const errorId = React.useId();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionInFlight.current) return;

    const problem = validate(password, confirmation);
    setError(problem);
    if (problem) return;

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
      setError(toSaveErrorMessage(cause));
    } finally {
      submissionInFlight.current = false;
      setIsSaving(false);
    }
  };

  const describedBy = [hintId, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

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
                id={passwordId}
                type="password"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
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
                id={confirmationId}
                type="password"
                autoComplete="new-password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                required
              />
            </div>

            {error ? (
              <AuthMessage id={errorId} tone="error">
                {error}
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
