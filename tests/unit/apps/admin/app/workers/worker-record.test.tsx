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
    fireEvent.click(within(dialog).getByRole("button", { name: "Restrict" }));
    expect(
      await within(dialog).findByText(
        "A restricted or high-risk worker needs a public alias.",
      ),
    ).toBeTruthy();
    expect(posts).toEqual([]);
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
    expect(submit.disabled).toBe(false);
    fireEvent.submit(submit.closest("form")!);
    expect(
      await within(dialog).findByText("Choose what to change."),
    ).toBeTruthy();
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

  it("validates on submit: Confirm, Restrict, Lift and Reveal keep their button enabled, and a submit without a reason marks Reason invalid with its text, moves focus to it and sends nothing (WP5 rest 2b, issue 2835 item 1; red: the button is disabled and nothing says why)", async () => {
    show();
    for (const [trigger, submitName] of [
      [/Confirm level for Worker Kestrel/, "Confirm level"],
      [/Restrict Worker Kestrel/, "Restrict"],
      [/Lift restriction for Worker Kestrel/, "Lift restriction"],
      [/Show legal name for Worker Kestrel/, "Show legal name"],
    ] as const) {
      const dialog = await openDialog(trigger);
      if (submitName === "Lift restriction")
        fireEvent.click(
          within(dialog).getByRole("radio", { name: "Standard" }),
        );
      const submit = within(dialog).getByRole("button", {
        name: submitName,
      }) as HTMLButtonElement;
      expect(submit.disabled).toBe(false);
      fireEvent.click(submit);
      const reason = within(dialog).getByLabelText("Reason");
      await waitFor(() =>
        expect(reason.getAttribute("aria-invalid")).toBe("true"),
      );
      expect(document.activeElement).toBe(reason);
      expect(within(dialog).getByText("Give a reason.")).toBeTruthy();
      fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    }
    expect(posts).toEqual([]);
  });

  it("W6 (fix round of 2869): a reason made only of invisible characters (a zero-width space and a word joiner) is no reason: the submit marks Reason invalid with its text and sends nothing (red: it is sent and the database refuses it)", async () => {
    show();
    const dialog = await openDialog(/Confirm level for Worker Kestrel/);
    fireEvent.change(within(dialog).getByLabelText("Reason"), {
      target: { value: "​⁠" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Confirm level" }),
    );
    const reason = within(dialog).getByLabelText("Reason");
    await waitFor(() =>
      expect(reason.getAttribute("aria-invalid")).toBe("true"),
    );
    expect(within(dialog).getByText("Give a reason.")).toBeTruthy();
    expect(posts).toEqual([]);
  });

  it("validates on submit: Restrict to a restricted level with no stored alias and an alias of invisible characters marks the alias invalid and focuses it; Lift with nothing chosen marks the level choice and focuses its first level; nothing is sent (WP5 rest 2b, issue 2835 item 1; red: the button is disabled)", async () => {
    current = worker({ securityLevel: "standard", publicAlias: null });
    show();
    let dialog = await openDialog(/Restrict Worker Kestrel/);
    fillReason(dialog);
    fireEvent.click(within(dialog).getByRole("radio", { name: "Restricted" }));
    fireEvent.change(within(dialog).getByLabelText("Public alias"), {
      target: { value: "​ " },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Restrict" }));
    const alias = within(dialog).getByLabelText("Public alias");
    await waitFor(() =>
      expect(alias.getAttribute("aria-invalid")).toBe("true"),
    );
    expect(document.activeElement).toBe(alias);
    expect(
      within(dialog).getByText(
        "A restricted or high-risk worker needs a public alias.",
      ),
    ).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    current = worker({
      securityLevel: "restricted",
      securityLevelSource: "manual",
      publicAlias: "Birch",
    });
    await act(async () => {
      await client.invalidateQueries();
    });
    dialog = await openDialog(/Lift restriction for Worker Kestrel/);
    fillReason(dialog);
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Lift restriction" }),
    );
    await waitFor(() =>
      expect(within(dialog).getByText("Choose what to change.")).toBeTruthy(),
    );
    expect(document.activeElement).toBe(
      within(dialog).getAllByRole("radio")[0],
    );
    expect(posts).toEqual([]);
  });

  const MAY_HAVE_SAVED =
    "The change may have been saved. Reload this worker before trying again.";
  const recordReads = () =>
    fetchMock.mock.calls.filter(
      ([url, init]) =>
        String(url) === `/api/admin/workers/${WORKER}` &&
        (init as RequestInit | undefined)?.method !== "POST",
    ).length;

  it("a command whose answer is lost, or is a 2xx that is not the worker envelope, shows that the change may have been saved and reads the worker again (WP5 rest 2b, issue 2835: the lost answer and item 2; red: nothing was changed, or the body taken as the worker)", async () => {
    for (const reply of [
      () => Promise.reject(new TypeError("Failed to fetch")),
      () => ({ status: 200, body: { worker: { assignmentId: WORKER } } }),
      () => ({ status: 200, body: { ok: true } }),
    ]) {
      postReply = reply as typeof postReply;
      const view = show();
      const dialog = await openDialog(/Restrict Worker Kestrel/);
      fillReason(dialog);
      fireEvent.click(
        within(dialog).getByRole("checkbox", { name: "Do not publish" }),
      );
      const before = recordReads();
      fireEvent.click(within(dialog).getByRole("button", { name: "Restrict" }));
      expect((await within(dialog).findByRole("alert")).textContent).toBe(
        MAY_HAVE_SAVED,
      );
      await waitFor(() => expect(recordReads()).toBeGreaterThan(before));
      view.unmount();
      client.clear();
    }
  });

  it("a reveal whose answer is lost or malformed says the change may have been saved, shows no value, and sends one request with no retry of its own (WP5 rest 2b, issue 2835: the malformed reveal and the lost answer; red: nothing was changed, or a partial value drawn)", async () => {
    for (const reply of [
      () => Promise.reject(new TypeError("Failed to fetch")),
      () => ({ status: 200, body: { legalName: SECRET } }),
    ]) {
      posts = [];
      postReply = reply as typeof postReply;
      const view = show();
      const dialog = await openDialog(/Show legal name for Worker Kestrel/);
      fillReason(dialog, "Visa paperwork");
      fireEvent.click(
        within(dialog).getByRole("button", { name: "Show legal name" }),
      );
      expect((await within(dialog).findByRole("alert")).textContent).toBe(
        MAY_HAVE_SAVED,
      );
      expect(document.body.textContent).not.toContain(SECRET);
      expect(posts).toHaveLength(1);
      view.unmount();
      client.clear();
    }
  });

  it("a read whose 2xx is not the worker envelope shows that workers could not be loaded and draws no worker (WP5 rest 2b, issue 2835 item 2; red: the body drawn as the worker)", async () => {
    fetchMock.mockImplementation(async () =>
      respond({
        status: 200,
        body: { worker: { assignmentId: WORKER, displayName: "Half Kestrel" } },
      }),
    );
    show();
    expect(
      await screen.findByText("Workers could not be loaded."),
    ).toBeTruthy();
    expect(document.body.textContent).not.toContain("Half Kestrel");
  });
  it("with people.manage_members and safety.restrict_publication, a worker with no login offers Invite to sign in: the form validates on submit (address and reason marked, focus on the first), sends the address and reason to the worker's invite route, then shows the one-time missionary workspace path with Copy; a worker with a login, or a caller without people.manage_members, has no Invite (WP5 rest 2b, worker invitations; red: no Invite)", async () => {
    state.mc = {
      capabilities: ["safety.restrict_publication", "people.manage_members"],
    };
    current = worker({ hasLogin: false });
    postReply = (path) =>
      path.endsWith("/invite")
        ? {
            status: 201,
            body: {
              invitation: {
                invitationId: "00000000-0000-4000-8000-00000000e0e1",
                email: "heron@example.org",
                expiresAt: "2026-12-05T09:00:00+00:00",
              },
              invitePath: "/invite/selector-one#verifier-one",
            },
          }
        : { status: 200, body: { worker: current } };
    const view = show();
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Invite to sign in: Worker Kestrel",
      }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create invitation" }),
    );
    const address = within(dialog).getByLabelText("E-mail address");
    await waitFor(() =>
      expect(address.getAttribute("aria-invalid")).toBe("true"),
    );
    expect(document.activeElement).toBe(address);
    expect(
      within(dialog).getByLabelText("Reason").getAttribute("aria-invalid"),
    ).toBe("true");
    expect(posts).toEqual([]);
    fireEvent.change(address, { target: { value: "heron@example.org" } });
    fireEvent.change(within(dialog).getByLabelText("Reason"), {
      target: { value: "Sign in to your record" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create invitation" }),
    );
    const link = await within(dialog).findByLabelText(
      "Missionary workspace invitation path",
    );
    expect((link as HTMLInputElement).value).toBe(
      "/invite/selector-one#verifier-one",
    );
    expect(within(dialog).getByRole("button", { name: "Copy" })).toBeTruthy();
    expect(posts).toEqual([
      {
        path: `/api/admin/workers/${WORKER}/invite`,
        body: { email: "heron@example.org", reason: "Sign in to your record" },
      },
    ]);
    view.unmount();
    client.clear();
    current = worker({ hasLogin: true });
    const linked = show();
    expect(await screen.findByText("Linked")).toBeTruthy();
    expect(
      screen.queryByRole("button", {
        name: "Invite to sign in: Worker Kestrel",
      }),
    ).toBeNull();
    linked.unmount();
    client.clear();
    current = worker({ hasLogin: false });
    state.mc = { capabilities: ["safety.restrict_publication"] };
    show();
    expect((await screen.findAllByText("None")).length).toBeGreaterThan(0);
    expect(
      screen.queryByRole("button", {
        name: "Invite to sign in: Worker Kestrel",
      }),
    ).toBeNull();
  });
  it("W4 (fix round of 2869): the one-time invitation link is kept out of Session Replay as the members' dialog keeps it: inside a block Replay never records, its input masked and not autocompleted (red: a plain read-only input)", async () => {
    state.mc = {
      capabilities: ["safety.restrict_publication", "people.manage_members"],
    };
    current = worker({ hasLogin: false });
    postReply = (path) =>
      path.endsWith("/invite")
        ? {
            status: 201,
            body: {
              invitation: {
                invitationId: "00000000-0000-4000-8000-00000000e0e1",
                email: "heron@example.org",
                expiresAt: "2026-12-05T09:00:00+00:00",
              },
              invitePath: "/invite/selector-one#verifier-one",
            },
          }
        : { status: 200, body: { worker: current } };
    show();
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Invite to sign in: Worker Kestrel",
      }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("E-mail address"), {
      target: { value: "heron@example.org" },
    });
    fireEvent.change(within(dialog).getByLabelText("Reason"), {
      target: { value: "Sign in to your record" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create invitation" }),
    );
    const link = await within(dialog).findByLabelText(
      "Missionary workspace invitation path",
    );
    expect(link.closest("[data-sentry-block]")).not.toBeNull();
    expect(link.getAttribute("data-sentry-mask")).toBe("true");
    expect(link.getAttribute("autocomplete")).toBe("off");
  });
});
