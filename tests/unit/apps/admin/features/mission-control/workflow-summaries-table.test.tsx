// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  WorkflowSummariesTable,
  type WorkflowSummaryRow,
} from "../../../../../../apps/admin/features/mission-control/components/WorkflowSummariesTable";

afterEach(() => {
  cleanup();
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

describe("WorkflowSummariesTable (#298)", () => {
  it("renders an accessible table with column headers and a caption", () => {
    render(<WorkflowSummariesTable summaries={[summary()]} />);

    expect(screen.getByRole("table")).toBeTruthy();
    expect(
      screen.getByText("Workflow run summaries for this organization"),
    ).toBeTruthy();
    for (const header of [
      "Workflow",
      "Record",
      "Status",
      "Attempts",
      "Alert",
    ]) {
      expect(screen.getByRole("columnheader", { name: header })).toBeTruthy();
    }
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
    expect(screen.getByText("Needs attention")).toBeTruthy();
    expect(screen.getByText("Urgent")).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/sk_|signed|stack|payload/i);
  });

  it("labels review-held work as needing routing review", () => {
    render(
      <WorkflowSummariesTable
        summaries={[
          summary({
            dispatchRequestId: "req-3",
            state: "action_required",
            notification: {
              level: "urgent",
              reason: "Staff action is required (inbound routing review).",
            },
          }),
        ]}
      />,
    );

    expect(screen.getByText("Needs routing review")).toBeTruthy();
    expect(screen.getByText("Urgent")).toBeTruthy();
  });

  it("renders a quiet empty state", () => {
    render(<WorkflowSummariesTable summaries={[]} />);

    expect(screen.getByText("No workflow activity yet.")).toBeTruthy();
  });
});
