import {
  getDefaultPostLoginPathForApp,
  safeNextParam,
} from "@asym/auth/demo-login";
import { createClient } from "@asym/database/supabase/server";
import { LoginScreen } from "@asym/ui/components/auth/LoginScreen";
import { redirect } from "next/navigation";

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
    <LoginScreen
      appId="donor"
      nextPath={nextPath}
      demoOnly={process.env.DEMO_ONLY_LOGIN === "true"}
      title="Sign In"
      subtitle="Access the donor portal"
      registerHref="/register"
      forgotPasswordHref="/forgot-password"
    />
  );
}
