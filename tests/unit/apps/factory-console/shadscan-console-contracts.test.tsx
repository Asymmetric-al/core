/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-2650: Shadscan proof mounts the real Console at its public UI boundary.
import { Console } from "../../../../apps/factory-console/src/components/console";
// eslint-disable-next-line no-restricted-imports -- AL-2650: The Console's own scope key, so the mounted identity matches the fixture.
import { consoleScope } from "../../../../apps/factory-console/src/lib/contracts";
// eslint-disable-next-line no-restricted-imports -- AL-2650: Requests go through the Console's production BFF dispatcher, not a stub.
import { dispatch } from "../../../../apps/factory-console/src/server/api";
// eslint-disable-next-line no-restricted-imports -- AL-2650: Run ids of the Console's own synthetic factory fixture.
import { RUN } from "../../../../apps/factory-console/tests/fixtures/factory-fixture";
// eslint-disable-next-line no-restricted-imports -- AL-2650: The Console's own TEST-ONLY factory wiring (state, control and engine seams).
import { harness } from "../../../../apps/factory-console/tests/fixtures/harness";

/**
 * Rendered proof for the Shadscan findings on the private VM 100 operator
 * Console that are scanner limitations (tooling/shadscan/findings.json).
 *
 * The real Console is mounted over its real BFF dispatcher and the app's own
 * synthetic factory fixture, so every assertion is about what an operator and
 * assistive technology actually get: accessible names, live regions, pending
 * and empty states. Shadscan reads one function or file at a time and cannot
 * follow these through the shared @asym/ui and Console components.
 */

type Fixture = ReturnType<typeof harness>;
type Call = { method: string; path: string };

const READ_TIMEOUT = { timeout: 15_000 };
const ASK_REQUEST = "cr-fixtureask-0000000000000000-0000000000000000";

function deferred() {
  let release = () => {};
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

/**
 * Serve the Console's same-origin API from the production dispatcher.
 * `hold` delays matching requests until its promise settles; `down` fails
 * them the way a lost connection does.
 */
function serve(
  fixture: Fixture,
  {
    hold,
    down,
  }: {
    hold?: (call: Call) => Promise<void> | null;
    down?: (call: Call) => boolean;
  } = {},
) {
  const calls: Call[] = [];
  vi.stubGlobal(
    "fetch",
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input), fixture.auth.origin);
      const call = {
        method: init?.method ?? "GET",
        path: url.pathname.slice("/api/console/".length),
      };
      calls.push(call);
      if (down?.(call)) throw new TypeError("fetch failed");
      await hold?.(call);
      return dispatch(new Request(url, init), fixture.factory);
    },
  );
  return calls;
}

function mount(fixture: Fixture) {
  return render(
    <Console
      scope={consoleScope({
        instance: fixture.auth.storeId,
        operator: fixture.auth.owner,
        codebase: fixture.auth.codebaseId,
      })}
    />,
  );
}

async function live() {
  await screen.findByText("Live", {}, READ_TIMEOUT);
}

function panelOf(tab: HTMLElement | undefined) {
  return [...document.querySelectorAll<HTMLElement>('[role="tabpanel"]')].find(
    (panel) => panel.getAttribute("aria-labelledby") === tab?.id,
  );
}

/** The panel of the section that is selected right now. */
function activePanel() {
  const panel = panelOf(
    screen
      .getAllByRole("tab")
      .find((tab) => tab.getAttribute("aria-selected") === "true"),
  );
  if (!panel) throw new Error("No section panel is active");
  return panel;
}

/** Select one section and return its panel once it is the active one. */
async function openTab(name: string) {
  const tab = screen.getByRole("tab", { name });
  await act(async () => {
    fireEvent.click(tab);
  });
  return waitFor(() => {
    const panel = panelOf(tab);
    if (
      tab.getAttribute("aria-selected") !== "true" ||
      !panel ||
      panel.hidden ||
      panel.hasAttribute("inert")
    )
      throw new Error(`The ${name} section is not active yet`);
    return panel;
  }, READ_TIMEOUT);
}

/**
 * Move the browser clock forward. The Console measures freshness on that
 * clock and re-reads it every second, so the next tick sees the new time.
 */
function advanceClock(milliseconds: number) {
  const real = Date.now.bind(Date);
  vi.spyOn(Date, "now").mockImplementation(() => real() + milliseconds);
}

/** Disabled for the operator, whether or not it stays focusable. */
function unavailable(control: HTMLElement) {
  return (
    control.hasAttribute("disabled") ||
    control.getAttribute("aria-disabled") === "true"
  );
}

/** Class tokens that hide an element at some or every viewport width. */
function hidingClasses(element: Element) {
  return [...element.classList].filter(
    (token) =>
      /(?:^|:)(?:hidden|invisible|sr-only|collapse)$/.test(token) ||
      /(?:^|:)w-0$/.test(token),
  );
}

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Console custom controls are named (custom-controls-have-labels)", () => {
  it("names the proposal's end-state Select through the shared SelectControlLabel", async () => {
    const fixture = harness();
    // No authorized scope, and Samson proposes a scope that keeps the end
    // state: the operator must choose one, so the flagged Select renders.
    fixture.state.docs.delete("core/scope");
    fixture.state.set("core/chat/op-fixture-conversation", {
      v: 1,
      messages: [
        {
          role: "operator",
          text: "Authorize #101.",
          request: ASK_REQUEST,
          at: new Date(Date.now() - 600_000).toISOString(),
        },
        {
          role: "samson",
          request: ASK_REQUEST,
          at: new Date(Date.now() - 540_000).toISOString(),
          text: "Assigning #101 keeps the end state you already chose.",
          sources: [],
          operation: {
            kind: "assign-scope",
            issue: 0,
            issues: [101],
            endState: "unchanged",
            reason: "Operator asked to authorize #101",
            status: "proposed",
          },
        },
      ],
    });
    serve(fixture);
    mount(fixture);
    await live();
    const chat = await openTab("Samson");

    const endState = await within(chat).findByRole(
      "combobox",
      { name: "End state" },
      READ_TIMEOUT,
    );
    expect(endState.textContent).toContain("Choose an end state");
    const hint = document.getElementById(
      endState.getAttribute("aria-describedby") ?? "",
    );
    expect(hint?.textContent).toContain("there is no current scope");
    // The proposal cannot be applied until the named control has a value.
    expect(
      within(chat).getByText("Choose an end state to apply."),
    ).toBeTruthy();
  });

  it("names every other Console Select the same way", async () => {
    const fixture = harness();
    serve(fixture);
    mount(fixture);
    await live();

    const issues = await openTab("Phases & issues");
    expect(
      within(issues).getByRole("combobox", { name: "End state" }),
    ).toBeTruthy();
    expect(
      within(issues).getByRole("combobox", { name: "Owner" }),
    ).toBeTruthy();

    const health = await openTab("Health & capacity");
    expect(
      within(health).getByRole("combobox", { name: "Analysis scope" }),
    ).toBeTruthy();

    const runs = await openTab("Agents & runs");
    expect(within(runs).getByRole("combobox", { name: "Status" })).toBeTruthy();

    const checks = await openTab("Checks & reviews");
    expect(
      await within(checks).findByRole(
        "combobox",
        { name: "Evidence" },
        READ_TIMEOUT,
      ),
    ).toBeTruthy();
    expect(
      within(checks).getByRole("combobox", { name: "Currency" }),
    ).toBeTruthy();

    // No Select trigger anywhere in the mounted Console is left unnamed.
    for (const panel of document.querySelectorAll('[role="tabpanel"]'))
      for (const trigger of panel.querySelectorAll(
        '[data-slot="select-trigger"]',
      ))
        expect(
          trigger.getAttribute("aria-labelledby") ??
            trigger.getAttribute("aria-label"),
        ).toBeTruthy();
  });
});

describe("Console dialogs are named (dialogs-have-accessible-names)", () => {
  it("names the issue sheet from the SheetTitle its body renders", async () => {
    const fixture = harness();
    serve(fixture);
    mount(fixture);
    await live();
    const issues = await openTab("Phases & issues");
    fireEvent.click(within(issues).getAllByRole("button", { name: "#103" })[0]);

    const sheet = await screen.findByRole(
      "dialog",
      { name: "Issue #103" },
      READ_TIMEOUT,
    );
    expect(
      within(sheet).getByRole("heading", { name: "Issue #103" }),
    ).toBeTruthy();
    // The title is there from the first frame, before the issue is read.
    expect(sheet.getAttribute("aria-labelledby")).toBe(
      within(sheet).getByRole("heading", { name: "Issue #103" }).id,
    );
  });

  it("names the run and analysis report dialogs", async () => {
    const fixture = harness();
    serve(fixture);
    mount(fixture);
    await live();

    const runs = await openTab("Agents & runs");
    const openRun = within(runs)
      .getAllByRole("button", { name: /^Open run/ })
      .find((button) => button.textContent?.includes(RUN.repair));
    if (!openRun) throw new Error("The fixture run is not listed");
    fireEvent.click(openRun);
    const run = await screen.findByRole(
      "dialog",
      { name: "Run detail" },
      READ_TIMEOUT,
    );
    fireEvent.click(within(run).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    const health = await openTab("Health & capacity");
    fireEvent.click(
      within(health).getAllByRole("button", { name: "Open report" })[0],
    );
    expect(
      await screen.findByRole(
        "dialog",
        { name: "Analysis report" },
        READ_TIMEOUT,
      ),
    ).toBeTruthy();
  });
});

describe("Console status messages are announced (status-messages-announced)", () => {
  it("announces the pending conversation read in polite live regions and names why sending waits", async () => {
    const fixture = harness();
    const chatRead = deferred();
    serve(fixture, {
      hold: (call) => (call.path === "chat" ? chatRead.promise : null),
    });
    mount(fixture);
    await live();
    const chat = await openTab("Samson");

    const regions = within(chat).getAllByRole("status");
    expect(regions.map((region) => region.textContent)).toEqual([
      "Loading Samson's conversations…",
      "Loading the conversation…",
    ]);
    for (const region of regions)
      expect(region.getAttribute("aria-live")).toBe("polite");
    // The flagged text is the visible reason beside the disabled Send button.
    expect(
      within(chat).getByText("Reading Samson's conversations…"),
    ).toBeTruthy();
    expect(
      within(chat)
        .getByRole("button", { name: "Send to Samson" })
        .hasAttribute("disabled"),
    ).toBe(true);

    await act(async () => {
      chatRead.release();
    });
    await waitFor(() =>
      expect(within(chat).queryAllByRole("status")).toEqual([]),
    );
    expect(
      within(chat).queryByText("Reading Samson's conversations…"),
    ).toBeNull();
  });

  it("raises an alert when the conversation read fails", async () => {
    const fixture = harness();
    serve(fixture, { down: (call) => call.path === "chat" });
    mount(fixture);
    await live();
    const chat = await openTab("Samson");

    const alert = await within(chat).findByRole("alert", {}, READ_TIMEOUT);
    expect(alert.textContent).toContain(
      "Samson's conversations are unavailable",
    );
    expect(
      within(chat).getByText(
        "Samson's conversations could not be read; retry the read before sending.",
      ),
    ).toBeTruthy();
  });

  it("announces the pending issue and analysis report reads inside their dialogs", async () => {
    const fixture = harness();
    const issueRead = deferred();
    const reportRead = deferred();
    serve(fixture, {
      hold: (call) =>
        call.path === "issues/103"
          ? issueRead.promise
          : call.path.startsWith("analysis/")
            ? reportRead.promise
            : null,
    });
    mount(fixture);
    await live();

    const issues = await openTab("Phases & issues");
    fireEvent.click(within(issues).getAllByRole("button", { name: "#103" })[0]);
    const sheet = await screen.findByRole(
      "dialog",
      { name: "Issue #103" },
      READ_TIMEOUT,
    );
    // Two polite regions: the pending read, and the sheet's own freshness
    // notice, which stays mounted and empty while the read is not stale.
    const regions = within(sheet).getAllByRole("status");
    expect(regions.map((region) => region.textContent).sort()).toEqual([
      "",
      "Loading issue #103…",
    ]);
    for (const region of regions)
      expect(region.getAttribute("aria-live")).toBe("polite");
    await act(async () => {
      issueRead.release();
    });
    await waitFor(() =>
      expect(
        within(sheet)
          .getAllByRole("status")
          .map((region) => region.textContent),
      ).toEqual([""]),
    );
    fireEvent.click(within(sheet).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    const health = await openTab("Health & capacity");
    fireEvent.click(
      within(health).getAllByRole("button", { name: "Open report" })[0],
    );
    const report = await screen.findByRole(
      "dialog",
      { name: "Analysis report" },
      READ_TIMEOUT,
    );
    const loading = within(report).getByRole("status");
    expect(loading.textContent).toBe("Loading the analysis report…");
    expect(loading.getAttribute("aria-live")).toBe("polite");
    await act(async () => {
      reportRead.release();
    });
    await waitFor(() =>
      expect(within(report).queryByRole("status")).toBeNull(),
    );
  });

  it("announces inside the issue sheet when its own observation goes stale", async () => {
    const fixture = harness();
    serve(fixture);
    mount(fixture);
    await live();
    // Paused: nothing is re-read, so the sheet's read ages on the browser
    // clock. The sheet is modal, so the page's connection status is behind it.
    fireEvent.click(screen.getByRole("button", { name: "Pause live updates" }));
    const issues = await openTab("Phases & issues");
    fireEvent.click(within(issues).getAllByRole("button", { name: "#102" })[0]);
    const sheet = await screen.findByRole(
      "dialog",
      { name: "Issue #102" },
      READ_TIMEOUT,
    );
    const hold = await within(sheet).findByRole(
      "button",
      { name: "Hold issue #102" },
      READ_TIMEOUT,
    );
    await waitFor(() => expect(unavailable(hold)).toBe(false), READ_TIMEOUT);

    // The region is mounted and empty while the read is fresh, so the change
    // of its text is what assistive technology announces.
    const freshness = within(sheet).getByRole("status");
    expect(freshness.textContent).toBe("");
    expect(freshness.getAttribute("aria-live")).toBe("polite");

    advanceClock(46_000);
    await waitFor(
      () =>
        expect(freshness.textContent).toBe(
          "This observation is stale; refresh before relying on it.",
        ),
      READ_TIMEOUT,
    );
    expect(freshness.isConnected).toBe(true);
    // The stale read no longer authorizes the sheet's controls.
    expect(unavailable(hold)).toBe(true);
    expect(
      document.getElementById(hold.getAttribute("aria-describedby") ?? "")
        ?.textContent,
    ).toContain("stale");
  });

  it("announces inside the run dialog when its own observation goes stale", async () => {
    const fixture = harness();
    serve(fixture);
    mount(fixture);
    await live();
    fireEvent.click(screen.getByRole("button", { name: "Pause live updates" }));
    const runs = await openTab("Agents & runs");
    const openRun = within(runs)
      .getAllByRole("button", { name: /^Open run/ })
      .find((button) => button.textContent?.includes(RUN.repair));
    if (!openRun) throw new Error("The fixture run is not listed");
    fireEvent.click(openRun);
    const dialog = await screen.findByRole(
      "dialog",
      { name: "Run detail" },
      READ_TIMEOUT,
    );
    const cancel = await within(dialog).findByRole(
      "button",
      { name: "Cancel this run" },
      READ_TIMEOUT,
    );
    await waitFor(() => expect(unavailable(cancel)).toBe(false), READ_TIMEOUT);

    const freshness = within(dialog).getByRole("status");
    expect(freshness.textContent).toBe("");
    expect(freshness.getAttribute("aria-live")).toBe("polite");

    advanceClock(46_000);
    await waitFor(
      () =>
        expect(freshness.textContent).toBe(
          "This observation of the run is stale; refresh before relying on it.",
        ),
      READ_TIMEOUT,
    );
    expect(freshness.isConnected).toBe(true);
    expect(unavailable(cancel)).toBe(true);
  });
});

describe("Console async actions show pending state (async-action-pending-state)", () => {
  it("disables Send, shows progress and sends one request while a message is in flight", async () => {
    const fixture = harness();
    const ask = deferred();
    const calls = serve(fixture, {
      hold: (call) => (call.path === "chat/ask" ? ask.promise : null),
    });
    mount(fixture);
    await live();
    const chat = await openTab("Samson");
    const message = await within(chat).findByLabelText(
      "Message to Samson",
      {},
      READ_TIMEOUT,
    );
    const send = within(chat).getByRole("button", { name: "Send to Samson" });
    await waitFor(() =>
      expect(
        within(chat).queryByText("Reading Samson's conversations…"),
      ).toBeNull(),
    );

    // Nothing to send yet: the trigger starts disabled, without a spinner.
    expect(send.hasAttribute("disabled")).toBe(true);
    fireEvent.change(message, { target: { value: "Hold #104 for me" } });
    expect(send.hasAttribute("disabled")).toBe(false);
    expect(send.querySelector("svg.spinner-essential")).toBeNull();

    fireEvent.click(send);
    await waitFor(() =>
      expect(calls.filter((call) => call.path === "chat/ask")).toHaveLength(1),
    );
    // In flight: disabled trigger, spinner in the trigger, locked draft and a
    // politely announced "requested" receipt with the request id.
    expect(send.hasAttribute("disabled")).toBe(true);
    expect(send.querySelector("svg.spinner-essential")).not.toBeNull();
    expect(message.hasAttribute("readonly")).toBe(true);
    expect(within(chat).getByText("Sending to Samson…")).toBeTruthy();
    const requested = within(chat).getByRole("status");
    expect(requested.textContent).toMatch(
      /^Requested · request cr-.+… waiting for the factory to answer\.$/,
    );
    expect(requested.closest("[aria-live]")?.getAttribute("aria-live")).toBe(
      "polite",
    );

    // A second submit while pending is dropped before it reaches the server.
    const form = message.closest("form");
    if (!form) throw new Error("The composer form is missing");
    fireEvent.submit(form);
    fireEvent.click(send);
    await act(async () => {
      await Promise.resolve();
    });
    expect(calls.filter((call) => call.path === "chat/ask")).toHaveLength(1);
    expect(calls.filter((call) => call.path === "request-ids")).toHaveLength(1);

    await act(async () => {
      ask.release();
    });
    // Settled: the spinner leaves the trigger and the wait is announced.
    await waitFor(() =>
      expect(send.querySelector("svg.spinner-essential")).toBeNull(),
    );
    expect(
      (
        await within(chat).findByText(
          "Waiting for Samson's recorded reply…",
          {},
          READ_TIMEOUT,
        )
      ).getAttribute("role"),
    ).toBe("status");
    expect(send.hasAttribute("disabled")).toBe(true);
    expect(calls.filter((call) => call.path === "chat/ask")).toHaveLength(1);
  });
});

describe("Console says when there is nothing to show (empty-state-present)", () => {
  it("states that no observation exists when the first snapshot read fails", async () => {
    const fixture = harness();
    serve(fixture, { down: (call) => call.path.startsWith("snapshot") });
    mount(fixture);

    const alert = await screen.findByRole("alert", {}, READ_TIMEOUT);
    expect(alert.textContent).toContain("No current authority to act");
    expect(screen.getByText("Disconnected")).toBeTruthy();
    expect(
      screen.getByText("Last observation:", { exact: false }).textContent,
    ).toBe("Last observation: none yet");
    expect(screen.getByText("Private owner lane")).toBeTruthy();

    // Every section of every always-mounted view says what was not read,
    // instead of rendering an empty table or nothing.
    for (const tab of [
      "Overview",
      "Live work map",
      "Phases & issues",
      "Agents & runs",
      "Health & capacity",
    ]) {
      const panel = await openTab(tab);
      const notes = within(panel).getAllByText(/^No .+ has been read yet\.$/);
      expect(notes.length).toBeGreaterThan(0);
      expect(within(panel).queryByRole("table")).toBeNull();
    }
  });

  it("announces the first read instead of showing an empty Console", async () => {
    const fixture = harness();
    const first = deferred();
    serve(fixture, {
      hold: (call) => (call.path.startsWith("snapshot") ? first.promise : null),
    });
    mount(fixture);

    expect(screen.getByText("Connecting")).toBeTruthy();
    expect(screen.getByText("Reading the factory…")).toBeTruthy();
    const overview = activePanel();
    expect(
      within(overview)
        .getAllByRole("status")
        .every((region) => /^Loading .+…$/.test(region.textContent ?? "")),
    ).toBe(true);

    await act(async () => {
      first.release();
    });
    await live();
    expect(screen.queryByText("Last observation: none yet")).toBeNull();
  });

  it("gives an emptied collection its own message in the owning view", async () => {
    const fixture = harness();
    for (const name of [...fixture.state.docs.keys()])
      if (name.startsWith("core/chat/")) fixture.state.docs.delete(name);
    serve(fixture);
    mount(fixture);
    await live();
    const chat = await openTab("Samson");

    expect(
      await within(chat).findByText("No conversations yet.", {}, READ_TIMEOUT),
    ).toBeTruthy();
    expect(
      within(chat).getByText("Send Samson a message to start one."),
    ).toBeTruthy();
  });
});

describe("Console navigation needs no mobile panel (mobile-nav-present)", () => {
  it("keeps the flagged pager and the section tabs rendered at every width", async () => {
    const fixture = harness();
    serve(fixture);
    mount(fixture);
    await live();

    // Section navigation: one tab list with all nine sections, in a
    // horizontally scrolling strip rather than a hidden menu.
    const sections = screen.getByRole("tablist", { name: "Console sections" });
    expect(within(sections).getAllByRole("tab")).toHaveLength(9);
    expect(sections.parentElement?.classList.contains("overflow-x-auto")).toBe(
      true,
    );
    for (const element of [
      sections,
      ...within(sections).getAllByRole("tab"),
      ...(sections.parentElement ? [sections.parentElement] : []),
    ])
      expect(hidingClasses(element)).toEqual([]);
    // There is no menu trigger, sheet or drawer that navigation hides behind.
    expect(
      screen.queryByRole("button", { name: /menu|navigation/i }),
    ).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();

    // The flagged <nav> elements are pagers: two buttons and a range, always
    // rendered, wrapping instead of collapsing on a narrow screen.
    for (const [tab, label, older, newer] of [
      ["Checks & reviews", "Checks and reviews pages", "Older", "Newer"],
      ["History & decisions", "History pages", "Older", "Newer"],
      ["Agents & runs", "Run pages", "Next runs", "Previous runs"],
    ] as const) {
      const panel = await openTab(tab);
      const pager = await within(panel).findByRole(
        "navigation",
        { name: label },
        READ_TIMEOUT,
      );
      expect(within(pager).getByRole("button", { name: older })).toBeTruthy();
      expect(within(pager).getByRole("button", { name: newer })).toBeTruthy();
      expect(pager.querySelector("a")).toBeNull();
      expect(pager.classList.contains("flex-wrap")).toBe(true);
      for (
        let element: Element | null = pager;
        element && element !== panel;
        element = element.parentElement
      )
        expect(hidingClasses(element)).toEqual([]);
    }
  });
});
