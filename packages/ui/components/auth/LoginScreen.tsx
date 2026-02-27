"use client";

import {
  getDefaultPostLoginPathForApp,
  getDemoRoleForApp,
  safeNextParam,
  type AppId,
} from "@asym/auth/demo-login";
import { createBrowserClient } from "@asym/database/supabase";
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
  const router = useRouter();
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
  const [isDemoEnabled, setIsDemoEnabled] = React.useState(false);

  React.useEffect(() => {
    if (demoOnly) return;

    let active = true;
    void (async () => {
      try {
        const response = await fetch("/api/auth/demo-account", {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) return;

        const payload = (await response.json()) as DemoAvailabilityResponse;
        if (!active) return;
        setIsDemoEnabled(resolveDemoAvailability(payload, demoRole));
      } catch {
        if (!active) return;
        setIsDemoEnabled(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [demoOnly, demoRole]);

  React.useEffect(() => {
    const supabase = createBrowserClient();
    let active = true;

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active || !session) return;
      router.replace(targetPath);
      router.refresh();
    })();

    return () => {
      active = false;
    };
  }, [router, targetPath]);

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

      router.replace(targetPath);
      router.refresh();
    } catch (cause) {
      setError(toSafeUiError(cause, "Demo login unavailable."));
    } finally {
      setIsDemoSubmitting(false);
    }
  }, [demoRole, router, targetPath]);

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

        router.replace(targetPath);
        router.refresh();
      } catch (cause) {
        setError(toSafeUiError(cause, "Unable to sign in."));
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, router, setError, setIsSubmitting, targetPath],
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
