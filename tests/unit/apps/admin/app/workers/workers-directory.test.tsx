/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WorkersDirectory } from "../../../../../../apps/admin/features/mission-control/workers/workers-directory";
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../../../apps/admin/node_modules/@tanstack/react-query/build/modern/index.js";

const state = vi.hoisted(() => ({ search: "" }));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(state.search),
}));

vi.mock("@asym/auth/tenant-navigation", () => ({
  TenantLink: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function worker(id: string, overrides: Record<string, unknown> = {}) {
  return {
    assignmentId: id,
    partyId: `${id.slice(0, -4)}d0d1`,
    displayName: `Worker ${id.slice(-4)}`,
    publicAlias: null,
    securityLevel: "standard",
    securityLevelSource: "manual",
    doNotPublish: false,
    hasLegalIdentity: null,
    hasLogin: false,
    createdAt: "2026-11-26T00:00:00+00:00",
    ...overrides,
  };
}

const A = "00000000-0000-4000-8000-00000000aaaa";
const B = "00000000-0000-4000-8000-00000000bbbb";

const fetchMock = vi.fn();
let client: QueryClient;

function reply(status: number, body: unknown) {
  return { ok: status < 300, status, json: async () => body };
}

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  state.search = "";
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
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
    addListener() {},
    removeListener() {},
  }));
});

afterEach(() => {
  cleanup();
  client.clear();
  vi.unstubAllGlobals();
});

function show() {
  return render(
    <QueryClientProvider client={client}>
      <WorkersDirectory />
    </QueryClientProvider>,
  );
}

describe("AL-2678 r2b1: the workers' directory", () => {
  it("lists each worker with the alias beneath, the level as text, Do not publish, and Security level unreviewed only for an unreviewed worker; each name opens its record by id", async () => {
    fetchMock.mockResolvedValue(
      reply(200, {
        workers: [
          worker(A, {
            securityLevelSource: "unreviewed_default",
            hasLogin: true,
          }),
          worker(B, {
            securityLevel: "restricted",
            publicAlias: "Birch",
            doNotPublish: true,
          }),
        ],
      }),
    );
    show();
    const table = await screen.findByRole("table", { name: "Workers" });
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(2);
    expect(
      within(rows[0]!).getByText("Security level unreviewed"),
    ).toBeTruthy();
    expect(within(rows[0]!).getByText("Standard")).toBeTruthy();
    expect(within(rows[0]!).getByText("Linked")).toBeTruthy();
    expect(
      within(rows[1]!).queryByText("Security level unreviewed"),
    ).toBeNull();
    expect(within(rows[1]!).getByText("Restricted")).toBeTruthy();
    expect(within(rows[1]!).getByText("Do not publish")).toBeTruthy();
    expect(within(rows[1]!).getByText("Alias: Birch")).toBeTruthy();
    expect(
      within(rows[1]!)
        .getByRole("link", { name: "Worker bbbb" })
        .getAttribute("href"),
    ).toBe(`/workers/${B}`);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/admin/workers");
  });

  it("filters to unreviewed workers from ?review=unreviewed, marks the current filter, and says when none is waiting", async () => {
    state.search = "review=unreviewed";
    fetchMock.mockResolvedValue(
      reply(200, {
        workers: [
          worker(A, { securityLevelSource: "unreviewed_default" }),
          worker(B),
        ],
      }),
    );
    const view = show();
    const table = await screen.findByRole("table", {
      name: "Unreviewed workers",
    });
    expect(within(table).getAllByRole("row")).toHaveLength(2);
    const nav = screen.getByRole("navigation", { name: "Filter workers" });
    expect(
      within(nav)
        .getByRole("link", { name: "Unreviewed" })
        .getAttribute("aria-current"),
    ).toBe("page");
    expect(
      within(nav)
        .getByRole("link", { name: "All workers" })
        .getAttribute("href"),
    ).toBe("/workers");
    expect(
      within(nav)
        .getByRole("link", { name: "Unreviewed" })
        .getAttribute("href"),
    ).toBe("/workers?review=unreviewed");
    view.unmount();
    client.clear();
    fetchMock.mockResolvedValue(reply(200, { workers: [worker(B)] }));
    show();
    expect(
      await screen.findByText(
        "No worker's security level is waiting for review.",
      ),
    ).toBeTruthy();
  });

  it("says when there are no workers, shows nothing but a skeleton while loading, and on a failed read offers Try again", async () => {
    let resolve: (value: unknown) => void = () => {};
    fetchMock.mockReturnValueOnce(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const view = show();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByText("No workers yet.")).toBeNull();
    resolve(reply(200, { workers: [] }));
    expect(await screen.findByText("No workers yet.")).toBeTruthy();
    view.unmount();
    client.clear();
    fetchMock.mockResolvedValue(reply(500, { error: "x" }));
    show();
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Workers could not be loaded.",
    );
    fetchMock.mockResolvedValue(reply(200, { workers: [worker(A)] }));
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() =>
      expect(screen.getByRole("table", { name: "Workers" })).toBeTruthy(),
    );
  });

  it("a long directory is paged and searchable in the shared data table: of 30 workers a page shows 20 and the next page the other 10, and a search by name narrows it to the match (WP5 rest 2b, issue 2835 item 3; red: one table of every worker and no search)", async () => {
    const workers = Array.from({ length: 30 }, (_, i) =>
      worker(`00000000-0000-4000-8000-${String(i).padStart(12, "0")}`),
    );
    fetchMock.mockResolvedValue(reply(200, { workers }));
    show();
    const names = () =>
      screen
        .getAllByRole("link")
        .map((link) => link.textContent ?? "")
        .filter((text) => /^Worker \d{4}$/.test(text));
    await waitFor(() => expect(names()).toHaveLength(20));
    expect(names()[0]).toBe("Worker 0000");
    fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));
    await waitFor(() => expect(names()).toHaveLength(10));
    expect(names()).toContain("Worker 0029");
    fireEvent.change(screen.getByRole("textbox", { name: "Search workers" }), {
      target: { value: "0007" },
    });
    await waitFor(() => expect(names()).toEqual(["Worker 0007"]));
  });
});
