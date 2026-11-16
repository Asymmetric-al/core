import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { useEffect } from "react";

type EveSection = { id: string; title: string; description: string };

export function EveUnavailableSections({
  sections,
  isLoading,
  loadingLabel,
}: {
  sections: readonly EveSection[];
  isLoading: boolean;
  loadingLabel: string;
}) {
  return (
    <div
      className="space-y-6"
      role={isLoading ? "status" : undefined}
      aria-label={isLoading ? loadingLabel : undefined}
    >
      {isLoading ? <span className="sr-only">{loadingLabel}…</span> : null}
      {sections.map((section) => (
        <Card key={section.id} id={section.id}>
          <CardHeader>
            <CardTitle role="heading" aria-level={2}>
              {section.title}
            </CardTitle>
            <CardDescription>{section.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <p className="text-sm text-muted-foreground">
                Unavailable until this section loads.
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function useEveSectionReady(
  isReady: boolean,
  sections: readonly EveSection[],
) {
  useEffect(() => {
    const sectionId = window.location.hash.slice(1);
    if (!isReady || !sections.some((section) => section.id === sectionId))
      return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView?.({ block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isReady, sections]);
}

export function EveSectionEmpty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Empty role="status">
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function formatStatusLabel(value: string): string {
  const words = value.replace(/[_-]+/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
