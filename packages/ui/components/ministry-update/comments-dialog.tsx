"use client";

/**
 * Ministry Update engagement — module-owned comments dialog.
 *
 * Lazily fetches the comment thread through the shared
 * {@link EngagementTransport} the first time it opens (react-query,
 * `staleTime` 30s) and adds comments optimistically. When the server accepts
 * without persisting (`persisted: false`, the read-only demo no-op) the
 * optimistic comment is kept client-side; when it persists, the thread is
 * refetched.
 *
 * Requires a `QueryClientProvider` above it — the interactive `ReactionBar`
 * only mounts this dialog once the viewer opens comments.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Send, UserRound } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "../shadcn/avatar";
import { Button } from "../shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../shadcn/dialog";
import { Input } from "../shadcn/input";
import { ScrollArea } from "../shadcn/scroll-area";
import { Spinner } from "../shadcn/spinner";

import type {
  EngagementTransport,
  UpdateComment,
} from "./engagement-transport";

/** Props for the module-owned {@link CommentsDialog}. */
export interface CommentsDialogProps {
  /** The Ministry Update whose comments are shown. */
  updateId: string;
  /** Transport used to list and add comments. */
  transport: EngagementTransport;
  /** Controlled open state. */
  open: boolean;
  /** Controlled open-state setter. */
  onOpenChange: (open: boolean) => void;
  /**
   * Whether the viewer can add a comment. When false the thread is shown
   * read-only, with no composer that could look like it posted.
   */
  canComment?: boolean;
  /**
   * Called after a comment is accepted (persisted or demo no-op) so the
   * owning bar can bump its shared comment count.
   */
  onCommentAdded?: () => void;
}

function commentsQueryKey(updateId: string): readonly [string, string] {
  return ["ministry-update-comments", updateId];
}

/**
 * The byline for an author with no name to show: a blank display name, or a
 * viewer outside the post's organization (AL-2675, JB11). Not "Anonymous":
 * the person did not ask to be anonymous.
 */
const NAMELESS_AUTHOR = "Commenter";

function commentAuthorName(comment: UpdateComment): string {
  return (
    [comment.user?.first_name, comment.user?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() || NAMELESS_AUTHOR
  );
}

/** The author's initials, or null for an author with no name. */
function commentInitials(comment: UpdateComment): string | null {
  const first = comment.user?.first_name?.charAt(0) ?? "";
  const last = comment.user?.last_name?.charAt(0) ?? "";
  return `${first}${last}`.trim() || null;
}

/**
 * Comment thread dialog for one Ministry Update. Module-internal: the
 * interactive `ReactionBar` renders it for `comments="dialog"`; callers who
 * want their own presentation pass `comments={{ onOpen }}` instead.
 */
export function CommentsDialog({
  updateId,
  transport,
  open,
  onOpenChange,
  onCommentAdded,
  canComment = true,
}: CommentsDialogProps): React.JSX.Element {
  const [content, setContent] = React.useState("");
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const retryRef = React.useRef<HTMLButtonElement>(null);
  const retrying = React.useRef(false);
  const queryClient = useQueryClient();
  const queryKey = commentsQueryKey(updateId);

  const {
    data: comments = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: ({ signal }) => transport.listComments(updateId, signal),
    enabled: open,
    staleTime: 30_000,
  });

  // A retry removes the focused Try again (at once when nothing is cached):
  // focus waits on the heading and returns to a new Try again if it fails.
  React.useLayoutEffect(() => {
    if (!retrying.current) return;
    const active = document.activeElement;
    const parked =
      !active || active === document.body || active === titleRef.current;
    if (!isFetching) retrying.current = false;
    if (!parked) return;
    if (!isFetching && isError) retryRef.current?.focus();
    else titleRef.current?.focus();
  }, [isError, isFetching]);

  const addComment = useMutation({
    mutationFn: (text: string) => transport.addComment(updateId, text),
    onMutate: async (text: string) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<UpdateComment[]>(queryKey);
      const optimistic: UpdateComment = {
        id: `local-comment-${Date.now()}`,
        content: text,
        created_at: new Date().toISOString(),
        user: {
          id: "viewer",
          first_name: "You",
          last_name: "",
          avatar_url: null,
        },
      };
      queryClient.setQueryData<UpdateComment[]>(queryKey, (rows = []) => [
        ...rows,
        optimistic,
      ]);
      return { previous };
    },
    onError: (_error, _text, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error("Couldn't add your comment. Please try again.");
    },
    onSuccess: (result) => {
      setContent("");
      onCommentAdded?.();
      if (result.persisted) {
        // Replace the optimistic row with the server's copy.
        void queryClient.invalidateQueries({ queryKey });
      }
      // persisted:false (read-only demo): keep the optimistic comment.
    },
  });

  // Posting disables the input and Send, which would drop focus to the page:
  // focus waits on the form, then goes to the cleared input, or after a
  // failure back to where the comment was sent from.
  const formRef = React.useRef<HTMLFormElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const sendRef = React.useRef<HTMLButtonElement>(null);
  const returnFocusTo = React.useRef<HTMLElement | null>(null);
  React.useLayoutEffect(() => {
    const target = returnFocusTo.current;
    if (addComment.isPending || !target) return;
    returnFocusTo.current = null;
    if (document.activeElement !== formRef.current) return;
    (addComment.isError ? target : inputRef.current)?.focus();
  }, [addComment.isPending, addComment.isError]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (addComment.isPending) return;
    const trimmed = content.trim();
    if (!trimmed) return;
    const form = event.currentTarget;
    const active = document.activeElement;
    if (active instanceof HTMLElement && form.contains(active)) {
      // Safari focuses the form, not the button, on a click on Send.
      returnFocusTo.current = active === form ? sendRef.current : active;
      form.focus({ preventScroll: true });
    }
    addComment.mutate(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex max-h-[70vh] flex-col gap-4">
          <DialogHeader>
            <DialogTitle ref={titleRef} tabIndex={-1}>
              Comments
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <p role="alert" className="text-sm text-foreground">
                  Couldn&apos;t load comments. Please try again.
                </p>
                <Button
                  ref={retryRef}
                  variant="outline"
                  disabled={isFetching}
                  focusableWhenDisabled
                  onClick={() => {
                    retrying.current = true;
                    void refetch();
                  }}
                >
                  Try again
                </Button>
              </div>
            ) : comments.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {canComment
                  ? "No comments yet. Be the first to comment!"
                  : "No comments yet."}
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="size-8">
                      {comment.user?.avatar_url && (
                        <AvatarImage src={comment.user.avatar_url} />
                      )}
                      <AvatarFallback>
                        {commentInitials(comment) ?? (
                          <UserRound aria-hidden className="size-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">
                          {commentAuthorName(comment)}
                        </span>{" "}
                        {comment.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {canComment ? (
            <>
              <form
                ref={formRef}
                tabIndex={-1}
                onSubmit={handleSubmit}
                className="flex gap-2 border-t pt-4 outline-none"
              >
                <Input
                  ref={inputRef}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Add a comment..."
                  required
                  disabled={addComment.isPending}
                  aria-label="Comment text"
                />
                <Button
                  ref={sendRef}
                  type="submit"
                  size="icon"
                  disabled={!content.trim() || addComment.isPending}
                  aria-label="Send comment"
                >
                  {addComment.isPending ? (
                    <Spinner aria-hidden="true" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </form>
              <p role="status" aria-atomic="true" className="sr-only">
                {addComment.isPending ? "Sending comment…" : ""}
              </p>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
