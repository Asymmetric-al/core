// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { toastMock } = vi.hoisted(() => ({
  toastMock: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("sonner", () => ({ toast: toastMock }));

import {
  parseWorkflowStatusFilter,
  shortWorkflowRecordId,
  summarizeWorkflowRuns,
  workflowStateRank,
  workflowRecordHref,
  WorkflowSummariesTable,
  type WorkflowSummaryRow,
} from "../../../../../../apps/admin/features/mission-control/components/WorkflowSummariesTable";

beforeEach(() => {
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
  vi.unstubAllGlobals();
});

function summary(
  overrides: Partial<WorkflowSummaryRow> = {},
): WorkflowSummaryRow {
  return {
    dispatchRequestId: "req-1",
    productArea: "donations",
    workflowName: "donations/saga.recovery.requested",
    subjectType: "donation_saga_outbox",
    subjectId: "outbox-1",
    state: "retrying",
    attempts: 2,
    lastErrorCode: "workflow_dispatch_failed",
    createdAt: "2026-06-11T00:00:00.000Z",
    notification: {
      level: "visible",
      reason: "Routine retryable failure; automatic recovery continues.",
    },
    ...overrides,
  };
}

describe("workflow identifier labels", () => {
  it("names known workflows and keeps technical identifiers discoverable", () => {
    const view = render(<WorkflowSummariesTable summaries={[summary()]} />);
    expect(view.getByText("Gift recovery")).toBeTruthy();
    expect(view.getByText("Contributions")).toBeTruthy();
    expect(view.getByText("Could not start the workflow")).toBeTruthy();
    expect(view.getByText("workflow_dispatch_failed")).toBeTruthy();
    expect(view.getByTitle("donations/saga.recovery.requested")).toBeTruthy();
  });
  it("retains unknown workflow identifiers", () => {
    const view = render(
      <WorkflowSummariesTable
        summaries={[summary({ workflowName: "new/unknown.workflow" })]}
      />,
    );
    expect(view.getByText("new/unknown.workflow")).toBeTruthy();
  });
});

describe("WorkflowSummariesTable (#298)", () => {
  it("lists every run it is given, not the first page of ten", () => {
    const runs = Array.from({ length: 15 }, (_, index) =>
      summary({
        dispatchRequestId: `req-${index + 1}`,
        subjectId: `outbox-${index + 1}`,
      }),
    );
    render(<WorkflowSummariesTable summaries={runs} />);
    const table = within(
      screen.getByRole("region", { name: "Workflow runs" }),
    ).getByRole("table");
    expect(table.querySelectorAll("tbody tr")).toHaveLength(15);
  });

  it("renders a named grid with sortable column headers", () => {
    render(<WorkflowSummariesTable summaries={[summary()]} />);

    expect(screen.getByRole("region", { name: "Workflow runs" })).toBeTruthy();
    expect(screen.getByRole("table")).toBeTruthy();
    for (const header of [
      "Workflow",
      "Record",
      "Status",
      "Attempts",
      "Requested",
      "Attention",
    ]) {
      expect(
        screen.getByRole("columnheader", { name: new RegExp(header) }),
      ).toBeTruthy();
    }
  });

  it("still renders a state the client does not know", () => {
    render(
      <WorkflowSummariesTable
        summaries={[
          summary({
            state: "paused_for_review" as WorkflowSummaryRow["state"],
          }),
        ]}
      />,
    );
    expect(screen.getByText("paused for review")).toBeTruthy();
  });

  it("shows summary states and urgent alerts without raw internals", () => {
    render(
      <WorkflowSummariesTable
        summaries={[
          summary(),
          summary({
            dispatchRequestId: "req-2",
            state: "dead_letter",
            notification: { level: "urgent", reason: "Needs staff review." },
          }),
        ]}
      />,
    );

    expect(screen.getByText("Retrying")).toBeTruthy();
    expect(screen.getByText("Stopped")).toBeTruthy();
    expect(screen.getByText("Urgent")).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/sk_|signed|stack|payload/i);
  });

  it("shows a held email as waiting for an administrator, not as urgent", () => {
    render(
      <WorkflowSummariesTable
        summaries={[
          summary({
            dispatchRequestId: "req-3",
            subjectType: "email_inbound_message",
            subjectId: "in-1",
            state: "action_required",
            // An older server still marks it urgent; it is not staff work.
            notification: {
              level: "urgent",
              reason: "Staff action is required (inbound routing review).",
            },
          }),
        ]}
      />,
    );

    const grid = screen.getByRole("table");
    expect(within(grid).getByText("Held for routing")).toBeTruthy();
    expect(within(grid).getByText("Waiting for an administrator")).toBeTruthy();
    expect(within(grid).queryByText("Urgent")).toBeNull();
    expect(within(grid).queryByText(/Staff action is required/)).toBeNull();
    // The information stays: what it is and who resolves it.
    expect(within(grid).getByText("Inbound email")).toBeTruthy();
    expect(
      within(grid).getByText(/ask an administrator to route it/i),
    ).toBeTruthy();
  });

  it("leaves held email out of the urgent filter but keeps it under its own status", () => {
    const runs = [
      summary({
        dispatchRequestId: "req-held",
        workflowName: "email/inbound-email.process.requested",
        subjectType: "email_inbound_message",
        subjectId: "in-1",
        state: "action_required",
        notification: {
          level: "urgent",
          reason: "Staff action is required (inbound routing review).",
        },
      }),
      summary({
        dispatchRequestId: "req-stopped",
        workflowName: "donations/saga.recovery.requested",
        state: "dead_letter",
        notification: { level: "urgent", reason: "Needs staff review." },
      }),
    ];
    const { rerender } = render(
      <WorkflowSummariesTable summaries={runs} status="urgent" />,
    );
    const rowNames = () =>
      Array.from(
        screen.getByRole("table").querySelectorAll("tbody tr"),
        (row) => row.textContent ?? "",
      );
    expect(rowNames()).toHaveLength(1);
    expect(rowNames()[0]).toContain("donations/saga.recovery.requested");

    rerender(
      <WorkflowSummariesTable summaries={runs} status="waitingOnStaff" />,
    );
    expect(rowNames()).toHaveLength(1);
    expect(rowNames()[0]).toContain("email/inbound-email.process.requested");
  });

  it("keeps the error code beside an urgent run's plain reason, for escalation", () => {
    render(
      <WorkflowSummariesTable
        summaries={[
          summary({
            lastErrorCode: "provider_rejected",
            state: "failed",
            notification: { level: "urgent", reason: "Provider rejected it" },
          }),
        ]}
      />,
    );
    const grid = screen.getByRole("table");
    expect(within(grid).getByText("Provider rejected it")).toBeTruthy();
    expect(within(grid).getByText("provider_rejected")).toBeTruthy();
  });

  it("takes its status filter from the page, so a link or callout can set it", () => {
    const onStatusChange = vi.fn();
    render(
      <WorkflowSummariesTable
        status="failedOrStopped"
        onStatusChange={onStatusChange}
        summaries={[
          summary(),
          summary({
            dispatchRequestId: "req-2",
            workflowName: "receipts/send",
            state: "dead_letter",
          }),
        ]}
      />,
    );
    const grid = screen.getByRole("table");
    expect(within(grid).getAllByRole("row")).toHaveLength(2);
    expect(within(grid).getByText("receipts/send")).toBeTruthy();
  });

  it("links a run to its record where staff have a page for it", () => {
    expect(workflowRecordHref("donation", "don_1")).toBe(
      "/contributions?gift=don_1",
    );
    expect(workflowRecordHref("donor", "d 2")).toBe("/crm?donor=d%202");
    expect(workflowRecordHref("support_conversation_move", "c-3")).toBe(
      "/support?id=c-3",
    );
    // Internal records (outbox rows, raw provider events) have no page.
    expect(workflowRecordHref("donation_saga_outbox", "outbox-1")).toBeNull();
    expect(workflowRecordHref("stripe_raw_event", "evt_1")).toBeNull();
  });

  it("lets staff open the record behind an urgent run from the row", () => {
    render(
      <WorkflowSummariesTable
        summaries={[
          summary({
            subjectType: "donation",
            subjectId: "don_4200",
            notification: { level: "urgent", reason: "Provider rejected it" },
          }),
        ]}
      />,
    );
    const grid = screen.getByRole("table");
    const link = within(grid).getByRole("link", { name: /Donation/ });
    expect(link.getAttribute("href")).toBe("/contributions?gift=don_4200");
  });

  it("renders a quiet empty state", () => {
    render(<WorkflowSummariesTable summaries={[]} />);

    expect(screen.getByText("No workflow runs yet")).toBeTruthy();
  });

  it("filters runs by status, so failed or stopped runs can be listed alone", () => {
    render(
      <WorkflowSummariesTable
        summaries={[
          summary(),
          summary({
            dispatchRequestId: "req-2",
            workflowName: "receipts/send",
            state: "dead_letter",
          }),
        ]}
      />,
    );
    const grid = screen.getByRole("table");
    expect(within(grid).getAllByRole("row")).toHaveLength(3);
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search workflow runs" }),
      {
        target: { value: "receipts" },
      },
    );
    expect(within(grid).getAllByRole("row")).toHaveLength(2);
    expect(within(grid).getByText("receipts/send")).toBeTruthy();
  });

  it("shows status and urgency on phone cards, not only on wide screens", () => {
    vi.stubGlobal("innerWidth", 390);
    render(
      <WorkflowSummariesTable
        summaries={[
          summary({
            state: "dead_letter",
            notification: { level: "urgent", reason: "Needs staff review." },
          }),
        ]}
      />,
    );
    expect(screen.queryByRole("table")).toBeNull();
    const card = screen.getByRole("list", { name: "Workflow runs" });
    expect(within(card).getByText("Stopped")).toBeTruthy();
    expect(within(card).getByText("Urgent")).toBeTruthy();
    expect(within(card).getByText("Needs staff review.")).toBeTruthy();
    // The record the run acts on stays visible on phones.
    expect(within(card).getByText("outbox-1")).toBeTruthy();
  });
});

describe("WorkflowSummariesTable on phones", () => {
  it("shortens a long record ID to both ends so IDs that share a prefix differ", () => {
    expect(shortWorkflowRecordId("8f14e45f-ceea-467a-9575-1e2b3c4d5e6f")).toBe(
      "8f14e45f…5e6f",
    );
    // Prefixed IDs keep the part that tells them apart.
    expect(shortWorkflowRecordId("donation_saga_outbox_4200")).toBe(
      "donation…4200",
    );
    expect(shortWorkflowRecordId("donation_saga_outbox_4205")).toBe(
      "donation…4205",
    );
    // IDs short enough to read are shown whole.
    expect(shortWorkflowRecordId("donation_4200")).toBe("donation_4200");
    expect(shortWorkflowRecordId("donation_4205")).toBe("donation_4205");
    expect(shortWorkflowRecordId("outbox-1")).toBe("outbox-1");
    // Shortening has to pay for the ellipsis and the copy step: an ID only
    // a few characters longer than the short form stays whole.
    expect(shortWorkflowRecordId("donation_420015")).toBe("donation_420015");
    expect(shortWorkflowRecordId("donation_outbox_4200")).toBe(
      "donation_outbox_4200",
    );
    expect(shortWorkflowRecordId("donation_outbox_42001")).toBe(
      "donation…2001",
    );
  });

  it("lets touch users copy a shortened record ID in full", async () => {
    vi.stubGlobal("innerWidth", 390);
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    const longId = "8f14e45f-ceea-467a-9575-1e2b3c4d5e6f";
    render(
      <WorkflowSummariesTable summaries={[summary({ subjectId: longId })]} />,
    );
    const card = screen.getByRole("list", { name: "Workflow runs" });
    const id = within(card).getByText("8f14e45f…5e6f");
    expect(id.className).not.toContain("break-all");
    // A button touch can reach carries the full value, not only a title.
    const copy = within(card).getByRole("button", {
      name: `Copy record ID ${longId}`,
    });
    fireEvent.click(copy);
    expect(writeText).toHaveBeenCalledWith(longId);
    await vi.waitFor(() =>
      expect(toastMock.success).toHaveBeenCalledWith("Record ID copied"),
    );
  });

  it("does not offer to copy a record ID shown in full", () => {
    vi.stubGlobal("innerWidth", 390);
    render(<WorkflowSummariesTable summaries={[summary()]} />);
    const card = screen.getByRole("list", { name: "Workflow runs" });
    expect(within(card).getByText("outbox-1")).toBeTruthy();
    expect(
      within(card).queryByRole("button", { name: /copy record id/i }),
    ).toBeNull();
  });

  it("keeps the status badge on the name's line instead of wrapping it", () => {
    vi.stubGlobal("innerWidth", 390);
    render(<WorkflowSummariesTable summaries={[summary()]} />);
    const card = screen.getByRole("list", { name: "Workflow runs" });
    const row = within(card).getByText("Retrying").parentElement!;
    expect(row.className).not.toContain("flex-wrap");
  });

  it("offers a sort control where the cards have no column headers", () => {
    vi.stubGlobal("innerWidth", 390);
    render(<WorkflowSummariesTable summaries={[summary()]} />);
    expect(
      screen.getByRole("combobox", { name: "Sort workflow runs" }),
    ).toBeTruthy();
  });

  it("gives the desktop search room for its whole placeholder", () => {
    render(<WorkflowSummariesTable summaries={[summary()]} />);
    const search = screen.getByRole("searchbox", {
      name: "Search workflow runs",
    });
    expect(search.getAttribute("placeholder")).toBe(
      "Search by workflow or record…",
    );
    // The shared default (sm:w-64) cut the placeholder off at desktop
    // widths; the wrapper is the search's outermost element.
    const wrapper = search.closest("[data-slot=input-group]")!.parentElement!;
    expect(wrapper.className).toContain("sm:w-80");
    expect(wrapper.className).not.toContain("sm:w-64");
  });

  it("has no extra sort control beside the sortable headers on wide screens", () => {
    render(<WorkflowSummariesTable summaries={[summary()]} />);
    expect(
      screen.queryByRole("combobox", { name: "Sort workflow runs" }),
    ).toBeNull();
  });
});

describe("workflowStateRank", () => {
  it("sorts statuses by how much they need staff, not by their raw keys", () => {
    const states = [
      "completed",
      "dispatching",
      "processing",
      "retrying",
      "action_required",
      "dead_letter",
      "failed",
    ];
    expect(
      [...states].sort((a, b) => workflowStateRank(a) - workflowStateRank(b)),
    ).toEqual([
      "failed",
      "dead_letter",
      "action_required",
      "retrying",
      "processing",
      "dispatching",
      "completed",
    ]);
    // A state the client does not know sorts after the known ones.
    expect(workflowStateRank("paused_for_review")).toBeGreaterThan(
      workflowStateRank("completed"),
    );
  });
});

describe("summarizeWorkflowRuns", () => {
  it("puts every run in exactly one state bucket", () => {
    const counts = summarizeWorkflowRuns([
      summary({ state: "dispatching" }),
      summary({ state: "processing" }),
      summary({ state: "retrying" }),
      summary({ state: "action_required" }),
      summary({ state: "completed" }),
      summary({ state: "failed" }),
      summary({ state: "dead_letter" }),
    ]);
    expect(counts).toEqual({
      inProgress: 3,
      waitingOnStaff: 1,
      completed: 1,
      failedOrStopped: 2,
    });
  });
});

describe("parseWorkflowStatusFilter", () => {
  it("reads only the filters the page offers and lists every run otherwise", () => {
    expect(parseWorkflowStatusFilter("failedOrStopped")).toBe(
      "failedOrStopped",
    );
    expect(parseWorkflowStatusFilter("urgent")).toBe("urgent");
    for (const value of [
      null,
      undefined,
      "",
      "nonsense",
      // Inherited object keys: an `in` check would accept these and the
      // list would then crash on them.
      "constructor",
      "toString",
      "__proto__",
      "hasOwnProperty",
    ]) {
      expect(parseWorkflowStatusFilter(value), String(value)).toBe("all");
    }
  });

  it("lists runs instead of crashing when the URL names an inherited key", () => {
    expect(() =>
      render(
        <WorkflowSummariesTable
          summaries={[summary()]}
          status={parseWorkflowStatusFilter("constructor")}
        />,
      ),
    ).not.toThrow();
    expect(screen.getByRole("table")).toBeTruthy();
  });
});
