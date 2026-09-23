// @vitest-environment jsdom

import { supportHubReadModel } from "@asym/database/collections/support-workspace";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1894: Verify the real intake names, payload, reset, and pending contract.
import { NewTicketForm } from "../../../../../../apps/admin/app/(app)/support/tickets/new/new-ticket-form";
// eslint-disable-next-line no-restricted-imports -- AL-1894: Verify server-rendered GET controls preserve form submission semantics.
import SupportTicketsPage from "../../../../../../apps/admin/app/(app)/support/tickets/page";

const { loadTicketList } = vi.hoisted(() => ({ loadTicketList: vi.fn() }));
vi.mock("@asym/api/admin/support/loaders", () => ({
  loadSupportTicketList: loadTicketList,
}));
const contacts = [
  { id: "contact-1", name: "Ada Lovelace", email: "ada@example.test" },
];
const queues = [
  {
    id: "donor_care" as const,
    label: "Donor Care",
    description: "Giving support",
  },
];
const defaults = {
  contact: "",
  queueId: "",
  priority: "normal",
  subject: "",
  summary: "",
};
beforeEach(() => {
  loadTicketList.mockResolvedValue({
    ...supportHubReadModel,
    tickets: [],
    queues,
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView ??= () => {};
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
function getForm(container: HTMLElement) {
  const form = container.querySelector("form");
  if (!form) throw new Error("Form was not rendered");
  return form;
}
function intake() {
  return getForm(
    render(<NewTicketForm contacts={contacts} queues={queues} />).container,
  );
}
async function choose(name: string, value: string, label: string) {
  const control = screen.getByRole("combobox", { name, exact: true });
  // Support the native before-migration baseline for payload/reset tests.
  if (control instanceof HTMLSelectElement) {
    fireEvent.change(control, { target: { value } });
    return;
  }
  fireEvent.mouseDown(control);
  const option = await screen.findByRole("option", {
    name: label,
    exact: true,
  });
  fireEvent.pointerDown(option, { pointerType: "mouse", buttons: 1 });
  fireEvent.click(option);
}
async function fillIntake() {
  await choose("Contact", "contact-1", "Ada Lovelace");
  await choose("Support track", "donor_care", "Donor Care");
  await choose("Priority", "urgent", "urgent");
  fireEvent.change(screen.getByLabelText("Subject"), {
    target: { value: "  Receipt help  " },
  });
  fireEvent.change(screen.getByLabelText("Summary"), {
    target: { value: "  Please resend the receipt.  " },
  });
}
describe("support ticket intake", () => {
  it("names shared selectors and serializes required placeholders/default priority", () => {
    const form = intake();
    for (const name of ["Contact", "Support track", "Priority"])
      expect(screen.getByRole("combobox", { name, exact: true }).tagName).toBe(
        "BUTTON",
      );
    expect(Object.fromEntries(new FormData(form))).toEqual(defaults);
    expect(form.checkValidity()).toBe(false);
  });
  it("submits once while pending and resets all controls after success", async () => {
    let finish!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      finish = resolve;
    });
    const fetchMock = vi.fn((_url: string, _init?: RequestInit) => pending);
    vi.stubGlobal("fetch", fetchMock);
    const form = intake();
    await fillIntake();
    expect(form.checkValidity()).toBe(true);
    const submit = screen.getByRole("button", { name: "Create ticket" });
    submit.focus();
    act(() => {
      form.requestSubmit();
      form.requestSubmit();
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("/api/admin/support/tickets");
    expect(JSON.parse(String(init?.body))).toEqual({
      contactId: "contact-1",
      contactEmail: "ada@example.test",
      contactName: "Ada Lovelace",
      queueId: "donor_care",
      priority: "urgent",
      subject: "Receipt help",
      summary: "Please resend the receipt.",
    });
    expect(document.activeElement).toBe(submit);
    expect(submit.getAttribute("aria-disabled")).toBe("true");
    await act(async () => finish(Response.json({ id: "ticket-1" })));
    expect(screen.getByText("Created ticket ticket-1")).toBeTruthy();
    expect(screen.queryByText("Unable to create support ticket.")).toBeNull();
    expect(Object.fromEntries(new FormData(form))).toEqual(defaults);
    expect(
      screen.getByRole("combobox", { name: "Contact" }).textContent,
    ).toContain("Select contact");
    expect(
      screen.getByRole("combobox", { name: "Priority" }).textContent,
    ).toContain("normal");
  });
  it("retains selections on failure and permits retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({ error: "Try again" }, { status: 400 }),
      )
      .mockResolvedValueOnce(Response.json({ id: "ticket-2" }));
    vi.stubGlobal("fetch", fetchMock);
    const form = intake();
    await fillIntake();
    fireEvent.submit(form);
    expect(await screen.findByText("Try again")).toBeTruthy();
    expect(new FormData(form).get("contact")).toBe("contact-1");
    expect(new FormData(form).get("priority")).toBe("urgent");
    fireEvent.submit(form);
    expect(await screen.findByText("Created ticket ticket-2")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
describe("support ticket server GET filters", () => {
  it("preserves names and URL defaults, then serializes explicit All choices", async () => {
    const form = getForm(
      render(
        await SupportTicketsPage({
          searchParams: Promise.resolve({
            queueId: "donor_care",
            status: "waiting",
            search: "receipt",
          }),
        }),
      ).container,
    );
    expect(form.method).toBe("get");
    expect(Object.fromEntries(new FormData(form))).toEqual({
      queueId: "donor_care",
      status: "waiting",
      search: "receipt",
    });
    expect(
      screen.getByRole("combobox", { name: "Support track" }).tagName,
    ).toBe("BUTTON");
    await choose("Support track", "", "All tracks");
    await choose("Status", "", "All statuses");
    expect(Object.fromEntries(new FormData(form))).toEqual({
      queueId: "",
      status: "",
      search: "receipt",
    });
  });
  it("matches the native All fallback for unknown filter defaults", async () => {
    const form = getForm(
      render(
        await SupportTicketsPage({
          searchParams: Promise.resolve({
            queueId: "removed",
            status: "unknown",
          }),
        }),
      ).container,
    );
    expect(new FormData(form).get("queueId")).toBe("");
    expect(new FormData(form).get("status")).toBe("");
  });
});
