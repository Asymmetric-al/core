"use client";

import {
  getDefaultPostLoginPathForApp,
  type AppId,
} from "@asym/auth/demo-login";
import { createBrowserClient } from "@asym/database/supabase";
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

export interface RegisterScreenProps {
  appId: AppId;
  enabled: boolean;
  title?: string;
  subtitle?: string;
  loginHref?: string;
}

function toRegistrationErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Unable to create account.";
  }

  const message = error.message.trim();
  if (!message) return "Unable to create account.";
  return message;
}

export function RegisterScreen({
  appId,
  enabled,
  title = "Create account",
  subtitle = "Create your account to continue",
  loginHref = "/login",
}: RegisterScreenProps) {
  const { replace, refresh } = useRouter();
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

        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters.");
        }

        const supabase = createBrowserClient();
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
            },
          },
        });

        if (signUpError) throw new Error(signUpError.message);

        if (data.session) {
          replace(defaultPostLoginPath);
          refresh();
          return;
        }

        setNotice(
          "Account created. Check your email for verification before signing in.",
        );
      } catch (cause) {
        setError(toRegistrationErrorMessage(cause));
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
                  minLength={8}
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
