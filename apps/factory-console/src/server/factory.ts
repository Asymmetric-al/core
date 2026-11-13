import { BackendError, type Archon } from "./archon";
import {
  askArgs,
  controlArgs,
  interpret,
  type ControlRunner,
  type RequestIds,
} from "./control";
import {
  StateUnavailable,
  type StateDocument,
  type StateReader,
} from "./state";
import {
  scrub,
  scrubDeep,
  type EngineState,
  type RunDetailView,
} from "../lib/contracts";
import {
  CONVERSATION_PATTERN,
  DESTRUCTIVE,
  actionKey,
  analysisIndexSchema,
  analysisReportSchema,
  attentionDocSchema,
  chatDocSchema,
  describeAction,
  factoryDocSchema,
  feedbackDocSchema,
  scopeDocSchema,
  selectionDocSchema,
  workItemSchema,
  type AnalysisReport,
  type Availability,
  type ChatDoc,
  type ChatView,
  type FeedbackDoc,
  type ControlAction,
  type ControlReceipt,
  type FactoryState,
  type IssueDetailView,
  type IssueSummary,
  type ScopeDoc,
  type Snapshot,
  type WorkItem,
} from "../lib/factory";
import {
  ledgerPage,
  type LedgerInput,
  type LedgerPage,
  type LedgerQuery,
} from "../lib/ledger";
import { performanceView, type PerformanceView } from "../lib/performance";

import type {
  FactoryConfiguration,
  FactoryPolicy,
  FactoryPolicyReader,
} from "./factory-config";
import type { Configuration } from "./security";
import type { RoundTrace } from "../lib/timing";
import type { z } from "zod";

export type FactoryDependencies = {
  auth: Configuration;
  settings: FactoryConfiguration | null;
  settingsError: string | null;
  reader: StateReader | null;
  control: ControlRunner | null;
  /** Scope owners and the admission limit, from core-factory.json. */
  policy: FactoryPolicyReader | null;
  engine: Archon;
  ids: RequestIds;
  now?: () => Date;
};

const ISSUE_DOCUMENT = /^core\/issues\/([1-9][0-9]{0,7})$/;
const FEEDBACK_DOCUMENT = /^core\/issues\/([1-9][0-9]{0,7})\/feedback$/;
const DETAIL_LIMIT = 8;
const SUMMARY_ROUNDS = 2;
const SUMMARY_TEXT = 200;
/** Rounds whose engine records an issue's detail reads (the pack keeps 12). */
const ROUND_LIMIT = 16;

function parse<Schema extends z.ZodType>(
  schema: Schema,
  document: StateDocument,
  malformed: { name: string; reason: string }[],
): z.infer<Schema> | null {
  if (document.value === null || document.value === undefined) return null;
  const result = schema.safeParse(document.value);
  if (result.success) return scrubDeep(result.data);
  const issue = result.error.issues[0];
  malformed.push({
    name: document.name,
    reason:
      `Unexpected ${issue?.path.join(".") || "document"}: ${issue?.message ?? "invalid"}`.slice(
        0,
        300,
      ),
  });
  return null;
}

function clip(text: string | null | undefined, size: number) {
  if (!text) return text;
  return text.length > size ? `${text.slice(0, size)}…` : text;
}

function reasonOf(error: unknown, fallback: string) {
  return error instanceof StateUnavailable || error instanceof BackendError
    ? error.message
    : fallback;
}

export class Factory {
  private now: () => Date;

  constructor(private deps: FactoryDependencies) {
    this.now = deps.now ?? (() => new Date());
  }

  private stamp() {
    return this.now().toISOString();
  }

  private ready() {
    const { settings, reader, control, settingsError } = this.deps;
    if (!settings || !reader || !control)
      throw new BackendError(
        settingsError ?? "The factory adapter is not configured",
        503,
      );
    return { settings, reader, control };
  }

  /** core-factory.json owners and admission limit; null fields are unavailable. */
  private async policy(): Promise<FactoryPolicy> {
    const { policy, settingsError } = this.deps;
    const unavailable = (reason: string): FactoryPolicy => ({
      owners: null,
      capacity: null,
      reason,
    });
    if (!policy)
      return unavailable(
        settingsError ?? "The factory adapter is not configured",
      );
    try {
      return await policy();
    } catch {
      return unavailable("The factory configuration file could not be read");
    }
  }

  private summarize(
    item: WorkItem,
    lease: StateDocument["lease"],
    scope: ScopeDoc | null,
  ): IssueSummary {
    const repair = item.brief?.repair ?? null;
    return {
      issue: item.issue,
      admitted: true,
      assignedAt: item.assignment.assignedAt,
      status: item.status,
      control: item.control,
      controlReason: item.controlReason ?? null,
      round: item.round,
      route: item.route,
      run: item.run
        ? {
            id: item.run.id,
            startedAt: item.run.startedAt,
            route: item.run.route ?? null,
          }
        : null,
      lease,
      branch: item.branch ?? null,
      head: item.head ?? null,
      pr: item.pr
        ? {
            number: item.pr.number,
            url: item.pr.url,
            mergedAt: item.pr.mergedAt ?? null,
          }
        : null,
      blocker: item.blocker
        ? {
            code: item.blocker.code,
            detail: item.blocker.detail ?? null,
            recovery: item.blocker.recovery ?? null,
            at: item.blocker.at ?? null,
            route: item.blocker.route ?? null,
          }
        : null,
      priority: scope?.priorities[String(item.issue)] ?? null,
      endState: item.assignment.endState,
      owner: item.assignment.owner,
      inScope: Boolean(scope?.issues.includes(item.issue)),
      repair: repair
        ? {
            acceptance: repair.acceptance.length,
            implementation: repair.implementation.length,
            reviewOnly: repair.reviewOnly,
            source: repair.source,
          }
        : null,
      parked: item.parked
        ? {
            areas: item.parked.areas,
            holders: item.parked.holders,
            at: item.parked.at ?? null,
          }
        : null,
      mergedOutside: mergedOutside(item),
      // The snapshot is polled every ten seconds for every issue, so it keeps
      // the latest rounds and only the latest round's summary, shortened. Run
      // links are resolved on the server (Snapshot.runIssues) and the issue
      // detail read carries every recorded round in full.
      history: item.history
        .slice(-SUMMARY_ROUNDS)
        .map((entry, index, kept) => ({
          ...entry,
          summary:
            index === kept.length - 1
              ? clip(entry.summary, SUMMARY_TEXT)
              : null,
        })),
      reviews: item.reviews
        ? Object.fromEntries(
            Object.entries(item.reviews).map(([name, review]) => [
              name,
              {
                decision: review.decision,
                findings: review.findings,
                sealedAt: review.sealedAt,
              },
            ]),
          )
        : null,
      finalDecision: item.final?.decision ?? null,
      updatedAt: item.updatedAt,
    };
  }

  async state(): Promise<Availability<FactoryState>> {
    return (await this.readState()).state;
  }

  /** Factory state plus every recorded round's run, mapped to its issues. */
  private async readState(): Promise<{
    state: Availability<FactoryState>;
    runs: Map<string, number[]>;
  }> {
    const runs = new Map<string, number[]>();
    return { state: await this.factoryState(runs), runs };
  }

  private async factoryState(
    runs: Map<string, number[]>,
  ): Promise<Availability<FactoryState>> {
    const observedAt = this.stamp();
    let reader: StateReader;
    try {
      reader = this.ready().reader;
    } catch (error) {
      return {
        state: "unavailable",
        reason: reasonOf(error, "Factory adapter unavailable"),
        observedAt,
      };
    }
    try {
      const [factory, scope, issues, selection, attention, analysis] =
        await Promise.all([
          reader.get("core/factory"),
          reader.get("core/scope"),
          reader.list("core/issues/"),
          reader.get("core/selection"),
          reader.get("core/attention"),
          reader.get("core/analysis"),
        ]);
      const malformed: { name: string; reason: string }[] = [];
      const factoryDoc = parse(factoryDocSchema, factory, malformed);
      const scopeDoc = parse(scopeDocSchema, scope, malformed);
      const summaries: IssueSummary[] = [];
      for (const document of issues) {
        if (!ISSUE_DOCUMENT.test(document.name)) continue;
        const item = parse(workItemSchema, document, malformed);
        if (!item) continue;
        summaries.push(this.summarize(item, document.lease, scopeDoc));
        for (const entry of item.history) {
          const linked = runs.get(entry.run) ?? [];
          if (!linked.includes(item.issue))
            runs.set(entry.run, [...linked, item.issue]);
        }
      }
      const admitted = new Set(summaries.map((summary) => summary.issue));
      for (const issue of scopeDoc?.issues ?? [])
        if (!admitted.has(issue))
          summaries.push({
            issue,
            admitted: false,
            assignedAt: null,
            status: "queued",
            control: null,
            controlReason: null,
            round: 0,
            route: null,
            run: null,
            lease: null,
            branch: null,
            head: null,
            pr: null,
            blocker: null,
            priority: scopeDoc?.priorities[String(issue)] ?? null,
            endState:
              scopeDoc?.endStates[String(issue)] ?? scopeDoc?.endState ?? null,
            owner: scopeDoc?.owner ?? null,
            inScope: true,
            repair: null,
            parked: null,
            mergedOutside: null,
            history: [],
            reviews: null,
            finalDecision: null,
            updatedAt: null,
          });
      summaries.sort((left, right) => left.issue - right.issue);
      return {
        state: "available",
        observedAt,
        data: {
          factory: factoryDoc,
          scope: scopeDoc,
          issues: summaries,
          malformed,
          selection:
            parse(selectionDocSchema, selection, malformed)?.decisions ?? [],
          attention:
            parse(attentionDocSchema, attention, malformed)?.items ?? [],
          analysis:
            parse(analysisIndexSchema, analysis, malformed)?.reports ?? [],
        },
      };
    } catch (error) {
      return {
        state: "unavailable",
        reason: reasonOf(error, "Factory state is unavailable"),
        observedAt,
      };
    }
  }

  private async enginePage(offset: number) {
    const { engine } = this.deps;
    const health = await engine.health();
    const page = await engine.runs(offset, { checked: true });
    return { health, ...page, offset };
  }

  private async engineState(
    page: Promise<Awaited<ReturnType<Factory["enginePage"]>>>,
    linked: string[],
  ): Promise<Availability<EngineState>> {
    const observedAt = this.stamp();
    const { engine } = this.deps;
    try {
      const base = await page;
      const wanted = [
        ...linked,
        ...base.runs
          .filter((run) => run.status === "running" || run.status === "paused")
          .map((run) => run.id),
      ];
      const ids = [...new Set(wanted)].slice(0, DETAIL_LIMIT);
      const details: Record<string, RunDetailView> = {};
      const detailErrors: Record<string, string> = {};
      await Promise.all(
        ids.map(async (id) => {
          try {
            details[id] = await engine.detail(id, { checked: true });
          } catch (error) {
            detailErrors[id] = reasonOf(error, "Run detail unavailable");
          }
        }),
      );
      return {
        state: "available",
        observedAt,
        data: { ...base, details, detailErrors },
      };
    } catch (error) {
      return {
        state: "unavailable",
        reason: reasonOf(error, "Archon is unavailable"),
        observedAt,
      };
    }
  }

  async snapshot(offset = 0): Promise<Snapshot> {
    // The engine page and the factory documents are read concurrently; run
    // details then cover every round the work items reference.
    const page = this.enginePage(offset);
    page.catch(() => undefined);
    const policy = this.policy();
    const { state: factory, runs } = await this.readState();
    const linked =
      factory.state === "available"
        ? factory.data.issues.flatMap((issue) =>
            issue.run
              ? [issue.run.id]
              : issue.lease?.live
                ? [issue.lease.runId]
                : [],
          )
        : [];
    const engine = await this.engineState(page, linked);
    const runIssues: Record<string, number[]> = {};
    if (engine.state === "available")
      for (const id of [
        ...engine.data.runs.map((run) => run.id),
        ...Object.keys(engine.data.details),
      ]) {
        const issues = runs.get(id);
        if (issues) runIssues[id] = issues;
      }
    const { auth, settings } = this.deps;
    const { owners, capacity, reason } = await policy;
    return {
      runIssues,
      identity: {
        instance: auth.storeId,
        operator: auth.owner,
        codebase: auth.codebaseId,
      },
      observedAt: this.stamp(),
      engine,
      factory,
      settings: {
        capacity,
        owners,
        configReason: reason,
        repository: settings?.repository ?? null,
        fixture: settings?.fixtureLabel ?? null,
      },
    };
  }

  private async requestHistory(target: string): Promise<RequestHistory> {
    const { reader } = this.ready();
    const malformed: { name: string; reason: string }[] = [];
    if (target === "factory")
      return (
        parse(factoryDocSchema, await reader.get("core/factory"), malformed)
          ?.requests ?? []
      );
    if (target === "scope")
      return (
        parse(scopeDocSchema, await reader.get("core/scope"), malformed)
          ?.requests ?? []
      );
    const issue = Number(target.slice("issue:".length));
    if (!Number.isSafeInteger(issue) || issue <= 0) return [];
    return (
      parse(workItemSchema, await reader.get(`core/issues/${issue}`), malformed)
        ?.requests ?? []
    );
  }

  mintRequestId() {
    return this.deps.ids.mint();
  }

  runDetail(runId: string) {
    return this.deps.engine.detail(runId);
  }

  runArtifacts(runId: string) {
    return this.deps.engine.artifacts(runId);
  }

  async issue(issue: number): Promise<IssueDetailView> {
    const { reader, settings } = this.ready();
    const [document, feedback, scope] = await Promise.all([
      reader.get(`core/issues/${issue}`),
      reader.get(`core/issues/${issue}/feedback`),
      reader.get("core/scope"),
    ]);
    const malformed: { name: string; reason: string }[] = [];
    const item = parse(workItemSchema, document, malformed);
    const scopeDoc = parse(scopeDocSchema, scope, malformed);
    const inScope = Boolean(scopeDoc?.issues.includes(issue));
    if (malformed.some((entry) => entry.name === document.name))
      throw new BackendError(
        `The work item for #${issue} is malformed: ${malformed[0].reason}`,
        502,
      );
    if (!item && !inScope)
      throw new BackendError(
        `#${issue} has no work item and is not in scope`,
        404,
      );
    return {
      issue,
      observedAt: this.stamp(),
      requestUrl: `https://github.com/${settings.repository}/issues/${issue}`,
      item,
      lease: document.lease,
      feedback: parse(feedbackDocSchema, feedback, malformed),
      inScope,
      priority: scopeDoc?.priorities[String(issue)] ?? null,
      allowProtected: scopeDoc?.allowProtected[String(issue)] ?? null,
      rounds: item ? await this.rounds(item) : [],
    };
  }

  /**
   * The work item's rounds, oldest first, each with the engine's run record
   * when the engine still has it. A round the engine cannot return keeps the
   * times the work item recorded and says why its records are missing.
   */
  private async rounds(item: WorkItem): Promise<RoundTrace[]> {
    const traces: RoundTrace[] = [
      ...item.history.map((entry) => ({
        round: entry.round,
        run: entry.run,
        route: entry.route ?? null,
        startedAt: entry.startedAt ?? null,
        endedAt: entry.at,
        status: null,
        intervals: null,
        error: null,
      })),
      ...(item.run
        ? [
            {
              round: item.round,
              run: item.run.id,
              route: item.run.route ?? item.route,
              startedAt: item.run.startedAt,
              endedAt: null,
              status: null,
              intervals: null,
              error: null,
            },
          ]
        : []),
    ].slice(-ROUND_LIMIT);
    const { engine } = this.deps;
    const details = new Map<string, RunDetailView | string>();
    try {
      await engine.health();
      await Promise.all(
        [...new Set(traces.map((trace) => trace.run))].map(async (id) => {
          try {
            details.set(id, await engine.detail(id, { checked: true }));
          } catch (error) {
            details.set(id, reasonOf(error, "Run detail unavailable"));
          }
        }),
      );
    } catch (error) {
      const reason = reasonOf(error, "Archon is unavailable");
      for (const trace of traces) details.set(trace.run, reason);
    }
    return traces.map((trace) => {
      const detail = details.get(trace.run);
      if (!detail || typeof detail === "string")
        return { ...trace, error: detail ?? "Run detail unavailable" };
      const live = ["pending", "running", "paused"].includes(detail.run.status);
      return {
        ...trace,
        startedAt: detail.run.started_at,
        endedAt: live ? null : (detail.run.completed_at ?? trace.endedAt),
        status: detail.run.status,
        intervals: detail.intervals,
      };
    });
  }

  /**
   * Everything History & decisions and Checks & reviews are built from, read
   * once per request from the state documents. Unreadable documents are left
   * out and listed, never guessed at.
   */
  private async ledgerInput(): Promise<{
    input: LedgerInput;
    malformed: { name: string; reason: string }[];
  }> {
    const { reader, settings } = this.ready();
    const [factory, scope, issues, selection, attention, analysis, chats] =
      await Promise.all([
        reader.get("core/factory"),
        reader.get("core/scope"),
        reader.list("core/issues/"),
        reader.get("core/selection"),
        reader.get("core/attention"),
        reader.get("core/analysis"),
        reader.list("core/chat/"),
      ]);
    const malformed: { name: string; reason: string }[] = [];
    const factoryDoc = parse(factoryDocSchema, factory, malformed);
    const scopeDoc = parse(scopeDocSchema, scope, malformed);
    const items: WorkItem[] = [];
    const feedback = new Map<number, FeedbackDoc>();
    for (const document of issues) {
      if (ISSUE_DOCUMENT.test(document.name)) {
        const item = parse(workItemSchema, document, malformed);
        if (item) items.push(item);
        continue;
      }
      const match = FEEDBACK_DOCUMENT.exec(document.name);
      if (!match) continue;
      const doc = parse(feedbackDocSchema, document, malformed);
      if (doc) feedback.set(Number(match[1]), doc);
    }
    const requestsOf = new Map<string, RequestHistory>([
      ["factory", factoryDoc?.requests ?? []],
      ["scope", scopeDoc?.requests ?? []],
      ...items.map(
        (item) =>
          [`issue:${item.issue}`, item.requests] as [string, RequestHistory],
      ),
    ]);
    const conversations: { id: string; doc: ChatDoc }[] = [];
    const proposals = new Map<string, boolean | null>();
    for (const document of chats) {
      const id = document.name.slice("core/chat/".length);
      if (!CONVERSATION_PATTERN.test(id)) continue;
      const doc = parse(chatDocSchema, document, malformed);
      if (!doc) continue;
      conversations.push({ id, doc });
      for (const message of doc.messages)
        if (message.role === "samson" && message.operation && message.request)
          proposals.set(
            `${id}/${message.request}`,
            proposalRecord(
              requestsOf.get(targetOf(message.operation)) ?? [],
              `${this.deps.ids.proposal(id, message.request)}-`,
              message.at,
            ).recorded,
          );
    }
    return {
      malformed,
      input: {
        repository: settings.repository,
        factory: factoryDoc,
        scope: scopeDoc,
        items,
        feedback,
        selection:
          parse(selectionDocSchema, selection, malformed)?.decisions ?? [],
        attention: parse(attentionDocSchema, attention, malformed)?.items ?? [],
        analysis:
          parse(analysisIndexSchema, analysis, malformed)?.reports ?? [],
        chats: conversations,
        proposals,
      },
    };
  }

  /** One server-side page of History & decisions or Checks & reviews. */
  async ledger(query: LedgerQuery): Promise<LedgerPage> {
    const { input, malformed } = await this.ledgerInput();
    return ledgerPage(input, query, { observedAt: this.stamp(), malformed });
  }

  /** Verified deliveries, cycle, wait and rework from the work items. */
  async performance(): Promise<
    PerformanceView & { malformed: { name: string; reason: string }[] }
  > {
    const { reader } = this.ready();
    const malformed: { name: string; reason: string }[] = [];
    const items: WorkItem[] = [];
    for (const document of await reader.list("core/issues/")) {
      if (!ISSUE_DOCUMENT.test(document.name)) continue;
      const item = parse(workItemSchema, document, malformed);
      if (item) items.push(item);
    }
    return {
      ...performanceView(items, { observedAt: this.stamp(), mergedOutside }),
      malformed,
    };
  }

  async report(run: string): Promise<AnalysisReport> {
    const { reader } = this.ready();
    if (!/^[A-Za-z0-9_-]{1,160}$/.test(run))
      throw new BackendError("Invalid report id", 400);
    const malformed: { name: string; reason: string }[] = [];
    const report = parse(
      analysisReportSchema,
      await reader.get(`core/analysis/reports/${run}`),
      malformed,
    );
    if (malformed.length)
      throw new BackendError(
        `The report is malformed: ${malformed[0].reason}`,
        502,
      );
    if (!report)
      throw new BackendError("No report is recorded for that run", 404);
    return report;
  }

  async conversation(
    id: string,
  ): Promise<{ observedAt: string; doc: ChatDoc | null }> {
    const { reader } = this.ready();
    if (!CONVERSATION_PATTERN.test(id))
      throw new BackendError("Invalid conversation id", 400);
    const malformed: { name: string; reason: string }[] = [];
    const doc = parse(
      chatDocSchema,
      await reader.get(`core/chat/${id}`),
      malformed,
    );
    if (malformed.length)
      throw new BackendError(
        `The conversation is malformed: ${malformed[0].reason}`,
        502,
      );
    return { observedAt: this.stamp(), doc };
  }

  async chat(): Promise<ChatView> {
    const { reader } = this.ready();
    const [chats, factory, scope, issues] = await Promise.all([
      reader.list("core/chat/"),
      reader.get("core/factory"),
      reader.get("core/scope"),
      reader.list("core/issues/"),
    ]);
    const malformed: { name: string; reason: string }[] = [];
    const requestsOf = new Map<string, RequestHistory>();
    const factoryDoc = parse(factoryDocSchema, factory, malformed);
    const scopeDoc = parse(scopeDocSchema, scope, malformed);
    requestsOf.set("factory", factoryDoc?.requests ?? []);
    requestsOf.set("scope", scopeDoc?.requests ?? []);
    for (const document of issues) {
      const match = ISSUE_DOCUMENT.exec(document.name);
      if (!match) continue;
      const item = parse(workItemSchema, document, malformed);
      requestsOf.set(`issue:${match[1]}`, item?.requests ?? []);
    }
    const conversations: ChatView["conversations"] = [];
    for (const document of chats) {
      const id = document.name.slice("core/chat/".length);
      if (!CONVERSATION_PATTERN.test(id)) continue;
      const doc = parse(chatDocSchema, document, malformed);
      if (!doc) continue;
      conversations.push({
        id,
        updatedAt: doc.messages.at(-1)?.at ?? null,
        messages: doc.messages.map((message) => {
          if (
            message.role !== "samson" ||
            !message.operation ||
            !message.request
          )
            return { ...message, applied: null };
          const prefix = `${this.deps.ids.proposal(id, message.request)}-`;
          const history = requestsOf.get(targetOf(message.operation)) ?? [];
          return {
            ...message,
            applied: proposalRecord(history, prefix, message.at),
          };
        }),
      });
    }
    conversations.sort((left, right) =>
      (right.updatedAt ?? "").localeCompare(left.updatedAt ?? ""),
    );
    let answering: ChatView["answering"] = [];
    let answeringError: string | null = null;
    try {
      const page = await this.deps.engine.runs(0);
      answering = page.runs
        .filter(
          (run) =>
            run.workflow_name === "core-answer" &&
            ["pending", "running", "paused"].includes(run.status),
        )
        .map((run) => ({
          runId: run.id,
          status: run.status,
          startedAt: run.started_at,
        }));
    } catch (error) {
      answeringError = reasonOf(error, "Archon is unavailable");
    }
    return {
      observedAt: this.stamp(),
      conversations,
      answering,
      answeringError,
      malformed,
    };
  }

  async execute(
    action: ControlAction,
    requestId: string,
    { derived = false, confirmed = false } = {},
  ): Promise<ControlReceipt> {
    const { control } = this.ready();
    if (!derived && !this.deps.ids.verify(requestId))
      throw new BackendError(
        "That request id was not issued by this Console",
        400,
      );
    if (DESTRUCTIVE.has(actionKey(action)) && !confirmed)
      throw new BackendError(
        "This control needs an explicit confirmation",
        400,
      );
    // control.mjs refuses an owner core-factory.json does not list; the
    // Console reads the same file so it never offers or sends another one.
    if (action.kind === "scope") {
      const { owners, reason } = await this.policy();
      if (!owners)
        throw new BackendError(
          `${reason ?? "The factory configuration's owners could not be read"}, so the scope was not changed`,
          503,
        );
      if (!owners.includes(action.owner))
        throw new BackendError(
          "That scope owner is not listed in the factory configuration",
          400,
        );
    }
    // A scope write replaces the per-issue end states. They limit what may
    // merge, so the ones the scope already records are carried through, and
    // the write is refused when they cannot be read.
    let keptEndStates: Record<string, string> = {};
    if (action.kind === "scope") {
      const malformed: { name: string; reason: string }[] = [];
      let current: z.infer<typeof scopeDocSchema> | null;
      try {
        current = parse(
          scopeDocSchema,
          await this.ready().reader.get("core/scope"),
          malformed,
        );
      } catch {
        malformed.push({ name: "core/scope", reason: "unavailable" });
        current = null;
      }
      if (malformed.length)
        throw new BackendError(
          "The current scope could not be read, so the scope was not changed",
          503,
        );
      keptEndStates = current?.endStates ?? {};
    }
    const requestedAt = this.stamp();
    const run = await control.run(
      controlArgs(action, requestId, this.deps.auth.owner, keptEndStates),
    );
    const interpretation = interpret(action.kind, run);
    let observed: ControlReceipt["observed"] = null;
    try {
      observed = await this.observe(action, requestId, heldIssue(run.json));
    } catch {
      observed = null;
    }
    return {
      requestId,
      label: describeAction(action),
      requestedAt,
      ...interpretation,
      observed,
    };
  }

  private async observe(
    action: ControlAction,
    requestId: string,
    held: number | null = null,
  ): Promise<ControlReceipt["observed"]> {
    const { reader } = this.ready();
    const at = this.stamp();
    const malformed: { name: string; reason: string }[] = [];
    switch (action.kind) {
      case "factory": {
        const doc = parse(
          factoryDocSchema,
          await reader.get("core/factory"),
          malformed,
        );
        if (!doc)
          return {
            at,
            summary: "No factory document is recorded",
            recorded: false,
          };
        return {
          at,
          summary: `Intake ${doc.intake} · mode ${doc.mode} · merges ${doc.mergeHold ? "held" : "not held"}`,
          recorded: doc.requests.some((entry) => entry.id === requestId),
        };
      }
      case "issue": {
        const doc = parse(
          workItemSchema,
          await reader.get(`core/issues/${action.issue}`),
          malformed,
        );
        if (!doc)
          return {
            at,
            summary: `#${action.issue} has no work item`,
            recorded: false,
          };
        return {
          at,
          summary: `#${doc.issue} control ${doc.control} · status ${doc.status}${doc.route ? ` · route ${doc.route}` : ""}`,
          recorded: doc.requests.some((entry) => entry.id === requestId),
        };
      }
      case "scope":
      case "prioritize": {
        const doc = parse(
          scopeDocSchema,
          await reader.get("core/scope"),
          malformed,
        );
        if (!doc)
          return { at, summary: "No scope is recorded", recorded: false };
        return {
          at,
          summary:
            action.kind === "prioritize"
              ? `#${action.issue} priority ${doc.priorities[String(action.issue)] ?? "unset"}`
              : `${doc.issues.length} issue(s) → ${doc.endState} for ${doc.owner}${
                  Object.keys(doc.endStates).length
                    ? `; except ${Object.entries(doc.endStates)
                        .map(([issue, state]) => `#${issue} ${state}`)
                        .join(", ")}`
                    : ""
                }`,
          recorded: doc.requests.some((entry) => entry.id === requestId),
        };
      }
      case "cancel-run": {
        const detail = await this.deps.engine.detail(action.runId);
        const run = `Run is ${detail.run.status}`;
        if (held === null) return { at, summary: run, recorded: null };
        // cancel-run held this issue under the same request id first.
        const doc = parse(
          workItemSchema,
          await reader.get(`core/issues/${held}`),
          malformed,
        );
        if (!doc)
          return {
            at,
            summary: `${run} · #${held} has no readable work item`,
            recorded: null,
          };
        return {
          at,
          summary: `${run} · #${held} control ${doc.control} · status ${doc.status}`,
          recorded: doc.requests.some((entry) => entry.id === requestId),
        };
      }
      case "analyze": {
        const doc = parse(
          analysisIndexSchema,
          await reader.get("core/analysis"),
          malformed,
        );
        const last = doc?.reports.at(-1);
        return {
          at,
          summary: last
            ? `Latest recorded report: ${last.status} (${last.scope}) at ${last.at}`
            : "No analysis report is recorded yet",
          recorded: null,
        };
      }
    }
  }

  async ask(
    requestId: string,
    conversation: string | null,
    question: string,
  ): Promise<{ conversation: string; receipt: ControlReceipt }> {
    const { control, reader } = this.ready();
    if (!this.deps.ids.verify(requestId))
      throw new BackendError(
        "That request id was not issued by this Console",
        400,
      );
    const id = conversation ?? this.deps.ids.conversation(requestId);
    if (!CONVERSATION_PATTERN.test(id))
      throw new BackendError("Invalid conversation id", 400);
    const text = question.trim();
    if (!text || text.length > 2000)
      throw new BackendError("A question must contain 1–2000 characters", 400);
    const requestedAt = this.stamp();
    const run = await control.run(askArgs(id, requestId, text));
    const interpretation = interpret("ask", run);
    let observed: ControlReceipt["observed"] = null;
    try {
      const malformed: { name: string; reason: string }[] = [];
      const doc = parse(
        chatDocSchema,
        await reader.get(`core/chat/${id}`),
        malformed,
      );
      const recorded = Boolean(
        doc?.messages.some(
          (message) =>
            message.request === requestId && message.role === "samson",
        ),
      );
      observed = {
        at: this.stamp(),
        summary: recorded
          ? "Samson's reply is recorded"
          : "Samson's reply is not recorded yet",
        recorded,
      };
    } catch {
      observed = null;
    }
    return {
      conversation: id,
      receipt: {
        requestId,
        label: "Ask Samson",
        requestedAt,
        ...interpretation,
        observed,
      },
    };
  }

  /** Apply one recorded Samson proposal through the matching control. */
  async apply(
    conversation: string,
    message: string,
    overrides: { priority?: number; endState?: "PR_READY" | "MERGED" },
    confirmed: boolean,
  ): Promise<ControlReceipt> {
    const { reader } = this.ready();
    const { doc } = await this.conversation(conversation);
    const turn = doc?.messages.find(
      (entry) =>
        entry.role === "samson" && entry.request === message && entry.operation,
    );
    if (!turn?.operation)
      throw new BackendError(
        "No proposed operation is recorded for that turn",
        404,
      );
    const operation = turn.operation;
    const prefix = `${this.deps.ids.proposal(conversation, message)}-`;
    // Decide from durable state before running anything: a proposal whose id
    // the target document records is already applied, whatever variant
    // (priority or end state) is chosen now.
    const record = proposalRecord(
      await this.requestHistory(targetOf(operation)),
      prefix,
      turn.at,
    );
    if (record.recorded === true)
      return {
        requestId: record.requestId,
        label: "Apply Samson's proposal",
        requestedAt: this.stamp(),
        outcome: "already-applied",
        message:
          "Already applied: the target document records this proposal's request id. Nothing was run.",
        code: null,
        revision: null,
        runId: null,
        observed: {
          at: this.stamp(),
          summary: "The target document records this proposal",
          recorded: true,
        },
      };
    if (record.recorded === null && !confirmed)
      throw new BackendError(
        "This proposal is older than the request history the factory retains, so the Console cannot tell whether it was already applied. Confirm explicitly to apply it again.",
        409,
      );
    const reason = scrub(
      `Samson proposal ${conversation}/${message}: ${operation.reason}`,
    ).slice(0, 600);
    let action: ControlAction;
    let variant = "x";
    switch (operation.kind) {
      case "pause-intake":
      case "resume-intake":
      case "drain":
      case "stop":
      case "resume":
      case "hold-merge":
      case "release-merge":
        action = { kind: "factory", action: operation.kind, reason };
        break;
      case "hold":
      case "release":
      case "retry":
      case "reopen":
        if (operation.issue <= 0)
          throw new BackendError("The proposal names no issue", 409);
        action = {
          kind: "issue",
          issue: operation.issue,
          action: operation.kind,
          reason,
        };
        break;
      case "assign-scope": {
        const malformed: { name: string; reason: string }[] = [];
        const scope = parse(
          scopeDocSchema,
          await reader.get("core/scope"),
          malformed,
        );
        const endState =
          operation.endState !== "unchanged"
            ? operation.endState
            : (overrides.endState ?? scope?.endState);
        if (!endState)
          throw new BackendError(
            "Choose an end state: there is no current scope to keep",
            409,
          );
        if (!operation.issues.length)
          throw new BackendError("The proposal names no issues", 409);
        // A proposal names no owner. It keeps the current scope's owner, which
        // execute() then checks against core-factory.json, so an owner the
        // file no longer lists is refused, never replaced. Without a current
        // scope it takes the file's only owner; it never picks among several.
        let owner = scope?.owner;
        if (!owner) {
          const policy = await this.policy();
          const { owners } = policy;
          if (!owners)
            throw new BackendError(
              `${policy.reason ?? "The factory configuration's owners could not be read"}, so the scope was not changed`,
              503,
            );
          if (owners.length !== 1)
            throw new BackendError(
              "There is no current scope owner to keep: assign this scope from Assign scope, where the owner is chosen",
              409,
            );
          owner = owners[0];
        }
        if (
          operation.issues.length > 200 ||
          operation.issues.some(
            (issue) =>
              !Number.isSafeInteger(issue) || issue <= 0 || issue > 10_000_000,
          )
        )
          throw new BackendError(
            "The proposal names an invalid issue number",
            409,
          );
        action = {
          kind: "scope",
          issues: operation.issues,
          endState,
          owner,
          note: reason,
        };
        variant = `e${endState === "MERGED" ? "m" : "p"}`;
        break;
      }
      case "reprioritize":
        if (operation.issue <= 0)
          throw new BackendError("The proposal names no issue", 409);
        if (
          overrides.priority === undefined ||
          !Number.isInteger(overrides.priority) ||
          overrides.priority < 0 ||
          overrides.priority > 100
        )
          throw new BackendError(
            "Choose a priority from 0 to 100 to apply this proposal",
            409,
          );
        action = {
          kind: "prioritize",
          issue: operation.issue,
          priority: overrides.priority,
        };
        variant = `p${overrides.priority}`;
        break;
    }
    const receipt = await this.execute(
      action,
      `${this.deps.ids.proposal(conversation, message)}-${variant}`,
      { derived: true, confirmed },
    );
    return { ...receipt, label: `Apply Samson's proposal: ${receipt.label}` };
  }
}

/**
 * Who merged a MERGED issue. The pack can only merge an assignment whose end
 * state is MERGED, so a MERGED issue with another end state was merged
 * outside the factory; otherwise only an explicit record says.
 */
export function mergedOutside(item: WorkItem): boolean | null {
  if (item.status !== "MERGED") return null;
  if (item.pr?.mergedBy === "external") return true;
  if (item.pr?.mergedBy === "factory") return false;
  // record marks a merge the factory did not perform on the round itself.
  if (
    item.history.some((entry) => entry.outcome === "MERGED" && entry.external)
  )
    return true;
  return item.assignment.endState !== "MERGED" ? true : null;
}

/** The issue cancel-run reports it held, if any. */
function heldIssue(json: Record<string, unknown> | null): number | null {
  const held = json?.held;
  if (!held || typeof held !== "object") return null;
  const issue = (held as Record<string, unknown>).issue;
  return typeof issue === "number" && Number.isSafeInteger(issue) && issue > 0
    ? issue
    : null;
}

function targetOf(
  operation: NonNullable<ChatDoc["messages"][number]["operation"]>,
) {
  if (["hold", "release", "retry", "reopen"].includes(operation.kind))
    return `issue:${operation.issue}`;
  if (operation.kind === "assign-scope" || operation.kind === "reprioritize")
    return "scope";
  return "factory";
}

type RequestHistory = { id: string; at: string }[];

/** The pack keeps only the last 20 entries in each document's requests[]. */
export const REQUEST_WINDOW = 20;

/**
 * Whether a proposal is applied, from the target document's retained request
 * history. When the history is full and its oldest entry is newer than the
 * turn, an application could have been evicted: report unknown (null).
 */
export function proposalRecord(
  history: RequestHistory,
  prefix: string,
  turnAt: string,
): { requestId: string; recorded: boolean | null } {
  const found = history.find((entry) => entry.id.startsWith(prefix));
  if (found) return { requestId: found.id, recorded: true };
  const oldest = history.reduce<string | null>(
    (current, entry) =>
      current === null || entry.at < current ? entry.at : current,
    null,
  );
  // Fails closed: with a full history, anything but a provably older oldest
  // entry (including unparseable timestamps) is reported as unknown.
  const evictable =
    history.length >= REQUEST_WINDOW &&
    !(oldest !== null && Date.parse(oldest) <= Date.parse(turnAt));
  return { requestId: prefix, recorded: evictable ? null : false };
}
