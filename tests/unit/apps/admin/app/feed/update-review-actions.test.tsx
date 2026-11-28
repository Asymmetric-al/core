// @vitest-environment jsdom
import { QueryProvider } from "../../../../../../packages/database/providers/query-provider";
import { getQueryClient } from "../../../../../../packages/database/providers/query-client";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Moderation from "../../../../../../apps/admin/app/(app)/feed/content-moderation-page-client";

const identity = vi.hoisted(() => ({
  tenant: { id: "tenant-a" },
  user: { id: "user-a" },
  role: "admin",
  capabilities: [] as string[],
  hasCapability(capability: string) {
    return this.capabilities.includes(capability);
  },
}));
vi.mock("@asym/lib/mission-control/context", () => ({ useMC: () => identity }));
vi.mock("@asym/lib/hooks/use-locale-format", () => ({
  useLocaleFormat: () => ({ formatDateTime: () => "Formatted post date" }),
}));

const WAITING = {
  id: "waiting",
  title: "Clinic opens",
  content: "<p>Waiting update</p>",
  status: "published",
  review_state: "submitted",
  review_reason: null,
  post_type: "Update",
  visibility: "public",
  ministry_assignment_id: "worker-1",
  content_version: 2,
  worker_withheld: false,
  author: { first_name: "Lee" },
};
const LIVE = {
  ...WAITING,
  id: "live",
  title: "Term two begins",
  content: "<p>Live update</p>",
  review_state: "approved",
  content_version: 5,
};
const HELD = {
  ...WAITING,
  id: "held",
  title: "Field news",
  content: "<p>Held update</p>",
  review_state: "approved",
  worker_withheld: true,
};

type Sent = { url: string; method: string; body: unknown };

function stubServer(
  answers: {
    review?: () => Response;
    policy?: () => Response;
    policies?: () => Response;
  } = {},
) {
  const sent: Sent[] = [];
  const queue = { waiting: { ...WAITING } };
  const decide = (url: string, body: unknown) => {
    const { decision, version } = (body ?? {}) as {
      decision?: string;
      version?: number;
    };
    return url.includes(`/${queue.waiting.id}/review`) &&
      decision !== "withdraw" &&
      version !== queue.waiting.content_version
      ? Response.json(
          { error: "The update changed since it was read" },
          { status: 409 },
        )
      : Response.json({ success: true });
  };
  const fetcher = vi.fn(async (url: string, init?: RequestInit) => {
    const method = init?.method ?? "GET";
    if (method !== "GET") {
      const body = init?.body ? JSON.parse(String(init.body)) : null;
      sent.push({ url, method, body });
      if (url.includes("/review"))
        return answers.review?.() ?? decide(url, body);
      return answers.policy?.() ?? Response.json({ success: true });
    }
    if (url.includes("comments"))
      return Response.json({ comments: [], total: 0 });
    if (url.includes("publication-policies") && answers.policies)
      return answers.policies();
    if (url.includes("publication-policies"))
      return Response.json({
        policies: [
          {
            ministry_assignment_id: "worker-1",
            path: "update",
            mode: "automatic",
            reason: "Trusted writer",
          },
        ],
      });
    if (url.includes("reviewState=submitted"))
      return Response.json({
        posts: [queue.waiting],
        total: 1,
        stats: { total: 2, flagged: 0, hidden: 0, waiting: 1 },
      });
    return Response.json({
      posts: [queue.waiting, LIVE, HELD],
      total: 3,
      stats: { total: 3, flagged: 0, hidden: 0, waiting: 1 },
    });
  });
  vi.stubGlobal("fetch", fetcher);
  return { fetcher, sent, queue };
}

function mount() {
  return render(
    <QueryProvider>
      <Moderation />
    </QueryProvider>,
  );
}

beforeEach(() => {
  identity.capabilities = ["updates.review"];
});
afterEach(() => {
  cleanup();
  getQueryClient().clear();
  vi.unstubAllGlobals();
});

describe("Mission Control's review queue (AL-2680, WP7 pull request 1)", () => {
  it("lists the updates waiting for review and approves one with the version it shows, then reloads the queue (fix round S4)", async () => {
    const { fetcher, sent } = stubServer();
    mount();
    expect(await screen.findByText("Waiting update")).toBeTruthy();
    expect(
      fetcher.mock.calls.some(([url]) =>
        url.includes("reviewState=submitted&status=published"),
      ),
    ).toBe(true);
    const before = fetcher.mock.calls.length;
    fireEvent.click(
      screen.getByRole("button", { name: "Approve Clinic opens" }),
    );
    await waitFor(() =>
      expect(sent).toEqual([
        {
          url: "/api/admin/posts/waiting/review",
          method: "POST",
          body: { decision: "approve", version: 2 },
        },
      ]),
    );
    await waitFor(() =>
      expect(fetcher.mock.calls.length).toBeGreaterThan(before + 1),
    );
  });

  it("checks the reason when it is sent: a blank one gets a field error, aria-invalid, its description and focus, and nothing is sent; a reason is sent (WP7 1b, item 1)", async () => {
    const { sent } = stubServer();
    mount();
    await screen.findByText("Waiting update");
    fireEvent.click(
      screen.getByRole("button", { name: "Don’t approve Clinic opens" }),
    );
    const dialog = await screen.findByRole("dialog");
    expect(dialog.textContent).toContain(
      "every feed but its author’s and a reviewer’s",
    );
    const submit = within(dialog).getByRole("button", {
      name: "Don’t approve",
    }) as HTMLButtonElement;
    const reason = within(dialog).getByRole("textbox", { name: "Reason" });
    for (const blank of ["", "  ​ "]) {
      fireEvent.change(reason, { target: { value: blank } });
      expect(submit.disabled).toBe(false);
      fireEvent.click(submit);
      const error = await within(dialog).findByText("Give a reason.");
      expect(reason.getAttribute("aria-invalid")).toBe("true");
      expect(reason.getAttribute("aria-describedby")?.split(" ")).toContain(
        error.id,
      );
      expect(document.activeElement).toBe(reason);
    }
    expect(sent).toEqual([]);
    fireEvent.change(reason, {
      target: { value: "Names a partner church" },
    });
    expect(within(dialog).queryByText("Give a reason.")).toBeNull();
    expect(reason.getAttribute("aria-invalid")).toBeNull();
    fireEvent.click(submit);
    await waitFor(() =>
      expect(sent).toEqual([
        {
          url: "/api/admin/posts/waiting/review",
          method: "POST",
          body: {
            decision: "reject",
            version: 2,
            reason: "Names a partner church",
          },
        },
      ]),
    );
  });

  it("binds a rejection to the version its dialog opened on: after the list refreshes with new words the server refuses it, and the dialog says the update changed and shows the new words (WP7 1b, item 2)", async () => {
    const { sent, queue } = stubServer();
    mount();
    await screen.findByText("Waiting update");
    fireEvent.click(
      screen.getByRole("button", { name: "Don’t approve Clinic opens" }),
    );
    const dialog = await screen.findByRole("dialog");
    queue.waiting = {
      ...queue.waiting,
      content: "<p>Waiting update, revised</p>",
      content_version: 3,
    };
    await getQueryClient().invalidateQueries({ queryKey: ["moderation"] });
    await screen.findByText("Waiting update, revised");
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Reason" }), {
      target: { value: "Names a partner church" },
    });
    const versions = () =>
      sent.map((call) => (call.body as { version?: number }).version);
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Don’t approve" }),
    );
    await waitFor(() => expect(versions()).toEqual([2]));
    expect((await within(dialog).findByRole("alert")).textContent).toContain(
      "The update changed since it was read",
    );
    expect(
      within(dialog).getByText(
        "This update changed after you opened it. Its words now:",
      ),
    ).toBeTruthy();
    expect(within(dialog).getByText("Waiting update, revised")).toBeTruthy();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Don’t approve" }),
    );
    await waitFor(() => expect(versions()).toEqual([2, 3]));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("says a decision whose answer was lost could not be confirmed, never that nothing was changed, and refreshes the list (WP7 1b, item 3)", async () => {
    const { fetcher, sent } = stubServer({
      review: () => {
        throw new TypeError("Failed to fetch");
      },
    });
    mount();
    await screen.findByText("Waiting update");
    fireEvent.click(
      screen.getByRole("button", { name: "Don’t approve Clinic opens" }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Reason" }), {
      target: { value: "Names a partner church" },
    });
    const before = fetcher.mock.calls.length;
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Don’t approve" }),
    );
    const alert = await within(dialog).findByRole("alert");
    expect(alert.textContent).toBe(
      "Couldn’t confirm whether that went through. The list has been refreshed: check the update before you try again.",
    );
    expect(sent).toHaveLength(1);
    await waitFor(() =>
      expect(fetcher.mock.calls.length).toBeGreaterThan(before + 1),
    );
  });

  it("withdraws an approved update from All posts with a reason, and offers no withdrawal on one still waiting there", async () => {
    const { sent } = stubServer();
    mount();
    await screen.findByText("Waiting update");
    fireEvent.click(screen.getByRole("tab", { name: "All posts" }));
    await screen.findByText("Live update");
    expect(
      screen.queryByRole("button", { name: "Withdraw Clinic opens" }),
    ).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Withdraw Term two begins" }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Reason" }), {
      target: { value: "Shared a location" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Withdraw update" }),
    );
    await waitFor(() =>
      expect(sent).toEqual([
        {
          url: "/api/admin/posts/live/review",
          method: "POST",
          body: { decision: "withdraw", reason: "Shared a location" },
        },
      ]),
    );
  });

  it("checks the reason of a withdrawal and of a publication policy the same way when it is sent (WP7 1b, item 1)", async () => {
    identity.capabilities = ["updates.review", "safety.restrict_publication"];
    const { sent } = stubServer();
    mount();
    await screen.findByText("Waiting update");
    fireEvent.click(screen.getByRole("tab", { name: "All posts" }));
    await screen.findByText("Live update");
    for (const [open, send] of [
      ["Withdraw Term two begins", "Withdraw update"],
      ["Publication policy for Lee", "Save policy"],
    ] as const) {
      fireEvent.click(screen.getAllByRole("button", { name: open })[0]!);
      const dialog = await screen.findByRole("dialog");
      const reason = within(dialog).getByRole("textbox", { name: "Reason" });
      fireEvent.click(within(dialog).getByRole("button", { name: send }));
      const error = await within(dialog).findByText("Give a reason.");
      expect(reason.getAttribute("aria-invalid")).toBe("true");
      expect(reason.getAttribute("aria-describedby")?.split(" ")).toContain(
        error.id,
      );
      expect(document.activeElement).toBe(reason);
      fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    }
    expect(sent).toEqual([]);
  });

  it("shows the server's refusal beside the update, keeps it in the queue and reloads the queue, since the refusal means it changed (fix round A3)", async () => {
    const { fetcher } = stubServer({
      review: () =>
        Response.json(
          { error: "The update changed since it was read" },
          { status: 409 },
        ),
    });
    mount();
    await screen.findByText("Waiting update");
    const before = fetcher.mock.calls.length;
    fireEvent.click(
      screen.getByRole("button", { name: "Approve Clinic opens" }),
    );
    expect((await screen.findByRole("alert")).textContent).toContain(
      "The update changed since it was read",
    );
    expect(screen.getByText("Waiting update")).toBeTruthy();
    await waitFor(() =>
      expect(fetcher.mock.calls.length).toBeGreaterThan(before + 1),
    );
  });

  it("marks a withheld update in All posts and says who still sees it (fix round C5)", async () => {
    stubServer();
    mount();
    await screen.findByText("Waiting update");
    fireEvent.click(screen.getByRole("tab", { name: "All posts" }));
    await screen.findByText("Held update");
    expect(screen.getAllByText("Withheld")).toHaveLength(1);
    expect(
      screen.getByText(
        "Withheld while its worker is restricted: off every feed but its author’s and a reviewer’s.",
      ),
    ).toBeTruthy();
  });
});

describe("the publication policy of a missionary path (AL-2680, WP7 pull request 1)", () => {
  it("shows each update's policy, and lets staff who may restrict publication set it with a reason", async () => {
    identity.capabilities = ["updates.review", "safety.restrict_publication"];
    const { sent } = stubServer();
    mount();
    await screen.findByText("Waiting update");
    expect(
      screen.getByText("Lee’s updates publish without review"),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Publication policy for Lee" }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("radio", { name: "Review each update first" }),
    );
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Reason" }), {
      target: { value: "New to the field" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save policy" }),
    );
    await waitFor(() =>
      expect(sent).toEqual([
        {
          url: "/api/admin/publication-policies",
          method: "PUT",
          body: {
            ministryAssignmentId: "worker-1",
            path: "update",
            mode: "review",
            reason: "New to the field",
          },
        },
      ]),
    );
  });

  it("shows no policy and offers no control while the policies are unknown, and says so when they fail to load (fix round A2)", async () => {
    identity.capabilities = ["updates.review", "safety.restrict_publication"];
    stubServer({
      policies: () => Response.json({ error: "unavailable" }, { status: 500 }),
    });
    mount();
    await screen.findByText("Waiting update");
    expect(
      (await screen.findAllByText("Publication policy unavailable")).length,
    ).toBeGreaterThan(0);
    expect(
      screen.queryByText(/updates (wait for review|publish without review)/),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: /Publication policy for/ }),
    ).toBeNull();
  });

  it("opens the policy dialog on the stored mode every time, not on a choice left unsaved (fix round A2)", async () => {
    identity.capabilities = ["updates.review", "safety.restrict_publication"];
    stubServer();
    mount();
    await screen.findByText("Waiting update");
    const open = async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Publication policy for Lee" }),
      );
      return screen.findByRole("dialog");
    };
    let dialog = await open();
    fireEvent.click(
      within(dialog).getByRole("radio", { name: "Review each update first" }),
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    dialog = await open();
    expect(
      within(dialog)
        .getByRole("radio", { name: "Publish without review" })
        .getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("offers no policy control to staff without that permission", async () => {
    stubServer();
    mount();
    await screen.findByText("Waiting update");
    expect(
      screen.queryByRole("button", { name: /Publication policy for/ }),
    ).toBeNull();
  });
});
