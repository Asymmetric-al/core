/** @vitest-environment jsdom */

// Use the UI package's context under Bun's isolated peer graph.
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../packages/ui/node_modules/@tanstack/react-query/build/modern/index.js";
// The missionary app's own copy, which its dialog uses.
import {
  QueryClient as MissionaryQueryClient,
  QueryClientProvider as MissionaryQueryClientProvider,
} from "../../../../apps/missionary/node_modules/@tanstack/react-query/build/modern/index.js";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { EngagementTransport } from "../../../../packages/ui/components/ministry-update/engagement-transport";

/**
 * AL-2675, JB11 and its ruling: a comment whose author has no name to show
 * (a blank display name, or a viewer outside the post's organization) is
 * shown with the label "Commenter" and the neutral fallback avatar, in both
 * comment screens: never a blank byline, never "?", never a crash.
 */

const ownApi = vi.hoisted(() => ({ ownApiFetch: vi.fn() }));
vi.mock("@asym/database/own-api", () => ownApi);

afterEach(cleanup);

const NAMELESS = {
  id: "c1",
  content: "Praying for the new classroom",
  created_at: "2026-11-01T10:00:00.000Z",
  user: { id: "u1", first_name: "", last_name: "", avatar_url: null },
};
const NAMED = {
  id: "c2",
  content: "Thank you for the update",
  created_at: "2026-11-01T11:00:00.000Z",
  user: {
    id: "u2",
    first_name: "Blair Admin",
    last_name: "",
    avatar_url: null,
  },
};

/** The byline of the comment whose text is `content`, and its avatar's text. */
function byline(content: string) {
  const row = screen.getByText(content).closest("div.flex.gap-3");
  if (!row) throw new Error(`no comment row for ${content}`);
  return {
    name: row.querySelector("span.font-semibold")?.textContent ?? "",
    avatar: row.querySelector('[data-slot="avatar"]'),
  };
}

describe("the Ministry Update comments dialog (@asym/ui)", () => {
  it('labels an author with no name "Commenter", with the neutral fallback avatar', async () => {
    const { CommentsDialog } =
      await import("../../../../packages/ui/components/ministry-update/comments-dialog");
    const transport: EngagementTransport = {
      listComments: vi.fn().mockResolvedValue([NAMELESS, NAMED]),
      addComment: vi.fn(),
      setReaction: vi.fn().mockResolvedValue({ applied: true }),
    };
    render(
      <QueryClientProvider
        client={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
        <CommentsDialog
          updateId="update-1"
          transport={transport}
          open
          onOpenChange={vi.fn()}
          canComment={false}
        />
      </QueryClientProvider>,
    );
    await screen.findByText(NAMELESS.content);

    const nameless = byline(NAMELESS.content);
    expect(nameless.name).toBe("Commenter");
    expect(nameless.avatar?.textContent).not.toContain("?");
    expect(nameless.avatar?.querySelector("svg")).not.toBeNull();
    const named = byline(NAMED.content);
    expect(named.name).toBe("Blair Admin");
    expect(named.avatar?.textContent).toBe("B");
  });
});

describe("the missionary workspace's comments dialog", () => {
  it('labels an author with no name "Commenter", with the neutral fallback avatar', async () => {
    ownApi.ownApiFetch.mockResolvedValue(
      Response.json({ comments: [NAMELESS, NAMED] }),
    );
    const { CommentsDialog } =
      await import("../../../../apps/missionary/features/feed/components/comments-dialog");
    render(
      <MissionaryQueryClientProvider
        client={
          new MissionaryQueryClient({
            defaultOptions: { queries: { retry: false } },
          })
        }
      >
        <CommentsDialog postId="post-1" open onOpenChange={vi.fn()} />
      </MissionaryQueryClientProvider>,
    );
    await screen.findByText(NAMELESS.content);

    const nameless = byline(NAMELESS.content);
    expect(nameless.name).toBe("Commenter");
    expect(nameless.avatar?.querySelector("svg")).not.toBeNull();
    const named = byline(NAMED.content);
    expect(named.name).toBe("Blair Admin");
    expect(named.avatar?.textContent).toBe("B");
  });
});
