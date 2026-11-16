// @vitest-environment jsdom
import { QueryProvider } from "../../../../../../packages/database/providers/query-provider";
import { getQueryClient } from "../../../../../../packages/database/providers/query-client";
import {
  cleanup,
  render,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import Moderation from "../../../../../../apps/admin/app/(app)/feed/content-moderation-page-client";
const identity = vi.hoisted(() => ({
  tenant: { id: "tenant-a" },
  user: { id: "user-a" },
  role: "admin",
}));
const formatDateTime = vi.hoisted(() => vi.fn(() => "Formatted post date"));
vi.mock("@asym/lib/mission-control/context", () => ({ useMC: () => identity }));
vi.mock("@asym/lib/hooks/use-locale-format", () => ({
  useLocaleFormat: () => ({ formatDateTime }),
}));
afterEach(() => {
  cleanup();
  getQueryClient().clear();
  vi.unstubAllGlobals();
});
beforeEach(() => {
  identity.tenant.id = "tenant-a";
  identity.user.id = "user-a";
});
function response(url: string) {
  if (url.includes("comments"))
    return {
      comments: [
        {
          id: "comment",
          content: "Real comment",
          author: { first_name: "Ada" },
        },
      ],
      total: 50,
    };
  return {
    posts: [
      {
        id: "real",
        content: "<p>Real update</p>",
        status: "flagged",
        post_type: "Update",
        author: { first_name: "Lee" },
      },
    ],
    total: 150,
    stats: { total: 200, flagged: 150, hidden: 2 },
  };
}
function mount() {
  return render(
    <QueryProvider>
      <Moderation />
    </QueryProvider>,
  );
}
it("loads server-authorized posts even when the shell identity is unresolved", async () => {
  identity.tenant.id = "";
  identity.user.id = "";
  const fetcher = vi.fn(async (url: string) => Response.json(response(url)));
  vi.stubGlobal("fetch", fetcher);
  mount();
  expect(await screen.findByText("Real update")).toBeTruthy();
  expect(screen.queryByText("Organization unavailable")).toBeNull();
  expect(fetcher).toHaveBeenCalledTimes(3);
});
it("uses staff labels, semantic badges and the shared date formatter", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const data = response(url);
      if ("posts" in data)
        Object.assign(data.posts[0], {
          status: "pending_review",
          post_type: "prayer_request",
          visibility: "partners_only",
          created_at: "2026-11-10T12:00:00Z",
        });
      return Response.json(data);
    }),
  );
  mount();
  expect(
    await screen.findByText("Waiting for review", {
      selector: '[data-slot="badge"]',
    }),
  ).toBeTruthy();
  expect(
    screen.getByText("Prayer request", { selector: '[data-slot="badge"]' }),
  ).toBeTruthy();
  expect(
    screen.getByText("Partners only", { selector: '[data-slot="badge"]' }),
  ).toBeTruthy();
  expect(screen.getByText("Formatted post date").getAttribute("datetime")).toBe(
    "2026-11-10T12:00:00Z",
  );
  expect(formatDateTime).toHaveBeenCalledWith(
    "2026-11-10T12:00:00Z",
    expect.objectContaining({ month: "short", year: "numeric" }),
  );
  expect(
    screen.queryByText(/pending_review|prayer_request|partners_only/),
  ).toBeNull();
});
it("shows real review posts and comments read-only with capped-list disclosures", async () => {
  const fetcher = vi.fn(async (url: string) => Response.json(response(url)));
  vi.stubGlobal("fetch", fetcher);
  mount();
  expect(await screen.findByText("Real update")).toBeTruthy();
  expect(
    screen.getByRole("tab", { name: "Queue" }).getAttribute("aria-selected"),
  ).toBe("true");
  expect(screen.getByText("Real comment")).toBeTruthy();
  expect(screen.getByText("Read-only for now")).toBeTruthy();
  expect(screen.getByText("Showing the latest 1 of 150 updates.")).toBeTruthy();
  expect(screen.getByText("Showing the latest 1 of 50 comments.")).toBeTruthy();
  expect(
    screen.queryByRole("button", { name: /approve|hide|delete|export/i }),
  ).toBeNull();
  expect(
    fetcher.mock.calls.some(([url]) =>
      url.includes("status=flagged,hidden,pending_review"),
    ),
  ).toBe(true);
});
it("preserves headings, links and lists without mounting an editable composer", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const data = response(url);
      if ("posts" in data)
        data.posts[0].content =
          '<h2>Field report</h2><ul><li>Visit completed</li></ul><p><a href="https://example.org/report">Read the report</a></p>';
      return Response.json(data);
    }),
  );
  mount();
  expect(
    await screen.findByRole("heading", { name: "Field report" }),
  ).toBeTruthy();
  expect(
    screen.getByRole("link", { name: "Read the report" }).getAttribute("href"),
  ).toBe("https://example.org/report");
  expect(screen.getByText("Visit completed").closest("li")).not.toBeNull();
  expect(document.querySelector('[contenteditable="true"]')).toBeNull();
  expect(screen.queryByRole("toolbar")).toBeNull();
});
it("keeps comment failure separate and retries without hiding loaded posts", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) =>
      url.includes("comments")
        ? Response.json({ error: "Comments unavailable" }, { status: 500 })
        : Response.json(response(url)),
    ),
  );
  mount();
  expect(await screen.findByText("Comments unavailable")).toBeTruthy();
  expect(screen.getByText("Real update")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Retry comments" }));
});
it("does not reuse another tenant's cached content", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => Response.json(response(url))),
  );
  const view = mount();
  await screen.findByText("Real update");
  identity.tenant.id = "tenant-b";
  vi.stubGlobal(
    "fetch",
    vi.fn(() => new Promise(() => {})),
  );
  view.rerender(
    <QueryProvider>
      <Moderation />
    </QueryProvider>,
  );
  await waitFor(() => expect(screen.queryByText("Real update")).toBeNull());
});

it("keeps rich-text paragraphs readable and searches the loaded real updates", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const data = response(url);
      if ("posts" in data)
        data.posts[0].content = JSON.stringify({
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "First paragraph" }],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "Second paragraph" }],
            },
          ],
        });
      return Response.json(data);
    }),
  );
  mount();
  expect((await screen.findByText("First paragraph")).tagName).toBe("P");
  expect(screen.getByText("Second paragraph").tagName).toBe("P");
  fireEvent.change(
    screen.getByRole("textbox", { name: "Search loaded updates" }),
    { target: { value: "no matching words" } },
  );
  expect(screen.queryByText("First paragraph")).toBeNull();
  expect(screen.getByText("No updates match")).toBeTruthy();
  expect(screen.getByRole("combobox", { name: "Sort updates" })).toBeTruthy();
});

it("prefers a comment author's full name without losing the fallback", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const data = response(url);
      if ("comments" in data)
        Object.assign(data.comments[0].author, { full_name: "Ada Lovelace" });
      return Response.json(data);
    }),
  );
  mount();
  expect(await screen.findByText("Ada Lovelace")).toBeTruthy();
});

it("keeps author attribution alongside a titled moderation post", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const data = response(url);
      return Response.json(
        "posts" in data
          ? {
              ...data,
              posts: data.posts.map((post) => ({
                ...post,
                title: "Titled field update",
              })),
            }
          : data,
      );
    }),
  );
  mount();
  const title = await screen.findByRole("heading", {
    name: "Titled field update",
  });
  expect(title.closest("li")?.textContent).toContain("Lee");
});
