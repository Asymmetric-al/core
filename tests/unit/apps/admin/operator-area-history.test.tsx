// @vitest-environment jsdom

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

const mfa = vi.hoisted(() => ({
  readFactorState: vi.fn(),
  startEnrolment: vi.fn(),
  verifyCode: vi.fn(),
  removeFactor: vi.fn(),
  readPlatformHistory: vi.fn(),
}));

vi.mock("@asym/auth/operator-mfa", () => ({
  readFactorState: mfa.readFactorState,
  startEnrolment: mfa.startEnrolment,
  verifyCode: mfa.verifyCode,
  removeFactor: mfa.removeFactor,
  readPlatformHistory: mfa.readPlatformHistory,
}));

vi.mock("@asym/auth/client-session", () => ({
  signOutClientSession: vi.fn(),
}));

const { OperatorAreaClient } =
  await import("../../../../apps/admin/app/(operator)/operator/operator-area-client");

const VERIFIED = "Your session is verified with a second factor.";
const HISTORY_TITLE = "Changes with no organization";
const HISTORY_EMPTY = "No change has been recorded with no organization.";
const HISTORY_REFUSED =
  "The database refused this history. Sign out and sign in again.";
const HISTORY_FAILED = "The history could not be loaded.";

function historyRow(
  id: string,
  action: string,
  createdAt: string,
  changeSummary = `${action} changed`,
) {
  return {
    id,
    createdAt,
    action,
    result: "succeeded",
    identityMode: "admin",
    actorId: "operator:wren",
    policyId: "eve.governance",
    changeSummary,
    decisionSummary: "Allowed",
  };
}

async function showAreaWithHistory() {
  mfa.readFactorState.mockResolvedValue({
    kind: "area",
    factors: [
      { id: "v1", friendlyName: "Phone", createdAt: "2026-11-20T10:00:00Z" },
    ],
  });
  render(<OperatorAreaClient />);
  await screen.findByText(VERIFIED);
}

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  for (const fn of Object.values(mfa)) fn.mockReset();
  mfa.readPlatformHistory.mockResolvedValue({ kind: "rows", rows: [] });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("AL-2675 WP2c rest: the history with no organization in the operator area (D-18: moved from operator-area-client.test.tsx, review of #2855 F9)", () => {
  it.each([
    ["enrolment", { kind: "enrol" }],
    ["the challenge", { kind: "challenge", factorIds: ["v1"] }],
    ["the database's refusal", { kind: "refused" }],
    [
      "a failed read",
      { kind: "failed", message: "Something went wrong. Try again." },
    ],
  ])("reads and shows no history on %s", async (_state, state) => {
    mfa.readFactorState.mockResolvedValue(state);
    render(<OperatorAreaClient />);
    await waitFor(() => expect(mfa.readFactorState).toHaveBeenCalled());
    await act(async () => undefined);
    expect(mfa.readPlatformHistory).not.toHaveBeenCalled();
    expect(screen.queryByRole("heading", { name: HISTORY_TITLE })).toBeNull();
  });

  it("lists the changes newest first once the session is confirmed", async () => {
    mfa.readPlatformHistory.mockResolvedValue({
      kind: "rows",
      rows: [
        historyRow("h2", "kill_switch.global.set", "2026-11-27T10:00:00Z"),
        historyRow("h1", "model_policy.global.update", "2026-11-26T10:00:00Z"),
      ],
    });
    await showAreaWithHistory();
    const heading = await screen.findByRole("heading", {
      level: 2,
      name: HISTORY_TITLE,
    });
    const list = await screen.findByRole("list", { name: HISTORY_TITLE });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]!.textContent).toContain("kill_switch.global.set");
    expect(items[0]!.textContent).toContain("kill_switch.global.set changed");
    expect(items[0]!.textContent).toContain("operator:wren");
    expect(items[1]!.textContent).toContain("model_policy.global.update");
    expect(within(items[0]!).getByText(/2026/).tagName).toBe("TIME");
    expect(heading).toBeTruthy();
    expect(mfa.readPlatformHistory).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(HISTORY_EMPTY)).toBeNull();
  });

  it("says so when nothing has been recorded with no organization", async () => {
    await showAreaWithHistory();
    expect(await screen.findByText(HISTORY_EMPTY)).toBeTruthy();
    expect(screen.queryByText(HISTORY_REFUSED)).toBeNull();
  });

  it("shows a refusal as refused, never as an empty history", async () => {
    mfa.readPlatformHistory.mockResolvedValue({ kind: "refused" });
    await showAreaWithHistory();
    expect(await screen.findByText(HISTORY_REFUSED)).toBeTruthy();
    expect(screen.queryByText(HISTORY_EMPTY)).toBeNull();
    expect(screen.queryByRole("list", { name: HISTORY_TITLE })).toBeNull();
  });

  it("shows a failed read as failed, never as an empty history, and reads again on request", async () => {
    mfa.readPlatformHistory.mockResolvedValueOnce({ kind: "failed" });
    await showAreaWithHistory();
    expect(await screen.findByText(HISTORY_FAILED)).toBeTruthy();
    expect(screen.queryByText(HISTORY_EMPTY)).toBeNull();
    mfa.readPlatformHistory.mockResolvedValueOnce({
      kind: "rows",
      rows: [
        historyRow("h1", "kill_switch.global.set", "2026-11-27T10:00:00Z"),
      ],
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Load the history again" }),
    );
    expect(
      await screen.findByRole("list", { name: HISTORY_TITLE }),
    ).toBeTruthy();
    expect(screen.queryByText(HISTORY_FAILED)).toBeNull();
    expect(mfa.readPlatformHistory).toHaveBeenCalledTimes(2);
  });

  it("shows a busy placeholder, and no empty text, while the history loads", async () => {
    mfa.readPlatformHistory.mockReturnValue(new Promise(() => undefined));
    await showAreaWithHistory();
    const region = await screen.findByRole("region", { name: HISTORY_TITLE });
    expect(region.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.queryByText(HISTORY_EMPTY)).toBeNull();
    expect(screen.queryByText(HISTORY_REFUSED)).toBeNull();
  });

  it("F5 (review of #2855): shows the whole change summary, never clamped to two lines", async () => {
    const summary = `Switched the assistant off everywhere. ${"Every organization stops answering at once. ".repeat(8)}`;
    mfa.readPlatformHistory.mockResolvedValue({
      kind: "rows",
      rows: [
        historyRow(
          "h1",
          "kill_switch.global.set",
          "2026-11-27T10:00:00Z",
          summary.trim(),
        ),
      ],
    });
    await showAreaWithHistory();
    const text = await screen.findByText(summary.trim());
    let node: HTMLElement | null = text;
    while (node && node.getAttribute("role") !== "listitem") {
      expect(node.className).not.toMatch(/(^|\s)line-clamp-(?!none)/);
      expect(node.className).not.toMatch(/(^|\s)truncate(\s|$)/);
      node = node.parentElement;
    }
  });

  it("F6 (review of #2855): announces the loaded history in a stable polite status region that starts empty, and keeps errors out of it", async () => {
    let answer: (value: unknown) => void = () => undefined;
    mfa.readPlatformHistory.mockReturnValueOnce(
      new Promise((resolve) => {
        answer = resolve;
      }),
    );
    await showAreaWithHistory();
    const region = await screen.findByRole("region", { name: HISTORY_TITLE });
    const status = within(region).getByRole("status");
    expect(status.textContent).toBe("");
    expect(status.getAttribute("aria-live") ?? "polite").toBe("polite");
    await act(async () =>
      answer({
        kind: "rows",
        rows: [
          historyRow("h2", "kill_switch.global.set", "2026-11-27T10:00:00Z"),
          historyRow(
            "h1",
            "model_policy.global.update",
            "2026-11-26T10:00:00Z",
          ),
        ],
      }),
    );
    expect(within(region).getByRole("status")).toBe(status);
    expect(status.textContent).toBe("History loaded: 2 changes.");

    mfa.readPlatformHistory.mockResolvedValueOnce({ kind: "failed" });
    cleanup();
    await showAreaWithHistory();
    const failedRegion = await screen.findByRole("region", {
      name: HISTORY_TITLE,
    });
    await within(failedRegion).findByText(HISTORY_FAILED);
    expect(within(failedRegion).getByRole("status").textContent).toBe("");

    mfa.readPlatformHistory.mockResolvedValueOnce({ kind: "rows", rows: [] });
    fireEvent.click(
      within(failedRegion).getByRole("button", {
        name: "Load the history again",
      }),
    );
    await within(failedRegion).findByText(HISTORY_EMPTY);
    expect(within(failedRegion).getByRole("status").textContent).toBe(
      "History loaded: no changes.",
    );
  });
});
