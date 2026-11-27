import { requireAnonymousVisitor } from "@asym/auth/auth-screen";
import { OPERATOR_AREA_ROOT } from "@asym/auth/operator-area";
import { readOperationsSignIn } from "@asym/auth/operator-area-server";
import { serverEnv } from "@asym/env";
import { LoginScreen } from "@asym/ui/components/auth/LoginScreen";

import type { Metadata } from "next";

import { PayloadClipboardReset } from "@/src/cms-ui/web-studio/shell/payload-clipboard";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the admin portal.",
};

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const operations = await readOperationsSignIn();
  const params = await searchParams;
  const { nextPath } = await requireAnonymousVisitor({
    appId: "admin",
    searchParams: operations ? { next: OPERATOR_AREA_ROOT } : params,
  });

  return (
    <>
      <PayloadClipboardReset />
      <LoginScreen
        appId="admin"
        nextPath={nextPath}
        demoOnly={!operations && serverEnv.DEMO_ONLY_LOGIN === true}
        title="Sign in"
        subtitle="Access is by invitation. Ask your Mission Control administrator for an account."
        // Invitation guidance replaces the registration link. Password reset
        // is self-service, through the default /forgot-password link.
        showRegisterLink={false}
      />
    </>
  );
}
