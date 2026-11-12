"use client";

import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { PenTool } from "lucide-react";
import Link from "next/link";

export default function SignStudioPage() {
  return (
    <PageShell
      title="Sign Studio"
      description="Send documents for signature and keep the signed copies."
      density="compact"
    >
      <div className="rounded-xl border">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PenTool aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Sign Studio is not set up yet</EmptyTitle>
            <EmptyDescription>
              Signature requests, templates and signed documents will appear
              here once a signing service is connected. Until then, keep
              agreements with the person&apos;s record in the CRM.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link
              href="/crm"
              className={buttonVariants({ variant: "outline" })}
            >
              Open CRM
            </Link>
          </EmptyContent>
        </Empty>
      </div>
    </PageShell>
  );
}
