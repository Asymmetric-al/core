import { getDefaultPostLoginPathForApp } from "@asym/auth/demo-login";
import { createClient } from "@asym/database/supabase/server";
import { RegisterScreen } from "@asym/ui/components/auth/RegisterScreen";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(getDefaultPostLoginPathForApp("donor"));
  }

  return (
    <RegisterScreen
      appId="donor"
      enabled={process.env.DEMO_ONLY_LOGIN !== "true"}
      title="Create Donor Account"
      subtitle="Create your donor account to access the portal"
      loginHref="/login"
    />
  );
}
