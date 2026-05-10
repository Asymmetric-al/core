import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import Link from "next/link";

import { supportHubDemoModel } from "../support-hub.data";
import { supportHubRoutes } from "../support-hub.routes";

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
        <Button asChild variant="outline">
          <Link href={supportHubRoutes.home}>Back to Support Hub</Link>
        </Button>
      }
    >
      <div className="space-y-4">
        {!selectedArticleExists ? (
          <Card className="rounded-3xl border-dashed">
            <CardContent className="p-4 text-sm text-muted-foreground">
              Article {selectedArticleId} was not found. Showing all support
              knowledge entries.
            </CardContent>
          </Card>
        ) : null}
        {supportHubDemoModel.knowledge.map((entry) => (
          <Card
            className={`rounded-3xl ${
              entry.id === selectedArticleId ? "ring-2 ring-ring" : ""
            }`}
            key={entry.id}
          >
            <CardHeader>
              <CardTitle>{entry.title}</CardTitle>
              <CardDescription>
                {entry.category} · Updated{" "}
                {new Intl.DateTimeFormat("en", {
                  dateStyle: "medium",
                }).format(makeDisplayDate(entry.updatedAt))}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                {entry.summary}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
