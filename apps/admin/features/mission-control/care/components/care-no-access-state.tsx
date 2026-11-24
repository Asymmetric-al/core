"use client";

import { TenantLink as Link } from "@asym/auth/tenant-navigation";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { ButtonLink } from "@asym/ui/components/shadcn/button";

export function isCareAccessDeniedError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: unknown }).status === 403
  );
}

export function CareNoAccessState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <PageShell title={title} description={description} density="compact">
      <Alert role="note">
        <AlertTitle>No access to Member Care</AlertTitle>
        <AlertDescription>
          <p>
            Your active assignment does not have access to Member Care. Switch
            to a Member Care assignment, or go to home.
          </p>
          <div className="pt-2">
            <ButtonLink variant="outline" render={<Link href="/" />}>
              Go to home
            </ButtonLink>
          </div>
        </AlertDescription>
      </Alert>
    </PageShell>
  );
}
