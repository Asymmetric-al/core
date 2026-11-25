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

const NOT_JSON = Symbol("a body that is not JSON");

function respond(reply: Reply) {
  return {
    ok: reply.status >= 200 && reply.status < 300,
    status: reply.status,
    json: async () => {
      if (reply.body === NOT_JSON) throw new SyntaxError("Unexpected token <");
      return reply.body;
    },
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
          if (reply.status === 200) server.lastRead = reply;
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
    .find((row) => row.querySelector("td")?.textContent === name)!;
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
    const field = view.getByRole("textbox", {
      name: "Donor account name",
    }) as HTMLInputElement;
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
    expect(
      await view.findByRole("cell", { name: "Refetched site" }),
    ).toBeTruthy();
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
    const field = view.getByRole("textbox", {
      name: "Donor account name",
    }) as HTMLInputElement;
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
        (
          view.getByRole("textbox", {
            name: "Donor account name",
          }) as HTMLInputElement
        ).value,
      ).toBe("Hope Givers (stored)"),
    );
    expect(h.toastSuccess).toHaveBeenCalledWith(
      expect.stringContaining("Hope Givers (answered)"),
    );

    const again = view.getByRole("textbox", {
      name: "Donor account name",
    }) as HTMLInputElement;
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
    const field = view.getByRole("textbox", { name: "Donor account name" });
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

const INVALID_NAME_TEXT =
  "Use 1 to 160 characters, with nothing invisible and no spaces at the start or end.";
const INVALID_NAME_REPLY: Reply = {
  status: 400,
  body: { error: INVALID_NAME_TEXT, code: "INVALID_NAME" },
};
const UNAVAILABLE_TEXT =
  "Sites can't be loaded or changed right now. Try again.";
const BRAND = "/api/admin/sites/brand";
const STATUS = "/api/admin/sites/status";

function nameField(view: ReturnType<typeof show>) {
  return view.getByRole("textbox", {
    name: "Donor account name",
  }) as HTMLInputElement;
}

async function refreshWithBrand(displayName: string) {
  server.reads.push({
    status: 200,
    body: settings({ brand: { display_name: displayName } }),
  });
  const before = reads().length;
  await act(async () => {
    await client.invalidateQueries({ queryKey: ["admin", "site-settings"] });
  });
  expect(reads()).toHaveLength(before + 1);
  expect(client.getQueryData(["admin", "site-settings"])).toMatchObject({
    brand: { display_name: displayName },
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

describe("Mission Control's Sites screen, the fix round of pull request 2827", () => {
  it("F1: shows what the database holds after a save whose refetch returns the earlier name", async () => {
    const view = await loaded();
    fireEvent.change(nameField(view), { target: { value: "Hope Givers" } });
    server.posts[BRAND] = [
      { status: 200, body: { brand: { display_name: "Hope Givers" } } },
    ];
    server.reads.push({ status: 200, body: settings() });
    fireEvent.click(view.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(reads()).toHaveLength(2));
    await waitFor(() => expect(nameField(view).value).toBe("GiveHope"));
  });

  it("F1: keeps the same field, and focus in the form, across a successful save", async () => {
    const view = await loaded();
    const field = nameField(view);
    field.focus();
    fireEvent.change(field, { target: { value: "Hope Givers" } });
    server.posts[BRAND] = [
      { status: 200, body: { brand: { display_name: "Hope Givers" } } },
    ];
    server.reads.push({
      status: 200,
      body: settings({ brand: { display_name: "Hope Givers" } }),
    });
    const form = field.closest("form")!;
    fireEvent.submit(form);
    await waitFor(() => expect(h.toastSuccess).toHaveBeenCalled());
    await waitFor(() => expect(reads()).toHaveLength(2));
    await waitFor(() =>
      expect(
        (view.getByRole("button", { name: "Save" }) as HTMLButtonElement)
          .disabled,
      ).toBe(true),
    );
    expect(nameField(view)).toBe(field);
    expect(field.value).toBe("Hope Givers");
    expect(form.contains(document.activeElement)).toBe(true);
  });

  it("F1: sends no second save while one is in flight, though a refresh changes the stored name", async () => {
    const view = await loaded();
    const first = deferred<Reply>();
    server.posts[BRAND] = [
      first.promise,
      { status: 200, body: { brand: { display_name: "Third name" } } },
    ];
    fireEvent.change(nameField(view), { target: { value: "Hope Givers" } });
    fireEvent.click(view.getByRole("button", { name: "Save" }));
    expect(posts(BRAND)).toHaveLength(1);
    await refreshWithBrand("Renamed elsewhere");
    fireEvent.change(nameField(view), { target: { value: "Third name" } });
    fireEvent.submit(nameField(view).closest("form")!);
    fireEvent.click(view.getByRole("button", { name: "Save" }));
    expect(posts(BRAND)).toHaveLength(1);
    await act(async () => {
      first.resolve({
        status: 200,
        body: { brand: { display_name: "Hope Givers" } },
      });
    });
  });

  it("F1: shows the first save's refusal after a refresh replaced the stored name", async () => {
    const view = await loaded();
    const first = deferred<Reply>();
    server.posts[BRAND] = [first.promise];
    fireEvent.change(nameField(view), { target: { value: "a\u0001b" } });
    fireEvent.click(view.getByRole("button", { name: "Save" }));
    await refreshWithBrand("Renamed elsewhere");
    await act(async () => {
      first.resolve(INVALID_NAME_REPLY);
    });
    expect(await view.findByText(INVALID_NAME_TEXT)).toBeTruthy();
    expect(nameField(view).getAttribute("aria-invalid")).toBe("true");
  });

  it("F1: keeps an unsaved draft when a refetch changes the stored name", async () => {
    const view = await loaded();
    const field = nameField(view);
    fireEvent.change(field, { target: { value: "My draft" } });
    await refreshWithBrand("Renamed elsewhere");
    expect(nameField(view)).toBe(field);
    expect(nameField(view).value).toBe("My draft");
    expect(
      (view.getByRole("button", { name: "Save" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  });

  it("F2: disables every Reactivate while one reactivation runs, and a click on another sends nothing", async () => {
    const OLDER: Site = {
      ...OLD,
      id: "00000000-0000-4000-8000-00000000c0c4",
      name: "Older site",
    };
    server.lastRead = {
      status: 200,
      body: settings({ sites: [DEFAULT_SITE, OLD, OLDER, SPANISH] }),
    };
    const view = await loaded();
    const pending = deferred<Reply>();
    server.posts[STATUS] = [pending.promise];
    fireEvent.click(view.getByRole("button", { name: "Reactivate Old site" }));
    const other = view.getByRole("button", {
      name: "Reactivate Older site",
    }) as HTMLButtonElement;
    expect(other.disabled).toBe(true);
    fireEvent.click(other);
    expect(posts(STATUS)).toHaveLength(1);
    await act(async () => {
      pending.resolve({
        status: 200,
        body: { site: { ...OLD, status: "active" } },
      });
    });
    await waitFor(() =>
      expect(
        (
          view.getByRole("button", {
            name: "Reactivate Older site",
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(false),
    );
    expect(
      (
        view.getByRole("button", {
          name: "Reactivate Old site",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
  });

  it("F4: moves focus to the donor account name, described by its error, when the name is refused", async () => {
    const view = await loaded();
    fireEvent.change(nameField(view), { target: { value: "" } });
    server.posts[BRAND] = [INVALID_NAME_REPLY];
    const save = view.getByRole("button", { name: "Save" });
    save.focus();
    fireEvent.click(save);
    const error = await view.findByText(INVALID_NAME_TEXT);
    await waitFor(() => expect(document.activeElement).toBe(nameField(view)));
    expect(
      nameField(view).getAttribute("aria-describedby")?.split(" "),
    ).toContain(error.id);
  });

  it("F4: moves focus to Site name, described by its error, when the name is refused", async () => {
    const view = await loaded();
    fireEvent.click(view.getByRole("button", { name: "Create Site" }));
    const dialog = await view.findByRole("dialog", { name: "Create a Site" });
    const field = within(dialog).getByLabelText(
      "Site name",
    ) as HTMLInputElement;
    fireEvent.change(field, { target: { value: "a\u0001b" } });
    server.posts["/api/admin/sites"] = [INVALID_NAME_REPLY];
    const submit = within(dialog).getByRole("button", { name: "Create Site" });
    submit.focus();
    fireEvent.click(submit);
    const error = await within(dialog).findByText(INVALID_NAME_TEXT);
    await waitFor(() => expect(document.activeElement).toBe(field));
    expect(field.getAttribute("aria-describedby")?.split(" ")).toContain(
      error.id,
    );
  });

  it.each([
    ["a body that is not JSON", NOT_JSON],
    ["null", null],
    ["an object without sites", { brand: null }],
    [
      "a Site without its status",
      {
        sites: [
          {
            id: SPANISH.id,
            name: "Spanish site",
            is_default: false,
            primary_domain: null,
          },
        ],
        brand: null,
      },
    ],
  ])(
    "F5: shows the read-failed state for a 200 with %s, and never throws",
    async (_what, body) => {
      server.reads.push({ status: 200, body });
      const view = show();
      expect(
        await view.findByText("Sites can't be loaded right now."),
      ).toBeTruthy();
      expect(view.getByRole("button", { name: "Try again" })).toBeTruthy();
      expect(view.queryByRole("table")).toBeNull();
    },
  );

  it.each([
    ["a body that is not JSON", NOT_JSON],
    ["an object without a site", {}],
    ["a Site without its fields", { site: { id: SPANISH.id } }],
  ])(
    "F5: keeps Create open with the unavailable alert for a 201 with %s",
    async (_what, body) => {
      const view = await loaded();
      fireEvent.click(view.getByRole("button", { name: "Create Site" }));
      const dialog = await view.findByRole("dialog", { name: "Create a Site" });
      fireEvent.change(within(dialog).getByLabelText("Site name"), {
        target: { value: "Spanish site" },
      });
      server.posts["/api/admin/sites"] = [{ status: 201, body }];
      fireEvent.click(
        within(dialog).getByRole("button", { name: "Create Site" }),
      );
      expect(await within(dialog).findByText(UNAVAILABLE_TEXT)).toBeTruthy();
      expect(view.getByRole("dialog", { name: "Create a Site" })).toBeTruthy();
      expect(h.toastSuccess).not.toHaveBeenCalled();
    },
  );

  it("F5: shows the unavailable alert, not a success, for a brand answer without its name", async () => {
    const view = await loaded();
    fireEvent.change(nameField(view), { target: { value: "Hope Givers" } });
    server.posts[BRAND] = [{ status: 200, body: { brand: {} } }];
    fireEvent.click(view.getByRole("button", { name: "Save" }));
    expect(await view.findByText(UNAVAILABLE_TEXT)).toBeTruthy();
    expect(h.toastSuccess).not.toHaveBeenCalled();
  });

  it("F5: keeps Deactivate open with the unavailable alert for an answer that is not a Site", async () => {
    const view = await loaded();
    fireEvent.click(
      view.getByRole("button", { name: "Deactivate Spanish site" }),
    );
    const dialog = await view.findByRole("alertdialog", {
      name: "Deactivate Spanish site?",
    });
    server.posts[STATUS] = [
      { status: 200, body: { site: { id: SPANISH.id } } },
    ];
    fireEvent.click(within(dialog).getByRole("button", { name: "Deactivate" }));
    expect(await within(dialog).findByText(UNAVAILABLE_TEXT)).toBeTruthy();
    expect(view.getByRole("alertdialog")).toBeTruthy();
    expect(h.toastSuccess).not.toHaveBeenCalled();
  });

  it("F5: shows the unavailable alert, not a success, for a reactivation answer that is not a Site", async () => {
    const view = await loaded();
    server.posts[STATUS] = [{ status: 200, body: { site: { id: OLD.id } } }];
    fireEvent.click(view.getByRole("button", { name: "Reactivate Old site" }));
    expect(await view.findByText(UNAVAILABLE_TEXT)).toBeTruthy();
    expect(h.toastSuccess).not.toHaveBeenCalled();
  });
});
