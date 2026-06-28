/** @vitest-environment jsdom */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { cleanup, fireEvent, render } from "@testing-library/react";
import { JSDOM } from "jsdom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { useMissionControlAutomationsMock } = vi.hoisted(() => ({
  useMissionControlAutomationsMock: vi.fn(),
}));

vi.mock("@asym/database/hooks", () => ({
  useMissionControlAutomations: useMissionControlAutomationsMock,
}));

const repoRoot = process.cwd();
type AutomationsPageComponent =
  typeof import("../../../../../apps/admin/app/automations/page-client").default;
type AutomationsPageViewComponent =
  typeof import("../../../../../apps/admin/app/automations/page-client").AutomationsPageView;
type FilterAutomationRules =
  typeof import("../../../../../apps/admin/app/automations/page-client").filterAutomationRules;
type AutomationRuleFixture = Parameters<FilterAutomationRules>[0][number];
let AutomationsPage: AutomationsPageComponent;
let AutomationsPageView: AutomationsPageViewComponent;
let filterAutomationRules: FilterAutomationRules;
let dom: JSDOM | undefined;

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

describe("apps/admin/app/automations/page-client", () => {
  beforeEach(async () => {
    useMissionControlAutomationsMock.mockReset();
    process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
    dom = new JSDOM("<!doctype html><html><body></body></html>", {
      url: "http://localhost",
    });
    globalThis.window = dom.window as unknown as Window & typeof globalThis;
    globalThis.document = dom.window.document;
    globalThis.HTMLElement = dom.window.HTMLElement;
    globalThis.SVGElement = dom.window.SVGElement;
    globalThis.Node = dom.window.Node;
    globalThis.Event = dom.window.Event;
    globalThis.InputEvent = dom.window.InputEvent;
    globalThis.MutationObserver = dom.window.MutationObserver;
    globalThis.getComputedStyle = dom.window.getComputedStyle;
    globalThis.requestAnimationFrame = (callback) =>
      window.setTimeout(callback, 0);
    globalThis.cancelAnimationFrame = (id) => window.clearTimeout(id);
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: dom.window.navigator,
    });
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
        await import("../../../../../apps/admin/app/automations/page-client");
      AutomationsPage = pageClient.default;
      AutomationsPageView = pageClient.AutomationsPageView;
      filterAutomationRules = pageClient.filterAutomationRules;
    }
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    dom?.window.close();
    dom = undefined;
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
    expect(
      view.getByText(
        "This tenant has no persisted Mission Control automation rules.",
      ),
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

    const filterInput = view.getByRole("searchbox", {
      name: /filter automation rules/i,
    });

    expect(filterInput.getAttribute("id")).toBe("automation-rule-filter");
    expect(
      view.container.querySelector('label[for="automation-rule-filter"]')
        ?.textContent,
    ).toContain("Filter automation rules");
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

    expect(view.getByText("Active Rules")).toBeTruthy();
    expect(view.getByText("Total Rules")).toBeTruthy();
    expect(view.getByText("Executions (24h)")).toBeTruthy();
    expect(view.getByText("Invalid Rules")).toBeTruthy();
    expect(view.getByText("Failed Runs (24h)")).toBeTruthy();
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
    expect(view.getAllByText("Invalid")).toHaveLength(1);
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
    expect(
      view.getByText("No persisted automation rules match the current filter."),
    ).toBeTruthy();
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
        "The automations response did not include a persisted dashboard summary.",
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

  it("communicates that integration telemetry is not wired yet", () => {
    const view = render(
      <AutomationsPageView
        automationRules={[]}
        isError={false}
        isLoading={false}
        summary={emptySummary}
      />,
    );

    expect(
      view.getByText("Connection telemetry is not wired yet"),
    ).toBeTruthy();
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
    const source = readRepoFile("apps/admin/app/automations/page-client.tsx");

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
