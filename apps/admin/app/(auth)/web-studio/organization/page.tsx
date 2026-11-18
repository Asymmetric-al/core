import { loadWebStudioOrganizationChoices } from "@asym/api/auth/organization-choices";
import {
  safeWebStudioNext,
  WEB_STUDIO_CHOOSER_PATH,
} from "@asym/auth/web-studio";
import { AuthScreenSkeleton } from "@asym/ui/components/auth/AuthScreenSkeleton";
import { OrganizationChooser } from "@asym/ui/components/auth/organization-chooser";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { chooseWebStudioOrganization } from "./actions";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Choose an organization" };

type WebStudioOrganizationPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * The organization choice inside Web Studio (plan 5.2, "One stated exception:
 * Web Studio"; AL-2675). The admin proxy and the Web Studio layout send a
 * person here when they hold staff rows in more than one place and no usable
 * choice is set, and the Studio chrome links here to switch. It sits outside
 * Payload's layout, which needs an organization to render, but under
 * `/web-studio`, where the cookie it sets belongs. Stream: the person's
 * memberships are request-time data.
 */
export default function WebStudioOrganizationPage({
  searchParams,
}: WebStudioOrganizationPageProps) {
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

async function Choices({ searchParams }: WebStudioOrganizationPageProps) {
  // Request time first: the session read below must never run while the
  // static shell is prerendered.
  await connection();
  const params = await searchParams;
  const choices = await loadWebStudioOrganizationChoices();
  if (choices.kind === "signed_out") {
    redirect(`/login?next=${encodeURIComponent(WEB_STUDIO_CHOOSER_PATH)}`);
  }
  if (choices.kind === "unavailable") {
    throw new Error("Your organizations could not be read. Try again.");
  }
  if (choices.organizations.length === 0) redirect("/no-access");
  // Shown even with one option: a person whose earlier choice no longer
  // holds confirms the one that is left, so nothing is ever picked for them.
  return (
    <OrganizationChooser
      organizations={choices.organizations}
      choose={{
        action: chooseWebStudioOrganization,
        next: safeWebStudioNext(first(params.next)),
      }}
    />
  );
}
