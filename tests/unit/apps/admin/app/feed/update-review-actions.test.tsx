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
  author: { first_name: "Lee" },
};
const LIVE = {
  ...WAITING,
  id: "live",
  title: "Term two begins",
  content: "<p>Live update</p>",
  review_state: "approved",
};

type Sent = { url: string; method: string; body: unknown };

function stubServer(
  answers: { review?: () => Response; policy?: () => Response } = {},
) {
  const sent: Sent[] = [];
  const fetcher = vi.fn(async (url: string, init?: RequestInit) => {
    const method = init?.method ?? "GET";
    if (method !== "GET") {
      sent.push({
        url,
        method,
        body: init?.body ? JSON.parse(String(init.body)) : null,
      });
      if (url.includes("/review"))
        return answers.review?.() ?? Response.json({ success: true });
      return answers.policy?.() ?? Response.json({ success: true });
    }
    if (url.includes("comments"))
      return Response.json({ comments: [], total: 0 });
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
        posts: [WAITING],
        total: 1,
        stats: { total: 2, flagged: 0, hidden: 0, waiting: 1 },
      });
    return Response.json({
      posts: [WAITING, LIVE],
      total: 2,
      stats: { total: 2, flagged: 0, hidden: 0, waiting: 1 },
    });
  });
  vi.stubGlobal("fetch", fetcher);
  return { fetcher, sent };
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
  it("lists the updates waiting for review and approves one, then reloads the queue", async () => {
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
          body: { decision: "approve" },
        },
      ]),
    );
    await waitFor(() =>
      expect(fetcher.mock.calls.length).toBeGreaterThan(before + 1),
    );
  });

  it("asks for a reason before not approving, and sends it", async () => {
    const { sent } = stubServer();
    mount();
    await screen.findByText("Waiting update");
    fireEvent.click(
      screen.getByRole("button", { name: "Don’t approve Clinic opens" }),
    );
    const dialog = await screen.findByRole("dialog");
    const submit = within(dialog).getByRole("button", {
      name: "Don’t approve",
    }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Reason" }), {
      target: { value: "  ​ " },
    });
    expect(submit.disabled).toBe(true);
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Reason" }), {
      target: { value: "Names a partner church" },
    });
    expect(submit.disabled).toBe(false);
    fireEvent.click(submit);
    await waitFor(() =>
      expect(sent).toEqual([
        {
          url: "/api/admin/posts/waiting/review",
          method: "POST",
          body: { decision: "reject", reason: "Names a partner church" },
        },
      ]),
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

  it("shows the server's refusal beside the update and keeps it in the queue", async () => {
    stubServer({
      review: () =>
        Response.json(
          { error: "Only a submitted update can be approved" },
          { status: 409 },
        ),
    });
    mount();
    await screen.findByText("Waiting update");
    fireEvent.click(
      screen.getByRole("button", { name: "Approve Clinic opens" }),
    );
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Only a submitted update can be approved",
    );
    expect(screen.getByText("Waiting update")).toBeTruthy();
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

  it("offers no policy control to staff without that permission", async () => {
    stubServer();
    mount();
    await screen.findByText("Waiting update");
    expect(
      screen.queryByRole("button", { name: /Publication policy for/ }),
    ).toBeNull();
  });
});
