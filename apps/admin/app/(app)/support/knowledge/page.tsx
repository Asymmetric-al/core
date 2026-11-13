import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { ButtonLink } from "@asym/ui/components/shadcn/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@asym/ui/components/shadcn/empty";
import Link from "next/link";
export default function SupportKnowledgePage() {
  return (
    <PageShell
      title="Support knowledge"
      description="Internal knowledge for support replies."
    >
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Knowledge library isn’t available yet</EmptyTitle>
          <EmptyDescription>
            Use a saved canned response for reusable reply text.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <ButtonLink
            variant="outline"
            render={
              <Link href="/support/settings/canned-responses">
                Manage canned responses
              </Link>
            }
          />
        </EmptyContent>
      </Empty>
    </PageShell>
  );
}

export const metadata = { title: "Support knowledge" };
