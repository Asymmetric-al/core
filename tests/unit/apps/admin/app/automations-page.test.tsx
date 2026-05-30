/** @vitest-environment jsdom */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { cleanup, render } from "@testing-library/react";
import { JSDOM } from "jsdom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const repoRoot = process.cwd();
type AutomationsPageViewComponent =
  typeof import("../../../../../apps/admin/app/automations/page-client").AutomationsPageView;
type FilterAutomationRules =
  typeof import("../../../../../apps/admin/app/automations/page-client").filterAutomationRules;
let AutomationsPageView: AutomationsPageViewComponent;
let filterAutomationRules: FilterAutomationRules;
let dom: JSDOM | undefined;

const emptySummary = {
  totalRules: 0,
  activeRules: 0,
  pausedRules: 0,
  draftRules: 0,
  executions24h: 0,
  failedRuns24h: 0,
  activityLogBacked: true,
  integrationHealthBacked: false,
};

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

describe("apps/admin/app/automations/page-client", () => {
  beforeEach(async () => {
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

    if (!AutomationsPageView || !filterAutomationRules) {
      const pageClient =
        await import("../../../../../apps/admin/app/automations/page-client");
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

  it("renders real summary values and real automation rules", async () => {
    const automationRules: Parameters<FilterAutomationRules>[0] = [
      {
        id: "rule_1",
        name: "Receipt follow-up",
        mode: "advanced",
        trigger: { kind: "contribution_issue_created" },
        conditions: [],
        actions: [],
        runMode: "automatic",
        enabled: true,
        activationStatus: "active",
      },
      {
        id: "rule_2",
        name: "CRM task review",
        mode: "advanced",
        trigger: { kind: "contribution_action_completed" },
        conditions: [],
        actions: [],
        runMode: "review_first",
        enabled: false,
        activationStatus: "draft",
      },
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
          draftRules: 1,
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
    expect(view.getByText("Failed Runs (24h)")).toBeTruthy();
    expect(view.getByText("Receipt follow-up")).toBeTruthy();
    expect(view.getByText("CRM task review")).toBeTruthy();
    expect(
      view.queryByRole("button", { name: /automation actions for/i }),
    ).toBeNull();

    const filteredRules = filterAutomationRules(automationRules, "crm");
    expect(filteredRules.map((rule) => rule.name)).toEqual(["CRM task review"]);
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
    ]) {
      expect(source).not.toContain(banned);
    }
  });
});
