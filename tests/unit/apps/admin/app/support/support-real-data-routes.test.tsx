// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Route regression at the public boundary.
import ContactsPage from "../../../../../../apps/admin/app/(app)/support/contacts/page";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Route redirect regression.
import ReportsRoot from "../../../../../../apps/admin/app/(app)/support/reports/page";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Canonical redirect regression.
import MacrosPage from "../../../../../../apps/admin/app/(app)/support/macros/page";
const mocks = vi.hoisted(() => ({
  load: vi.fn(),
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
}));
vi.mock("@asym/api/admin/support/loaders", () => ({
  loadSupportContacts: mocks.load,
}));
vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  permanentRedirect: mocks.permanentRedirect,
}));
afterEach(cleanup);
it("searches saved contacts and links to real ticket and CRM searches", async () => {
  mocks.load.mockResolvedValue([
    {
      id: "saved",
      name: "Mina",
      email: "mina@example.org",
      organization: "Hope",
    },
    { id: "other", name: "Other", email: "other@example.org" },
  ]);
  const element = ContactsPage({
    searchParams: Promise.resolve({ search: "Hope" }),
  });
  render(await element.props.children.type(element.props.children.props));
  expect(screen.getByRole("status").textContent).toContain(
    "Showing 1 of 2 contacts",
  );
  expect(
    screen.getByRole("link", { name: "View tickets" }).getAttribute("href"),
  ).toBe("/support/tickets?search=mina%40example.org");
  expect(
    screen.getByRole("link", { name: "Find in CRM" }).getAttribute("href"),
  ).toBe("/crm?email=mina%40example.org");
  expect(screen.queryByText("Other")).toBeNull();
});
it("accepts repeated contact search parameters without crashing", async () => {
  mocks.load.mockResolvedValue([
    {
      id: "saved",
      name: "Mina",
      email: "mina@example.org",
      organization: "Hope",
    },
  ]);
  const element = ContactsPage({
    searchParams: Promise.resolve({ search: ["Hope", "other"] }),
  });
  render(await element.props.children.type(element.props.children.props));
  expect(screen.getByRole("status").textContent).toContain(
    "Showing 1 of 1 contacts",
  );
});
it("preserves repeated and unknown report query parameters", async () => {
  const element = ReportsRoot({
    searchParams: Promise.resolve({
      scopeKind: "team",
      scopeId: "care",
      from: "2026-11-01",
      label: ["first", "second"],
      extra: "keep",
    }),
  });
  await element.props.children.type(element.props.children.props);
  const url = new URL(
    mocks.redirect.mock.calls.at(-1)![0],
    "https://example.org",
  );
  expect(url.pathname).toBe("/support/reports/overview");
  expect(url.searchParams.getAll("label")).toEqual(["first", "second"]);
  expect(url.searchParams.get("scopeId")).toBe("care");
  expect(url.searchParams.get("extra")).toBe("keep");
});
it("redirects the retired sample macro library to the canonical settings route", () => {
  MacrosPage();
  expect(mocks.permanentRedirect).toHaveBeenCalledWith(
    "/support/settings/macros",
  );
});
