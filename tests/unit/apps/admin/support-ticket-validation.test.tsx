/** @vitest-environment jsdom */

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NewTicketForm } from "../../../../apps/admin/app/(app)/support/tickets/new/new-ticket-form";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Support ticket form validation", () => {
  it("keeps native required constraints and rejects an incomplete submission before any request", () => {
    const request = vi.fn();
    vi.stubGlobal("fetch", request);
    const view = render(<NewTicketForm contacts={[]} queues={[]} />);
    expect(view.getByRole("textbox", { name: "Subject" })).toHaveProperty(
      "required",
      true,
    );
    expect(view.getByRole("textbox", { name: "Summary" })).toHaveProperty(
      "required",
      true,
    );
    const form = view
      .getByRole("button", { name: "Create ticket" })
      .closest("form");
    if (!form) throw new Error("Create ticket must submit its form");
    fireEvent.submit(form);
    expect(view.getByRole("alert").textContent).toContain(
      "Contact, subject, support track, priority, and summary are required.",
    );
    expect(request).not.toHaveBeenCalled();
  });
});
