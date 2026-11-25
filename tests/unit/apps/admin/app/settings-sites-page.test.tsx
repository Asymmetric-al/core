/** @vitest-environment jsdom */
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SitesPage from "../../../../../apps/admin/app/(app)/settings/sites/page-client";
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../../apps/admin/node_modules/@tanstack/react-query/build/modern/index.js";

const h = vi.hoisted(() => ({
  capabilities: ["sites.manage"] as string[] | undefined,
  fetch: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@asym/lib/mission-control/context", () => ({
  useMC: () => ({ role: "admin", capabilities: h.capabilities }),
}));

vi.mock("@asym/database/own-api", () => ({
  ownApiFetch: h.fetch,
}));

vi.mock("sonner", () => ({
  toast: { success: h.toastSuccess, error: vi.fn() },
}));

type Site = {
  id: string;
  name: string;
  is_default: boolean;
  status: "active" | "inactive";
  primary_domain: string | null;
};
type Settings = { sites: Site[]; brand: { display_name: string } | null };
type Reply = { status: number; body: unknown };

const DEFAULT_SITE: Site = {
  id: "ffbeafc8-f85f-a2c9-5493-d62f5003e3b8",
  name: "GiveHope",
  is_default: true,
  status: "active",
  primary_domain: "give-hope-demo.localhost",
};
const SPANISH: Site = {
  id: "00000000-0000-4000-8000-00000000c0c1",
  name: "Spanish site",
  is_default: false,
  status: "active",
  primary_domain: null,
};
const OLD: Site = {
  id: "00000000-0000-4000-8000-00000000c0c2",
  name: "Old site",
  is_default: false,
  status: "inactive",
  primary_domain: null,
};

function settings(overrides: Partial<Settings> = {}): Settings {
  return {
    sites: [DEFAULT_SITE, OLD, SPANISH],
    brand: { display_name: "GiveHope" },
    ...overrides,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

const server = {
  reads: [] as Array<Reply | Promise<Reply>>,
  lastRead: { status: 200, body: settings() } as Reply,
  posts: {} as Record<string, Array<Reply | Promise<Reply>>>,
};

function respond(reply: Reply) {
  return {
    ok: reply.status >= 200 && reply.status < 300,
    status: reply.status,
    json: async () => reply.body,
  };
}

function posts(path?: string) {
  return h.fetch.mock.calls.filter(
    ([url, init]) =>
      (init as RequestInit | undefined)?.method === "POST" &&
      (path === undefined || url === path),
  );
}

function reads() {
  return h.fetch.mock.calls.filter(
    ([url, init]) =>
      url === "/api/admin/sites" &&
      ((init as RequestInit | undefined)?.method ?? "GET") === "GET",
  );
}

function postBody(index = 0, path?: string) {
  return JSON.parse(String((posts(path)[index]![1] as RequestInit).body));
}

let client: QueryClient;

beforeEach(() => {
  h.capabilities = ["sites.manage"];
  h.toastSuccess.mockReset();
  server.reads = [];
  server.lastRead = { status: 200, body: settings() };
  server.posts = {};
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  h.fetch
    .mockReset()
    .mockImplementation(async (url: string, init?: RequestInit) => {
      if ((init?.method ?? "GET") === "GET") {
        const next = server.reads.shift();
        if (next) {
          const reply = await next;
          server.lastRead = reply;
          return respond(reply);
        }
        return respond(server.lastRead);
      }
      const queue = server.posts[url] ?? [];
      const next = queue.shift();
      return respond(next ? await next : { status: 500, body: {} });
    });
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
  vi.unstubAllGlobals();
});

function show() {
  return render(
    <QueryClientProvider client={client}>
      <SitesPage />
    </QueryClientProvider>,
  );
}

async function loaded() {
  const view = show();
  await view.findByRole("table", { name: "Sites in this organization" });
  return view;
}

function rowOf(view: ReturnType<typeof show>, name: string) {
  const table = view.getByRole("table", { name: "Sites in this organization" });
  return within(table)
    .getAllByRole("row")
    .find((row) => within(row).queryByText(name, { exact: true }))!;
}

describe("Mission Control's Sites screen (T4)", () => {
  it("shows the no-access note and calls no own API without sites.manage", async () => {
    h.capabilities = [];
    const view = show();
    expect(view.getByRole("heading", { level: 1, name: "Sites" })).toBeTruthy();
    const note = view.getByRole("note");
    expect(within(note).getByText("No access to Sites")).toBeTruthy();
    expect(
      within(note).getByText(
        "Your active assignment can't manage Sites. Ask an administrator of this organization.",
      ),
    ).toBeTruthy();
    expect(
      within(note)
        .getByRole("link", { name: "Go to home" })
        .getAttribute("href"),
    ).toBe("/");
    await act(async () => {
      await Promise.resolve();
    });
    expect(h.fetch).not.toHaveBeenCalled();
  });

  it("shows the no-access note when the context has no capabilities at all", () => {
    h.capabilities = undefined;
    const view = show();
    expect(view.getByText("No access to Sites")).toBeTruthy();
    expect(h.fetch).not.toHaveBeenCalled();
  });

  it("shows the no-access note when the read answers 403 with no code", async () => {
    server.reads.push({ status: 403, body: { error: "Forbidden" } });
    const view = show();
    expect(await view.findByText("No access to Sites")).toBeTruthy();
    expect(view.queryByRole("table")).toBeNull();
  });

  it("shows the no-access note when the read answers 403 NOT_PERMITTED", async () => {
    server.reads.push({
      status: 403,
      body: {
        error: "You can't manage Sites in this organization.",
        code: "NOT_PERMITTED",
      },
    });
    const view = show();
    expect(await view.findByText("No access to Sites")).toBeTruthy();
  });

  it("shows a busy region while the read loads", async () => {
    const pending = deferred<Reply>();
    server.reads.push(pending.promise);
    const view = show();
    const busy = await view.findByText("Loading Sites…");
    expect(busy.closest("[aria-busy='true']")).not.toBeNull();
    await act(async () => {
      pending.resolve({ status: 200, body: settings() });
    });
    await view.findByRole("table", { name: "Sites in this organization" });
  });

  it("offers Try again when the read fails, and loads on retry", async () => {
    server.reads.push({ status: 500, body: { code: "SITES_UNAVAILABLE" } });
    const view = show();
    expect(
      await view.findByText("Sites can't be loaded right now."),
    ).toBeTruthy();
    fireEvent.click(view.getByRole("button", { name: "Try again" }));
    await view.findByRole("table", { name: "Sites in this organization" });
    expect(reads()).toHaveLength(2);
  });

  it("shows the empty state and an empty donor account name when there is neither", async () => {
    server.lastRead = { status: 200, body: { sites: [], brand: null } };
    const view = show();
    expect(await view.findByText("No Sites yet")).toBeTruthy();
    expect(view.getByRole("button", { name: "Create Site" })).toBeTruthy();
    const field = view.getByLabelText("Donor account name") as HTMLInputElement;
    expect(field.value).toBe("");
    expect(
      (view.getByRole("button", { name: "Save" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it("lists every Site with its status, domain and an action named for it, none on the default", async () => {
    const view = await loaded();
    expect(view.getByRole("heading", { level: 1, name: "Sites" })).toBeTruthy();
    expect(
      view.getByRole("region", { name: "Donor account name" }),
    ).toBeTruthy();
    expect(view.getByRole("region", { name: "Sites" })).toBeTruthy();
    const defaultRow = rowOf(view, "GiveHope");
    expect(within(defaultRow).getByText("Default")).toBeTruthy();
    expect(within(defaultRow).getByText("Active")).toBeTruthy();
    expect(
      within(defaultRow).getByText("give-hope-demo.localhost"),
    ).toBeTruthy();
    expect(within(defaultRow).getByText("Always active")).toBeTruthy();
    expect(within(defaultRow).queryByRole("button")).toBeNull();
    expect(
      view.queryByRole("button", { name: /Deactivate GiveHope/ }),
    ).toBeNull();
    const spanish = rowOf(view, "Spanish site");
    expect(within(spanish).getByText("Not connected")).toBeTruthy();
    expect(
      within(spanish).getByRole("button", { name: "Deactivate Spanish site" }),
    ).toBeTruthy();
    const old = rowOf(view, "Old site");
    expect(within(old).getByText("Inactive")).toBeTruthy();
    expect(
      within(old).getByRole("button", { name: "Reactivate Old site" }),
    ).toBeTruthy();
    expect(view.queryByText(/designate|home/i)).toBeNull();
    expect(view.queryByRole("button", { name: /domain/i })).toBeNull();
  });

  it("creates a Site once for two clicks, sends the stripped name, and shows what the refetched read holds", async () => {
    const view = await loaded();
    fireEvent.click(view.getByRole("button", { name: "Create Site" }));
    const dialog = await view.findByRole("dialog", { name: "Create a Site" });
    const field = within(dialog).getByLabelText(
      "Site name",
    ) as HTMLInputElement;
    await waitFor(() => expect(document.activeElement).toBe(field));
    fireEvent.change(field, { target: { value: "  Typed site​ " } });
    const pending = deferred<Reply>();
    server.posts["/api/admin/sites"] = [pending.promise];
    server.reads.push({
      status: 200,
      body: settings({
        sites: [
          DEFAULT_SITE,
          OLD,
          SPANISH,
          {
            ...SPANISH,
            id: "00000000-0000-4000-8000-00000000c0c3",
            name: "Refetched site",
          },
        ],
      }),
    });
    const submit = within(dialog).getByRole("button", { name: "Create Site" });
    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(posts("/api/admin/sites")).toHaveLength(1);
    expect(postBody(0, "/api/admin/sites")).toEqual({ name: "Typed site" });
    expect(field.value).toBe("Typed site");
    expect((submit as HTMLButtonElement).disabled).toBe(true);
    await act(async () => {
      pending.resolve({
        status: 201,
        body: {
          site: {
            ...SPANISH,
            id: "00000000-0000-4000-8000-00000000c0c3",
            name: "Answered site",
          },
        },
      });
    });
    await waitFor(() =>
      expect(view.queryByRole("dialog", { name: "Create a Site" })).toBeNull(),
    );
    expect(await view.findByText("Refetched site")).toBeTruthy();
    expect(view.queryByText("Answered site")).toBeNull();
    expect(view.queryByText("Typed site")).toBeNull();
    expect(h.toastSuccess).toHaveBeenCalledWith(
      expect.stringContaining("Answered site"),
    );
    expect(posts()).toHaveLength(1);
  });

  it("creates a Site once for two Enters", async () => {
    const view = await loaded();
    fireEvent.click(view.getByRole("button", { name: "Create Site" }));
    const dialog = await view.findByRole("dialog", { name: "Create a Site" });
    const field = within(dialog).getByLabelText("Site name");
    fireEvent.change(field, { target: { value: "Spanish site" } });
    const pending = deferred<Reply>();
    server.posts["/api/admin/sites"] = [pending.promise];
    const form = field.closest("form")!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(posts("/api/admin/sites")).toHaveLength(1);
    await act(async () => {
      pending.resolve({ status: 201, body: { site: SPANISH } });
    });
  });

  it("keeps the create dialog open on a refusal, shows INVALID_NAME as the field's error, and refetches", async () => {
    const view = await loaded();
    const before = reads().length;
    fireEvent.click(view.getByRole("button", { name: "Create Site" }));
    const dialog = await view.findByRole("dialog", { name: "Create a Site" });
    fireEvent.change(within(dialog).getByLabelText("Site name"), {
      target: { value: "a\u0001b" },
    });
    server.posts["/api/admin/sites"] = [
      {
        status: 400,
        body: {
          error:
            "Use 1 to 160 characters, with nothing invisible and no spaces at the start or end.",
          code: "INVALID_NAME",
        },
      },
    ];
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create Site" }),
    );
    expect(
      await within(dialog).findByText(
        "Use 1 to 160 characters, with nothing invisible and no spaces at the start or end.",
      ),
    ).toBeTruthy();
    expect(view.getByRole("dialog", { name: "Create a Site" })).toBeTruthy();
    await waitFor(() => expect(reads().length).toBe(before + 1));
  });

  it("asks before deactivating: Cancel and Escape send nothing, confirm sends one POST and stays open while pending", async () => {
    const view = await loaded();
    const opener = view.getByRole("button", {
      name: "Deactivate Spanish site",
    });

    fireEvent.click(opener);
    let dialog = await view.findByRole("alertdialog", {
      name: "Deactivate Spanish site?",
    });
    expect(
      within(dialog).getByText(
        "While it's inactive, its pages aren't shown to visitors. You can reactivate it at any time, and its pages come back without republishing.",
      ),
    ).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(view.queryByRole("alertdialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(opener));

    fireEvent.click(opener);
    dialog = await view.findByRole("alertdialog", {
      name: "Deactivate Spanish site?",
    });
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(view.queryByRole("alertdialog")).toBeNull());
    expect(posts()).toHaveLength(0);

    fireEvent.click(opener);
    dialog = await view.findByRole("alertdialog", {
      name: "Deactivate Spanish site?",
    });
    const pending = deferred<Reply>();
    server.posts["/api/admin/sites/status"] = [pending.promise];
    server.reads.push({
      status: 200,
      body: settings({
        sites: [DEFAULT_SITE, OLD, { ...SPANISH, status: "inactive" }],
      }),
    });
    const confirm = within(dialog).getByRole("button", { name: "Deactivate" });
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    expect(posts("/api/admin/sites/status")).toHaveLength(1);
    expect(postBody(0, "/api/admin/sites/status")).toEqual({
      siteId: SPANISH.id,
      status: "inactive",
    });
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(
      view.getByRole("alertdialog", { name: "Deactivate Spanish site?" }),
    ).toBeTruthy();
    expect((confirm as HTMLButtonElement).disabled).toBe(true);
    await act(async () => {
      pending.resolve({
        status: 200,
        body: { site: { ...SPANISH, status: "inactive" } },
      });
    });
    await waitFor(() => expect(view.queryByRole("alertdialog")).toBeNull());
    const reactivate = await view.findByRole("button", {
      name: "Reactivate Spanish site",
    });
    await waitFor(() => expect(document.activeElement).toBe(reactivate));
    expect(
      within(rowOf(view, "Spanish site")).getByText("Inactive"),
    ).toBeTruthy();
    expect(h.toastSuccess).toHaveBeenCalledWith(
      "Spanish site is now inactive.",
    );
  });

  it("shows a refused deactivation inside the dialog and keeps it open", async () => {
    const view = await loaded();
    fireEvent.click(
      view.getByRole("button", { name: "Deactivate Spanish site" }),
    );
    const dialog = await view.findByRole("alertdialog", {
      name: "Deactivate Spanish site?",
    });
    server.posts["/api/admin/sites/status"] = [
      {
        status: 404,
        body: {
          error:
            "This Site isn't in this organization any more. Reload to see the current list.",
          code: "SITE_NOT_FOUND",
        },
      },
    ];
    fireEvent.click(within(dialog).getByRole("button", { name: "Deactivate" }));
    expect(
      await within(dialog).findByText(
        "This Site isn't in this organization any more. Reload to see the current list.",
      ),
    ).toBeTruthy();
    expect(view.getByRole("alertdialog")).toBeTruthy();
  });

  it("reactivates without asking, once for two clicks", async () => {
    const view = await loaded();
    const pending = deferred<Reply>();
    server.posts["/api/admin/sites/status"] = [pending.promise];
    server.reads.push({
      status: 200,
      body: settings({
        sites: [DEFAULT_SITE, { ...OLD, status: "active" }, SPANISH],
      }),
    });
    const button = view.getByRole("button", { name: "Reactivate Old site" });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(view.queryByRole("alertdialog")).toBeNull();
    expect(posts("/api/admin/sites/status")).toHaveLength(1);
    expect(postBody(0, "/api/admin/sites/status")).toEqual({
      siteId: OLD.id,
      status: "active",
    });
    await act(async () => {
      pending.resolve({
        status: 200,
        body: { site: { ...OLD, status: "active" } },
      });
    });
    expect(
      await view.findByRole("button", { name: "Deactivate Old site" }),
    ).toBeTruthy();
    expect(h.toastSuccess).toHaveBeenCalledWith("Old site is now active.");
  });

  it("saves the donor account name once for two clicks and two Enters, enabled only when it changes", async () => {
    const view = await loaded();
    const field = view.getByLabelText("Donor account name") as HTMLInputElement;
    const save = view.getByRole("button", {
      name: "Save",
    }) as HTMLButtonElement;
    expect(field.value).toBe("GiveHope");
    expect(save.disabled).toBe(true);
    fireEvent.change(field, { target: { value: " GiveHope​" } });
    expect(save.disabled).toBe(true);
    fireEvent.change(field, { target: { value: " Hope Givers " } });
    expect(save.disabled).toBe(false);

    const first = deferred<Reply>();
    server.posts["/api/admin/sites/brand"] = [first.promise];
    server.reads.push({
      status: 200,
      body: settings({ brand: { display_name: "Hope Givers (stored)" } }),
    });
    fireEvent.click(save);
    fireEvent.click(save);
    expect(posts("/api/admin/sites/brand")).toHaveLength(1);
    expect(postBody(0, "/api/admin/sites/brand")).toEqual({
      displayName: "Hope Givers",
    });
    await act(async () => {
      first.resolve({
        status: 200,
        body: { brand: { display_name: "Hope Givers (answered)" } },
      });
    });
    await waitFor(() =>
      expect(
        (view.getByLabelText("Donor account name") as HTMLInputElement).value,
      ).toBe("Hope Givers (stored)"),
    );
    expect(h.toastSuccess).toHaveBeenCalledWith(
      expect.stringContaining("Hope Givers (answered)"),
    );

    const again = view.getByLabelText("Donor account name") as HTMLInputElement;
    fireEvent.change(again, { target: { value: "Second name" } });
    const second = deferred<Reply>();
    server.posts["/api/admin/sites/brand"] = [second.promise];
    const form = again.closest("form")!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(posts("/api/admin/sites/brand")).toHaveLength(2);
    await act(async () => {
      second.resolve({
        status: 200,
        body: { brand: { display_name: "Second name" } },
      });
    });
  });

  it("lets a cleared donor account name be sent and shows INVALID_NAME as the field's error", async () => {
    const view = await loaded();
    const field = view.getByLabelText("Donor account name");
    fireEvent.change(field, { target: { value: "" } });
    const save = view.getByRole("button", {
      name: "Save",
    }) as HTMLButtonElement;
    expect(save.disabled).toBe(false);
    server.posts["/api/admin/sites/brand"] = [
      {
        status: 400,
        body: {
          error:
            "Use 1 to 160 characters, with nothing invisible and no spaces at the start or end.",
          code: "INVALID_NAME",
        },
      },
    ];
    fireEvent.click(save);
    expect(
      await view.findByText(
        "Use 1 to 160 characters, with nothing invisible and no spaces at the start or end.",
      ),
    ).toBeTruthy();
    expect(postBody(0, "/api/admin/sites/brand")).toEqual({ displayName: "" });
    expect(field.getAttribute("aria-invalid")).toBe("true");
  });

  it("reads under the key [admin, site-settings] through ownApiFetch only", async () => {
    await loaded();
    expect(client.getQueryData(["admin", "site-settings"])).toEqual(settings());
    expect(h.fetch.mock.calls[0]![0]).toBe("/api/admin/sites");
  });
});
