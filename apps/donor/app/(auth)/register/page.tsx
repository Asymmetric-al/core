import { requireAnonymousVisitor } from "@asym/auth/auth-screen";
import { serverEnv } from "@asym/env";
import { RegisterScreen } from "@asym/ui/components/auth/RegisterScreen";

export default async function RegisterPage() {
  await requireAnonymousVisitor({ appId: "donor" });

  return (
    <RegisterScreen
      appId="donor"
      enabled={serverEnv.DEMO_ONLY_LOGIN !== true}
      title="Create Donor Account"
      subtitle="Create your donor account to access the portal"
      loginHref="/login"
    />
  );
}
