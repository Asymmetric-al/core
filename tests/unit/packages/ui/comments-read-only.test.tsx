/** @vitest-environment jsdom */

// Use the UI package's context under Bun's isolated peer graph.
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../packages/ui/node_modules/@tanstack/react-query/build/modern/index.js";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CommentsDialog } from "../../../../packages/ui/components/ministry-update/comments-dialog";
import type { EngagementTransport } from "../../../../packages/ui/components/ministry-update/engagement-transport";

afterEach(cleanup);

function transport(comments: unknown[] = []): EngagementTransport {
  return {
    listComments: vi.fn().mockResolvedValue(comments),
    addComment: vi.fn(),
    setReaction: vi.fn().mockResolvedValue({ applied: true }),
  };
}

function show(t: EngagementTransport, canComment: boolean) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <CommentsDialog
        updateId="update-1"
        transport={t}
        open
        onOpenChange={vi.fn()}
        canComment={canComment}
      />
    </QueryClientProvider>,
  );
}

describe("comments that can only be read", () => {
  it("shows the conversation without a box that pretends to post", async () => {
    show(
      transport([
        {
          id: "c1",
          content: "Praying for the new classroom",
          created_at: "2026-11-01T10:00:00.000Z",
          user: {
            id: "p1",
            first_name: "Avery",
            last_name: "Lopez",
            avatar_url: null,
          },
        },
      ]),
      false,
    );
    expect(
      await screen.findByText("Praying for the new classroom"),
    ).toBeTruthy();
    expect(screen.queryByRole("textbox", { name: "Comment text" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Send comment" })).toBeNull();
  });

  it("says plainly when there are no comments, without inviting one", async () => {
    show(transport(), false);
    expect(await screen.findByText("No comments yet.")).toBeTruthy();
    expect(screen.queryByText(/Be the first/)).toBeNull();
  });
});
