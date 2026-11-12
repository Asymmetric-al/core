/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { TasksPageContent } from "../../../../../../apps/admin/app/(app)/tasks/tasks-content";

const state = vi.hoisted(() => ({
  query: {
    data: undefined as undefined | { items: unknown[]; groups: unknown[] },
    isPending: false,
    isError: false,
    error: null as Error | null,
    refetch: vi.fn(),
  },
}));
vi.mock("@asym/database/hooks", () => ({
  useMissionControlNeedsAttention: () => state.query,
}));
vi.mock("@asym/lib/mission-control/context", () => ({
  useMC: () => ({ user: null, tenant: null }),
}));
vi.mock("@asym/lib/hooks/use-locale-format", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@asym/lib/hooks/use-locale-format")>();
  return {
    ...actual,
    useLocaleFormat: () =>
      actual.createLocaleFormatters({ locale: "en-US", timeZone: "UTC" }, true),
  };
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
beforeEach(() => {
  vi.stubGlobal("innerWidth", 390);
  vi.stubGlobal("matchMedia", (media: string) => ({
    media,
    matches: true,
    addEventListener() {},
    removeEventListener() {},
  }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  state.query = {
    data: { items: [], groups: [] },
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  };
});
it("searches real follow-ups and keeps a phone sort control", () => {
  const items = [
    {
      id: "receipt",
      summary: "Receipt failed",
      issueLabel: "Receipt",
      urgency: "critical",
      contributionId: "gift",
      donorId: null,
      firstSeenAt: "2026-11-01T00:00:00Z",
    },
  ];
  state.query.data = { items, groups: [] };
  render(<TasksPageContent />);
  expect(screen.getByText("Nov 1, 2026").getAttribute("datetime")).toBe(
    "2026-11-01T00:00:00Z",
  );
  expect(
    screen.getByText(/Team to-dos are no longer available here/),
  ).toBeTruthy();
  expect(
    screen.getByRole("combobox", { name: "Sort follow-ups" }),
  ).toBeTruthy();
  fireEvent.change(
    screen.getByRole("searchbox", { name: "Search listed follow-ups" }),
    { target: { value: "missing" } },
  );
  expect(screen.queryByText("Receipt failed")).toBeNull();
  expect(screen.getByText("No follow-ups match")).toBeTruthy();
  fireEvent.change(
    screen.getByRole("searchbox", { name: "Search listed follow-ups" }),
    { target: { value: "receipt" } },
  );
  expect(screen.getByText("Receipt failed")).toBeTruthy();
});
it("shows real follow-ups with gift and donor links and no sample board", () => {
  const items = [
    {
      id: "gift",
      summary: "Receipt failed",
      issueLabel: "Receipt",
      urgency: "critical",
      contributionId: "gift/1",
      donorId: "donor",
      firstSeenAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "donor",
      summary: "Check donor",
      issueLabel: "Donor",
      urgency: "high",
      contributionId: null,
      donorId: "donor/1",
      firstSeenAt: "2026-11-01T00:00:00Z",
    },
    {
      id: "unlinked",
      summary: "Check provider",
      issueLabel: "Provider",
      urgency: "normal",
      contributionId: null,
      donorId: null,
      firstSeenAt: "2026-11-01T00:00:00Z",
    },
  ];
  state.query.data = {
    items,
    groups: [{ key: "receipt", title: "Receipt", urgency: "critical", items }],
  };
  render(<TasksPageContent />);
  expect(screen.getByRole("heading", { name: "Needs attention" })).toBeTruthy();
  expect(
    screen
      .getByRole("link", { name: "Open contribution" })
      .getAttribute("href"),
  ).toBe("/contributions/gift%2F1");
  expect(
    screen.getByRole("link", { name: "Open donor" }).getAttribute("href"),
  ).toBe("/crm?donor=donor%2F1");
  expect(screen.getByText("Not linked to a gift or donor yet")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "New task" })).toBeNull();
  expect(screen.queryByText("Sample tasks")).toBeNull();
  expect(screen.getByText(/up to 100/i)).toBeTruthy();
});
it("lists more than ten follow-ups and orders urgent work before normal work", () => {
  const items = Array.from({ length: 12 }, (_, index) => ({
    id: `follow-up-${index}`,
    summary: `Follow-up ${index}`,
    issueLabel: "Receipt",
    urgency: index === 11 ? "critical" : "normal",
    contributionId: `gift-${index}`,
    donorId: null,
    firstSeenAt: "2026-11-01T00:00:00Z",
  }));
  state.query.data = { items, groups: [] };
  render(<TasksPageContent />);
  const list = screen.getByRole("list", { name: "Listed follow-ups" });
  expect(within(list).getAllByRole("link")).toHaveLength(12);
  expect(within(list).getAllByRole("link")[0]?.getAttribute("href")).toBe(
    "/contributions/gift-11",
  );
});
it("does not report empty or zero when loading fails and offers Retry", () => {
  state.query.isError = true;
  state.query.error = new Error("Service unavailable");
  render(<TasksPageContent />);
  expect(screen.getByRole("alert").textContent).toContain(
    "Service unavailable",
  );
  expect(screen.queryByText("Nothing needs follow-up")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(state.query.refetch).toHaveBeenCalledOnce();
});
it("keeps loading distinct from an empty queue", () => {
  state.query.isPending = true;
  render(<TasksPageContent />);
  expect(
    screen.getByRole("status", { name: "Loading follow-ups" }),
  ).toBeTruthy();
  expect(screen.queryByText("Nothing needs follow-up")).toBeNull();
});
