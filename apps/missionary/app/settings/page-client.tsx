"use client";

import { useAuth } from "@asym/lib/hooks";
import { MISSIONARY_SETTINGS_HEADER_VT_NAME } from "@asym/lib/view-transitions";
import { ChangePasswordForm } from "@asym/ui/components/auth/change-password-form";
import { SignOutOtherSessions } from "@asym/ui/components/auth/sign-out-other-sessions";
import { PageHeader } from "@asym/ui/components/page-header";
import { ReadOnlyField } from "@asym/ui/components/primitives/read-only-field";
import { SettingsCard } from "@asym/ui/components/settings";
import Link from "next/link";
import * as React from "react";

/** Account and sign-in security; the supporter-facing page is edited at /profile. */
export default function SettingsPage() {
  const { profile, user } = useAuth();
  const accountEmail = profile?.email ?? user?.email ?? "";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        titleViewTransitionName={MISSIONARY_SETTINGS_HEADER_VT_NAME}
        description="Your sign-in details and account security."
      />

      <div className="grid max-w-3xl gap-6">
        <SettingsCard
          title="Account"
          description={
            <>
              How supporters see you is set on your{" "}
              <Link
                href="/profile"
                className="font-medium text-foreground underline underline-offset-4"
              >
                giving page
              </Link>
              .
            </>
          }
        >
          <ReadOnlyField
            label="Sign-in email"
            value={accountEmail || "Loading…"}
            description="Your organization’s administrator can change it."
          />
        </SettingsCard>

        <SettingsCard
          title="Password"
          description="Enter your current password to choose a new one."
        >
          <ChangePasswordForm />
        </SettingsCard>

        <SettingsCard
          title="Signed-in devices"
          description="Lost a phone or used a shared computer? Sign out everywhere except here."
        >
          <SignOutOtherSessions />
        </SettingsCard>
      </div>
    </div>
  );
}
