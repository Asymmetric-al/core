"use client";

import { Badge } from "@asym/ui/components/shadcn/badge-component";
import { Button } from "@asym/ui/components/shadcn/button-component";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs-component";
import { ThemeToggle } from "@asym/ui/components/shadcn/theme-toggle";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import {
  Activity,
  CirclePause,
  CirclePlay,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import { Chat } from "./chat";
import { STALE_AFTER_MS, api, failureText, keys } from "./data";
import { Health, ReportDialog } from "./health";
import { IssueSheet } from "./issue-detail";
import { Issues } from "./issues";
import { EvidenceView, HistoryView } from "./ledger";
import { Overview } from "./overview";
import { Performance } from "./performance";
import { RunDialog } from "./run-detail";
import { Runs } from "./runs";
import {
  Ago,
  ConsoleContext,
  ErrorNote,
  When,
  type ConsoleContextValue,
} from "./shared";
import { WorkMap } from "./work-map";
import { consoleScope } from "../lib/contracts";

import type { Snapshot } from "../lib/factory";

/** A snapshot plus the browser's own receive time, which freshness uses. */
type Observed = Snapshot & { receivedAt: number };

export function Console({ scope }: { scope: string }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 5_000,
            gcTime: 300_000,
            refetchOnWindowFocus: true,
          },
          mutations: { retry: false },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <Workspace scope={scope} />
    </QueryClientProvider>
  );
}

const TABS = [
  ["overview", "Overview"],
  ["map", "Live work map"],
  ["issues", "Phases & issues"],
  ["runs", "Agents & runs"],
  ["checks", "Checks & reviews"],
  ["history", "History & decisions"],
  ["chat", "Samson"],
  ["health", "Health & capacity"],
  ["performance", "Performance"],
] as const;
type Tab = (typeof TABS)[number][0];

function useClock() {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const clock = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(clock);
    };
  }, []);
  return now;
}

const subscribeNothing = () => () => undefined;

/**
 * The shared toggle reads the stored theme, which only exists in the browser:
 * render it after mount so the server HTML never disagrees with it.
 */
function ThemeSwitch() {
  const mounted = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  return mounted ? (
    <ThemeToggle />
  ) : (
    <span aria-hidden="true" className="h-9 w-28" />
  );
}

function subscribeHash(update: () => void) {
  window.addEventListener("hashchange", update);
  return () => window.removeEventListener("hashchange", update);
}

function Workspace({ scope }: { scope: string }) {
  const hash = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash.slice(1),
    () => "",
  );
  const tab: Tab = TABS.some(([id]) => id === hash)
    ? (hash as Tab)
    : "overview";
  const [paused, setPaused] = useState(false);
  const [offset, setOffset] = useState(0);
  // The last successful observation (and the page it was read at), recorded
  // when a read succeeds, so a failed read of a new page shows history instead
  // of blanking the Console. It never authorizes a control.
  const [lastGood, setLastGood] = useState<{
    snapshot: Observed;
    offset: number;
  } | null>(null);
  const [issue, setIssue] = useState<number | null>(null);
  const [run, setRun] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const now = useClock();

  const selectTab = useCallback((next: string) => {
    if (!TABS.some(([id]) => id === next)) return;
    window.history.replaceState(null, "", `#${next}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }, []);

  const query = useQuery({
    queryKey: keys.snapshot(scope, offset),
    queryFn: async (): Promise<Observed> => {
      const current = await api<Snapshot>(`snapshot?offset=${offset}`);
      if (consoleScope(current.identity) !== scope)
        throw new Error(
          "Console identity changed. Reload the page before acting.",
        );
      const observed = { ...current, receivedAt: Date.now() };
      setLastGood({ snapshot: observed, offset });
      return observed;
    },
    refetchInterval: paused ? false : 10_000,
    refetchOnWindowFocus: !paused,
    refetchOnReconnect: !paused,
    placeholderData: (previous) => previous,
  });
  const fallback = !query.data && query.isError ? lastGood : null;
  const snapshot: Observed | null = query.data ?? fallback?.snapshot ?? null;
  const shownOffset = fallback ? fallback.offset : offset;
  // Freshness is measured on the browser's clock from when the observation
  // arrived, so clock skew between the browser and the VM cannot matter.
  const age = snapshot && now ? now - snapshot.receivedAt : 0;
  const stale = Boolean(snapshot) && age > STALE_AFTER_MS;
  const connection = query.isPending
    ? "Connecting"
    : query.isError
      ? "Disconnected"
      : stale
        ? "Stale"
        : paused
          ? "Paused"
          : "Live";
  const authorityReason = !snapshot
    ? "No current observation has been read yet."
    : query.isError
      ? "The latest read failed; refresh before acting."
      : stale
        ? "The observation is stale; refresh before acting."
        : snapshot.factory.state === "unavailable"
          ? "Factory state is unavailable, so no control can be confirmed."
          : null;

  const context = useMemo<ConsoleContextValue>(
    () => ({
      scope,
      now,
      paused,
      snapshot,
      authority: authorityReason === null,
      authorityReason,
      openIssue: setIssue,
      openRun: setRun,
      openReport: setReport,
      selectTab,
    }),
    [scope, now, paused, snapshot, authorityReason, selectTab],
  );

  return (
    <ConsoleContext.Provider value={context}>
      <div className="min-h-screen bg-background font-sans text-foreground">
        <a
          href="#main"
          className="sr-only rounded-lg bg-primary p-3 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
        >
          Skip to Console content
        </a>
        <header className="border-b bg-card px-4 py-4 sm:px-8">
          <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="rounded-xl border bg-secondary p-3">
                <Activity aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium tracking-widest text-muted-foreground">
                  CORE / VM100
                </p>
                <h1 className="text-xl font-semibold">Factory Console</h1>
                <p className="break-all text-xs text-muted-foreground">
                  {snapshot
                    ? `${snapshot.identity.operator} · ${snapshot.identity.codebase} · instance ${snapshot.identity.instance}`
                    : "Private owner lane"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline">
                <ShieldCheck aria-hidden="true" /> Owner only
              </Badge>
              <ThemeSwitch />
            </div>
          </div>
        </header>
        <main
          id="main"
          tabIndex={-1}
          className="mx-auto flex max-w-screen-2xl flex-col gap-6 p-4 outline-none sm:p-8"
        >
          {snapshot?.settings.fixture ? (
            <section
              aria-label="Synthetic data"
              className="rounded-xl border border-warning bg-warning/10 p-4 text-sm"
            >
              <p className="font-medium">Synthetic test fixture</p>
              <p className="break-words">
                {snapshot.settings.fixture}. Nothing on this page is live
                factory data.
              </p>
            </section>
          ) : null}
          <section
            aria-label="Connection"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4"
          >
            <div className="flex min-w-0 flex-col gap-1 text-sm">
              {/* Only connection changes are announced; the ticking relative
                  time below stays outside the live region. */}
              <div
                role="status"
                aria-live="polite"
                className="flex min-w-0 flex-col gap-1"
              >
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  <Badge
                    variant={
                      connection === "Live"
                        ? "success"
                        : connection === "Disconnected"
                          ? "destructive-subtle"
                          : "warning"
                    }
                  >
                    {connection}
                  </Badge>
                  {connection === "Live"
                    ? "Reading the factory every 10 seconds"
                    : connection === "Paused"
                      ? "Display updates paused in this browser; the factory keeps working"
                      : connection === "Stale"
                        ? "No fresh observation; controls are disabled until a refresh succeeds"
                        : connection === "Disconnected"
                          ? "The latest read failed; showing the last observation as history"
                          : "Reading the factory…"}
                </p>
                {snapshot && authorityReason ? (
                  <p className="font-medium">
                    Controls are disabled: {authorityReason}
                  </p>
                ) : null}
              </div>
              <p className="text-muted-foreground">
                Last observation:{" "}
                {snapshot ? (
                  <>
                    <When value={snapshot.observedAt} /> (
                    <Ago value={snapshot.observedAt} />)
                  </>
                ) : (
                  "none yet"
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPaused(!paused)}
              >
                {paused ? (
                  <CirclePlay aria-hidden="true" />
                ) : (
                  <CirclePause aria-hidden="true" />
                )}
                {paused ? "Resume live updates" : "Pause live updates"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={query.isFetching}
                onClick={() => void query.refetch()}
              >
                <RefreshCw aria-hidden="true" />
                Refresh now
              </Button>
            </div>
          </section>
          {query.isError ? (
            <ErrorNote>
              <p className="font-medium">No current authority to act</p>
              <p>{failureText(query.error)}</p>
              <p className="text-xs">
                Anything still shown is the last successful observation.
                Controls are disabled. Nothing is retried automatically except
                the read itself.
              </p>
            </ErrorNote>
          ) : null}
          <Tabs
            value={tab}
            onValueChange={(value) => selectTab(String(value))}
            className="gap-6"
          >
            <div className="max-w-full overflow-x-auto pb-1">
              <TabsList aria-label="Console sections">
                {TABS.map(([id, label]) => (
                  <TabsTrigger key={id} value={id}>
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <TabsContent value="overview" keepMounted>
              <Overview loading={query.isPending} />
            </TabsContent>
            <TabsContent value="map" keepMounted>
              <WorkMap loading={query.isPending} />
            </TabsContent>
            <TabsContent value="issues" keepMounted>
              <Issues loading={query.isPending} />
            </TabsContent>
            <TabsContent value="runs" keepMounted>
              <Runs
                loading={query.isPending}
                offset={shownOffset}
                fetching={query.isFetching}
                setOffset={setOffset}
              />
            </TabsContent>
            <TabsContent value="checks">
              <EvidenceView active={tab === "checks"} />
            </TabsContent>
            <TabsContent value="history">
              <HistoryView active={tab === "history"} />
            </TabsContent>
            <TabsContent value="chat" keepMounted>
              <Chat active={tab === "chat"} />
            </TabsContent>
            <TabsContent value="health" keepMounted>
              <Health loading={query.isPending} />
            </TabsContent>
            <TabsContent value="performance">
              <Performance active={tab === "performance"} />
            </TabsContent>
          </Tabs>
          <footer className="border-t pt-4 text-xs text-muted-foreground">
            Archon executes and persists everything. The Console reads Archon
            state documents and runs, and every control goes through the
            factory&apos;s control seam; it keeps no factory state of its own.
            Last observation is not last progress.
          </footer>
        </main>
        <IssueSheet issue={issue} close={() => setIssue(null)} />
        <RunDialog run={run} close={() => setRun(null)} />
        <ReportDialog run={report} close={() => setReport(null)} />
      </div>
    </ConsoleContext.Provider>
  );
}
