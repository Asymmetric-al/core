// History & decisions and Checks & reviews read models. Both are built on the
// server from the factory's state documents (work items, feedback
// dispositions, selection, factory and scope requests, chat proposals,
// attention and analysis) and sent to the browser one page at a time. Nothing
// here is inferred: a fact the pack does not record is labeled as such.
import { unverifiedReason } from "./performance";

import type {
  AnalysisIndexEntry,
  AttentionItem,
  ChatDoc,
  FactoryDoc,
  FeedbackDoc,
  ScopeDoc,
  SelectionDecision,
  WorkItem,
} from "./factory";

export type LedgerInput = {
  repository: string | null;
  factory: FactoryDoc | null;
  scope: ScopeDoc | null;
  items: readonly WorkItem[];
  feedback: ReadonlyMap<number, FeedbackDoc>;
  selection: readonly SelectionDecision[];
  attention: readonly AttentionItem[];
  analysis: readonly AnalysisIndexEntry[];
  chats: readonly { id: string; doc: ChatDoc }[];
  /** Applied state of each proposal, keyed `<conversation>/<request>`. */
  proposals: ReadonlyMap<string, boolean | null>;
};

function time(value: string | null | undefined) {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

function newestFirst<Row extends { at: string | null; id: string }>(
  rows: Row[],
): Row[] {
  return rows.sort(
    (left, right) =>
      time(right.at) - time(left.at) || left.id.localeCompare(right.id),
  );
}

function clip(value: string | null | undefined, size = 1200) {
  if (!value) return null;
  return value.length > size ? `${value.slice(0, size)}…` : value;
}

function capitalize(value: string) {
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : value;
}

/** The pack records the admission reason as JSON; keep its summary. */
function admission(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "summary" in parsed) {
      const { summary } = parsed as { summary: unknown };
      if (typeof summary === "string" && summary.trim()) return summary;
    }
  } catch {
    // A plain-text reason.
  }
  return raw;
}

function feedbackSource(id: string) {
  const check = /^check-(\d+)$/.exec(id);
  if (check)
    return {
      kind: "check" as const,
      label: `GitHub check run ${check[1]}`,
      id: check[1],
    };
  const review = /^review-(\d+)$/.exec(id);
  if (review)
    return {
      kind: "review" as const,
      label: `GitHub review ${review[1]}`,
      id: review[1],
    };
  const comment = /^comment-(\d+)$/.exec(id);
  if (comment)
    return {
      kind: "comment" as const,
      label: `PR comment ${comment[1]}`,
      id: comment[1],
    };
  return { kind: "thread" as const, label: `Review thread ${id}`, id };
}

/** A GitHub link for one disposed feedback item, built from recorded ids. */
function feedbackLink(
  id: string,
  prUrl: string | null,
  repository: string | null,
): string | null {
  const source = feedbackSource(id);
  if (source.kind === "check")
    return repository
      ? `https://github.com/${repository}/runs/${source.id}`
      : null;
  if (!prUrl) return null;
  if (source.kind === "review")
    return `${prUrl}#pullrequestreview-${source.id}`;
  if (source.kind === "comment") return `${prUrl}#issuecomment-${source.id}`;
  return prUrl;
}

// ---------------------------------------------------------------------------
// History & decisions
// ---------------------------------------------------------------------------

export const HISTORY_KINDS = [
  "selection",
  "assignment",
  "round",
  "delivery",
  "blocked",
  "direction",
  "proposal",
  "disposition",
  "recommendation",
  "analysis",
] as const;
export type HistoryKind = (typeof HISTORY_KINDS)[number];

export type HistoryEvent = {
  id: string;
  at: string;
  kind: HistoryKind;
  issue: number | null;
  title: string;
  detail: string | null;
  sources: string[];
  actor: string | null;
  outcome: string | null;
  run: string | null;
  link: string | null;
};

const OPERATION_TEXT: Record<string, string> = {
  "pause-intake": "pause intake",
  "resume-intake": "resume intake",
  drain: "drain the factory",
  stop: "stop the factory",
  resume: "resume the factory",
  "hold-merge": "hold merges",
  "release-merge": "release the merge hold",
  "assign-scope": "assign a scope",
};

function proposalText(
  operation: NonNullable<ChatDoc["messages"][number]["operation"]>,
) {
  if (
    ["hold", "release", "retry", "reopen", "reprioritize"].includes(
      operation.kind,
    )
  )
    return `${operation.kind} #${operation.issue}`;
  if (operation.kind === "assign-scope")
    return `assign a scope of ${operation.issues.map((issue) => `#${issue}`).join(", ") || "no issues"}`;
  return OPERATION_TEXT[operation.kind] ?? operation.kind;
}

/** The policy and profile re-binding a retry, reopen or release recorded. */
export function rebindText(request: WorkItem["requests"][number]) {
  const parts: string[] = [];
  if (request.policy)
    parts.push(
      `policy ${request.policy.from.slice(0, 12)} → ${request.policy.to.slice(0, 12)}`,
    );
  if (request.profileRebound) parts.push("owner profile re-bound");
  return parts.length
    ? `Re-bound to the installed release: ${parts.join("; ")}.`
    : null;
}

type Disposition = FeedbackDoc["dispositions"][string];

/** Samson's action with an accepted fix's state. */
export function dispositionResult(disposition: Disposition) {
  if (disposition.status === "fixed") return `${disposition.action} (fixed)`;
  if (disposition.status === "fix-pending")
    return `${disposition.action} (fix pending)`;
  return disposition.action;
}

function dispositionDetail(disposition: Disposition) {
  const state =
    disposition.status === "fixed"
      ? `Fixed in ${disposition.fixedIn ? disposition.fixedIn.slice(0, 12) : "an unrecorded head"}`
      : disposition.status === "fix-pending"
        ? "Fix pending: no fixing head has been published yet"
        : null;
  return [disposition.reason, state].filter(Boolean).join("\n") || null;
}

const OUTSIDE = "Merged outside the factory";

function verification(item: WorkItem) {
  const reason = unverifiedReason(item);
  return reason
    ? `Not verified: ${reason}`
    : "Verified: CLEAR reviews and PASS final acceptance bound to the published head";
}

export function historyEvents(input: LedgerInput): HistoryEvent[] {
  const events: HistoryEvent[] = [];
  const push = (
    event: Omit<HistoryEvent, "sources" | "link"> &
      Partial<Pick<HistoryEvent, "sources" | "link">>,
  ) => events.push({ sources: [], link: null, ...event });

  for (const decision of input.selection) {
    const reason = decision.reason;
    push({
      id: `selection:${decision.at}:${decision.issue}`,
      at: decision.at,
      kind: "selection",
      issue: decision.issue,
      title: `Samson selected #${decision.issue}`,
      detail:
        [
          reason?.summary,
          reason?.expectedBenefit
            ? `Expected benefit: ${reason.expectedBenefit}`
            : null,
          reason?.uncertainty ? `Uncertainty: ${reason.uncertainty}` : null,
          decision.frontier.length
            ? `Frontier: ${decision.frontier.join(", ")}`
            : null,
        ]
          .filter(Boolean)
          .join("\n") || null,
      sources: reason?.sources ?? [],
      actor: "Samson (selector)",
      outcome: null,
      run: decision.run,
    });
  }

  for (const item of input.items) {
    const issue = item.issue;
    const prUrl = item.pr?.url ?? null;
    push({
      id: `assignment:${issue}:${item.assignment.id}`,
      at: item.assignment.assignedAt,
      kind: "assignment",
      issue,
      title: `#${issue} admitted for ${item.assignment.owner}, ending at ${item.assignment.endState === "MERGED" ? "merged" : "PR ready"}`,
      detail: clip(admission(item.assignment.reason)),
      actor: item.assignment.assignedBy ?? null,
      outcome: item.assignment.endState,
      run: null,
    });
    const last = item.history.at(-1);
    for (const entry of item.history) {
      const kind: HistoryKind =
        entry.outcome === "PR_READY" || entry.outcome === "MERGED"
          ? "delivery"
          : entry.outcome === "BLOCKED"
            ? "blocked"
            : "round";
      const blocker =
        kind === "blocked" && entry === last && item.blocker
          ? [
              item.blocker.detail,
              item.blocker.recovery
                ? `Recovery: ${item.blocker.recovery}`
                : null,
            ]
          : [];
      const verified =
        kind === "delivery" && entry === last && entry.outcome === item.status
          ? [verification(item)]
          : [];
      const outside =
        entry.external && !entry.summary?.startsWith(OUTSIDE)
          ? [`${OUTSIDE}: the factory did not perform this merge.`]
          : [];
      push({
        id: `round:${issue}:${entry.round}:${entry.run}:${entry.at}`,
        at: entry.at,
        kind,
        issue,
        title: `Round ${entry.round}${entry.route ? ` (${entry.route})` : ""} of #${issue}: ${entry.outcome}${entry.next ? `, next ${entry.next}` : ""}`,
        detail:
          [entry.summary, ...outside, ...blocker, ...verified]
            .filter(Boolean)
            .join("\n") || null,
        actor: null,
        outcome: entry.outcome,
        run: entry.run,
        link: kind === "delivery" ? prUrl : null,
      });
    }
    for (const request of item.requests)
      push({
        id: `direction:${issue}:${request.id}`,
        at: request.at,
        kind: "direction",
        issue,
        title: `${capitalize(request.action)} #${issue}`,
        detail: rebindText(request),
        actor: request.by ?? null,
        outcome: null,
        run: null,
      });
    for (const [id, disposition] of Object.entries(
      input.feedback.get(issue)?.dispositions ?? {},
    ))
      push({
        id: `disposition:${issue}:${id}`,
        at: disposition.at,
        kind: "disposition",
        issue,
        title: `${feedbackSource(id).label} on #${issue}: ${disposition.action}`,
        detail: dispositionDetail(disposition),
        actor: "Samson (feedback)",
        outcome: dispositionResult(disposition),
        run: disposition.run ?? null,
        link: feedbackLink(id, prUrl, input.repository),
      });
  }

  for (const request of input.factory?.requests ?? [])
    push({
      id: `direction:factory:${request.id}`,
      at: request.at,
      kind: "direction",
      issue: null,
      title: `Factory: ${request.action}`,
      detail: null,
      actor: request.by ?? null,
      outcome: null,
      run: null,
    });
  for (const request of input.scope?.requests ?? [])
    push({
      id: `direction:scope:${request.id}`,
      at: request.at,
      kind: "direction",
      issue: null,
      title: "Scope or priority change",
      detail:
        "The scope document records who changed it and when, not which change.",
      actor: request.by ?? null,
      outcome: null,
      run: null,
    });

  for (const { id, doc } of input.chats)
    for (const message of doc.messages) {
      if (message.role === "operator")
        push({
          id: `direction:chat:${id}:${message.request ?? message.at}`,
          at: message.at,
          kind: "direction",
          issue: null,
          title: "Asked Samson",
          detail: clip(message.text, 600),
          actor: "operator",
          outcome: null,
          run: null,
        });
      else if (message.operation) {
        const applied = message.request
          ? input.proposals.get(`${id}/${message.request}`)
          : undefined;
        push({
          id: `proposal:${id}:${message.request ?? message.at}`,
          at: message.at,
          kind: "proposal",
          issue: message.operation.issue > 0 ? message.operation.issue : null,
          title: `Samson proposed: ${proposalText(message.operation)}`,
          detail: clip(message.operation.reason, 600),
          sources: message.sources ?? [],
          actor: "Samson (chat)",
          outcome:
            applied === true
              ? "applied"
              : applied === false
                ? "not applied"
                : "unknown",
          run: message.run ?? null,
        });
      }
    }

  for (const item of input.attention)
    push({
      id: `recommendation:${item.fingerprint}:${item.at}`,
      at: item.at,
      kind: "recommendation",
      issue: /^issue:(\d+)$/.test(item.scope)
        ? Number(item.scope.slice(6))
        : null,
      title: item.title,
      detail:
        item.status === "open"
          ? `Scope ${item.scope}. The pack records attention items as open only; whether Samson accepted, routed or rejected the finding is not recorded.`
          : `Scope ${item.scope}. Status ${item.status}.`,
      actor: "Analyst",
      outcome: item.status,
      run: item.report ?? null,
    });
  for (const report of input.analysis)
    push({
      id: `analysis:${report.run}`,
      at: report.at,
      kind: "analysis",
      issue: /^issue:(\d+)$/.test(report.scope)
        ? Number(report.scope.slice(6))
        : null,
      title: `Analysis of ${report.scope} (${report.trigger})`,
      detail: `${report.findings} ${report.findings === 1 ? "finding" : "findings"}`,
      actor: "Analyst",
      outcome: report.status,
      run: report.run,
    });
  return newestFirst(events);
}

// ---------------------------------------------------------------------------
// Checks & reviews
// ---------------------------------------------------------------------------

export const EVIDENCE_CATEGORIES = [
  "internal-review",
  "acceptance",
  "local-check",
  "github-check",
  "external-review",
  "repair",
  "failure",
] as const;
export type EvidenceCategory = (typeof EVIDENCE_CATEGORIES)[number];

export type EvidenceRow = {
  id: string;
  issue: number;
  at: string | null;
  category: EvidenceCategory;
  source: string;
  result: string;
  /** The candidate (head) the evidence is bound to, when it is bound. */
  candidate: string | null;
  /** Current for the issue's present candidate, superseded, or not bound. */
  current: boolean | null;
  detail: string | null;
  run: string | null;
  link: string | null;
};

const REVIEWER_NAMES: Record<string, string> = {
  micaiah: "Micaiah",
  luke: "Luke",
};
const RETURNS: Record<string, string> = {
  repair: "Bezalel (repair)",
  oracle: "Ezra (acceptance correction)",
  review: "Micaiah and Luke (review only)",
};
const TERMINAL = new Set(["PR_READY", "MERGED", "BLOCKED", "stopped"]);

function items(count: number) {
  return `${count} ${count === 1 ? "item" : "items"}`;
}

export function evidenceRows(input: LedgerInput): EvidenceRow[] {
  const rows: EvidenceRow[] = [];
  for (const item of input.items) {
    const issue = item.issue;
    const head = item.head ?? null;
    const revision = item.acceptance?.revision ?? null;
    const prHead = item.pr?.head ?? null;
    const prUrl = item.pr?.url ?? null;
    const bound = (
      candidate: string | null | undefined,
      acceptance?: string | null,
    ) =>
      candidate && head
        ? candidate === head &&
          (!acceptance || !revision || acceptance === revision)
        : null;

    for (const [name, review] of Object.entries(item.reviews ?? {}))
      rows.push({
        id: `review:${issue}:${name}`,
        issue,
        at: review.sealedAt,
        category: "internal-review",
        source: REVIEWER_NAMES[name] ?? capitalize(name),
        result:
          review.cleared && review.decision === "CLEAR"
            ? "CLEAR (findings cleared by assessment)"
            : review.decision,
        candidate: review.candidate ?? null,
        current: bound(review.candidate, review.acceptance),
        detail: [
          `${review.findings} sealed ${review.findings === 1 ? "finding" : "findings"}`,
          review.carriedFrom
            ? `Carried forward over a base integration from ${review.carriedFrom.slice(0, 12)}`
            : null,
        ]
          .filter(Boolean)
          .join(". "),
        run: review.run,
        link: null,
      });

    if (item.final) {
      const passed = item.final.criteria.filter(
        (criterion) => criterion.result === "PASS",
      );
      const failing = item.final.criteria.filter(
        (criterion) => criterion.result !== "PASS",
      );
      rows.push({
        id: `final:${issue}`,
        issue,
        at: item.final.at,
        category: "acceptance",
        source: "Ezra (final acceptance)",
        result: item.final.decision,
        candidate: item.final.candidate ?? null,
        current: bound(item.final.candidate, item.final.acceptanceRevision),
        detail: [
          `${passed.length} of ${item.final.criteria.length} criteria PASS`,
          failing.length
            ? `Not passing: ${failing.map((criterion) => `${criterion.id} ${criterion.result}`).join(", ")}`
            : null,
          item.final.carriedFrom
            ? `Carried forward over a base integration from ${item.final.carriedFrom.slice(0, 12)}`
            : null,
        ]
          .filter(Boolean)
          .join(". "),
        run: item.final.run,
        link: null,
      });
    }

    if (item.acceptance?.checks.length)
      rows.push({
        id: `prescribed:${issue}`,
        issue,
        at: item.acceptance.at,
        category: "local-check",
        source: "Checks Ezra prescribed",
        result: "prescribed",
        candidate: null,
        current: null,
        detail: clip(item.acceptance.checks.join("\n")),
        run: item.acceptance.run,
        link: null,
      });
    if (item.pr?.publishedAt)
      rows.push({
        id: `prepush:${issue}`,
        issue,
        at: item.pr.publishedAt,
        category: "local-check",
        source: "Hooked pre-push (ci:preflight)",
        result: "publication recorded",
        candidate: prHead,
        current: bound(prHead),
        detail:
          "The pack publishes only after Core's hooked pre-push passes in the executor. The check receipt itself is kept in the run directory, not in factory state.",
        run: null,
        link: prUrl,
      });

    for (const [id, disposition] of Object.entries(
      input.feedback.get(issue)?.dispositions ?? {},
    )) {
      const source = feedbackSource(id);
      const against = prHead ?? head;
      rows.push({
        id: `feedback:${issue}:${id}`,
        issue,
        at: disposition.at,
        category: source.kind === "check" ? "github-check" : "external-review",
        source: source.label,
        result: dispositionResult(disposition),
        candidate: disposition.head ?? null,
        current:
          disposition.head && against ? disposition.head === against : null,
        detail: dispositionDetail(disposition),
        run: disposition.run ?? null,
        link: feedbackLink(id, prUrl, input.repository),
      });
    }

    const repair = item.brief?.repair;
    const latest = item.history.at(-1);
    const repairAt = latest?.at ?? item.updatedAt;
    if (repair) {
      const from = repair.source ? `From ${repair.source}.` : null;
      if (repair.acceptance.length)
        rows.push({
          id: `repair:${issue}:acceptance`,
          issue,
          at: repairAt,
          category: "repair",
          source: "Ezra (acceptance correction)",
          result: items(repair.acceptance.length),
          candidate: null,
          current: true,
          detail: clip([...repair.acceptance, from].filter(Boolean).join("\n")),
          run: latest?.run ?? null,
          link: null,
        });
      if (repair.implementation.length)
        rows.push({
          id: `repair:${issue}:implementation`,
          issue,
          at: repairAt,
          category: "repair",
          source: "Bezalel (implementation repair)",
          result: items(repair.implementation.length),
          candidate: null,
          current: true,
          detail: clip(
            [...repair.implementation, from].filter(Boolean).join("\n"),
          ),
          run: latest?.run ?? null,
          link: null,
        });
      if (repair.reviewOnly)
        rows.push({
          id: `repair:${issue}:review`,
          issue,
          at: repairAt,
          category: "repair",
          source: "Micaiah and Luke (review only)",
          result: "review again",
          candidate: null,
          current: true,
          detail: from,
          run: latest?.run ?? null,
          link: null,
        });
    }

    for (const entry of item.history) {
      const isLatest = entry === latest;
      if (entry.outcome === "continue" && entry.next && RETURNS[entry.next])
        rows.push({
          id: `return:${issue}:${entry.round}:${entry.run}`,
          issue,
          at: entry.at,
          category: "repair",
          source: `Round ${entry.round} returned to ${RETURNS[entry.next]}`,
          result: "returned",
          candidate: null,
          current: isLatest && !TERMINAL.has(item.status),
          detail: entry.summary ?? null,
          run: entry.run,
          link: null,
        });
      else if (entry.outcome === "BLOCKED")
        rows.push({
          id: `blocked:${issue}:${entry.round}:${entry.run}`,
          issue,
          at: entry.at,
          category: "failure",
          source: `Round ${entry.round}`,
          result: "BLOCKED",
          candidate: null,
          current: isLatest && item.status === "BLOCKED",
          detail:
            [
              entry.summary,
              isLatest && item.blocker?.recovery
                ? `Recovery: ${item.blocker.recovery}`
                : null,
            ]
              .filter(Boolean)
              .join("\n") || null,
          run: entry.run,
          link: null,
        });
      else if (entry.summary && /^Node \S+ failed/.test(entry.summary))
        rows.push({
          id: `nodefailed:${issue}:${entry.round}:${entry.run}`,
          issue,
          at: entry.at,
          category: "failure",
          source: `Round ${entry.round}`,
          result: "node failed",
          candidate: null,
          current: isLatest && !TERMINAL.has(item.status),
          detail: entry.summary,
          run: entry.run,
          link: null,
        });
    }
  }
  return newestFirst(rows);
}

// ---------------------------------------------------------------------------
// Paging and search (server side)
// ---------------------------------------------------------------------------

function matches(haystack: (string | null | undefined)[], query: string) {
  if (!query) return true;
  const text = haystack.filter(Boolean).join("\n").toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => text.includes(word));
}

export function queryHistory(
  events: readonly HistoryEvent[],
  {
    q = "",
    kind,
    offset,
    limit,
  }: { q?: string; kind?: HistoryKind; offset: number; limit: number },
) {
  const counts = Object.fromEntries(
    HISTORY_KINDS.map((entry) => [entry, 0]),
  ) as Record<HistoryKind, number>;
  for (const event of events) counts[event.kind] += 1;
  const found = events.filter(
    (event) =>
      (!kind || event.kind === kind) &&
      matches(
        [
          event.title,
          event.detail,
          event.actor,
          event.outcome,
          event.kind,
          event.issue ? `#${event.issue}` : null,
          event.run,
          ...event.sources,
        ],
        q,
      ),
  );
  return {
    total: found.length,
    events: found.slice(offset, offset + limit),
    counts,
  };
}

export type Currency = "current" | "superseded" | "all";

export function queryEvidence(
  rows: readonly EvidenceRow[],
  {
    q = "",
    category,
    currency = "current",
    offset,
    limit,
  }: {
    q?: string;
    category?: EvidenceCategory;
    currency?: Currency;
    offset: number;
    limit: number;
  },
) {
  const counts = Object.fromEntries(
    EVIDENCE_CATEGORIES.map((entry) => [entry, { current: 0, superseded: 0 }]),
  ) as Record<EvidenceCategory, { current: number; superseded: number }>;
  for (const row of rows) {
    if (row.current === false) counts[row.category].superseded += 1;
    else counts[row.category].current += 1;
  }
  const found = rows.filter(
    (row) =>
      (!category || row.category === category) &&
      (currency === "all" ||
        (currency === "current"
          ? row.current !== false
          : row.current === false)) &&
      matches(
        [
          row.source,
          row.result,
          row.detail,
          row.category,
          `#${row.issue}`,
          row.candidate,
          row.run,
        ],
        q,
      ),
  );
  return {
    total: found.length,
    rows: found.slice(offset, offset + limit),
    counts,
  };
}

// ---------------------------------------------------------------------------
// Pages sent to the browser
// ---------------------------------------------------------------------------

export const LEDGER_PAGE_LIMIT = 200;

export type LedgerQuery =
  | {
      view: "history";
      offset: number;
      limit: number;
      q?: string;
      kind?: HistoryKind;
    }
  | {
      view: "evidence";
      offset: number;
      limit: number;
      q?: string;
      category?: EvidenceCategory;
      currency?: Currency;
    };

type PageBase = {
  observedAt: string;
  total: number;
  offset: number;
  limit: number;
  /** State documents left out because they could not be read. */
  malformed: { name: string; reason: string }[];
};

export type LedgerPage =
  | (PageBase & {
      view: "history";
      events: HistoryEvent[];
      counts: Record<HistoryKind, number>;
    })
  | (PageBase & {
      view: "evidence";
      rows: EvidenceRow[];
      counts: Record<EvidenceCategory, { current: number; superseded: number }>;
    });

export function ledgerPage(
  input: LedgerInput,
  query: LedgerQuery,
  meta: Pick<PageBase, "observedAt" | "malformed">,
): LedgerPage {
  const base = { ...meta, offset: query.offset, limit: query.limit };
  if (query.view === "history")
    return {
      ...base,
      view: "history",
      ...queryHistory(historyEvents(input), query),
    };
  return {
    ...base,
    view: "evidence",
    ...queryEvidence(evidenceRows(input), query),
  };
}
