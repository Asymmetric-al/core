import { loadWebStudioOrganizationChoices } from "@asym/api/auth/organization-choices";
import { redirectInTenant } from "@asym/auth/tenant-server";
import {
  safeWebStudioNext,
  WEB_STUDIO_FROM_PARAM,
  WEB_STUDIO_REFUSED_PARAM,
  webStudioChooserAddress,
} from "@asym/auth/web-studio";
import { AuthScreenSkeleton } from "@asym/ui/components/auth/AuthScreenSkeleton";
import { OrganizationChooser } from "@asym/ui/components/auth/organization-chooser";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { connection } from "next/server";
import { Suspense } from "react";

import { chooseWebStudioOrganization } from "./actions";

import type { Metadata } from "next";

import { PayloadClipboardReset } from "@/src/cms-ui/web-studio/shell/payload-clipboard";

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
    <>
      <PayloadClipboardReset />
      <Suspense
        fallback={<AuthScreenSkeleton label="Loading your organizations" />}
      >
        <Choices searchParams={searchParams} />
      </Suspense>
    </>
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
  const next = safeWebStudioNext(first(params.next));
  const choices = await loadWebStudioOrganizationChoices();
  if (choices.kind === "signed_out") {
    // Back to this choice, and then to the page, once signed in.
    return redirectInTenant(
      `/login?next=${encodeURIComponent(webStudioChooserAddress(next))}`,
    );
  }
  if (choices.kind === "unavailable") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-muted px-4 py-8">
        <div className="w-full max-w-md">
          <Alert variant="destructive">
            <AlertTitle>Your organizations didn’t load</AlertTitle>
            <AlertDescription>
              Reload the page to try again. Web Studio opens once it knows which
              organization you work in.
            </AlertDescription>
          </Alert>
        </div>
      </main>
    );
  }
  if (choices.organizations.length === 0) return redirectInTenant("/no-access");
  // A link from Mission Control named this organization, and Web Studio
  // works in another or in none yet (JC3): offered first, and said why. Only
  // one the person holds a staff row in; the link chose nothing.
  const cameFrom = choices.organizations.find(
    (organization) =>
      organization.tenantId === first(params[WEB_STUDIO_FROM_PARAM]),
  );
  const organizations = cameFrom
    ? [cameFrom, ...choices.organizations.filter((o) => o !== cameFrom)]
    : choices.organizations;
  // Shown even with one option: a person whose earlier choice no longer
  // holds confirms the one that is left, so nothing is ever picked for them.
  return (
    <OrganizationChooser
      organizations={organizations}
      choose={{
        action: chooseWebStudioOrganization,
        next,
        // The action refused the last choice (council C11).
        refused: first(params[WEB_STUDIO_REFUSED_PARAM]) === "1",
        ...(cameFrom ? { cameFrom: cameFrom.name } : {}),
      }}
    />
  );
}
