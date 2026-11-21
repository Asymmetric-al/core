import { loadOrganizationChoices } from "@asym/api/auth/organization-choices";
import { redirectInTenant } from "@asym/auth/tenant-server";
import { AuthScreenSkeleton } from "@asym/ui/components/auth/AuthScreenSkeleton";
import {
  OrganizationChooser,
  OrganizationChooserUnavailable,
} from "@asym/ui/components/auth/organization-chooser";
import { Suspense } from "react";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Choose an organization" };

type ChooseOrganizationPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * The organization and assignment chooser, outside the tenant segment (plan
 * 5.2). The proxy sends a person here when an address leaves a choice open:
 * several organizations, or several staff roles in the one the address
 * names. Stream: the person's memberships are request-time data.
 */
export default function ChooseOrganizationPage({
  searchParams,
}: ChooseOrganizationPageProps) {
  return (
    <Suspense
      fallback={<AuthScreenSkeleton label="Loading your organizations" />}
    >
      <Choices searchParams={searchParams} />
    </Suspense>
  );
}

function first(value: string | string[] | undefined): string | null {
  return (Array.isArray(value) ? value[0] : value) ?? null;
}

async function Choices({ searchParams }: ChooseOrganizationPageProps) {
  const params = await searchParams;
  const choices = await loadOrganizationChoices({
    roleClass: "staff",
    tenantId: first(params.tenant),
    next: first(params.next),
  });
  if (choices.kind === "signed_out") return redirectInTenant("/login");
  // A failed read is an alert with a way to try again, not the error page
  // (council round 1, A9).
  if (choices.kind === "unavailable") {
    return <OrganizationChooserUnavailable retryHref={choices.retryHref} />;
  }
  const options = choices.organizations.flatMap((o) => o.options);
  if (options.length === 0) return redirectInTenant("/no-access");
  // Nothing to choose: go straight there, where the proxy decides again.
  if (options.length === 1) return redirectInTenant(options[0]!.href);
  return <OrganizationChooser organizations={choices.organizations} />;
}
