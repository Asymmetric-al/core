"use client";

import {
  getDefaultPostLoginPathForApp,
  getDemoRoleForApp,
  safeNextParam,
  type AppId,
} from "@asym/auth/demo-login";
import { createBrowserClient } from "@asym/database/supabase";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";

import { DemoOnlyLoginCard } from "./DemoOnlyLoginCard";
import { FullLoginCard } from "./FullLoginCard";

import type { AppRole } from "@asym/auth/roles";

interface DemoAvailabilityResponse {
  roles?: Partial<Record<AppRole, boolean>>;
  availableRoles?: Partial<Record<AppRole, boolean>>;
  reason?: string;
}

export interface LoginScreenProps {
  appId: AppId;
  nextPath: string | null;
  demoOnly: boolean;
  title?: string;
  subtitle?: string;
  registerHref?: string;
  forgotPasswordHref?: string;
  showRegisterLink?: boolean;
}

function resolveDemoAvailability(
  payload: DemoAvailabilityResponse,
  role: AppRole,
) {
  const roles = payload.roles ?? payload.availableRoles ?? {};
  return Boolean(roles[role]);
}

function toSafeUiError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export function LoginScreen({
  appId,
  nextPath,
  demoOnly,
  title = "Sign In",
  subtitle = "Sign in to continue",
  registerHref = "/register",
  forgotPasswordHref = "/forgot-password",
  showRegisterLink = true,
}: LoginScreenProps) {
  const { replace, refresh } = useRouter();
  const demoRole = getDemoRoleForApp(appId);
  const defaultPostLoginPath = getDefaultPostLoginPathForApp(appId);
  const sanitizedNextPath = safeNextParam(nextPath);
  const targetPath = React.useMemo(
    () => sanitizedNextPath ?? defaultPostLoginPath,
    [defaultPostLoginPath, sanitizedNextPath],
  );

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDemoSubmitting, setIsDemoSubmitting] = React.useState(false);

  const demoAvailabilityQuery = useQuery({
    queryKey: ["auth", "demo-availability", demoRole],
    enabled: !demoOnly,
    staleTime: 60_000,
    queryFn: async () => {
      const response = await fetch("/api/auth/demo-account", {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) return false;
      const payload = (await response.json()) as DemoAvailabilityResponse;
      return resolveDemoAvailability(payload, demoRole);
    },
  });
  const isDemoEnabled = demoAvailabilityQuery.data ?? false;

  const existingSessionQuery = useQuery({
    queryKey: ["auth", "session-existing"],
    staleTime: 0,
    queryFn: async () => {
      const supabase = createBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user ?? null;
    },
  });
  const existingUser = existingSessionQuery.data;

  React.useEffect(() => {
    if (!existingUser) return;
    replace(targetPath);
    refresh();
  }, [existingUser, refresh, replace, targetPath]);

  const handleDemoLogin = React.useCallback(async () => {
    setError(null);
    setIsDemoSubmitting(true);

    try {
      const response = await fetch("/api/auth/demo-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: demoRole }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || payload.ok !== true) {
        throw new Error(payload.error ?? "Demo login unavailable.");
      }

      replace(targetPath);
      refresh();
    } catch (cause) {
      setError(toSafeUiError(cause, "Demo login unavailable."));
    } finally {
      setIsDemoSubmitting(false);
    }
  }, [demoRole, refresh, replace, targetPath]);

  const handleFullLogin = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setIsSubmitting(true);

      try {
        const supabase = createBrowserClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw new Error(signInError.message);
        }

        replace(targetPath);
        refresh();
      } catch (cause) {
        setError(toSafeUiError(cause, "Unable to sign in."));
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, refresh, replace, targetPath],
  );

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-background via-muted to-muted" />
      <div className="relative z-10 w-full max-w-md">
        {demoOnly ? (
          <DemoOnlyLoginCard
            title={title}
            subtitle={subtitle}
            buttonLabel="Demo Access"
            isLoading={isDemoSubmitting}
            error={error}
            onDemoLogin={handleDemoLogin}
          />
        ) : (
          <FullLoginCard
            title={title}
            subtitle={subtitle}
            email={email}
            password={password}
            isLoading={isSubmitting}
            error={error}
            demoEnabled={isDemoEnabled}
            demoLoading={isDemoSubmitting}
            registerHref={registerHref}
            forgotPasswordHref={forgotPasswordHref}
            showRegisterLink={showRegisterLink}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleFullLogin}
            onDemoLogin={handleDemoLogin}
          />
        )}
      </div>
    </main>
  );
}
