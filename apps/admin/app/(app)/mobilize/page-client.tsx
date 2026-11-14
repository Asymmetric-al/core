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
import { Users } from "lucide-react";
import Link from "next/link";

export default function Mobilize() {
  return (
    <PageShell
      title="Mobilize"
      description="Applicant tracking and serving locations."
      density="compact"
    >
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Pipeline not connected yet</EmptyTitle>
          <EmptyDescription>
            The pipeline will track application, vetting, training and
            deployment. For now, continue managing applicants in your existing
            process. Locations is connected and manages the real public map.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link
            href="/mobilize/locations"
            className={buttonVariants({ variant: "outline" })}
          >
            Manage locations
          </Link>
        </EmptyContent>
      </Empty>
    </PageShell>
  );
}
