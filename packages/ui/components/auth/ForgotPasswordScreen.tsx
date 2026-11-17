"use client";

import { passwordRecoveryRedirectUrl } from "@asym/auth/password-recovery";
import { createBrowserClient } from "@asym/database/supabase";
import { KeyRound } from "lucide-react";
import Link from "next/link";
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

export interface ForgotPasswordScreenProps {
  title?: string;
  subtitle?: string;
  loginHref?: string;
}

function toRequestErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "The reset link couldn’t be sent. Try again.";
}

/**
 * Asks Supabase Auth to email a password reset link. The link returns to
 * this app on the host the screen was opened on. The confirmation reads the
 * same whether or not the address has an account, so the screen does not
 * reveal who has one.
 */
export function ForgotPasswordScreen({
  title = "Reset your password",
  subtitle = "Enter the email address you sign in with. We’ll email you a link to choose a new password.",
  loginHref = "/login",
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = React.useState("");
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const submissionInFlight = React.useRef(false);
  // Generated, not "email": Next keeps the sign-in screen mounted but hidden
  // after navigating here, and a repeated id would label its field instead.
  const emailId = React.useId();
  const errorId = React.useId();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionInFlight.current) return;
    submissionInFlight.current = true;
    setIsSubmitting(true);
    setError(null);
    setSentTo(null);

    try {
      const address = email.trim().toLowerCase();
      const supabase = createBrowserClient();
      const { error: requestError } = await supabase.auth.resetPasswordForEmail(
        address,
        {
          redirectTo: passwordRecoveryRedirectUrl(window.location.origin),
        },
      );
      if (requestError) throw requestError;
      setSentTo(address);
    } catch (cause) {
      setError(toRequestErrorMessage(cause));
    } finally {
      submissionInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard>
        <AuthCardHeader>
          <AuthMark icon={<KeyRound />} />
          <AuthCardTitle>{title}</AuthCardTitle>
          <AuthCardDescription>{subtitle}</AuthCardDescription>
        </AuthCardHeader>
        <AuthCardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <AuthLabel htmlFor={emailId}>Email</AuthLabel>
              <AuthInput
                id={emailId}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
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

            <AuthButton type="submit" loading={isSubmitting}>
              Send reset link
            </AuthButton>
          </form>

          {sentTo ? (
            <AuthMessage tone="success">
              If an account uses {sentTo}, we’ve sent it a link to reset the
              password. Open the link in this browser. It works once.
            </AuthMessage>
          ) : null}

          <p className="text-center text-sm text-muted-foreground">
            <Link
              href={loginHref}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        </AuthCardContent>
      </AuthCard>
    </AuthShell>
  );
}
