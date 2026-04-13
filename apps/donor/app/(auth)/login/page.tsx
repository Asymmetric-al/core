import {
  getDefaultPostLoginPathForApp,
  safeNextParam,
} from "@asym/auth/demo-login";
import { createClient } from "@asym/database/supabase/server";
import { serverEnv } from "@asym/env";
import { LoginScreen } from "@asym/ui/components/auth/LoginScreenClient";
import { LoginScreenLayout } from "@asym/ui/components/auth/LoginScreenLayout";
import { redirect } from "next/navigation";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the donor portal.",
};

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextPath = safeNextParam(rawNext ?? null);
  const defaultPath = getDefaultPostLoginPathForApp("donor");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(nextPath ?? defaultPath);
  }

  return (
    <LoginScreenLayout>
      <LoginScreen
        appId="donor"
        nextPath={nextPath}
        demoOnly={serverEnv.DEMO_ONLY_LOGIN === true}
        title="Sign In"
        subtitle="Access the donor portal"
        registerHref="/register"
        forgotPasswordHref="/forgot-password"
      />
    </LoginScreenLayout>
  );
}
