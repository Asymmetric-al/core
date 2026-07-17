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
import { Send } from "lucide-react";
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
   * Called after a comment is accepted (persisted or demo no-op) so the
   * owning bar can bump its shared comment count.
   */
  onCommentAdded?: () => void;
}

function commentsQueryKey(updateId: string): readonly [string, string] {
  return ["ministry-update-comments", updateId];
}

function commentAuthorName(comment: UpdateComment): string {
  return [comment.user.first_name, comment.user.last_name]
    .filter(Boolean)
    .join(" ");
}

function commentInitials(comment: UpdateComment): string {
  const first = comment.user.first_name.charAt(0);
  const last = comment.user.last_name.charAt(0);
  return `${first}${last}` || "?";
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
}: CommentsDialogProps): React.JSX.Element {
  const [content, setContent] = React.useState("");
  const queryClient = useQueryClient();
  const queryKey = commentsQueryKey(updateId);

  const { data: comments = [], isLoading } = useQuery({
    queryKey,
    queryFn: ({ signal }) => transport.listComments(updateId, signal),
    enabled: open,
    staleTime: 30_000,
  });

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (trimmed) {
      addComment.mutate(trimmed);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner className="size-6" />
            </div>
          ) : comments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="size-8">
                    {comment.user.avatar_url && (
                      <AvatarImage src={comment.user.avatar_url} />
                    )}
                    <AvatarFallback>{commentInitials(comment)}</AvatarFallback>
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

        <form onSubmit={handleSubmit} className="flex gap-2 border-t pt-4">
          <Input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Add a comment..."
            disabled={addComment.isPending}
            aria-label="Comment text"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!content.trim() || addComment.isPending}
            aria-label="Send comment"
          >
            <Send className="size-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
