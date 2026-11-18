// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import WorkflowsPageClient from "../../../../../apps/admin/app/(app)/workflows/page-client";

const navigation = vi.hoisted(() => ({
  params: new URLSearchParams(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/workflows",
  useRouter: () => ({ replace: navigation.replace }),
  useSearchParams: () => navigation.params,
}));

beforeEach(() => {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(
    new DOMRect(0, 0, 640, 224),
  );
  vi.stubGlobal("matchMedia", (media: string) => ({
    media,
    matches: false,
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
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  navigation.params = new URLSearchParams();
  navigation.replace.mockReset();
});

function run(
  id: string,
  state: string,
  level: "urgent" | "visible",
  workflowName = id,
) {
  return {
    dispatchRequestId: id,
    productArea: "Giving",
    workflowName,
    subjectType: "donation_saga_outbox",
    subjectId: `outbox-${id}`,
    state,
    attempts: 1,
    lastErrorCode: null,
    createdAt: "2026-11-09T00:00:00.000Z",
    notification: {
      level,
      reason: level === "urgent" ? "Needs review" : "Running",
    },
  };
}

function respond(summaries: unknown[], urgent: number) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ summaries, counts: { urgent, visible: 0 } }),
    }),
  );
}

describe("Workflow runs page", () => {
  it("distinguishes loading and empty runs without a duplicate outcome chart", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );
    const view = render(<WorkflowsPageClient />);
    expect(
      screen.getByRole("status", { name: "Loading workflow summaries" }),
    ).toBeTruthy();
    expect(screen.queryByText("Loading Recent runs by outcome")).toBeNull();
    expect(screen.queryByText(/0 in progress;/)).toBeNull();
    view.unmount();
    respond([], 0);
    render(<WorkflowsPageClient />);
    await screen.findByText(/Showing the latest 0 runs, up to 50/);
    expect(screen.queryByText("No workflow runs to compare yet.")).toBeNull();
    expect(screen.queryByText(/0 in progress;/)).toBeNull();
  });
  it("scopes summary figures to the returned runs without repeating them in a chart", async () => {
    respond(
      [run("a", "failed", "urgent"), run("b", "completed", "visible")],
      1,
    );
    render(<WorkflowsPageClient />);
    expect(
      await screen.findByText(/Showing the latest 2 runs, up to 50/),
    ).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "Recent runs by outcome" }),
    ).toBeNull();
    expect(
      screen.getByRole("region", { name: "Workflow summary" }).textContent,
    ).toContain("Completed1");
  });

  it("counts urgent runs once and lists only them from the callout", async () => {
    respond(
      [
        run("a", "retrying", "urgent", "Donation receipt"),
        run("d", "failed", "urgent", "Recurring payment"),
        // A held inbound email waits for an administrator; the notification
        // policy no longer counts it as urgent staff work.
        run("b", "action_required", "visible", "Inbound email routing"),
        run("c", "completed", "visible", "Year-end statement"),
      ],
      2,
    );
    render(<WorkflowsPageClient />);
    expect(await screen.findByText("2 urgent runs")).toBeTruthy();
    // The callout must not give held emails as a reason for urgency.
    const callout = screen
      .getByText("2 urgent runs")
      .closest('[role="alert"], [data-slot="alert"]');
    expect(callout?.textContent ?? "").not.toMatch(/held email/i);
    // The routing-review card names its own subset, not "waiting on staff".
    expect(screen.getByText("Held for routing review")).toBeTruthy();
    expect(screen.queryByText("Waiting on staff")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Show urgent runs" }));
    expect(navigation.replace).toHaveBeenCalledWith(
      "/workflows?status=urgent",
      {
        scroll: false,
      },
    );
  });

  it("opens already filtered from a ?status= link", async () => {
    navigation.params = new URLSearchParams("status=failedOrStopped");
    respond(
      [
        run("a", "failed", "urgent", "Refund notice"),
        run("c", "completed", "visible", "Year-end statement"),
      ],
      1,
    );
    render(<WorkflowsPageClient />);
    expect(await screen.findByText("Refund notice")).toBeTruthy();
    expect(screen.queryByText("Year-end statement")).toBeNull();
  });

  it("names a failed load and loads again from Retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          summaries: [],
          counts: { urgent: 0, visible: 0 },
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(<WorkflowsPageClient />);
    const title = await screen.findByText("Couldn't load workflow runs");
    expect(title).toBeTruthy();
    expect(
      screen.getByText("Workflow summaries are not available right now."),
    ).toBeTruthy();
    expect(
      screen.queryByText("Load workflow runs again to compare outcomes."),
    ).toBeNull();
    expect(screen.queryByText(/0 in progress;/)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(screen.queryByText("Couldn't load workflow runs")).toBeNull(),
    );
  });

  it("moves focus to the status filter when Show urgent runs removes itself", async () => {
    respond([run("a", "failed", "urgent", "Refund notice")], 1);
    const view = render(<WorkflowsPageClient />);
    const show = await screen.findByRole("button", {
      name: "Show urgent runs",
    });
    act(() => show.focus());
    fireEvent.click(show);
    const filter = screen.getByRole("combobox", { name: "Filter by status" });
    // What the filter reads once the task that focused it ends, which is
    // when assistive technology can first read it.
    const announced: string[] = [];
    filter.addEventListener("focus", () =>
      queueMicrotask(() => announced.push(filter.textContent ?? "")),
    );
    // Focus waits for the URL so the filter is announced with its new value.
    expect(document.activeElement).toBe(show);

    navigation.params = new URLSearchParams("status=urgent");
    view.rerender(<WorkflowsPageClient />);
    await Promise.resolve();
    expect(
      screen.queryByRole("button", { name: "Show urgent runs" }),
    ).toBeNull();
    expect(document.activeElement).toBe(filter);
    expect(announced).toHaveLength(1);
    expect(announced[0]).toContain("Urgent");
  });

  it("keeps focus on the reload from Retry through to the loaded runs", async () => {
    let finish: (value: unknown) => void = () => {};
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockReturnValueOnce(
        new Promise((resolve) => {
          finish = resolve;
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    render(<WorkflowsPageClient />);
    const retry = await screen.findByRole("button", { name: "Retry" });
    act(() => retry.focus());
    fireEvent.click(retry);
    const loading = screen.getByRole("status", {
      name: "Loading workflow summaries",
    });
    expect(document.activeElement).toBe(loading);

    await act(async () => {
      finish({
        ok: true,
        json: async () => ({
          summaries: [run("c", "completed", "visible")],
          counts: { urgent: 0, visible: 1 },
        }),
      });
    });
    const summary = await screen.findByText(
      /Showing the latest 1 run, up to 50/,
    );
    expect(document.activeElement).toBe(summary);
  });

  it("keeps focus on the reload when Retry is pressed before the alert's effects have run", async () => {
    // A busy main thread: React yields after every task, so the effects of
    // the render that showed the alert run in a later task than its commit.
    let clock = performance.now();
    vi.spyOn(performance, "now").mockImplementation(() => (clock += 10));
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false })
        .mockReturnValueOnce(new Promise(() => {})),
    );
    // Retry is pressed in the task that shows it, before those effects run.
    const focusAfterPress = new Promise<Element | null>((resolve) => {
      const observer = new MutationObserver(() => {
        const retry = screen.queryByRole("button", { name: "Retry" });
        if (!retry) return;
        observer.disconnect();
        retry.focus();
        fireEvent.click(retry);
        resolve(document.activeElement);
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });

    render(<WorkflowsPageClient />);

    expect(await focusAfterPress).toBe(
      screen.getByRole("status", { name: "Loading workflow summaries" }),
    );
  });

  it("returns focus to Retry when the reload fails again", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal("fetch", fetchMock);

    render(<WorkflowsPageClient />);
    const retry = await screen.findByRole("button", { name: "Retry" });
    act(() => retry.focus());
    fireEvent.click(retry);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Retry" }),
      ),
    );
  });

  it("leaves focus alone when the person moved on while the runs reloaded", async () => {
    let finish: (value: unknown) => void = () => {};
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockReturnValueOnce(
        new Promise((resolve) => {
          finish = resolve;
        }),
      );
    vi.stubGlobal("fetch", fetchMock);
    render(
      <>
        <button type="button">Elsewhere</button>
        <WorkflowsPageClient />
      </>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Retry" }));
    const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
    act(() => elsewhere.focus());
    await act(async () => {
      finish({
        ok: true,
        json: async () => ({
          summaries: [],
          counts: { urgent: 0, visible: 0 },
        }),
      });
    });
    await screen.findByText(/Showing the latest 0 runs, up to 50/);
    expect(document.activeElement).toBe(elsewhere);
  });
});
