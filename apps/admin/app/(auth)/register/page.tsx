import { getDefaultPostLoginPathForApp } from "@asym/auth/demo-login";
import { redirectInTenant } from "@asym/auth/tenant-server";
import { createClient } from "@asym/database/supabase/server";
import { RegisterScreen } from "@asym/ui/components/auth/RegisterScreen";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Registration unavailable" };

export default async function RegisterPage() {
  const supabase = await createClient(null); // Auth only: reads no tenant table.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirectInTenant(getDefaultPostLoginPathForApp("admin"));
  }

  return (
    <RegisterScreen
      appId="admin"
      enabled={false}
      title="Registration unavailable"
      subtitle="Admin access is provisioned by invitation only."
      loginHref="/login"
    />
  );
}
