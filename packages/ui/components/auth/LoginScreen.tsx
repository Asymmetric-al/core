"use client";

import {
  readSessionUser,
  runSessionChangeCleanups,
} from "@asym/auth/client-session";
import {
  getDefaultPostLoginPathForApp,
  getDemoRoleForApp,
  safeNextParam,
  type AppId,
} from "@asym/auth/demo-login";
import { useTenantRouter } from "@asym/auth/tenant-navigation";
import { ownApiFetch } from "@asym/database/own-api";
import { readJsonBody } from "@asym/lib/http/fetch-result";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import { AuthShell } from "./auth-primitives";
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
  /** Null hides the link where password reset is not offered. */
  forgotPasswordHref?: string | null;
  showRegisterLink?: boolean;
  /** Shown in place of the register link when there is no self sign-up. */
  accountNote?: React.ReactNode;
}

function resolveDemoAvailability(
  payload: DemoAvailabilityResponse,
  role: AppRole,
) {
  const roles = payload.roles ?? payload.availableRoles ?? {};
  return Boolean(roles[role]);
}

const SIGN_IN_FALLBACK = "Unable to sign in.";

function toSafeUiError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

async function signInThroughCore(
  email: string,
  password: string,
): Promise<string | null> {
  try {
    const response = await ownApiFetch("/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const { ok, body } = await readJsonBody<{
      ok?: boolean;
      error?: unknown;
    }>(response);
    if (ok && body?.ok === true) return null;
    return typeof body?.error === "string" && body.error.trim()
      ? body.error
      : SIGN_IN_FALLBACK;
  } catch {
    return SIGN_IN_FALLBACK;
  }
}

export function LoginScreen({
  appId,
  nextPath,
  demoOnly,
  title = "Sign in",
  subtitle = "Sign in to continue",
  registerHref = "/register",
  forgotPasswordHref = "/forgot-password",
  showRegisterLink = true,
  accountNote,
}: LoginScreenProps) {
  const { replace, refresh } = useTenantRouter();
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
  const submissionInFlight = React.useRef(false);
  const [isDemoSubmitting, setIsDemoSubmitting] = React.useState(false);

  const demoAvailabilityQuery = useQuery({
    queryKey: ["auth", "demo-availability", demoRole],
    enabled: !demoOnly,
    staleTime: 60_000,
    queryFn: async () => {
      const response = await ownApiFetch("/api/auth/demo-account", {
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
    queryFn: () => readSessionUser().catch(() => null),
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
      const response = await ownApiFetch("/api/auth/demo-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: demoRole }),
      });

      const { ok, body: payload } = await readJsonBody<{
        ok?: boolean;
        error?: string;
      }>(response);

      if (!ok || payload?.ok !== true) {
        throw new Error(payload?.error ?? "Demo login unavailable.");
      }

      runSessionChangeCleanups();
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
      if (submissionInFlight.current) return;
      submissionInFlight.current = true;
      setError(null);
      setIsSubmitting(true);

      try {
        const refusal = await signInThroughCore(email, password);
        if (refusal === null) {
          runSessionChangeCleanups();
          replace(targetPath);
          refresh();
        } else {
          setError(refusal);
        }
      } finally {
        submissionInFlight.current = false;
        setIsSubmitting(false);
      }
    },
    [email, password, refresh, replace, targetPath],
  );

  return (
    <AuthShell>
      {demoOnly ? (
        <DemoOnlyLoginCard
          title={title}
          subtitle={subtitle}
          buttonLabel="Demo access"
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
          accountNote={accountNote}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleFullLogin}
          onDemoLogin={handleDemoLogin}
        />
      )}
    </AuthShell>
  );
}
