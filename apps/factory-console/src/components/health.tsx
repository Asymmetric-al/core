"use client";

import { Badge } from "@asym/ui/components/shadcn/badge-component";
import { Button } from "@asym/ui/components/shadcn/button-component";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import { Meter } from "@asym/ui/components/shadcn/meter";
import {
  Select,
  SelectContent,
  SelectControlLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { RotateCcw } from "lucide-react";
import { useId, useState } from "react";

import { ControlButton } from "./controls";
import { ApiError, useReport } from "./data";
import {
  Ago,
  EmptyNote,
  ErrorNote,
  Fact,
  Facts,
  IssueButton,
  LoadingRows,
  LongText,
  Mono,
  Panel,
  RunButton,
  Section,
  StatusBadge,
  TextList,
  Unavailable,
  When,
  useConsole,
} from "./shared";

import type { EngineState, Health as EngineHealth } from "../lib/contracts";
import type {
  AnalysisIndexEntry,
  AnalysisReport,
  AttentionItem,
  Availability,
  FactoryState,
  IssueSummary,
} from "../lib/factory";

type FactoryValue = Availability<FactoryState> | undefined;
type EngineValue = Availability<EngineState> | undefined;

const FACTORY_LABEL = "factory state";
const ADVISORY =
  "Analysis is advisory: it is never a delivery gate, and a failed analysis does not mean the factory is healthy or unhealthy.";
const NO_USAGE_SOURCE =
  "Archon 0.14.0 and the installed pack expose no qualified usage source; nothing is estimated or scraped.";

/** Milliseconds for sorting; unparseable or missing stamps sort last. */
function time(value: string | null | undefined) {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

function scopeLabel(scope: string) {
  if (scope === "factory") return "Whole factory";
  const match = /^issue:(\d+)$/.exec(scope);
  return match ? `Issue #${match[1]}` : scope;
}

function Observed({ what, at }: { what: string; at: string }) {
  return (
    <p className="text-xs text-muted-foreground">
      {what} observed <When value={at} /> (<Ago value={at} />)
    </p>
  );
}

/** A count against a limit; the words carry the numbers, the meter only shows the share. */
function Ratio({
  label,
  value,
  max,
  caption,
}: {
  label: string;
  value: number;
  max: number;
  caption: string;
}) {
  const ceiling = Math.max(max, 1);
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="text-sm font-medium tabular-nums">{caption}</p>
      <Meter
        aria-label={label}
        value={Math.min(Math.max(value, 0), ceiling)}
        min={0}
        max={ceiling}
        getAriaValueText={() => caption}
      />
      {value > max ? (
        <p className="text-xs font-medium text-warning">
          Above the configured limit.
        </p>
      ) : null}
    </div>
  );
}

export function Health({ loading }: { loading: boolean }) {
  const { snapshot } = useConsole();
  const factory = snapshot?.factory;
  const engine = snapshot?.engine;
  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="min-w-0">
        <EnginePanel engine={engine} loading={loading} />
      </div>
      <div className="min-w-0">
        <CapacityPanel
          factory={factory}
          engine={engine}
          capacity={snapshot?.settings.capacity ?? null}
          capacityReason={snapshot?.settings.configReason ?? null}
          loading={loading}
        />
      </div>
      <div className="min-w-0">
        <AttentionPanel factory={factory} loading={loading} />
      </div>
      <div className="min-w-0">
        <AnalysisPanel factory={factory} engine={engine} loading={loading} />
      </div>
      <div className="min-w-0 lg:col-span-2">
        <UsagePanel />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

function EnginePanel({
  engine,
  loading,
}: {
  engine: EngineValue;
  loading: boolean;
}) {
  return (
    <Panel
      title="Engine"
      description="Archon's own health report and slot use."
    >
      <Section value={engine} loading={loading} label="engine">
        {(data, observedAt) => (
          <EngineFacts health={data.health} observedAt={observedAt} />
        )}
      </Section>
    </Panel>
  );
}

function EngineFacts({
  health,
  observedAt,
}: {
  health: EngineHealth;
  observedAt: string;
}) {
  const { active, maxConcurrent, queuedTotal } = health.concurrency;
  return (
    <>
      <Facts>
        <Fact term="Status">
          <StatusBadge
            value={health.status === "ok" ? "completed" : "INCONCLUSIVE"}
            label={health.status}
          />
        </Fact>
        <Fact term="Version">
          <Mono>{health.version}</Mono>
        </Fact>
        <Fact term="Store id">
          <Mono>{health.storeId}</Mono>
        </Fact>
        <Fact term="Running workflows">{health.runningWorkflows}</Fact>
        <Fact term="Slots in use">
          {active} of {maxConcurrent}
        </Fact>
        <Fact term="Queued">{queuedTotal}</Fact>
        <Fact term="Observed">
          <When value={observedAt} /> (<Ago value={observedAt} />)
        </Fact>
      </Facts>
      <Ratio
        label="Engine slots in use"
        value={active}
        max={maxConcurrent}
        caption={`${active} of ${maxConcurrent} engine slots in use`}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Admission capacity
// ---------------------------------------------------------------------------

/** The selector's rule: admitted, pending/active/waiting, under run control. */
function countsAgainstCapacity(issue: IssueSummary) {
  return (
    issue.admitted &&
    (issue.status === "pending" ||
      issue.status === "active" ||
      issue.status === "waiting") &&
    issue.control === "run"
  );
}

function CapacityPanel({
  factory,
  engine,
  capacity,
  capacityReason,
  loading,
}: {
  factory: FactoryValue;
  engine: EngineValue;
  capacity: number | null;
  /** Set once a snapshot has been read and the limit could not be. */
  capacityReason: string | null;
  loading: boolean;
}) {
  return (
    <Panel
      title="Admission capacity"
      description="Capacity is the selector's admission limit for this owner lane: Samson admits a new issue only while fewer admitted issues than the limit are pending, active or waiting under run control. Held and stopped issues do not count."
    >
      {capacity === null ? (
        capacityReason ? (
          <Unavailable title="Admission limit unavailable">
            {capacityReason}, so the admission limit is not shown.
          </Unavailable>
        ) : loading ? (
          <LoadingRows label="Loading admission capacity…" rows={1} />
        ) : (
          <Unavailable>No capacity setting has been read yet.</Unavailable>
        )
      ) : (
        <Section value={factory} loading={loading} label={FACTORY_LABEL}>
          {(data, observedAt) => (
            <Admitted
              issues={data.issues}
              capacity={capacity}
              observedAt={observedAt}
            />
          )}
        </Section>
      )}
      <section
        aria-label="Delivery runs on the current engine page"
        className="flex min-w-0 flex-col gap-2"
      >
        <Section value={engine} loading={loading} label="engine">
          {(data, observedAt) => {
            const running = data.runs.filter(
              (run) =>
                run.workflow_name === "core-deliver" &&
                run.status === "running",
            ).length;
            return (
              <>
                <Facts>
                  <Fact term="Running core-deliver runs on the current engine page">
                    {running}
                  </Fact>
                  <Fact term="Engine page">
                    {data.runs.length
                      ? `Runs ${data.offset + 1}–${data.offset + data.runs.length} of ${data.total}`
                      : `No runs at offset ${data.offset} (of ${data.total})`}
                  </Fact>
                </Facts>
                <Observed what="Engine runs" at={observedAt} />
              </>
            );
          }}
        </Section>
      </section>
    </Panel>
  );
}

function Admitted({
  issues,
  capacity,
  observedAt,
}: {
  issues: IssueSummary[];
  capacity: number;
  observedAt: string;
}) {
  const counted = issues.filter(countsAgainstCapacity);
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Ratio
        label="Admitted issues of capacity"
        value={counted.length}
        max={capacity}
        caption={`Admitted ${counted.length} of ${capacity}`}
      />
      {counted.length ? (
        <ul
          aria-label="Issues counted against capacity"
          className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1"
        >
          {counted.map((issue) => (
            <li key={issue.issue} className="flex items-center gap-1">
              <IssueButton issue={issue.issue} />
              <StatusBadge value={issue.status} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyNote>
          No admitted issue counts against capacity right now.
        </EmptyNote>
      )}
      <Observed what="Work items" at={observedAt} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Attention
// ---------------------------------------------------------------------------

function AttentionPanel({
  factory,
  loading,
}: {
  factory: FactoryValue;
  loading: boolean;
}) {
  return (
    <Panel
      title="Attention"
      description="Material findings from analysis that Samson also sees; open items first."
    >
      <Section value={factory} loading={loading} label={FACTORY_LABEL}>
        {(data, observedAt) => (
          <AttentionList items={data.attention} observedAt={observedAt} />
        )}
      </Section>
    </Panel>
  );
}

function AttentionList({
  items,
  observedAt,
}: {
  items: AttentionItem[];
  observedAt: string;
}) {
  const sorted = [...items].sort(
    (left, right) =>
      Number(right.status === "open") - Number(left.status === "open") ||
      time(right.at) - time(left.at),
  );
  const open = sorted.some((item) => item.status === "open");
  return (
    <>
      {open ? null : <EmptyNote>No open attention items.</EmptyNote>}
      {sorted.length ? (
        <ul className="flex min-w-0 flex-col gap-3">
          {sorted.map((item) => (
            <AttentionRow key={item.fingerprint} item={item} />
          ))}
        </ul>
      ) : null}
      <Observed what="Attention items" at={observedAt} />
    </>
  );
}

function AttentionRow({ item }: { item: AttentionItem }) {
  const { openReport } = useConsole();
  const titleId = useId();
  const report = item.report;
  return (
    <li className="flex min-w-0 flex-col gap-2 rounded-lg border p-3">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <StatusBadge
          value={item.status === "open" ? "FINDINGS" : item.status}
          label={item.status}
        />
        <h3 id={titleId} className="min-w-0 break-words text-sm font-medium">
          {item.title}
        </h3>
      </div>
      <p className="break-words text-sm text-muted-foreground">
        {scopeLabel(item.scope)} · recorded <When value={item.at} /> (
        <Ago value={item.at} />)
      </p>
      {report ? (
        <div>
          <Button
            size="sm"
            variant="outline"
            aria-describedby={titleId}
            onClick={() => openReport(report)}
          >
            Open report
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No report is linked to this item.
        </p>
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------

function AnalysisPanel({
  factory,
  engine,
  loading,
}: {
  factory: FactoryValue;
  engine: EngineValue;
  loading: boolean;
}) {
  return (
    <Panel title="Analysis" description={ADVISORY}>
      <AnalyzeNow factory={factory} />
      <RunningAnalyses engine={engine} loading={loading} />
      <Reports factory={factory} loading={loading} />
    </Panel>
  );
}

function AnalyzeNow({ factory }: { factory: FactoryValue }) {
  const headingId = useId();
  const triggerId = useId();
  const [chosen, setChosen] = useState("factory");
  const admitted =
    factory?.state === "available"
      ? factory.data.issues.filter((issue) => issue.admitted)
      : [];
  const choices = [
    { value: "factory", label: "Whole factory" },
    ...admitted.map((issue) => ({
      value: `issue:${issue.issue}`,
      label: `Issue #${issue.issue}`,
    })),
  ];
  // A chosen issue that is no longer admitted falls back to the whole factory.
  const scope = choices.some((choice) => choice.value === chosen)
    ? chosen
    : "factory";
  return (
    <section
      aria-labelledby={headingId}
      className="flex min-w-0 flex-col gap-3"
    >
      <h3 id={headingId} className="text-sm font-medium">
        Analyze now
      </h3>
      <div className="flex min-w-0 flex-col gap-2">
        <Select<string>
          items={choices}
          value={scope}
          onValueChange={(value) => {
            if (value !== null) setChosen(value);
          }}
        >
          <SelectControlLabel>Analysis scope</SelectControlLabel>
          <SelectTrigger id={triggerId}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {choices.map((choice) => (
              <SelectItem key={choice.value} value={choice.value}>
                {choice.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ControlButton action={{ kind: "analyze", scope }} label="Analyze now" />
    </section>
  );
}

function RunningAnalyses({
  engine,
  loading,
}: {
  engine: EngineValue;
  loading: boolean;
}) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="flex min-w-0 flex-col gap-2"
    >
      <h3 id={headingId} className="text-sm font-medium">
        Running analyses
      </h3>
      <Section value={engine} loading={loading} label="engine">
        {(data, observedAt) => {
          const running = data.runs.filter(
            (run) =>
              run.workflow_name === "core-analyze" &&
              (run.status === "running" || run.status === "pending"),
          );
          return (
            <>
              {running.length ? (
                <ul className="flex min-w-0 flex-col gap-2">
                  {running.map((run) => (
                    <li
                      key={run.id}
                      className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm"
                    >
                      <StatusBadge value="running" label="Analysis running" />
                      <span className="text-muted-foreground">
                        {run.status === "pending" ? "queued" : "started"}{" "}
                        <Ago value={run.started_at} />
                      </span>
                      <RunButton run={run.id} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyNote>
                  No analysis is running on the current engine page.
                </EmptyNote>
              )}
              <Observed what="Engine runs" at={observedAt} />
            </>
          );
        }}
      </Section>
    </section>
  );
}

function Reports({
  factory,
  loading,
}: {
  factory: FactoryValue;
  loading: boolean;
}) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="flex min-w-0 flex-col gap-2"
    >
      <h3 id={headingId} className="text-sm font-medium">
        Reports
      </h3>
      <Section value={factory} loading={loading} label={FACTORY_LABEL}>
        {(data, observedAt) => {
          const reports = [...data.analysis].sort(
            (left, right) => time(right.at) - time(left.at),
          );
          return (
            <>
              {reports.length ? (
                <ul className="flex min-w-0 flex-col gap-3">
                  {reports.map((report) => (
                    <ReportRow key={report.run} report={report} />
                  ))}
                </ul>
              ) : (
                <EmptyNote>No analysis report has been recorded yet.</EmptyNote>
              )}
              <Observed what="Analysis index" at={observedAt} />
            </>
          );
        }}
      </Section>
    </section>
  );
}

function ReportRow({ report }: { report: AnalysisIndexEntry }) {
  const { openReport } = useConsole();
  const summaryId = useId();
  return (
    <li className="flex min-w-0 flex-col gap-2 rounded-lg border p-3">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <StatusBadge value={report.status} />
        <p id={summaryId} className="min-w-0 break-words text-sm font-medium">
          {scopeLabel(report.scope)} · {report.trigger} trigger ·{" "}
          {report.findings} {report.findings === 1 ? "finding" : "findings"}
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        Recorded <When value={report.at} /> (<Ago value={report.at} />)
      </p>
      <div>
        <Button
          size="sm"
          variant="outline"
          aria-describedby={summaryId}
          onClick={() => openReport(report.run)}
        >
          Open report
        </Button>
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Usage
// ---------------------------------------------------------------------------

const USAGE_METERS = [
  "Subscription allowance",
  "Context occupancy",
  "Session usage",
  "API-equivalent cost",
];

function UsagePanel() {
  return (
    <Panel
      title="Usage"
      description="No usage figure is shown, because none can be observed."
    >
      <ul className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        {USAGE_METERS.map((name) => (
          <li key={name} className="min-w-0">
            <Unavailable title={`${name}: unavailable`}>
              {NO_USAGE_SOURCE}
            </Unavailable>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Analysis report dialog
// ---------------------------------------------------------------------------

export function ReportDialog({
  run,
  close,
}: {
  run: string | null;
  close: () => void;
}) {
  const { scope } = useConsole();
  const query = useReport(scope, run);
  return (
    <Dialog
      open={run !== null}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent scrollable className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Analysis report</DialogTitle>
          <DialogDescription>{ADVISORY}</DialogDescription>
        </DialogHeader>
        {run === null ? null : query.isPending ? (
          <LoadingRows label="Loading the analysis report…" />
        ) : query.isError ? (
          <div className="flex min-w-0 flex-col gap-3">
            <ErrorNote>
              {query.error instanceof ApiError && query.error.status === 404
                ? "No report is recorded for that run."
                : query.error.message}
            </ErrorNote>
            <div>
              <Button
                size="sm"
                variant="outline"
                disabled={query.isFetching}
                onClick={() => void query.refetch()}
              >
                <RotateCcw aria-hidden="true" />
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <ReportView report={query.data} readAt={query.dataUpdatedAt} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReportView({
  report,
  readAt,
}: {
  report: AnalysisReport;
  readAt: number;
}) {
  const read = readAt ? new Date(readAt).toISOString() : null;
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <Facts>
        <Fact term="Status">
          <StatusBadge value={report.status} />
        </Fact>
        <Fact term="Scope">{scopeLabel(report.scope)}</Fact>
        <Fact term="Trigger">{report.trigger}</Fact>
        <Fact term="Recorded at">
          <When value={report.at} /> (<Ago value={report.at} />)
        </Fact>
        <Fact term="Run">
          <Mono>{report.run}</Mono>
        </Fact>
        <Fact term="Result">
          {report.result ? (
            <StatusBadge value={report.result.result} />
          ) : (
            "No result recorded"
          )}
        </Fact>
        <Fact term="Problem">
          {report.problem ? (
            <LongText>{report.problem}</LongText>
          ) : (
            "None recorded"
          )}
        </Fact>
        <Fact term="Read by the Console">
          {read ? (
            <>
              <When value={read} /> (<Ago value={read} />)
            </>
          ) : (
            "Not recorded"
          )}
        </Fact>
      </Facts>
      {report.result ? (
        <ReportResult result={report.result} />
      ) : (
        <Unavailable title="No result">
          The analysis recorded no result. A failed analysis does not mean the
          factory is healthy or unhealthy.
        </Unavailable>
      )}
    </div>
  );
}

type ReportResultValue = NonNullable<AnalysisReport["result"]>;

function Evidence({ ids }: { ids: string[] }) {
  if (!ids.length) return <>None cited</>;
  return (
    <ul aria-label="Evidence ids" className="flex min-w-0 flex-wrap gap-2">
      {ids.map((id, index) => (
        <li key={`${index}-${id}`} className="min-w-0">
          <Mono>{id}</Mono>
        </li>
      ))}
    </ul>
  );
}

function ReportResult({ result }: { result: ReportResultValue }) {
  return (
    <>
      <section className="flex min-w-0 flex-col gap-3">
        <h3 className="text-sm font-medium">Observations</h3>
        {result.observations.length ? (
          <ol className="flex min-w-0 flex-col gap-3">
            {result.observations.map((observation, index) => (
              <li
                key={`${index}-${observation.text.slice(0, 24)}`}
                className="flex min-w-0 flex-col gap-1"
              >
                <LongText>{observation.text}</LongText>
                <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>Evidence</span>
                  <Evidence ids={observation.evidence} />
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyNote>No observations were recorded.</EmptyNote>
        )}
      </section>
      <section className="flex min-w-0 flex-col gap-3">
        <h3 className="text-sm font-medium">Findings</h3>
        {result.findings.length ? (
          <ol className="flex min-w-0 flex-col gap-3">
            {result.findings.map((finding, index) => (
              <Finding
                key={`${index}-${finding.title.slice(0, 24)}`}
                finding={finding}
              />
            ))}
          </ol>
        ) : (
          <EmptyNote>No findings were recorded.</EmptyNote>
        )}
      </section>
      <section className="flex min-w-0 flex-col gap-3">
        <h3 className="text-sm font-medium">Coverage limits</h3>
        <TextList
          items={result.coverage_limits}
          empty="No coverage limits were recorded."
        />
      </section>
    </>
  );
}

function Finding({
  finding,
}: {
  finding: ReportResultValue["findings"][number];
}) {
  return (
    <li className="flex min-w-0 flex-col gap-3 rounded-lg border p-3">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Badge variant={finding.material ? "warning" : "secondary"}>
          {finding.material ? "Material" : "Advisory"}
        </Badge>
        <h4 className="min-w-0 break-words text-sm font-medium">
          {finding.title}
        </h4>
      </div>
      <LongText>{finding.explanation}</LongText>
      <Facts>
        <Fact term="Alternatives">
          <TextList items={finding.alternatives} empty="None recorded" />
        </Fact>
        <Fact term="Evidence">
          <Evidence ids={finding.evidence} />
        </Fact>
        <Fact term="Next step">
          <LongText>{finding.next_step}</LongText>
        </Fact>
        <Fact term="How to tell">
          <LongText>{finding.how_to_tell}</LongText>
        </Fact>
      </Facts>
    </li>
  );
}
