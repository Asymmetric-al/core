/** @vitest-environment jsdom */

// Use the UI package's context under Bun's isolated peer graph.
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../packages/ui/node_modules/@tanstack/react-query/build/modern/index.js";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, expect, it, vi } from "vitest";

import { CommentsDialog } from "../../../../packages/ui/components/ministry-update/comments-dialog";
import type {
  EngagementTransport,
  UpdateComment,
} from "../../../../packages/ui/components/ministry-update/engagement-transport";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
  Toaster: () => null,
}));

const clients: QueryClient[] = [];
afterEach(() => {
  cleanup();
  clients.splice(0).forEach((client) => client.clear());
  vi.mocked(toast.error).mockClear();
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

function pendingPosts() {
  const posts: Array<{
    accept: (value: { persisted: false }) => void;
    fail: (error: Error) => void;
  }> = [];
  const addComment = vi.fn(
    () =>
      new Promise<{ persisted: false }>((accept, fail) => {
        posts.push({ accept, fail });
      }),
  );
  return { posts, addComment };
}

async function composer(addComment: EngagementTransport["addComment"]) {
  renderComments({
    listComments: vi.fn().mockResolvedValue([]),
    addComment,
    setReaction: vi.fn().mockResolvedValue({ applied: true }),
  });
  await screen.findByText("No comments yet. Be the first to comment!");
  const input = screen.getByRole<HTMLInputElement>("textbox", {
    name: "Comment text",
  });
  return { input, form: input.closest("form")! };
}

it("keeps focus in the composer while a comment posts, then returns it to the cleared input for the next one", async () => {
  const { posts, addComment } = pendingPosts();
  const { input, form } = await composer(addComment);

  // Enter in the input submits; the input and Send disable while it posts.
  input.focus();
  fireEvent.change(input, { target: { value: "Praying for the team" } });
  fireEvent.submit(form);
  await waitFor(() =>
    expect(screen.getByRole("status").textContent).toBe("Sending comment…"),
  );
  expect(input.hasAttribute("disabled")).toBe(true);
  expect(document.activeElement).toBe(form);

  await act(async () => posts[0]!.accept({ persisted: false }));
  await screen.findByText("Praying for the team");
  expect(input.hasAttribute("disabled")).toBe(false);
  expect(input.value).toBe("");
  expect(document.activeElement).toBe(input);

  // The same from Send.
  fireEvent.change(input, { target: { value: "And for the clinic" } });
  const send = screen.getByRole("button", { name: "Send comment" });
  send.focus();
  fireEvent.click(send);
  await waitFor(() => expect(document.activeElement).toBe(form));
  await act(async () => posts[1]!.accept({ persisted: false }));
  await screen.findByText("And for the clinic");
  expect(input.value).toBe("");
  expect(document.activeElement).toBe(input);
});

it("returns focus to where the comment was sent from when it fails, keeping the text and saying it failed", async () => {
  const { posts, addComment } = pendingPosts();
  const { input, form } = await composer(addComment);

  fireEvent.change(input, { target: { value: "Thank you" } });
  const send = screen.getByRole("button", { name: "Send comment" });
  send.focus();
  fireEvent.click(send);
  await waitFor(() => expect(document.activeElement).toBe(form));
  await act(async () => posts[0]!.fail(new Error("Offline")));
  await waitFor(() => expect(send.hasAttribute("disabled")).toBe(false));
  expect(toast.error).toHaveBeenCalledWith(
    "Couldn't add your comment. Please try again.",
  );
  expect(input.value).toBe("Thank you");
  expect(document.activeElement).toBe(send);

  input.focus();
  fireEvent.submit(form);
  await waitFor(() => expect(document.activeElement).toBe(form));
  await act(async () => posts[1]!.fail(new Error("Offline")));
  await waitFor(() => expect(input.hasAttribute("disabled")).toBe(false));
  expect(toast.error).toHaveBeenCalledTimes(2);
  expect(input.value).toBe("Thank you");
  expect(document.activeElement).toBe(input);
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

type Attempt = {
  resolve: (rows: UpdateComment[]) => void;
  reject: (error: Error) => void;
};

function deferredComments() {
  const attempts: Attempt[] = [];
  const listComments = vi.fn(
    () =>
      new Promise<UpdateComment[]>((resolve, reject) => {
        attempts.push({ resolve, reject });
      }),
  );
  return { attempts, listComments };
}

const comment: UpdateComment = {
  id: "comment-1",
  content: "Praying for you",
  created_at: "2026-10-03T00:00:00Z",
  user: {
    id: "user-1",
    first_name: "Amara",
    last_name: "Okafor",
    avatar_url: null,
  },
};

it("keeps focus in the dialog through a retry that loads from nothing: the heading while loading, the new Try again on failure", async () => {
  const { attempts, listComments } = deferredComments();
  renderComments({ listComments, addComment: vi.fn(), setReaction: vi.fn() });
  await waitFor(() => expect(attempts).toHaveLength(1));
  await act(async () => attempts[0]!.reject(new Error("Offline")));
  const heading = screen.getByRole("heading", { name: "Comments" });

  // With nothing cached the retry shows the spinner, which removes the button.
  const firstRetry = await screen.findByRole("button", { name: "Try again" });
  firstRetry.focus();
  fireEvent.click(firstRetry);
  await screen.findByRole("status", { name: "Loading" });
  expect(document.activeElement).toBe(heading);

  await act(async () => attempts[1]!.reject(new Error("Offline")));
  const secondRetry = await screen.findByRole("button", { name: "Try again" });
  expect(document.activeElement).toBe(secondRetry);

  fireEvent.click(secondRetry);
  await screen.findByRole("status", { name: "Loading" });
  expect(document.activeElement).toBe(heading);
  await act(async () => attempts[2]!.resolve([comment]));
  await screen.findByText("Praying for you");
  expect(document.activeElement).toBe(heading);
});

it("keeps focus on Try again while a refetch of loaded comments retries, then lands on the heading", async () => {
  const { attempts, listComments } = deferredComments();
  renderComments({ listComments, addComment: vi.fn(), setReaction: vi.fn() });
  await waitFor(() => expect(attempts).toHaveLength(1));
  await act(async () => attempts[0]!.resolve([]));
  await screen.findByText("No comments yet. Be the first to comment!");
  void clients[0]!.refetchQueries();
  await waitFor(() => expect(attempts).toHaveLength(2));
  await act(async () => attempts[1]!.reject(new Error("Offline")));

  const retry = await screen.findByRole("button", { name: "Try again" });
  retry.focus();
  fireEvent.click(retry);
  await waitFor(() => expect(retry.getAttribute("aria-disabled")).toBe("true"));
  expect(retry.hasAttribute("disabled")).toBe(false);
  expect(document.activeElement).toBe(retry);
  fireEvent.click(retry);
  expect(listComments).toHaveBeenCalledTimes(3);

  // A failed retry leaves the same button focused and ready again.
  await act(async () => attempts[2]!.reject(new Error("Offline")));
  await waitFor(() =>
    expect(retry.getAttribute("aria-disabled")).not.toBe("true"),
  );
  expect(document.activeElement).toBe(retry);
  fireEvent.click(retry);
  await waitFor(() => expect(attempts).toHaveLength(4));
  expect(document.activeElement).toBe(retry);

  await act(async () => attempts[3]!.resolve([comment]));
  await screen.findByText("Praying for you");
  expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  expect(document.activeElement).toBe(
    screen.getByRole("heading", { name: "Comments" }),
  );
});
