import { TenantLink as Link } from "@asym/auth/tenant-navigation";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@asym/ui/components/shadcn/empty";
import { Megaphone } from "lucide-react";

export default function OrgUpdatesPage() {
  return (
    <PageShell
      title="Organization updates"
      description="Organization news for your partners."
      density="compact"
    >
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Megaphone aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle role="heading" aria-level={2}>
            Publishing is not connected yet
          </EmptyTitle>
          <EmptyDescription>
            Organization updates cannot be published or saved here yet.{" "}
            Missionaries publish ministry updates from their app feed; review
            those in Moderation.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              className={buttonVariants({ variant: "outline" })}
              href="/feed"
            >
              Open Moderation
            </Link>
          </div>
        </EmptyContent>
      </Empty>
    </PageShell>
  );
}
