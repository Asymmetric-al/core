/** @vitest-environment jsdom */
/** @vitest-environment-options {"url": "http://localhost/"} */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { useMissionControlAutomationsMock } = vi.hoisted(() => ({
  useMissionControlAutomationsMock: vi.fn(),
}));

vi.mock("@asym/database/hooks", () => ({
  useMissionControlAutomations: useMissionControlAutomationsMock,
}));

const repoRoot = process.cwd();
type AutomationsPageComponent =
  typeof import("../../../../../apps/admin/app/(app)/automations/page-client").default;
type AutomationsPageViewComponent =
  typeof import("../../../../../apps/admin/app/(app)/automations/page-client").AutomationsPageView;
type FilterAutomationRules =
  typeof import("../../../../../apps/admin/app/(app)/automations/automation-rules").filterAutomationRules;
type AutomationRuleFixture = Parameters<FilterAutomationRules>[0][number];
let AutomationsPage: AutomationsPageComponent;
let AutomationsPageView: AutomationsPageViewComponent;
let filterAutomationRules: FilterAutomationRules;

const emptySummary = {
  totalRules: 0,
  activeRules: 0,
  pausedRules: 0,
  readyRules: 0,
  draftRules: 0,
  invalidRules: 0,
  executions24h: 0,
  failedRuns24h: 0,
  activityLogBacked: true,
  integrationHealthBacked: false,
};

const pendingControlLabels = [
  "View All Flows",
  "Manage Connections",
  "History",
  "New Flow",
] as const;

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function createAutomationRule(
  overrides: Partial<AutomationRuleFixture> = {},
): AutomationRuleFixture {
  return {
    id: "rule_1",
    name: "Automation rule",
    mode: "advanced",
    trigger: { kind: "contribution_issue_created" },
    conditions: [],
    actions: [],
    runMode: "automatic",
    enabled: false,
    activationStatus: "draft",
    ...overrides,
  };
}

describe("apps/admin/app/(app)/automations/page-client", () => {
  it("explains platform rule management below the summary without linking to unrelated inbox rules", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[]}
        isError={false}
        isLoading={false}
        summary={emptySummary}
      />,
    );
    expect(
      view.queryByRole("link", { name: "Open automation settings" }),
    ).toBeNull();
    const note = view.getByRole("note");
    expect(note.textContent).toContain("managed by the platform");
    expect(note.textContent).toContain("1,000");
    const summary = view.getByRole("region", { name: "Automation summary" });
    expect(
      summary.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
  beforeEach(async () => {
    useMissionControlAutomationsMock.mockReset();
    process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
    // Vitest owns the jsdom Window; its document getter cannot be replaced.
    document.body.replaceChildren();

    globalThis.requestAnimationFrame = (callback) =>
      window.setTimeout(callback, 0);
    globalThis.cancelAnimationFrame = (id) => window.clearTimeout(id);
    Object.defineProperty(globalThis.window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    if (!AutomationsPage || !AutomationsPageView || !filterAutomationRules) {
      const pageClient =
        await import("../../../../../apps/admin/app/(app)/automations/page-client");
      const automationRules =
        await import("../../../../../apps/admin/app/(app)/automations/automation-rules");
      AutomationsPage = pageClient.default;
      AutomationsPageView = pageClient.AutomationsPageView;
      filterAutomationRules = automationRules.filterAutomationRules;
    }
  }, 30_000);

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("does not render demo flows while loading", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[]}
        hasLoadedData={false}
        isError={false}
        isLoading
      />,
    );

    expect(view.getByText("Loading automation dashboard")).toBeTruthy();
    expect(view.queryByText("mobilize.advance-to-interview")).toBeNull();
    expect(view.queryByText("crm.sync-to-mailchimp")).toBeNull();
  });

  it("does not render demo flows when the query fails", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[]}
        errorMessage="Unable to reach automations"
        hasLoadedData={false}
        isError
        isLoading={false}
      />,
    );

    expect(view.getByText("Could not load automations")).toBeTruthy();
    expect(view.getByText("Unable to reach automations")).toBeTruthy();
    expect(view.queryByText("giving.send-thank-you")).toBeNull();
    expect(view.queryByText("care.alert-on-gap")).toBeNull();
  });

  it("renders an honest empty state when no automation rules exist", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[]}
        isError={false}
        isLoading={false}
        summary={emptySummary}
      />,
    );

    expect(view.getByText("No automation rules yet")).toBeTruthy();
    expect(view.getByRole("note").textContent).toContain(
      "Rules are managed by the platform and can’t be edited here.",
    );
    expect(
      view.queryByRole("link", { name: "Open automation settings" }),
    ).toBeNull();
    expect(
      view.getByText("No automation rules have been saved yet."),
    ).toBeTruthy();
    expect(view.queryByText("mobilize.advance-to-interview")).toBeNull();
  });

  it("associates the automation rules filter with a real label", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[]}
        isError={false}
        isLoading={false}
        summary={emptySummary}
      />,
    );

    // The shared grid search names its box; no bare placeholder label.
    const filterInput = view.getByRole("searchbox", {
      name: "Filter automation rules",
    });
    expect(filterInput.getAttribute("placeholder")).toBe("Filter rules…");
  });

  it("lists rules in the shared grid with how and when each one runs", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[
          createAutomationRule({
            id: "rule_auto",
            name: "giving.thank-you-email",
            trigger: { kind: "donation_completed" },
            conditions: [{ field: "amount" }],
            actions: [{ kind: "send_email" }, { kind: "create_task" }],
            runMode: "automatic",
            enabled: true,
            activationStatus: "active",
          }),
          createAutomationRule({
            id: "rule_review",
            name: "crm.duplicate-review",
            trigger: { kind: "duplicate_detected" },
            conditions: [],
            actions: [{ kind: "create_task" }],
            runMode: "review_first",
            enabled: false,
            activationStatus: "draft",
          }),
        ]}
        isError={false}
        isLoading={false}
        summary={{ ...emptySummary, totalRules: 2, activeRules: 1 }}
      />,
    );

    const table = view.getByRole("table");
    const headers = view
      .getAllByRole("columnheader")
      .map((header) => header.textContent?.trim())
      .filter(Boolean);
    expect(headers).toEqual([
      "Rule",
      "Trigger",
      "Runs",
      "Steps",
      "Status",
      "Last 24 hours",
    ]);
    const [, autoRow, reviewRow] = view.getAllByRole("row");
    expect(autoRow!.textContent).toContain("Giving: thank you email");
    expect(autoRow!.textContent).toContain("Donation Completed");
    expect(autoRow!.textContent).toContain("Automatically");
    expect(autoRow!.textContent).toContain("1 condition · 2 actions");
    expect(autoRow!.textContent).toContain("Active");
    expect(reviewRow!.textContent).toContain("After staff review");
    expect(reviewRow!.textContent).toContain("No conditions · 1 action");
    expect(table).toBeTruthy();
    expect(view.getByText("2 rules")).toBeTruthy();
  });

  it("renders real summary values and real automation rules", async () => {
    const automationRules: Parameters<FilterAutomationRules>[0] = [
      createAutomationRule({
        id: "rule_1",
        name: "Receipt follow-up",
        trigger: { kind: "contribution_issue_created" },
        enabled: true,
        activationStatus: "active",
      }),
      createAutomationRule({
        id: "rule_2",
        name: "CRM task review",
        trigger: { kind: "contribution_action_completed" },
        runMode: "review_first",
        enabled: false,
        activationStatus: "draft",
      }),
    ];
    const view = render(
      <AutomationsPageView
        automationRules={automationRules}
        isError={false}
        isLoading={false}
        summary={{
          totalRules: 2,
          activeRules: 1,
          pausedRules: 0,
          readyRules: 0,
          draftRules: 1,
          invalidRules: 0,
          executions24h: 3,
          failedRuns24h: 1,
          activityLogBacked: true,
          integrationHealthBacked: false,
        }}
      />,
    );

    expect(view.getByText("Active rules")).toBeTruthy();
    expect(view.getByText("Rule runs")).toBeTruthy();
    expect(view.getByText("Rules needing repair")).toBeTruthy();
    expect(view.getByText("Failed rule runs")).toBeTruthy();
    expect(
      view.getByText(
        /up to 1,000 most recent logged runs in the last 24 hours/,
      ),
    ).toBeTruthy();
    expect(view.getByText("Receipt follow-up")).toBeTruthy();
    expect(view.getByText("CRM task review")).toBeTruthy();
    expect(
      view.queryByRole("button", { name: /automation actions for/i }),
    ).toBeNull();
  });

  it("filters automation rules by search query", () => {
    const automationRules: Parameters<FilterAutomationRules>[0] = [
      createAutomationRule({
        id: "rule_1",
        name: "Receipt follow-up",
        trigger: { kind: "contribution_issue_created" },
        enabled: true,
        activationStatus: "active",
      }),
      createAutomationRule({
        id: "rule_2",
        name: "CRM task review",
        trigger: { kind: "contribution_action_completed" },
        runMode: "review_first",
        enabled: false,
        activationStatus: "draft",
      }),
    ];

    const filteredRules = filterAutomationRules(automationRules, "crm");

    expect(filteredRules.map((rule) => rule.name)).toEqual(["CRM task review"]);
  });

  it("keeps rule status badges and status filtering aligned with persisted summary semantics", () => {
    const automationRules = [
      createAutomationRule({
        id: "rule_active",
        name: "Valid active rule",
        enabled: true,
        activationStatus: "active",
      }),
      createAutomationRule({
        id: "rule_disabled_active",
        name: "Legacy disabled lifecycle rule",
        enabled: false,
        activationStatus: "active",
      }),
      createAutomationRule({
        id: "rule_enabled_draft",
        name: "Enabled draft rule",
        enabled: true,
        activationStatus: "draft",
      }),
      createAutomationRule({
        id: "rule_paused",
        name: "Paused rule",
        enabled: false,
        activationStatus: "paused",
      }),
    ];
    const view = render(
      <AutomationsPageView
        automationRules={automationRules}
        isError={false}
        isLoading={false}
        summary={{
          totalRules: 4,
          activeRules: 1,
          pausedRules: 1,
          readyRules: 0,
          draftRules: 1,
          invalidRules: 1,
          executions24h: 0,
          failedRuns24h: 0,
          activityLogBacked: true,
          integrationHealthBacked: false,
        }}
      />,
    );

    expect(view.getByText("Valid active rule")).toBeTruthy();
    expect(view.getByText("Legacy disabled lifecycle rule")).toBeTruthy();
    expect(view.getAllByText("Active")).toHaveLength(1);
    expect(view.getAllByText("Needs repair")).toHaveLength(1);
    expect(view.getAllByText("Draft")).toHaveLength(1);
    expect(view.getAllByText("Paused")).toHaveLength(1);

    const activeMatches = filterAutomationRules(automationRules, "active");
    expect(activeMatches.map((rule) => rule.id)).toEqual(["rule_active"]);
  });

  it("renders the filtered empty state when a rule search has no matches", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[
          createAutomationRule({
            id: "rule_filter",
            name: "Receipt follow-up",
            enabled: true,
            activationStatus: "active",
          }),
        ]}
        isError={false}
        isLoading={false}
        summary={{
          ...emptySummary,
          totalRules: 1,
          activeRules: 1,
          invalidRules: 0,
        }}
      />,
    );

    fireEvent.change(
      view.getByRole("searchbox", { name: /filter automation rules/i }),
      { target: { value: "zzznomatch" } },
    );

    expect(view.getByText("No matching automation rules")).toBeTruthy();
    expect(view.getByText("No rules match this filter.")).toBeTruthy();
  });

  it("titles code-style rule keys in words and keeps the key for reference", async () => {
    const { automationRuleTitle } =
      await import("../../../../../apps/admin/app/(app)/automations/automation-rules");
    expect(automationRuleTitle("giving.thank-you-email")).toBe(
      "Giving: thank you email",
    );
    expect(automationRuleTitle("mobilize.advance-to-interview")).toBe(
      "Mobilize: advance to interview",
    );
    // Acronyms keep their capitals.
    expect(automationRuleTitle("crm.duplicate-review")).toBe(
      "CRM: duplicate review",
    );
    expect(automationRuleTitle("giving.send-pdf-receipt")).toBe(
      "Giving: send PDF receipt",
    );
    // Names staff wrote stay as written.
    expect(automationRuleTitle("Receipt follow-up")).toBe("Receipt follow-up");
    const { filterAutomationRules } =
      await import("../../../../../apps/admin/app/(app)/automations/automation-rules");
    const rules = [createAutomationRule({ name: "giving.thank-you-email" })];
    // Searching the words on screen finds the rule.
    expect(filterAutomationRules(rules, "thank you")).toHaveLength(1);
  });

  it("shows a code-style rule key on screen beside its readable title", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[
          createAutomationRule({
            id: "rule_key",
            name: "giving.thank-you-email",
            enabled: true,
            activationStatus: "active",
          }),
          createAutomationRule({
            id: "rule_plain",
            name: "Receipt follow-up",
            enabled: true,
            activationStatus: "active",
          }),
        ]}
        isError={false}
        isLoading={false}
        summary={{ ...emptySummary, totalRules: 2, activeRules: 2 }}
      />,
    );

    expect(view.getByText("Giving: thank you email")).toBeTruthy();
    // The key is visible text, not only a hover title.
    const key = view.getByText("giving.thank-you-email");
    expect(key.className).toContain("font-mono");
    // A name staff wrote is not repeated as a key.
    expect(view.getAllByText("Receipt follow-up")).toHaveLength(1);
  });

  it("says what is wrong with each rule needing repair and what to do next", async () => {
    const { automationRepairNote } =
      await import("../../../../../apps/admin/app/(app)/automations/automation-rules");
    const switchedOff = createAutomationRule({
      id: "rule_off",
      name: "Switched-off rule",
      enabled: false,
      activationStatus: "active",
      actions: [{ kind: "send_email" }],
    });
    const noActions = createAutomationRule({
      id: "rule_empty",
      name: "Empty rule",
      enabled: false,
      activationStatus: "active",
      actions: [],
    });
    const healthy = createAutomationRule({
      enabled: true,
      activationStatus: "active",
    });

    expect(automationRepairNote(healthy)).toBeNull();
    // No page in Mission Control edits rules: they are saved only through
    // the automations API, which only administrators (the only readers of
    // this list) can call. That save refuses a rule with no actions and
    // cannot turn a rule on (it needs a preview no route supplies), so the
    // advice names only the fix the save path accepts.
    expect(automationRepairNote(switchedOff)).toEqual({
      problem: "Marked active but switched off, so it does not run.",
      nextStep:
        "Rules can't be edited in Mission Control; they are saved through the automations API. Whoever set this rule up there needs to save it as paused.",
    });
    expect(automationRepairNote(noActions)).toEqual({
      problem: "Marked active but switched off, and it has no actions to run.",
      nextStep:
        "Rules can't be edited in Mission Control; they are saved through the automations API. Whoever set this rule up there needs to add an action to it.",
    });
    for (const note of [switchedOff, noActions].map(automationRepairNote)) {
      expect(note?.nextStep).not.toMatch(/^(Switch|Pause|Add)/);
      // Neither a path the save refuses nor one nothing ships.
      expect(note?.nextStep).not.toMatch(
        /turn it back on|test run|administrator/i,
      );
    }
    // A rule with no actions cannot be saved as paused.
    expect(automationRepairNote(noActions)?.nextStep).not.toMatch(/paused/);

    const view = render(
      <AutomationsPageView
        automationRules={[switchedOff, noActions]}
        isError={false}
        isLoading={false}
        summary={{ ...emptySummary, totalRules: 2, invalidRules: 2 }}
      />,
    );
    expect(
      view.getByText("Marked active but switched off, so it does not run."),
    ).toBeTruthy();
    expect(view.getByText(/needs to save it as paused\./)).toBeTruthy();
    expect(view.getByText(/needs to add an action to it\./)).toBeTruthy();
  });

  it("blocks the rules list when loaded data is missing the persisted summary", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[
          createAutomationRule({
            id: "rule_missing_summary",
            name: "Rule with malformed response",
          }),
        ]}
        hasLoadedData
        isError={false}
        isLoading={false}
      />,
    );

    expect(
      view.getByText(
        "The automations list came back without its summary, so it isn't shown.",
      ),
    ).toBeTruthy();
    expect(view.getByText("Automation rules unavailable")).toBeTruthy();
    expect(view.queryByText("Rule with malformed response")).toBeNull();
  });

  it("normalizes non-Error hook failures in the default page export", () => {
    useMissionControlAutomationsMock.mockReturnValue({
      data: undefined,
      error: "Server returned a string failure",
      isError: true,
      isPending: false,
    });

    const view = render(<AutomationsPage />);

    expect(useMissionControlAutomationsMock).toHaveBeenCalledTimes(1);
    expect(view.getByText("Could not load automations")).toBeTruthy();
    expect(view.getByText("Server returned a string failure")).toBeTruthy();
  });

  it("names rule runs and failures by their source, not as workflow runs", () => {
    // The counts come from the automation activity log; Workflow runs
    // counts dispatched background work, so the card does not send staff
    // there to find a different number.
    const view = render(
      <AutomationsPageView
        automationRules={[]}
        isError={false}
        isLoading={false}
        summary={{ ...emptySummary, failedRuns24h: 2, invalidRules: 0 }}
      />,
    );
    expect(view.getByText("Rule runs")).toBeTruthy();
    expect(view.getByText("Failed rule runs")).toBeTruthy();
    expect(
      view.getByText("Last 24 hours, from the automation activity log"),
    ).toBeTruthy();
    expect(
      view.queryByRole("link", { name: /failed workflow runs/i }),
    ).toBeNull();
    // No rule needs repair: the card says so instead of pointing below.
    expect(view.queryByText(/marked Needs repair below/)).toBeNull();
  });

  it("shows each rule's runs and failures from the last 24 hours", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[
          createAutomationRule({
            id: "rule_failing",
            name: "Failing rule",
            runs24h: 3,
            failedRuns24h: 2,
            lastFailureAt: "2026-11-10T12:00:00.000Z",
          }),
          createAutomationRule({
            id: "rule_clean",
            name: "Clean rule",
            runs24h: 4,
            failedRuns24h: 0,
            lastFailureAt: null,
          }),
          createAutomationRule({
            id: "rule_idle",
            name: "Idle rule",
            runs24h: 0,
            failedRuns24h: 0,
            lastFailureAt: null,
          }),
        ]}
        isError={false}
        isLoading={false}
        summary={{ ...emptySummary, executions24h: 7, failedRuns24h: 2 }}
      />,
    );

    const rows = view.getAllByRole("row");
    const rowFor = (name: string) =>
      rows.find((row) => row.textContent?.includes(name))!;
    expect(rowFor("Failing rule").textContent).toContain("2 of 3 runs failed");
    expect(rowFor("Failing rule").textContent).toMatch(/Last failed Nov 10,/);
    expect(rowFor("Clean rule").textContent).toContain("4 runs, none failed");
    expect(rowFor("Idle rule").textContent).toContain("No runs");
  });

  it("lets the failure card filter the list to the rules that failed", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[
          createAutomationRule({
            id: "rule_failing",
            name: "Failing rule",
            runs24h: 2,
            failedRuns24h: 1,
            lastFailureAt: "2026-11-10T12:00:00.000Z",
          }),
          createAutomationRule({
            id: "rule_clean",
            name: "Clean rule",
            runs24h: 2,
            failedRuns24h: 0,
            lastFailureAt: null,
          }),
        ]}
        isError={false}
        isLoading={false}
        summary={{ ...emptySummary, executions24h: 4, failedRuns24h: 1 }}
      />,
    );

    // The old dead end is gone.
    expect(view.queryByText(/doesn't show which rule failed/)).toBeNull();
    const cardControl = view.getByRole("button", {
      name: "Show the failing rule",
    });
    // The label says what a press does, so it is not also a toggle: a
    // pressed "Show all rules" would read as the opposite of the state.
    expect(cardControl.hasAttribute("aria-pressed")).toBe(false);
    fireEvent.click(cardControl);

    expect(view.queryByText("Clean rule")).toBeNull();
    expect(view.getAllByText("Failing rule").length).toBeGreaterThan(0);
    expect(view.getByText("1 of 2 rules")).toBeTruthy();
    expect(
      view.getByText("Showing rules that failed in the last 24 hours"),
    ).toBeTruthy();

    // Both the card and the list can put every rule back.
    const showAll = view.getAllByRole("button", { name: "Show all rules" });
    expect(showAll).toHaveLength(2);
    for (const button of showAll) {
      expect(button.hasAttribute("aria-pressed")).toBe(false);
    }
    fireEvent.click(showAll[1]!);
    expect(view.getByText("Clean rule")).toBeTruthy();
    expect(view.getByText("2 rules")).toBeTruthy();
    expect(
      view.queryByText("Showing rules that failed in the last 24 hours"),
    ).toBeNull();
  });

  it("reads missing per-rule runs as not reported, never as no runs", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[
          createAutomationRule({ id: "rule_a", name: "Rule A" }),
          createAutomationRule({ id: "rule_b", name: "Rule B" }),
        ]}
        isError={false}
        isLoading={false}
        summary={{ ...emptySummary, executions24h: 148, failedRuns24h: 3 }}
      />,
    );
    const rows = view.getAllByRole("row");
    const rowFor = (name: string) =>
      rows.find((row) => row.textContent?.includes(name))!;
    expect(rowFor("Rule A").textContent).toContain("Not reported");
    expect(rowFor("Rule A").textContent).not.toContain("No runs");
    expect(rowFor("Rule B").textContent).toContain("Not reported");
    // The failures are not blamed on rules that are not listed.
    expect(view.queryByText(/no longer listed/)).toBeNull();
    expect(view.queryByText(/deleted/)).toBeNull();
    expect(view.queryByText(/listed here/)).toBeNull();
    expect(
      view.getByText(
        "Last 24 hours. The rules' own runs weren't reported, so which rules failed isn't known.",
      ),
    ).toBeTruthy();
    expect(view.queryByRole("button", { name: /failing rule/ })).toBeNull();
  });

  it("keeps the failing-rule filter when only some rules report their runs", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[
          createAutomationRule({
            id: "rule_a",
            name: "Rule A",
            runs24h: 2,
            failedRuns24h: 1,
          }),
          createAutomationRule({ id: "rule_b", name: "Rule B" }),
        ]}
        isError={false}
        isLoading={false}
        summary={{
          ...emptySummary,
          executions24h: 5,
          failedRuns24h: 3,
          failedRunsWithoutRule24h: 0,
        }}
      />,
    );
    expect(
      view.getByRole("button", { name: "Show the failing rule" }),
    ).toBeTruthy();
    // With a rule unreported, the other 2 failures can't be placed.
    expect(view.queryByText(/listed here/)).toBeNull();
    expect(view.queryByText(/deleted/)).toBeNull();
    expect(
      view.getByText(/Some rules didn't report their runs\./),
    ).toBeTruthy();
  });

  it("names failures that no listed rule accounts for", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[
          createAutomationRule({
            id: "rule_a",
            name: "Rule A",
            runs24h: 2,
            failedRuns24h: 1,
          }),
          createAutomationRule({
            id: "rule_b",
            name: "Rule B",
            runs24h: 1,
            failedRuns24h: 1,
          }),
        ]}
        isError={false}
        isLoading={false}
        summary={{ ...emptySummary, executions24h: 6, failedRuns24h: 3 }}
      />,
    );
    expect(
      view.getByRole("button", { name: "Show the 2 failing rules" }),
    ).toBeTruthy();
    // An older response without the server's breakdown: the extra failure
    // is described without claiming the rule was deleted.
    expect(
      view.getByText(/1 isn't matched to a rule listed here\./),
    ).toBeTruthy();
    expect(view.queryByText(/deleted|no longer listed/)).toBeNull();
  });

  it("says failures with no rule on record usually come from a deleted rule", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[
          createAutomationRule({
            id: "rule_a",
            name: "Rule A",
            runs24h: 2,
            failedRuns24h: 1,
          }),
        ]}
        isError={false}
        isLoading={false}
        summary={{
          ...emptySummary,
          executions24h: 4,
          failedRuns24h: 3,
          failedRunsWithoutRule24h: 2,
        }}
      />,
    );
    expect(
      view.getByText(
        /2 aren't tied to a rule, usually because the rule was deleted\./,
      ),
    ).toBeTruthy();
    expect(view.queryByText(/listed here/)).toBeNull();
  });

  it("says when no listed rule accounts for the failures, with no dead control", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[
          createAutomationRule({
            id: "rule_a",
            runs24h: 0,
            failedRuns24h: 0,
            lastFailureAt: null,
          }),
        ]}
        isError={false}
        isLoading={false}
        summary={{
          ...emptySummary,
          executions24h: 2,
          failedRuns24h: 2,
          failedRunsWithoutRule24h: 2,
        }}
      />,
    );
    expect(
      view.getByText(
        "Last 24 hours. 2 aren't tied to a rule, usually because the rule was deleted.",
      ),
    ).toBeTruthy();
    expect(view.queryByRole("button", { name: /failing rule/ })).toBeNull();
  });

  it("keeps the activity-log window on the failure card when nothing failed", () => {
    const clean = render(
      <AutomationsPageView
        automationRules={[]}
        isError={false}
        isLoading={false}
        summary={{ ...emptySummary, executions24h: 4 }}
      />,
    );
    expect(
      clean.getAllByText("Last 24 hours, from the automation activity log"),
    ).toHaveLength(2);
    expect(clean.queryByRole("button", { name: /failing rule/ })).toBeNull();
  });

  it("sorts rules by name, status, run mode and recent failures", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[
          createAutomationRule({ id: "b", name: "Bravo" }),
          createAutomationRule({ id: "a", name: "Alpha" }),
        ]}
        isError={false}
        isLoading={false}
        summary={{ ...emptySummary, totalRules: 2 }}
      />,
    );
    const ruleNames = () =>
      view
        .getAllByRole("row")
        .slice(1)
        .map((row) => (row.textContent?.includes("Alpha") ? "Alpha" : "Bravo"));
    expect(ruleNames()).toEqual(["Bravo", "Alpha"]);
    for (const title of ["Rule", "Runs", "Status", "Last 24 hours"]) {
      const header = view
        .getAllByRole("columnheader")
        .find((cell) => cell.textContent?.trim() === title)!;
      expect(header.querySelector("button")).toBeTruthy();
    }
    const ruleHeader = view
      .getAllByRole("columnheader")
      .find((cell) => cell.textContent?.trim() === "Rule")!;
    fireEvent.click(ruleHeader.querySelector("button")!);
    expect(ruleNames()).toEqual(["Alpha", "Bravo"]);
  });

  it("lists failing rules first, keeping saved order otherwise", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[
          createAutomationRule({
            id: "quiet",
            name: "Quiet rule",
            runs24h: 0,
            failedRuns24h: 0,
            lastFailureAt: null,
          }),
          createAutomationRule({
            id: "failing",
            name: "Failing rule",
            runs24h: 3,
            failedRuns24h: 1,
            lastFailureAt: "2026-11-10T12:00:00.000Z",
          }),
          createAutomationRule({
            id: "busy",
            name: "Busy rule",
            runs24h: 5,
            failedRuns24h: 0,
            lastFailureAt: null,
          }),
        ]}
        isError={false}
        isLoading={false}
        summary={{ ...emptySummary, totalRules: 3, failedRuns24h: 1 }}
      />,
    );
    const names = view
      .getAllByRole("row")
      .slice(1)
      .map((row) =>
        ["Quiet rule", "Failing rule", "Busy rule"].find((name) =>
          row.textContent?.includes(name),
        ),
      );
    expect(names).toEqual(["Failing rule", "Busy rule", "Quiet rule"]);
  });

  it("offers a sort control on phones, where cards have no column headers", () => {
    vi.stubGlobal("innerWidth", 390);
    try {
      const view = render(
        <AutomationsPageView
          automationRules={[
            createAutomationRule({ id: "b", name: "Bravo" }),
            createAutomationRule({ id: "a", name: "Alpha" }),
          ]}
          isError={false}
          isLoading={false}
          summary={{ ...emptySummary, totalRules: 2 }}
        />,
      );
      const sort = view.getByRole("combobox", {
        name: "Sort automation rules",
      });
      expect(sort.textContent).toContain("Most failures first");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("has no extra sort control beside the sortable headers on wide screens", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[createAutomationRule({ id: "a", name: "Alpha" })]}
        isError={false}
        isLoading={false}
        summary={{ ...emptySummary, totalRules: 1 }}
      />,
    );
    expect(
      view.queryByRole("combobox", { name: "Sort automation rules" }),
    ).toBeNull();
  });

  it("keeps summary labels short enough for a phone card", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[]}
        isError={false}
        isLoading={false}
        summary={emptySummary}
      />,
    );
    const labels = Array.from(
      view.container.querySelectorAll(
        '[data-slot="metric-card"] [data-slot="card-description"]',
      ),
    ).map((node) => node.textContent ?? "");
    expect(labels).toEqual([
      "Active rules",
      "Rule runs",
      "Failed rule runs",
      "Rules needing repair",
    ]);
    for (const label of labels) expect(label.length).toBeLessThanOrEqual(20);
  });

  it("invents no provider health and links to the real workflow runs", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[]}
        isError={false}
        isLoading={false}
        summary={emptySummary}
      />,
    );

    // No placeholder provider-health panel; runs live on Workflow runs.
    expect(view.queryByText(/telemetry/i)).toBeNull();
    expect(
      view.getByRole("link", { name: "Workflow runs" }).getAttribute("href"),
    ).toBe("/workflows");
    expect(view.queryByText("Stripe")).toBeNull();
    expect(view.queryByText("Mailchimp")).toBeNull();
    expect(view.queryByText("Slack")).toBeNull();
    expect(view.queryByText("Postmark")).toBeNull();
  });

  it("does not render pending automation controls as fake actions", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[]}
        isError={false}
        isLoading={false}
        summary={emptySummary}
      />,
    );

    for (const label of pendingControlLabels) {
      expect(view.queryByRole("button", { name: label })).toBeNull();
      expect(view.queryByRole("link", { name: label })).toBeNull();
      expect(view.queryByText(label)).toBeNull();
    }
  });

  it("does not keep production fallback demo data in the page source", () => {
    const source = readRepoFile(
      "apps/admin/app/(app)/automations/page-client.tsx",
    );

    for (const banned of [
      "RECENT_FLOWS",
      "STAT_CARDS",
      "INTEGRATION_CONNECTIONS",
      "1,247",
      "all systems operational",
      "Issue Detected",
      "most active",
      "MoreHorizontal",
      ...pendingControlLabels,
    ]) {
      expect(source).not.toContain(banned);
    }
  });
});
