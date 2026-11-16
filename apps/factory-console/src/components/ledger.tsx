"use client";

import { Button } from "@asym/ui/components/shadcn/button-component";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import { Label } from "@asym/ui/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { ChevronLeft, ChevronRight, RotateCcw, Search } from "lucide-react";
import { useId, useState } from "react";

import { STALE_AFTER_MS, failureText, useLedger } from "./data";
import {
  Ago,
  EmptyNote,
  ErrorNote,
  ExternalLink,
  IssueButton,
  LoadingRows,
  Mono,
  Panel,
  RunButton,
  StatusBadge,
  Unavailable,
  When,
  useConsole,
} from "./shared";
import {
  EVIDENCE_CATEGORIES,
  HISTORY_KINDS,
  type Currency,
  type EvidenceCategory,
  type EvidenceRow,
  type HistoryEvent,
  type HistoryKind,
  type LedgerPage,
  type LedgerQuery,
} from "../lib/ledger";

export const LEDGER_PAGE_SIZE = 25;

const KIND_TEXT: Record<HistoryKind, string> = {
  selection: "Selection",
  assignment: "Assignment",
  round: "Round",
  delivery: "Delivery",
  blocked: "Blocked",
  direction: "Operator direction",
  proposal: "Samson proposal",
  disposition: "Feedback disposition",
  recommendation: "Recommendation",
  analysis: "Analysis",
};

const CATEGORY_TEXT: Record<EvidenceCategory, string> = {
  "internal-review": "Internal review",
  acceptance: "Final acceptance",
  "local-check": "Local check",
  "github-check": "GitHub check",
  "external-review": "External review",
  repair: "Repair",
  failure: "Failure",
};

const CURRENCY_TEXT: Record<Currency, string> = {
  current: "Current evidence",
  superseded: "Superseded evidence",
  all: "Current and superseded",
};

const ALL = "all";

// ---------------------------------------------------------------------------
// Shared page chrome: search, one filter, paging and read states
// ---------------------------------------------------------------------------

function SearchForm({
  label,
  placeholder,
  value,
  onSearch,
}: {
  label: string;
  placeholder: string;
  value: string;
  onSearch: (value: string) => void;
}) {
  const id = useId();
  const [text, setText] = useState(value);
  return (
    <form
      role="search"
      className="flex min-w-0 flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(text.trim().slice(0, 200));
      }}
    >
      <Label htmlFor={id}>{label}</Label>
      <div className="flex min-w-0 gap-2">
        <Input
          id={id}
          type="search"
          value={text}
          maxLength={200}
          placeholder={placeholder}
          onChange={(event) => {
            setText(event.target.value);
            if (!event.target.value) onSearch("");
          }}
        />
        <Button type="submit" variant="outline">
          <Search aria-hidden="true" />
          Search
        </Button>
      </div>
    </form>
  );
}

function FilterSelect<Value extends string>({
  label,
  value,
  items,
  onChange,
}: {
  label: string;
  value: Value;
  items: Record<Value, string>;
  onChange: (value: Value) => void;
}) {
  const id = useId();
  const labelId = useId();
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label id={labelId} htmlFor={id}>
        {label}
      </Label>
      <Select
        items={items}
        value={value}
        onValueChange={(next) => {
          if (typeof next === "string" && next in items)
            onChange(next as Value);
        }}
      >
        <SelectTrigger id={id} aria-labelledby={labelId} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(items) as Value[]).map((key) => (
            <SelectItem key={key} value={key}>
              {items[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function PageNav({
  label,
  page,
  fetching,
  setOffset,
}: {
  label: string;
  page: LedgerPage;
  fetching: boolean;
  setOffset: (offset: number) => void;
}) {
  const shown = page.view === "history" ? page.events.length : page.rows.length;
  const first = shown ? page.offset + 1 : 0;
  const last = page.offset + shown;
  return (
    <nav aria-label={label} className="flex flex-wrap items-center gap-3">
      <Button
        size="sm"
        variant="outline"
        disabled={page.offset === 0 || fetching}
        onClick={() => setOffset(Math.max(0, page.offset - page.limit))}
      >
        <ChevronLeft aria-hidden="true" />
        Newer
      </Button>
      <p className="text-sm">
        {first}–{last} of {page.total}
        {fetching ? (
          <span className="text-muted-foreground"> · reading…</span>
        ) : null}
      </p>
      <Button
        size="sm"
        variant="outline"
        disabled={page.offset + page.limit >= page.total || fetching}
        onClick={() => setOffset(page.offset + page.limit)}
      >
        Older
        <ChevronRight aria-hidden="true" />
      </Button>
    </nav>
  );
}

/** Loading, failure (with retry), stale and malformed states of one page read. */
function PageState({
  query,
  label,
  children,
}: {
  query: ReturnType<typeof useLedger>;
  label: string;
  children: (page: LedgerPage) => React.ReactNode;
}) {
  const { now } = useConsole();
  const page = query.data ?? null;
  const stale = Boolean(
    page && now && now - query.dataUpdatedAt > 2 * STALE_AFTER_MS,
  );
  return (
    <>
      {query.isError ? (
        <ErrorNote>
          <p className="font-medium">The {label} could not be read</p>
          <p>{failureText(query.error)}</p>
          {page ? (
            <p className="text-xs">
              Showing the last page read, observed{" "}
              <When value={page.observedAt} />.
            </p>
          ) : null}
          <div className="mt-2">
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
        </ErrorNote>
      ) : null}
      {page ? (
        <>
          <p className="text-xs text-muted-foreground">
            Read from the factory&apos;s state documents{" "}
            <When value={page.observedAt} /> (<Ago value={page.observedAt} />
            ).
            {stale ? " This page is stale; refresh before relying on it." : ""}
          </p>
          {page.malformed.length ? (
            <ErrorNote>
              <p className="font-medium">
                {page.malformed.length === 1
                  ? "One state document could not be read and is left out"
                  : `${page.malformed.length} state documents could not be read and are left out`}
              </p>
              <ul className="mt-1 flex flex-col gap-1">
                {page.malformed.slice(0, 10).map((entry) => (
                  <li key={entry.name} className="break-words">
                    <Mono>{entry.name}</Mono>: {entry.reason}
                  </li>
                ))}
              </ul>
            </ErrorNote>
          ) : null}
          {children(page)}
        </>
      ) : query.isPending && query.fetchStatus !== "idle" ? (
        <LoadingRows label={`Loading ${label}…`} rows={5} />
      ) : !query.isError ? (
        <Unavailable>The {label} has not been read yet.</Unavailable>
      ) : null}
    </>
  );
}

function short(sha: string | null) {
  return sha ? sha.slice(0, 12) : null;
}

// ---------------------------------------------------------------------------
// History & decisions
// ---------------------------------------------------------------------------

export function HistoryView({ active }: { active: boolean }) {
  const { scope, paused } = useConsole();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<HistoryKind | typeof ALL>(ALL);
  const [offset, setOffset] = useState(0);
  const query: LedgerQuery = {
    view: "history",
    offset,
    limit: LEDGER_PAGE_SIZE,
    ...(q ? { q } : {}),
    ...(kind === ALL ? {} : { kind }),
  };
  const read = useLedger(scope, query, { paused, active });
  return (
    <Panel
      title="History & decisions"
      description="Every recorded assignment, selection reason and source, round outcome, delivery, operator direction, Samson proposal, feedback disposition and analyst recommendation, newest first. Searched and paged on the server."
    >
      <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
        <SearchForm
          label="Search history"
          placeholder="Issue (#101), reason, source, actor or outcome"
          value={q}
          onSearch={(value) => {
            setQ(value);
            setOffset(0);
          }}
        />
        <FilterSelect
          label="Kind"
          value={kind}
          items={{ [ALL]: "Every kind", ...KIND_TEXT }}
          onChange={(value) => {
            setKind(value);
            setOffset(0);
          }}
        />
      </div>
      <PageState query={read} label="history">
        {(page) =>
          page.view === "history" ? (
            <>
              <ul
                aria-label="Recorded history by kind"
                className="flex flex-wrap gap-2"
              >
                {HISTORY_KINDS.map((entry) => (
                  <li key={entry}>
                    <StatusBadge
                      value="outline"
                      label={`${KIND_TEXT[entry]}: ${page.counts[entry]}`}
                    />
                  </li>
                ))}
              </ul>
              <p
                role="status"
                aria-live="polite"
                className="text-sm text-muted-foreground"
              >
                {page.total} matching {page.total === 1 ? "record" : "records"}.
              </p>
              {page.events.length ? (
                <ItemGroup aria-label="History records" className="gap-3">
                  {page.events.map((event) => (
                    <HistoryItem key={event.id} event={event} />
                  ))}
                </ItemGroup>
              ) : (
                <EmptyNote>
                  {q || kind !== ALL
                    ? "No recorded history matches this search and kind. Clear them to see everything."
                    : "Nothing is recorded yet: no selection, assignment, round or direction."}
                </EmptyNote>
              )}
              <PageNav
                label="History pages"
                page={page}
                fetching={read.isFetching}
                setOffset={setOffset}
              />
              <p className="text-xs text-muted-foreground">
                The pack keeps the last 40 rounds and 20 requests per document,
                so older entries are not recorded here. Attention items record
                only that a finding is open, not whether Samson accepted, routed
                or rejected it.
              </p>
            </>
          ) : null
        }
      </PageState>
    </Panel>
  );
}

function HistoryItem({ event }: { event: HistoryEvent }) {
  return (
    <Item variant="outline" size="sm">
      <ItemContent className="min-w-0">
        <ItemTitle>
          <span className="min-w-0 break-words">{event.title}</span>
        </ItemTitle>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge value="outline" label={KIND_TEXT[event.kind]} />
          {event.outcome ? <StatusBadge value={event.outcome} /> : null}
        </div>
        {event.detail ? <Detail>{event.detail}</Detail> : null}
        {event.sources.length ? (
          <p className="break-words text-xs text-muted-foreground">
            Sources: {event.sources.join(" · ")}
          </p>
        ) : null}
        <Meta>
          <span>
            <When value={event.at} /> (<Ago value={event.at} />)
          </span>
          {event.actor ? (
            <span className="break-all">By {event.actor}</span>
          ) : null}
          {event.issue ? <IssueButton issue={event.issue} /> : null}
          {event.run ? (
            <RunButton run={event.run}>Run {event.run.slice(0, 8)}</RunButton>
          ) : null}
          {event.link ? (
            <ExternalLink href={event.link}>On GitHub</ExternalLink>
          ) : null}
        </Meta>
      </ItemContent>
    </Item>
  );
}

function Detail({ children }: { children: string }) {
  return (
    <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function Meta({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Checks & reviews
// ---------------------------------------------------------------------------

export function EvidenceView({ active }: { active: boolean }) {
  const { scope, paused } = useConsole();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<EvidenceCategory | typeof ALL>(ALL);
  const [currency, setCurrency] = useState<Currency>("current");
  const [offset, setOffset] = useState(0);
  const query: LedgerQuery = {
    view: "evidence",
    offset,
    limit: LEDGER_PAGE_SIZE,
    currency,
    ...(q ? { q } : {}),
    ...(category === ALL ? {} : { category }),
  };
  const read = useLedger(scope, query, { paused, active });
  return (
    <Panel
      title="Checks & reviews"
      description="Internal reviews and final acceptance, local and GitHub checks, external review feedback, repairs and failures. Evidence bound to an earlier candidate or acceptance revision is superseded."
    >
      <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-3">
        <SearchForm
          label="Search checks and reviews"
          placeholder="Issue (#103), reviewer, result or candidate"
          value={q}
          onSearch={(value) => {
            setQ(value);
            setOffset(0);
          }}
        />
        <FilterSelect
          label="Evidence"
          value={category}
          items={{ [ALL]: "All evidence", ...CATEGORY_TEXT }}
          onChange={(value) => {
            setCategory(value);
            setOffset(0);
          }}
        />
        <FilterSelect
          label="Currency"
          value={currency}
          items={CURRENCY_TEXT}
          onChange={(value) => {
            setCurrency(value);
            setOffset(0);
          }}
        />
      </div>
      <PageState query={read} label="checks and reviews">
        {(page) =>
          page.view === "evidence" ? (
            <>
              <ul
                aria-label="Evidence by kind"
                className="flex flex-wrap gap-2"
              >
                {EVIDENCE_CATEGORIES.map((entry) => (
                  <li key={entry}>
                    <StatusBadge
                      value="outline"
                      label={`${CATEGORY_TEXT[entry]}: ${page.counts[entry].current} current, ${page.counts[entry].superseded} superseded`}
                    />
                  </li>
                ))}
              </ul>
              <p
                role="status"
                aria-live="polite"
                className="text-sm text-muted-foreground"
              >
                {page.total} matching {page.total === 1 ? "record" : "records"}.
              </p>
              {page.rows.length ? (
                <ItemGroup aria-label="Checks and reviews" className="gap-3">
                  {page.rows.map((row) => (
                    <EvidenceItem key={row.id} row={row} />
                  ))}
                </ItemGroup>
              ) : (
                <EmptyNote>
                  {q || category !== ALL || currency !== "all"
                    ? "No evidence matches this search and filter. Widen them to see more."
                    : "No review, check, repair or failure is recorded yet."}
                </EmptyNote>
              )}
              <PageNav
                label="Checks and reviews pages"
                page={page}
                fetching={read.isFetching}
                setOffset={setOffset}
              />
              <Unavailable title="Not recorded by the factory">
                <p>
                  GitHub check runs appear here only when Samson disposed of
                  them during a feedback round: the pack does not record each
                  required check&apos;s name, conclusion and job link in factory
                  state. Local check receipts (Core&apos;s hooked commit and
                  pre-push in the executor) stay in each run&apos;s directory;
                  open the run to see its artifacts.
                </p>
              </Unavailable>
            </>
          ) : null
        }
      </PageState>
    </Panel>
  );
}

function EvidenceItem({ row }: { row: EvidenceRow }) {
  return (
    <Item variant="outline" size="sm">
      <ItemContent className="min-w-0">
        <ItemTitle>
          <span className="min-w-0 break-words">{row.source}</span>
        </ItemTitle>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge value="outline" label={CATEGORY_TEXT[row.category]} />
          <StatusBadge value={row.result.split(" ")[0]} label={row.result} />
          {row.current === false ? (
            <StatusBadge value="skipped" label="superseded" />
          ) : row.current === true ? (
            <StatusBadge value="open" label="current" />
          ) : null}
        </div>
        {row.detail ? <Detail>{row.detail}</Detail> : null}
        <Meta>
          <IssueButton issue={row.issue} />
          <span>
            <When value={row.at} />{" "}
            {row.at ? (
              <>
                (<Ago value={row.at} />)
              </>
            ) : null}
          </span>
          {row.candidate ? (
            <span>
              Candidate <Mono>{short(row.candidate)}</Mono>
            </span>
          ) : null}
          {row.run ? (
            <RunButton run={row.run}>Run {row.run.slice(0, 8)}</RunButton>
          ) : null}
          {row.link ? (
            <ExternalLink href={row.link}>On GitHub</ExternalLink>
          ) : null}
        </Meta>
      </ItemContent>
    </Item>
  );
}
