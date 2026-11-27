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
    expect(document.body.textContent).toContain(
      "Their ministry updates leave the Ministry Updates feed and the public site at once, and return when the restriction is lifted.",
    );
    expect(
      screen.getByText(
        'Turning on "Do not publish" takes their ministry updates out of every feed and the public site at once, but does not hide profiles or giving pages yet; that enforcement comes in a later publishing update.',
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "The worker's login photo on gift rows still shows, and a photo or media file already attached to one of their updates stays reachable at its address, until a later publishing update.",
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

  it.each([
    ["Cancel", /Restrict Worker Kestrel/],
    ["Escape", /Confirm level for Worker Kestrel/],
    ["Close", /Show legal name for Worker Kestrel/],
  ])(
    "a dialog dismissed with %s forgets the reason typed into it, so reopening starts empty and nothing is sent (review fix)",
    async (how, opener) => {
      show();
      let dialog = await openDialog(opener);
      fillReason(dialog, "Half-written reason");
      if (how === "Escape") fireEvent.keyDown(dialog, { key: "Escape" });
      else fireEvent.click(within(dialog).getByRole("button", { name: how }));
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      dialog = await openDialog(opener);
      expect(
        (within(dialog).getByLabelText("Reason") as HTMLTextAreaElement).value,
      ).toBe("");
      expect(posts).toEqual([]);
    },
  );

  it("Restrict judges the alias as the database does: an invisible-only alias is no alias, so a restricted level without a stored alias cannot be sent, and with a stored alias it is not sent (review fix)", async () => {
    current = worker({ securityLevel: "standard", publicAlias: null });
    show();
    let dialog = await openDialog(/Restrict Worker Kestrel/);
    fillReason(dialog);
    fireEvent.click(within(dialog).getByRole("radio", { name: "Restricted" }));
    fireEvent.change(within(dialog).getByLabelText("Public alias"), {
      target: { value: "\u200b\u2060 " },
    });
    expect(
      (
        within(dialog).getByRole("button", {
          name: "Restrict",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    current = worker({ securityLevel: "standard", publicAlias: "Kite" });
    await act(async () => {
      await client.invalidateQueries();
    });
    dialog = await openDialog(/Restrict Worker Kestrel/);
    await waitFor(() =>
      expect(
        within(dialog).getByText("Leave empty to keep Kite."),
      ).toBeTruthy(),
    );
    fillReason(dialog);
    fireEvent.click(
      within(dialog).getByRole("checkbox", { name: "Do not publish" }),
    );
    fireEvent.change(within(dialog).getByLabelText("Public alias"), {
      target: { value: "\ufeff\u00a0" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Restrict" }));
    await waitFor(() => expect(posts).toHaveLength(1));
    expect(posts[0]?.body).toEqual({
      doNotPublish: true,
      reason: "Field security",
    });
  });

  it("once the legal name is shown, the dialog offers one action, Hide, which clears it and closes; no Cancel and no spent Show button remain (review fix)", async () => {
    postReply = () => ({
      status: 200,
      body: {
        legalName: SECRET,
        realCountry: null,
        preciseLocation: null,
      },
    });
    show();
    const dialog = await openDialog(/Show legal name for Worker Kestrel/);
    expect(
      within(dialog)
        .getAllByRole("button")
        .map((button) => button.textContent?.trim()),
    ).toEqual(["Cancel", "Show legal name", "Close"]);
    fillReason(dialog, "Visa paperwork");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Show legal name" }),
    );
    await within(dialog).findByText(SECRET);
    expect(
      within(dialog)
        .getAllByRole("button")
        .map((button) => button.textContent?.trim()),
    ).toEqual(["Hide", "Close"]);
    fireEvent.click(within(dialog).getByRole("button", { name: "Hide" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.body.textContent).not.toContain(SECRET);
  });

  const checked = (dialog: HTMLElement) =>
    within(dialog)
      .queryAllByRole("radio")
      .filter((radio) => radio.getAttribute("aria-checked") === "true")
      .map((radio) => radio.getAttribute("aria-label") ?? radio.id);
  const levelUnder = async (overrides: Record<string, unknown>) => {
    current = worker(overrides);
    await act(async () => {
      await client.invalidateQueries();
    });
    await waitFor(() =>
      expect(
        screen.getByText(
          String(
            {
              standard: "Standard",
              sensitive: "Sensitive",
              restricted: "Restricted",
              high_risk: "High risk",
            }[current.securityLevel as string],
          ),
          { selector: "dd *, dd" },
        ),
      ).toBeTruthy(),
    );
  };

  it("B3 (bot round): Restrict, when the worker's level rises under the open dialog past the chosen level, selects the current level and sends no level; the reason and alias stay", async () => {
    current = worker({ securityLevel: "sensitive" });
    show();
    const dialog = await openDialog(/Restrict Worker Kestrel/);
    fireEvent.click(within(dialog).getByRole("radio", { name: "Restricted" }));
    fireEvent.change(within(dialog).getByLabelText("Public alias"), {
      target: { value: "Heron" },
    });
    fillReason(dialog);
    await levelUnder({
      securityLevel: "high_risk",
      securityLevelSource: "manual",
      publicAlias: "Birch",
    });
    expect(within(dialog).getAllByRole("radio")).toHaveLength(1);
    expect(
      within(dialog)
        .getByRole("radio", { name: "High risk" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      (within(dialog).getByLabelText("Public alias") as HTMLInputElement).value,
    ).toBe("Heron");
    expect(
      (within(dialog).getByLabelText("Reason") as HTMLTextAreaElement).value,
    ).toBe("Field security");
    fireEvent.click(within(dialog).getByRole("button", { name: "Restrict" }));
    await waitFor(() => expect(posts).toHaveLength(1));
    expect(posts[0]?.body).toEqual({
      alias: "Heron",
      reason: "Field security",
    });
  });

  it("B3 (bot round): Restrict, when the worker's level falls under the open dialog, selects the new current level instead of the one chosen against the old options", async () => {
    current = worker({
      securityLevel: "restricted",
      securityLevelSource: "manual",
      publicAlias: "Birch",
    });
    show();
    const dialog = await openDialog(/Restrict Worker Kestrel/);
    fireEvent.click(within(dialog).getByRole("radio", { name: "High risk" }));
    fillReason(dialog);
    await levelUnder({
      securityLevel: "sensitive",
      securityLevelSource: "manual",
      publicAlias: "Birch",
    });
    expect(
      within(dialog)
        .getByRole("radio", { name: "Sensitive" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      within(dialog)
        .getByRole("radio", { name: "High risk" })
        .getAttribute("aria-checked"),
    ).toBe("false");
    fireEvent.click(
      within(dialog).getByRole("checkbox", { name: "Do not publish" }),
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "Restrict" }));
    await waitFor(() => expect(posts).toHaveLength(1));
    expect(posts[0]?.body).toEqual({
      doNotPublish: true,
      reason: "Field security",
    });
  });

  it("B3 (bot round): Lift, when the worker's level falls under the open dialog below the chosen level, selects nothing and sends nothing until a level shown is chosen; the reason stays", async () => {
    current = worker({
      securityLevel: "high_risk",
      securityLevelSource: "manual",
      publicAlias: "Birch",
    });
    show();
    const dialog = await openDialog(/Lift restriction for Worker Kestrel/);
    fireEvent.click(within(dialog).getByRole("radio", { name: "Restricted" }));
    fillReason(dialog);
    await levelUnder({
      securityLevel: "sensitive",
      securityLevelSource: "manual",
      publicAlias: "Birch",
    });
    expect(within(dialog).getAllByRole("radio")).toHaveLength(1);
    expect(
      within(dialog).getByRole("radio", { name: "Standard" }),
    ).toBeTruthy();
    expect(checked(dialog)).toEqual([]);
    const submit = within(dialog).getByRole("button", {
      name: "Lift restriction",
    }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    fireEvent.submit(submit.closest("form")!);
    expect(posts).toEqual([]);
    expect(
      (within(dialog).getByLabelText("Reason") as HTMLTextAreaElement).value,
    ).toBe("Field security");
    fireEvent.click(within(dialog).getByRole("radio", { name: "Standard" }));
    fireEvent.click(submit);
    await waitFor(() => expect(posts).toHaveLength(1));
    expect(posts[0]?.body).toEqual({
      level: "standard",
      reason: "Field security",
    });
  });

  it("B2 (bot round): an answer that the change may have been saved shows its text in the open dialog and reads the worker again", async () => {
    const text =
      "The change may have been saved. Reload this worker before trying again.";
    postReply = () => ({
      status: 500,
      body: { error: text, code: "OUTCOME_UNKNOWN", requestId: "r" },
    });
    show();
    const dialog = await openDialog(/Restrict Worker Kestrel/);
    fillReason(dialog);
    fireEvent.click(
      within(dialog).getByRole("checkbox", { name: "Do not publish" }),
    );
    const reads = () =>
      fetchMock.mock.calls.filter(
        ([url, init]) =>
          String(url) === `/api/admin/workers/${WORKER}` &&
          (init as RequestInit | undefined)?.method !== "POST",
      ).length;
    const before = reads();
    fireEvent.click(within(dialog).getByRole("button", { name: "Restrict" }));
    expect((await within(dialog).findByRole("alert")).textContent).toBe(text);
    await waitFor(() => expect(reads()).toBeGreaterThan(before));
    expect(document.body.textContent).not.toContain(
      "Something went wrong. Nothing was changed.",
    );
  });
});
