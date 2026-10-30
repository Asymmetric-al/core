import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Alert, AlertDescription } from "@asym/ui/components/shadcn/alert";
import { ButtonLink } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { cn } from "@asym/ui/lib/utils";
import Link from "next/link";

import { supportHubDemoModel } from "../support-hub.data";
import { supportHubRoutes } from "../support-hub.routes";

const DATE_TIME_FORMATTER_1 = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

function makeDisplayDate(value?: string | number | Date): Date {
  return value === undefined
    ? new globalThis.Date()
    : new globalThis.Date(value);
}

interface SupportKnowledgePageProps {
  searchParams?: Promise<{ article?: string }>;
}

export default async function SupportKnowledgePage({
  searchParams,
}: SupportKnowledgePageProps) {
  const selectedArticleId = (await searchParams)?.article;
  const selectedArticleExists = selectedArticleId
    ? supportHubDemoModel.knowledge.some(
        (entry) => entry.id === selectedArticleId,
      )
    : true;

  return (
    <PageShell
      title="Support Knowledge"
      description="Internal playbooks support agents can attach to replies."
      actions={
        <ButtonLink
          variant="outline"
          render={<Link href={supportHubRoutes.home}>Back to Support Hub</Link>}
        />
      }
    >
      <div className="space-y-4">
        {!selectedArticleExists ? (
          <Alert>
            <AlertDescription>
              Article {selectedArticleId} was not found. Showing all support
              knowledge entries.
            </AlertDescription>
          </Alert>
        ) : null}
        {supportHubDemoModel.knowledge.map((entry) => (
          <div
            className={cn(
              "rounded-xl",
              entry.id === selectedArticleId && "ring-2 ring-ring",
            )}
            key={entry.id}
          >
            <Card>
              <CardHeader>
                <CardTitle>{entry.title}</CardTitle>
                <CardDescription>
                  {entry.category} · Updated{" "}
                  {DATE_TIME_FORMATTER_1.format(
                    makeDisplayDate(entry.updatedAt),
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  {entry.summary}
                </p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
