import { loadOrganizationChoices } from "@asym/api/auth/organization-choices";
import { AuthScreenSkeleton } from "@asym/ui/components/auth/AuthScreenSkeleton";
import { OrganizationChooser } from "@asym/ui/components/auth/organization-chooser";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import type { Metadata } from "next";

import { readOrganizationNames } from "@/lib/admin-access";

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
    readOrganizationNames,
  });
  if (choices.kind === "signed_out") redirect("/login");
  if (choices.kind === "unavailable") {
    throw new Error("Your organizations could not be read. Try again.");
  }
  const options = choices.organizations.flatMap((o) => o.options);
  if (options.length === 0) redirect("/no-access");
  // Nothing to choose: go straight there, where the proxy decides again.
  if (options.length === 1) redirect(options[0]!.href);
  return <OrganizationChooser organizations={choices.organizations} />;
}
