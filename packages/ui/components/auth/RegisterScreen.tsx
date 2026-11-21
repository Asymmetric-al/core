"use client";

import { answerReadsAsSent } from "@asym/auth/auth-email-request";
import {
  getDefaultPostLoginPathForApp,
  type AppId,
} from "@asym/auth/demo-login";
import { signUpConfirmationRedirectUrl } from "@asym/auth/sign-up-confirmation";
import {
  TenantLink as Link,
  useTenantRouter,
} from "@asym/auth/tenant-navigation";
import { createBrowserClient } from "@asym/database/supabase";
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

export interface RegisterScreenProps {
  appId: AppId;
  enabled: boolean;
  title?: string;
  subtitle?: string;
  loginHref?: string;
}

const MIN_PASSWORD_LENGTH = 8;

const REGISTRATION_FAILED_MESSAGE =
  "Your account couldn’t be created. Try again in a moment.";

/**
 * Auth's refusals that describe what was typed. They read the same for every
 * address, so their wording is shown; any other refusal gets a general
 * message, because its wording can differ for an address with an account.
 */
const INPUT_PROBLEM_CODES: ReadonlySet<string> = new Set([
  "weak_password",
  "email_address_invalid",
  "validation_failed",
]);

function toRegistrationErrorMessage(error: unknown): string {
  const { code, message } = (error ?? {}) as {
    code?: unknown;
    message?: unknown;
  };
  if (
    typeof code === "string" &&
    INPUT_PROBLEM_CODES.has(code) &&
    typeof message === "string" &&
    message.trim()
  ) {
    return message;
  }
  return REGISTRATION_FAILED_MESSAGE;
}

export function RegisterScreen({
  appId,
  enabled,
  title = "Create account",
  subtitle = "Create your account to continue",
  loginHref = "/login",
}: RegisterScreenProps) {
  const { replace, refresh } = useTenantRouter();
  const defaultPostLoginPath = getDefaultPostLoginPathForApp(appId);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const submissionInFlight = React.useRef(false);
  const passwordHintId = React.useId();

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!enabled || submissionInFlight.current) return;
      submissionInFlight.current = true;
      setIsSubmitting(true);

      try {
        setError(null);
        setNotice(null);

        if (password.length < MIN_PASSWORD_LENGTH) {
          setError(
            `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
          );
          return;
        }

        const address = email.trim().toLowerCase();
        const supabase = createBrowserClient();
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: address,
          password,
          options: {
            // The confirmation returns to this host, where the person is
            // then signed in: session cookies belong to one host.
            emailRedirectTo: signUpConfirmationRedirectUrl(
              window.location.origin,
            ),
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
            },
          },
        });

        if (!answerReadsAsSent(signUpError)) {
          setError(toRegistrationErrorMessage(signUpError));
          return;
        }

        // Only a project with confirmation switched off returns a session.
        if (data?.session) {
          replace(defaultPostLoginPath);
          refresh();
          return;
        }

        // The same answer whether or not the address already had an account
        // (plan 5.4): Auth answers a confirmed address "already registered",
        // and an unconfirmed one asked again within the email frequency with
        // a rate limit (`answerReadsAsSent`).
        setNotice(
          `Check your email: we’ve sent a link to ${address}. Open it in this browser to confirm the address and sign in. If nothing arrives in a few minutes, try again, or sign in if you already have an account.`,
        );
      } catch {
        setError(REGISTRATION_FAILED_MESSAGE);
      } finally {
        submissionInFlight.current = false;
        setIsSubmitting(false);
      }
    },
    [
      defaultPostLoginPath,
      email,
      enabled,
      firstName,
      lastName,
      password,
      refresh,
      replace,
    ],
  );

  return (
    <AuthShell>
      <AuthCard>
        <AuthCardHeader>
          <AuthMark />
          <AuthCardTitle>{title}</AuthCardTitle>
          <AuthCardDescription>{subtitle}</AuthCardDescription>
        </AuthCardHeader>
        <AuthCardContent>
          {enabled ? (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <AuthLabel htmlFor="firstName">First name</AuthLabel>
                  <AuthInput
                    id="firstName"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <AuthLabel htmlFor="lastName">Last name</AuthLabel>
                  <AuthInput
                    id="lastName"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <AuthLabel htmlFor="email">Email</AuthLabel>
                <AuthInput
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <AuthLabel htmlFor="password">Password</AuthLabel>
                <AuthInput
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  // Matches the length check in handleSubmit.
                  minLength={MIN_PASSWORD_LENGTH}
                  aria-describedby={passwordHintId}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <p
                  id={passwordHintId}
                  className="text-sm text-muted-foreground"
                >
                  At least 8 characters.
                </p>
              </div>

              <AuthButton type="submit" loading={isSubmitting}>
                Create account
              </AuthButton>
            </form>
          ) : (
            <AuthMessage tone="info">
              Self-service registration is not available for this portal. Please
              contact your administrator for access.
            </AuthMessage>
          )}

          {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
          {notice ? <AuthMessage tone="success">{notice}</AuthMessage> : null}

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={loginHref}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </AuthCardContent>
      </AuthCard>
    </AuthShell>
  );
}
