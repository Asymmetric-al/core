/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../../apps/admin/node_modules/@tanstack/react-query/build/modern/index.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TeamsPage from "../../../../../apps/admin/app/(app)/admin/teams/page-client";

const workspace = vi.hoisted(() => ({ role: "admin" as string }));
vi.mock("@asym/lib/mission-control/context", () => ({
  useMC: () => ({ role: workspace.role }),
}));

const fetchMock = vi.fn();
let client: QueryClient;
beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  vi.stubGlobal("fetch", fetchMock);
  fetchMock
    .mockReset()
    .mockResolvedValue({ ok: true, json: async () => ({ users: [] }) });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("matchMedia", (media: string) => ({
    media,
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));
});
afterEach(() => {
  cleanup();
  client.clear();
  workspace.role = "admin";
  vi.unstubAllGlobals();
});
function show() {
  return render(
    <QueryClientProvider client={client}>
      <TeamsPage />
    </QueryClientProvider>,
  );
}

describe("Staff directory and real staff", () => {
  it("names the page for what it holds, without simulated team controls", async () => {
    const view = show();
    expect(
      view.getByRole("heading", { level: 1, name: "Staff directory" }),
    ).toBeTruthy();
    expect(view.queryByText("Teams are not available yet")).toBeNull();
    expect(view.queryByText("Sample teams")).toBeNull();
    expect(view.queryByRole("button", { name: "New team" })).toBeNull();
    expect(await view.findByText("No staff accounts found")).toBeTruthy();
  });

  it("tells the administrator where access is managed instead of sending them to themselves", async () => {
    const view = show();
    await view.findByText("No staff accounts found");
    const note = view.getByRole("note");
    expect(note.textContent).toContain("Roles are read-only here");
    expect(note.textContent).toContain("Review synced website editor accounts");
    expect(note.textContent).not.toContain(
      "Website editing access is managed in",
    );
    expect(note.textContent).toContain("Mission Control has no teams yet");
    expect(view.container.textContent).not.toMatch(
      /Ask your Mission Control administrator/,
    );
    expect(
      view
        .getByRole("link", { name: "Web Studio editors" })
        .getAttribute("href"),
    ).toBe("/web-studio/collections/cms-users");
    // A compact note after the directory, so the people come first.
    const people = view.getByRole("heading", { level: 2, name: "People" });
    expect(
      people.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("names the platform administrators who can change a role", async () => {
    fetchMock.mockImplementation(async (url: string) => ({
      ok: true,
      json: async () => ({
        users: url.includes("role=super_admin")
          ? [{ id: "p1", full_name: "Pat Platform", role: "super_admin" }]
          : [],
      }),
    }));
    const view = show();
    await view.findAllByText("Pat Platform");
    expect(view.getByRole("note").textContent).toContain(
      "Ask a platform administrator (Pat Platform) to change a role.",
    );
  });

  it("explains the directory is for administrators instead of failing for other roles", () => {
    workspace.role = "finance";
    const view = show();
    expect(
      view.getByText("Only administrators can see staff accounts."),
    ).toBeTruthy();
    expect(view.queryByText("Could not load staff")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("shows staff names, email and actual roles from the admin users API", async () => {
    fetchMock.mockImplementation(async (url: string) => ({
      ok: true,
      json: async () => ({
        users: url.includes("role=staff")
          ? [
              {
                id: "staff-1",
                full_name: "Zoe Actual",
                email: "zoe@example.com",
                role: "staff",
              },
            ]
          : [],
      }),
    }));
    const view = show();
    expect(await view.findByText("Zoe Actual")).toBeTruthy();
    expect(view.getByText("zoe@example.com")).toBeTruthy();
    expect(view.getByText("Staff")).toBeTruthy();
    expect(
      fetchMock.mock.calls.every(([url]) =>
        String(url).startsWith("/api/admin/users?"),
      ),
    ).toBe(true);
  });
  it("distinguishes a failed staff load from no accounts and retries", async () => {
    fetchMock.mockResolvedValue({ ok: false });
    const view = show();
    expect(await view.findByText("Could not load staff")).toBeTruthy();
    expect(view.queryByText("No staff accounts found")).toBeNull();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ users: [] }),
    });
    fireEvent.click(view.getByRole("button", { name: "Retry" }));
    await view.findByText("No staff accounts found");
  });
  it("offers phone sorting for the real People directory", async () => {
    vi.stubGlobal("innerWidth", 390);
    fetchMock.mockImplementation(async (url: string) => ({
      ok: true,
      json: async () => ({
        users: url.includes("role=staff")
          ? [{ id: "s1", full_name: "Zoe", role: "staff" }]
          : [],
      }),
    }));
    const view = show();
    await view.findByText("Zoe");
    expect(view.getByRole("combobox", { name: "Sort people" })).toBeTruthy();
  });
  it("keeps the phone card list valid: one list item per person, no nested list item", async () => {
    vi.stubGlobal("innerWidth", 390);
    fetchMock.mockImplementation(async (url: string) => ({
      ok: true,
      json: async () => ({
        users: url.includes("role=staff")
          ? [
              { id: "s1", full_name: "Zoe", role: "staff" },
              { id: "s2", full_name: "Ana", role: "staff" },
            ]
          : [],
      }),
    }));
    const view = show();
    await view.findByText("Zoe");
    const rows = view.container.querySelectorAll(
      '[data-slot="data-grid-panel-row"]',
    );
    expect(rows.length).toBe(2);
    // The panel's <li> is the list item; a card inside it must not claim
    // role="listitem" too (axe aria-required-parent).
    for (const row of rows) {
      expect(row.querySelector('[role="listitem"]')).toBeNull();
    }
  });
  it("reads beyond the first staff page", async () => {
    fetchMock.mockImplementation(async (url: string) => ({
      ok: true,
      json: async () => ({
        users: url.includes("role=staff")
          ? url.includes("offset=0")
            ? Array.from({ length: 100 }, (_, i) => ({
                id: `s${i}`,
                full_name: `Staff ${i}`,
                role: "staff",
              }))
            : [{ id: "last", full_name: "Last staff", role: "staff" }]
          : [],
      }),
    }));
    show();
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(
          ([url]) =>
            String(url).includes("role=staff") &&
            String(url).includes("offset=100"),
        ),
      ).toBe(true),
    );
  });
});
