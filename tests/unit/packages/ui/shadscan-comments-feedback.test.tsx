/** @vitest-environment jsdom */

// Use the UI package's context under Bun's isolated peer graph.
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../packages/ui/node_modules/@tanstack/react-query/build/modern/index.js";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { CommentsDialog } from "../../../../packages/ui/components/ministry-update/comments-dialog";
import type { EngagementTransport } from "../../../../packages/ui/components/ministry-update/engagement-transport";

const clients: QueryClient[] = [];
afterEach(() => {
  cleanup();
  clients.splice(0).forEach((client) => client.clear());
});

function renderComments(transport: EngagementTransport) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  clients.push(client);
  return render(
    <QueryClientProvider client={client}>
      <CommentsDialog
        updateId="update-1"
        transport={transport}
        open
        onOpenChange={vi.fn()}
      />
    </QueryClientProvider>,
  );
}

it("communicates pending comment submission without allowing a duplicate", async () => {
  let accept: (value: { persisted: false }) => void = () => {};
  const addComment = vi.fn(
    () =>
      new Promise<{ persisted: false }>((resolve) => {
        accept = resolve;
      }),
  );
  const transport: EngagementTransport = {
    listComments: vi.fn().mockResolvedValue([]),
    addComment,
    setReaction: vi.fn().mockResolvedValue({ applied: true }),
  };
  renderComments(transport);
  await screen.findByText("No comments yet. Be the first to comment!");
  const input = screen.getByRole("textbox", { name: "Comment text" });
  expect(input.getAttribute("required")).not.toBeNull();
  fireEvent.change(input, { target: { value: "Thanks for the update" } });
  fireEvent.click(screen.getByRole("button", { name: "Send comment" }));
  await waitFor(() =>
    expect(screen.getByRole("status").textContent).toBe("Sending comment…"),
  );
  const submit = screen.getByRole("button", { name: "Send comment" });
  expect(submit.hasAttribute("disabled")).toBe(true);
  fireEvent.submit(submit.closest("form")!);
  expect(addComment).toHaveBeenCalledTimes(1);
  accept({ persisted: false });
  await screen.findByText("Thanks for the update");
});

it("shows a comment fetch failure distinctly from an empty thread and supports retry", async () => {
  const listComments = vi
    .fn()
    .mockRejectedValueOnce(new Error("Offline"))
    .mockResolvedValue([]);
  renderComments({ listComments, addComment: vi.fn(), setReaction: vi.fn() });
  expect((await screen.findByRole("alert")).textContent).toContain(
    "Couldn't load comments",
  );
  expect(
    screen.queryByText("No comments yet. Be the first to comment!"),
  ).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await screen.findByText("No comments yet. Be the first to comment!");
  expect(listComments).toHaveBeenCalledTimes(2);
});
