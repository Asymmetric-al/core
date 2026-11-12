// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { SupportTicketsTable } from "../../../../../../../apps/admin/features/support-hub/components/tickets/SupportTicketsTable";

import type { SupportTicket } from "../../../../../../../apps/admin/app/(app)/support/support-hub.types";
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }),
});
afterEach(cleanup);
const ticket: SupportTicket = {
  id: "ticket-1",
  subject: "Receipt question",
  summary: "Please resend my receipt",
  queueId: "donor_care",
  status: "waiting",
  priority: "high",
  channel: "email",
  updatedAt: "2026-11-10T10:00:00Z",
  followUpAt: "2026-11-12T10:00:00Z",
  contactEmail: "donor@example.test",
  tags: [],
};
describe("Support ticket server time", () => {
  it("uses UTC for SSR and hydrates into the visitor environment without losing timestamps", async () => {
    const originalTz = process.env.TZ;
    const instant = "2026-11-12T00:30:00.000Z";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    const table = (
      <SupportTicketsTable
        tickets={[{ ...ticket, followUpAt: instant }]}
        queues={[]}
        filtered={false}
      />
    );
    const container = document.createElement("div");
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      process.env.TZ = "America/Los_Angeles";
      container.innerHTML = renderToString(table);
      const expectedServer = new Intl.DateTimeFormat("en-US", {
        ...options,
        timeZone: "UTC",
      }).format(new Date(instant));
      expect(
        container.querySelector(`time[datetime="${instant}"]`)?.textContent,
      ).toBe(expectedServer);
      document.body.append(container);
      const errors: unknown[] = [];
      await act(async () => {
        root = hydrateRoot(container, table, {
          onRecoverableError: (error) => errors.push(error),
        });
      });
      expect(errors).toEqual([]);
      const expectedVisitor = new Intl.DateTimeFormat(
        undefined,
        options,
      ).format(new Date(instant));
      expect(expectedVisitor).not.toBe(expectedServer);
      expect(
        container.querySelector(`time[datetime="${instant}"]`)?.textContent,
      ).toBe(expectedVisitor);
      expect(container.querySelectorAll("time")).toHaveLength(2);
    } finally {
      if (root) await act(async () => root?.unmount());
      container.remove();
      if (originalTz === undefined) delete process.env.TZ;
      else process.env.TZ = originalTz;
    }
  });
});

describe("Support tickets grid", () => {
  it("preserves the ticket link, summary, identity, track and timing", () => {
    render(
      <SupportTicketsTable
        tickets={[ticket]}
        queues={[
          {
            id: "donor_care",
            label: "Donor care",
            description: "Donor requests",
          },
        ]}
        filtered={false}
      />,
    );
    expect(
      screen
        .getByRole("link", { name: "Receipt question" })
        .getAttribute("href"),
    ).toBe("/support/tickets/ticket-1");
    for (const text of [
      "Please resend my receipt",
      "ticket-1",
      "donor@example.test",
      "Donor care",
      "Waiting",
      "High",
    ])
      expect(screen.getByText(text)).toBeTruthy();
    expect(screen.getByText("Follow-up")).toBeTruthy();
    expect(screen.getByText("Updated")).toBeTruthy();
  });
  it("distinguishes a filtered empty result from no tickets", () => {
    const { rerender } = render(
      <SupportTicketsTable tickets={[]} queues={[]} filtered />,
    );
    expect(screen.getByText("No tickets match your filters")).toBeTruthy();
    rerender(<SupportTicketsTable tickets={[]} queues={[]} filtered={false} />);
    expect(screen.getByText("No support tickets yet")).toBeTruthy();
  });
});
