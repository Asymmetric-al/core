"use client";

import { TenantLink as Link } from "@asym/auth/tenant-navigation";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@asym/ui/components/shadcn/table";
import { useSearchParams } from "next/navigation";

import { WorkerBadges } from "./worker-display";
import { isUnreviewed, useWorkers } from "./workers-api";

export const WORKERS_TITLE = "Workers";
export const WORKERS_DESCRIPTION =
  "Workers of this organization and their security level.";

export function WorkersDirectorySkeleton() {
  return (
    <PageShell
      title={WORKERS_TITLE}
      description={WORKERS_DESCRIPTION}
      density="compact"
    >
      <div className="flex flex-col gap-2" aria-hidden="true">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </PageShell>
  );
}

function ReviewFilter({ unreviewedOnly }: { unreviewedOnly: boolean }) {
  return (
    <nav aria-label="Filter workers" className="flex flex-wrap gap-2">
      <Link
        href="/workers"
        aria-current={unreviewedOnly ? undefined : "page"}
        className={buttonVariants({
          variant: unreviewedOnly ? "outline" : "secondary",
          size: "sm",
        })}
      >
        All workers
      </Link>
      <Link
        href="/workers?review=unreviewed"
        aria-current={unreviewedOnly ? "page" : undefined}
        className={buttonVariants({
          variant: unreviewedOnly ? "secondary" : "outline",
          size: "sm",
        })}
      >
        Unreviewed
      </Link>
    </nav>
  );
}

export function WorkersDirectory() {
  const unreviewedOnly = useSearchParams().get("review") === "unreviewed";
  const workers = useWorkers();
  const shown = (workers.data ?? []).filter(
    (worker) => !unreviewedOnly || isUnreviewed(worker),
  );

  return (
    <PageShell
      title={WORKERS_TITLE}
      description={WORKERS_DESCRIPTION}
      density="compact"
    >
      <div className="flex flex-col gap-4">
        <ReviewFilter unreviewedOnly={unreviewedOnly} />
        {workers.isError ? (
          <div
            role="alert"
            className="flex flex-wrap items-center gap-2 text-sm"
          >
            <span>Workers could not be loaded.</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void workers.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : workers.isPending ? (
          <div className="flex flex-col gap-2" aria-hidden="true">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : shown.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>
                {unreviewedOnly
                  ? "No worker's security level is waiting for review."
                  : "No workers yet."}
              </EmptyTitle>
              <EmptyDescription>{WORKERS_DESCRIPTION}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableCaption className="sr-only">
              {unreviewedOnly ? "Unreviewed workers" : "Workers"}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Name</TableHead>
                <TableHead scope="col">Security</TableHead>
                <TableHead scope="col">Login</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((worker) => (
                <TableRow key={worker.assignmentId}>
                  <TableCell>
                    <div className="flex flex-col">
                      <Link
                        href={`/workers/${encodeURIComponent(worker.assignmentId)}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {worker.displayName}
                      </Link>
                      {worker.publicAlias ? (
                        <span className="text-xs text-muted-foreground">
                          Alias: {worker.publicAlias}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <WorkerBadges worker={worker} />
                  </TableCell>
                  <TableCell>{worker.hasLogin ? "Linked" : "None"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </PageShell>
  );
}
