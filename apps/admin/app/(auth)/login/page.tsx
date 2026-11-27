import { requireAnonymousVisitor } from "@asym/auth/auth-screen";
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
  const { nextPath } = await requireAnonymousVisitor({
    appId: "admin",
    searchParams: await searchParams,
  });

  return (
    <>
      <PayloadClipboardReset />
      <LoginScreen
        appId="admin"
        nextPath={nextPath}
        demoOnly={serverEnv.DEMO_ONLY_LOGIN === true}
        title="Sign in"
        subtitle="Access is by invitation. Ask your Mission Control administrator for an account."
        // Invitation guidance replaces the registration link. Password reset
        // is self-service, through the default /forgot-password link.
        showRegisterLink={false}
      />
    </>
  );
}
