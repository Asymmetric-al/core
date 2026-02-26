import { safeNextParam } from "@asym/auth/demo-login";
import { LoginScreen } from "@asym/ui/components/auth/LoginScreen";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;

  return (
    <LoginScreen
      appId="admin"
      nextPath={safeNextParam(rawNext ?? null)}
      demoOnly={process.env.DEMO_ONLY_LOGIN === "true"}
      title="Sign In"
      subtitle="Access the admin portal"
      registerHref="/register"
      forgotPasswordHref="/forgot-password"
    />
  );
}
