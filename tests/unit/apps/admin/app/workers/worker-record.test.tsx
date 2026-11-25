/** @vitest-environment jsdom */
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WorkerRecord } from "../../../../../../apps/admin/features/mission-control/workers/worker-record";
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../../../apps/admin/node_modules/@tanstack/react-query/build/modern/index.js";

const WORKER = "00000000-0000-4000-8000-00000000c0c1";
const SECRET = "Legal Kestrel";
const NOT_PERMITTED =
  "Only staff with the Restrict publication permission can change these settings.";

const state = vi.hoisted(() => ({
  mc: { capabilities: ["safety.restrict_publication"] } as {
    capabilities?: string[];
  },
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ assignmentId: "00000000-0000-4000-8000-00000000c0c1" }),
  useSearchParams: () => new URLSearchParams(),
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

vi.mock("@asym/lib/mission-control/context", () => ({
  useMC: () => state.mc,
}));

function worker(overrides: Record<string, unknown> = {}) {
  return {
    assignmentId: WORKER,
    partyId: "00000000-0000-4000-8000-00000000d0d1",
    displayName: "Worker Kestrel",
    publicAlias: null,
    securityLevel: "sensitive",
    securityLevelSource: "unreviewed_default",
    doNotPublish: false,
    hasLegalIdentity: true,
    hasLogin: true,
    createdAt: "2026-11-26T00:00:00+00:00",
    ...overrides,
  };
}

type Reply =
  | { status: number; body: unknown }
  | Promise<{ status: number; body: unknown }>;

const fetchMock = vi.fn();
let current = worker();
let posts: { path: string; body: unknown }[] = [];
let postReply: (path: string) => Reply = () => ({
  status: 200,
  body: { worker: current },
});
let client: QueryClient;

function respond(reply: { status: number; body: unknown }) {
  return {
    ok: reply.status >= 200 && reply.status < 300,
    status: reply.status,
    json: async () => reply.body,
  };
}

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  current = worker();
  posts = [];
  postReply = () => ({ status: 200, body: { worker: current } });
  state.mc = { capabilities: ["safety.restrict_publication"] };
  vi.stubGlobal("fetch", fetchMock);
  fetchMock
    .mockReset()
    .mockImplementation(async (url: string, init?: RequestInit) => {
      const path = String(url);
      if (init?.method === "POST") {
        posts.push({ path, body: JSON.parse(String(init.body)) });
        return respond(await postReply(path));
      }
      return respond({ status: 200, body: { worker: current } });
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
      <WorkerRecord />
    </QueryClientProvider>,
  );
}

const cache = () =>
  JSON.stringify(
    client
      .getQueryCache()
      .getAll()
      .map((query) => query.state.data),
  );

async function openDialog(name: RegExp) {
  fireEvent.click(await screen.findByRole("button", { name }));
  return screen.findByRole("dialog");
}

function fillReason(dialog: HTMLElement, value = "Field security") {
  fireEvent.change(within(dialog).getByLabelText("Reason"), {
    target: { value },
  });
}

describe("AL-2678 r2b1: a worker's record in Mission Control", () => {
  it("with safety.restrict_publication shows the fields, the Legal name row, every control that applies and gate (e)'s text", async () => {
    current = worker({ doNotPublish: true });
    show();
    expect(
      await screen.findByRole("heading", { name: "Worker Kestrel" }),
    ).toBeTruthy();
    expect(screen.getByText("Recorded, hidden")).toBeTruthy();
    expect(screen.getByText("Legal name")).toBeTruthy();
    for (const name of [
      "Confirm level for Worker Kestrel",
      "Restrict Worker Kestrel",
      "Lift restriction for Worker Kestrel",
      "Show legal name for Worker Kestrel",
    ])
      expect(screen.getByRole("button", { name })).toBeTruthy();
    expect(screen.getByText("What a restriction changes.")).toBeTruthy();
    expect(
      screen.getByText(
        'Turning on "Do not publish" saves the setting now, but does not hide posts, profiles or giving pages yet; that enforcement comes in a later publishing update.',
      ),
    ).toBeTruthy();
    expect(screen.queryByText(NOT_PERMITTED)).toBeNull();
    expect(document.body.textContent).not.toContain(SECRET);
  });

  it("hides Confirm once reviewed, Lift at standard without do-not-publish, and Show legal name when none is recorded", async () => {
    current = worker({
      securityLevel: "standard",
      securityLevelSource: "manual",
      hasLegalIdentity: false,
    });
    show();
    await screen.findByRole("heading", { name: "Worker Kestrel" });
    expect(screen.getByText("Not recorded")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Confirm level/ })).toBeNull();
    expect(
      screen.queryByRole("button", { name: /Lift restriction/ }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: /Show legal name/ }),
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "Restrict Worker Kestrel" }),
    ).toBeTruthy();
  });

  it.each([
    ["an empty capability list", { capabilities: [] }],
    ["no capabilities at all", {}],
  ])(
    "without the capability (%s) the page is read-only: no control, no Legal name row, the fixed line, and no POST",
    async (_label, mc) => {
      state.mc = mc;
      current = worker({ hasLegalIdentity: null });
      show();
      await screen.findByRole("heading", { name: "Worker Kestrel" });
      expect(screen.getByText(NOT_PERMITTED)).toBeTruthy();
      expect(screen.queryByText("Legal name")).toBeNull();
      expect(screen.queryAllByRole("button")).toEqual([]);
      expect(screen.getByText("Security level unreviewed")).toBeTruthy();
      expect(posts).toEqual([]);
    },
  );

  it("a 403 on the read shows the same line", async () => {
    fetchMock.mockImplementation(async () =>
      respond({
        status: 403,
        body: { error: "Forbidden: requires a staff membership" },
      }),
    );
    show();
    expect(await screen.findByText(NOT_PERMITTED)).toBeTruthy();
  });

  it("a dialog stays open with its button disabled while pending, sends one POST for a double click and for a double submit, and closes only on success", async () => {
    let release: (reply: { status: number; body: unknown }) => void = () => {};
    postReply = () =>
      new Promise((resolve) => {
        release = resolve;
      });
    show();
    const dialog = await openDialog(/Restrict Worker Kestrel/);
    fillReason(dialog);
    fireEvent.click(within(dialog).getByRole("radio", { name: "Restricted" }));
    fireEvent.change(within(dialog).getByLabelText("Public alias"), {
      target: { value: "Heron" },
    });
    const submit = within(dialog).getByRole("button", { name: "Restrict" });
    fireEvent.click(submit);
    fireEvent.click(submit);
    fireEvent.submit(submit.closest("form")!);
    await waitFor(() => expect(posts).toHaveLength(1));
    expect(posts[0]).toEqual({
      path: `/api/admin/workers/${WORKER}/restrict`,
      body: { level: "restricted", alias: "Heron", reason: "Field security" },
    });
    expect(
      (
        within(dialog).getByRole("button", {
          name: "Saving…",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.getByRole("dialog")).toBeTruthy();
    current = worker({ securityLevel: "restricted", publicAlias: "Heron" });
    await act(async () => release({ status: 200, body: { worker: current } }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(posts).toHaveLength(1);
  });

  it("a refusal shows inside the open dialog as an alert with the server's fixed text, and a 403 shows the permission line", async () => {
    postReply = () => ({
      status: 409,
      body: {
        error: "This worker's level has changed. Reload to see it.",
        code: "LEVEL_CHANGED",
      },
    });
    show();
    let dialog = await openDialog(/Confirm level for Worker Kestrel/);
    fillReason(dialog);
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Confirm level" }),
    );
    expect((await within(dialog).findByRole("alert")).textContent).toBe(
      "This worker's level has changed. Reload to see it.",
    );
    expect(posts[0]?.body).toEqual({
      level: "sensitive",
      reason: "Field security",
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    postReply = () => ({
      status: 403,
      body: { error: NOT_PERMITTED, code: "NOT_PERMITTED" },
    });
    dialog = await openDialog(/Restrict Worker Kestrel/);
    fillReason(dialog);
    fireEvent.click(
      within(dialog).getByRole("checkbox", { name: "Do not publish" }),
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "Restrict" }));
    expect((await within(dialog).findByRole("alert")).textContent).toBe(
      NOT_PERMITTED,
    );
    expect(posts[1]?.body).toEqual({
      doNotPublish: true,
      reason: "Field security",
    });
  });

  it("the reveal shows the three values in a block Sentry Replay never records, never in the query cache, and gone from the page and the cache once hidden, closed or unmounted", async () => {
    postReply = (path) =>
      path.endsWith("/reveal")
        ? {
            status: 200,
            body: {
              legalName: SECRET,
              realCountry: "Country Kestrel",
              preciseLocation: "Place Kestrel",
            },
          }
        : { status: 500, body: {} };
    const view = show();
    let dialog = await openDialog(/Show legal name for Worker Kestrel/);
    fillReason(dialog, "Visa paperwork");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Show legal name" }),
    );
    const value = await within(dialog).findByText(SECRET);
    expect(value.closest("[data-sentry-block]")).not.toBeNull();
    expect(
      within(dialog).getByText("This view is recorded in the audit log."),
    ).toBeTruthy();
    expect(cache()).not.toContain(SECRET);
    fireEvent.click(within(dialog).getByRole("button", { name: "Hide" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.body.textContent).not.toContain(SECRET);
    expect(cache()).not.toContain(SECRET);

    dialog = await openDialog(/Show legal name for Worker Kestrel/);
    expect(within(dialog).queryByText(SECRET)).toBeNull();
    fillReason(dialog, "Again");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Show legal name" }),
    );
    await within(dialog).findByText(SECRET);
    view.unmount();
    expect(document.body.textContent).not.toContain(SECRET);
    expect(cache()).not.toContain(SECRET);
    expect(posts.map((post) => post.body)).toEqual([
      { reason: "Visa paperwork" },
      { reason: "Again" },
    ]);
  });

  it("keeps an open dialog and its typed reason by the worker's id when a refetch returns a new object", async () => {
    show();
    const dialog = await openDialog(/Restrict Worker Kestrel/);
    fillReason(dialog, "Still typing");
    current = worker({ displayName: "Worker Kestrel", publicAlias: "Kite" });
    await act(async () => {
      await client.invalidateQueries();
    });
    await waitFor(() =>
      expect(screen.getByText("Leave empty to keep Kite.")).toBeTruthy(),
    );
    expect(screen.getByRole("dialog")).toBe(dialog);
    expect(
      (within(dialog).getByLabelText("Reason") as HTMLTextAreaElement).value,
    ).toBe("Still typing");
  });
});
