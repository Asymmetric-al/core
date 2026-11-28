import { ChangePasswordForm } from "@asym/ui/components/auth/change-password-form";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { SettingsCard } from "@asym/ui/components/settings";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Your account" };

export default function AccountPage() {
  return (
    <PageShell
      title="Your account"
      description="Your own sign-in to Mission Control."
      density="compact"
    >
      <div className="max-w-2xl">
        <SettingsCard
          title="Password"
          description="Enter your current password to choose a new one."
        >
          <ChangePasswordForm />
        </SettingsCard>
      </div>
    </PageShell>
  );
}
