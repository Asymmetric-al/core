import { getDefaultPostLoginPathForApp } from "@asym/auth/demo-login";
import { createClient } from "@asym/database/supabase/server";
import { RegisterScreen } from "@asym/ui/components/auth/RegisterScreen";
import { redirect } from "next/navigation";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registration unavailable",
  description: "Missionary access is provisioned by invitation only.",
};

export default async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(getDefaultPostLoginPathForApp("missionary"));
  }

  return (
    <RegisterScreen
      appId="missionary"
      enabled={false}
      title="Registration unavailable"
      subtitle="Missionary access is provisioned by invitation only."
      loginHref="/login"
    />
  );
}
