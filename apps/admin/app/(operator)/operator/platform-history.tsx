"use client";

import {
  readPlatformHistory,
  type PlatformHistory,
  type PlatformHistoryRow,
} from "@asym/auth/operator-mfa";
import { Alert, AlertDescription } from "@asym/ui/components/shadcn/alert";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const TITLE = "Changes with no organization";
const DESCRIPTION =
  "Changes to the assistant that apply to every organization, such as the global kill switch, newest first. Changes made in an organization are not listed here.";
const EMPTY_TEXT = "No change has been recorded with no organization.";
const REFUSED_TEXT =
  "The database refused this history. Sign out and sign in again.";
const FAILED_TEXT = "The history could not be loaded.";

type View = { kind: "loading" } | PlatformHistory;

function loadedAnnouncement(view: View): string {
  if (view.kind !== "rows") return "";
  const count = view.rows.length;
  if (count === 0) return "History loaded: no changes.";
  return `History loaded: ${count} ${count === 1 ? "change" : "changes"}.`;
}

function recordedAt(createdAt: string): string {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime())
    ? createdAt
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function HistoryItem({ row }: { row: PlatformHistoryRow }) {
  return (
    <Item variant="outline" size="sm">
      <ItemContent>
        <ItemTitle>
          {row.action} ({row.result})
        </ItemTitle>
        <ItemDescription className="line-clamp-none">
          {row.changeSummary}
        </ItemDescription>
        <p className="text-xs text-muted-foreground">
          {row.actorId} ({row.identityMode}) ·{" "}
          <time dateTime={row.createdAt}>{recordedAt(row.createdAt)}</time>
        </p>
      </ItemContent>
    </Item>
  );
}

function HistoryBody({
  view,
  titleId,
  onRetry,
}: {
  view: View;
  titleId: string;
  onRetry: () => void;
}) {
  switch (view.kind) {
    case "loading":
      return (
        <div className="flex flex-col gap-2" aria-busy="true">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      );
    case "refused":
      return (
        <Alert variant="destructive">
          <AlertDescription>{REFUSED_TEXT}</AlertDescription>
        </Alert>
      );
    case "failed":
      return (
        <div className="flex flex-col gap-3">
          <Alert variant="destructive">
            <AlertDescription>{FAILED_TEXT}</AlertDescription>
          </Alert>
          <div>
            <Button variant="outline" onClick={onRetry}>
              Load the history again
            </Button>
          </div>
        </div>
      );
    case "rows":
      return view.rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{EMPTY_TEXT}</p>
      ) : (
        <ItemGroup aria-labelledby={titleId} className="gap-2">
          {view.rows.map((row) => (
            <HistoryItem key={row.id} row={row} />
          ))}
        </ItemGroup>
      );
  }
}

export function PlatformHistoryPanel() {
  const [view, setView] = useState<View>({ kind: "loading" });
  const titleId = useId();
  const reads = useRef(0);

  const read = useCallback(() => {
    reads.current += 1;
    const turn = reads.current;
    void readPlatformHistory().then((next) => {
      if (turn === reads.current) setView(next);
    });
  }, []);

  const retry = useCallback(() => {
    setView({ kind: "loading" });
    read();
  }, [read]);

  useEffect(() => {
    read();
    return () => {
      reads.current += 1;
    };
  }, [read]);

  return (
    <section aria-labelledby={titleId}>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 id={titleId} className="text-lg font-semibold tracking-tight">
              {TITLE}
            </h2>
          </CardTitle>
          <CardDescription>{DESCRIPTION}</CardDescription>
        </CardHeader>
        <CardContent>
          <p role="status" aria-live="polite" className="sr-only">
            {loadedAnnouncement(view)}
          </p>
          <HistoryBody view={view} titleId={titleId} onRetry={retry} />
        </CardContent>
      </Card>
    </section>
  );
}
