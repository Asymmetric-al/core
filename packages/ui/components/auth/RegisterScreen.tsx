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
  title = "Create Account",
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
  const [isSubmitting, startSubmitting] = React.useTransition();

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!enabled) return;

      startSubmitting(() => {
        void (async () => {
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
          }
        })();
      });
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
      startSubmitting,
    ],
  );

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-background via-muted to-muted" />
      <div className="relative z-10 w-full max-w-md">
        <AuthCard>
          <AuthCardHeader>
            <AuthCardTitle>{title}</AuthCardTitle>
            <AuthCardDescription>{subtitle}</AuthCardDescription>
          </AuthCardHeader>
          <AuthCardContent>
            {enabled ? (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <AuthLabel htmlFor="firstName">First Name</AuthLabel>
                    <AuthInput
                      id="firstName"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <AuthLabel htmlFor="lastName">Last Name</AuthLabel>
                    <AuthInput
                      id="lastName"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
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

                <div className="space-y-2">
                  <AuthLabel htmlFor="password">Password</AuthLabel>
                  <AuthInput
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>

                <AuthButton type="submit" loading={isSubmitting}>
                  Create Account
                </AuthButton>
              </form>
            ) : (
              <div className="rounded-xl border border-border bg-muted/60 p-4 text-sm text-muted-foreground">
                Self-service registration is not available for this portal.
                Please contact your administrator for access.
              </div>
            )}

            {error ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
                {notice}
              </p>
            ) : null}

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href={loginHref}
                className="font-medium text-foreground hover:underline"
              >
                Sign In
              </Link>
            </p>
          </AuthCardContent>
        </AuthCard>
      </div>
    </main>
  );
}
