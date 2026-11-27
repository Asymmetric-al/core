"use client";

import { TenantLink as Link } from "@asym/auth/tenant-navigation";
import { useMC } from "@asym/lib/mission-control/context";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Button } from "@asym/ui/components/shadcn/button";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { useParams } from "next/navigation";

import {
  ConfirmLevelDialog,
  InviteDialog,
  LiftDialog,
  RestrictDialog,
  RevealDialog,
} from "./worker-dialogs";
import { RestrictionEffects, WorkerBadges } from "./worker-display";
import {
  LEVEL_LABELS,
  MEMBERS_CAPABILITY,
  NOT_PERMITTED_TEXT,
  SAFETY_CAPABILITY,
  WorkerRequestError,
  isUnreviewed,
  useWorker,
  type Worker,
} from "./workers-api";

function BackToWorkers() {
  return (
    <Link
      href="/workers"
      className="text-sm text-muted-foreground underline-offset-4 hover:underline"
    >
      Workers
    </Link>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="text-sm text-muted-foreground sm:w-40">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

function WorkerControls({
  worker,
  canInvite,
}: {
  worker: Worker;
  canInvite: boolean;
}) {
  const raised = worker.securityLevel !== "standard" || worker.doNotPublish;
  return (
    <section aria-label="Safety settings" className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {isUnreviewed(worker) ? <ConfirmLevelDialog worker={worker} /> : null}
        <RestrictDialog worker={worker} />
        {raised ? <LiftDialog worker={worker} /> : null}
        {worker.hasLegalIdentity === true ? (
          <RevealDialog worker={worker} />
        ) : null}
        {canInvite && !worker.hasLogin ? (
          <InviteDialog worker={worker} />
        ) : null}
      </div>
      <RestrictionEffects />
    </section>
  );
}

function WorkerDetails({
  worker,
  canChange,
  canInvite,
}: {
  worker: Worker;
  canChange: boolean;
  canInvite: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <WorkerBadges worker={worker} />
      <dl className="flex flex-col gap-3">
        <Row label="Level" value={LEVEL_LABELS[worker.securityLevel]} />
        <Row label="Public alias" value={worker.publicAlias ?? "None"} />
        <Row
          label="Do not publish"
          value={worker.doNotPublish ? "Yes" : "No"}
        />
        <Row label="Login" value={worker.hasLogin ? "Linked" : "None"} />
        {canChange && worker.hasLegalIdentity !== null ? (
          <Row
            label="Legal name"
            value={
              worker.hasLegalIdentity ? "Recorded, hidden" : "Not recorded"
            }
          />
        ) : null}
      </dl>
      {canChange ? (
        <WorkerControls
          key={worker.assignmentId}
          worker={worker}
          canInvite={canInvite}
        />
      ) : (
        <p className="text-sm text-muted-foreground">{NOT_PERMITTED_TEXT}</p>
      )}
    </div>
  );
}

export function WorkerRecord() {
  const params = useParams<{ assignmentId: string }>();
  const assignmentId = params?.assignmentId ?? "";
  const { capabilities = [] } = useMC();
  const canChange = capabilities.includes(SAFETY_CAPABILITY);
  const canInvite = capabilities.includes(MEMBERS_CAPABILITY);
  const query = useWorker(assignmentId);
  const worker = query.data;

  if (query.isError) {
    const error = query.error;
    const message =
      error instanceof WorkerRequestError &&
      (error.status === 403 || error.status === 404)
        ? error.message
        : "Workers could not be loaded.";
    return (
      <PageShell title="Worker" breadcrumbs={<BackToWorkers />}>
        <div role="alert" className="flex flex-wrap items-center gap-2 text-sm">
          <span>{message}</span>
          {error instanceof WorkerRequestError &&
          (error.status === 403 || error.status === 404) ? null : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void query.refetch()}
            >
              Try again
            </Button>
          )}
        </div>
      </PageShell>
    );
  }

  if (!worker) {
    return (
      <PageShell title="Worker" breadcrumbs={<BackToWorkers />}>
        <div className="flex flex-col gap-3" aria-hidden="true">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-64" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={worker.displayName}
      description={
        worker.publicAlias ? `Public alias: ${worker.publicAlias}` : undefined
      }
      breadcrumbs={<BackToWorkers />}
    >
      <WorkerDetails
        worker={worker}
        canChange={canChange}
        canInvite={canInvite}
      />
    </PageShell>
  );
}
