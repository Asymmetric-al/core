import { requireAnonymousVisitor } from "@asym/auth/auth-screen";
import { serverEnv } from "@asym/env";
import { LoginScreen } from "@asym/ui/components/auth/LoginScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the donor portal.",
};

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { nextPath } = await requireAnonymousVisitor({
    appId: "donor",
    searchParams: await searchParams,
  });

  return (
    <LoginScreen
      appId="donor"
      nextPath={nextPath}
      demoOnly={serverEnv.DEMO_ONLY_LOGIN === true}
      title="Sign In"
      subtitle="Access the donor portal"
      registerHref="/register"
      forgotPasswordHref="/forgot-password"
    />
  );
}
