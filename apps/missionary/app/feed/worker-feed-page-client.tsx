"use client";
"use no memo";

import { useLocaleFormat } from "@asym/lib/hooks";
import { PageHeader } from "@asym/ui/components/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@asym/ui/components/shadcn/alert-dialog";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  EditorWordCount,
  isPostContentEmpty,
} from "@asym/ui/components/shadcn/rich-text-editor";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@asym/ui/components/shadcn/toggle-group";
import { useLoadRetry } from "@asym/ui/hooks";
import { ChevronDown, FileText, Globe, Loader2, Users, X } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { FollowerRequestsCard } from "./feed-follow-requests";
import {
  POST_TYPES,
  postTypeLabel,
  VISIBILITY_LABELS,
  type Post,
  type PostStatus,
  type Visibility,
} from "./feed-model";
import { DraftPostCard, PublishedPostCard } from "./feed-post-card";
import { EmptyState, PublishedFeedPane } from "./feed-support-ui";
import { useWorkerFeedPageView } from "./use-worker-feed-page-view";

import type { MediaItem } from "@asym/database/types";

const RichTextEditor = dynamic(
  () =>
    import("@asym/ui/components/primitives/RichTextEditor").then(
      (mod) => mod.RichTextEditor,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-62.5 w-full" />,
  },
);

/** Longest title the server accepts. */
const TITLE_MAX = 120;

type PostComposerActionsProps = {
  selectedMedia: MediaItem[];
  lastSaved: Date | null;
  isSaving: boolean;
  postPrivacy: Visibility;
  postActionDisabled: boolean;
  setSelectedMedia: (value: React.SetStateAction<MediaItem[]>) => void;
  setPostPrivacy: (value: React.SetStateAction<Visibility>) => void;
  handlePost: (status?: PostStatus) => Promise<void>;
  // Set while updates are read-only; the controls point to this notice.
  readOnlyNoticeId?: string;
};

export function PostComposerActions({
  selectedMedia,
  lastSaved,
  isSaving,
  postPrivacy,
  postActionDisabled,
  setSelectedMedia,
  setPostPrivacy,
  handlePost: onPost,
  readOnlyNoticeId,
}: PostComposerActionsProps) {
  const readOnly = readOnlyNoticeId !== undefined;
  const publishLabelId = useId();
  const [pendingAction, setPendingAction] = useState<PostStatus | null>(null);
  const pendingActionRef = useRef<PostStatus | null>(null);
  const removeButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const audienceTriggerRef = useRef<HTMLButtonElement | null>(null);
  const draftPending = pendingAction === "draft";
  const publishPending = pendingAction === "published";
  const actionsDisabled =
    postActionDisabled || isSaving || pendingAction !== null;
  const { formatTime } = useLocaleFormat();

  const runPostAction = async (status: PostStatus) => {
    if (postActionDisabled || isSaving || pendingActionRef.current) return;
    pendingActionRef.current = status;
    setPendingAction(status);
    try {
      await onPost(status);
    } finally {
      pendingActionRef.current = null;
      setPendingAction(null);
    }
  };

  const removeMedia = (idx: number) => {
    flushSync(() =>
      setSelectedMedia((prev) => prev.filter((_, i) => i !== idx)),
    );
    // The next photo has moved into the removed one's place.
    const buttons = removeButtonsRef.current;
    (buttons[idx] ?? buttons[idx - 1] ?? audienceTriggerRef.current)?.focus();
  };

  return (
    <div className="flex w-full flex-col gap-3">
      {selectedMedia.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {selectedMedia.map((item, idx) => (
            <div key={`${item.type}-${item.url}`} className="relative shrink-0">
              <Image
                src={item.url}
                alt={`Attached photo ${idx + 1}`}
                width={64}
                height={64}
                unoptimized
                className="size-16 rounded-lg border border-border object-cover"
              />
              <div className="absolute -top-1.5 -right-1.5">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-xs"
                  aria-label={`Remove attached photo ${idx + 1}`}
                  aria-describedby={readOnlyNoticeId}
                  disabled={readOnly}
                  focusableWhenDisabled={readOnly}
                  ref={(node) => {
                    removeButtonsRef.current[idx] = node;
                  }}
                  onClick={() => removeMedia(idx)}
                >
                  <X aria-hidden />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <div className="flex w-full flex-wrap items-center gap-2">
        {/* Photos are added with the editor toolbar's image control. */}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Who can see this: ${VISIBILITY_LABELS[postPrivacy]}`}
            aria-describedby={readOnlyNoticeId}
            disabled={readOnly}
            render={
              <Button
                ref={audienceTriggerRef}
                variant="outline"
                size="sm"
                focusableWhenDisabled={readOnly}
              >
                {postPrivacy === "public" ? (
                  <Globe data-icon="inline-start" aria-hidden />
                ) : (
                  <Users data-icon="inline-start" aria-hidden />
                )}
                {VISIBILITY_LABELS[postPrivacy]}
                <ChevronDown data-icon="inline-end" aria-hidden />
              </Button>
            }
          />
          <DropdownMenuContent align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Who can see this</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={postPrivacy}
                onValueChange={(value) => setPostPrivacy(value as Visibility)}
              >
                <DropdownMenuRadioItem value="public">
                  Public · shown in supporters’ Updates feeds
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="partners">
                  Partners only · only you can see it for now
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <EditorWordCount />

        {lastSaved ? (
          <span className="hidden text-sm text-muted-foreground md:inline">
            Draft saved{" "}
            {formatTime(lastSaved, { hour: "numeric", minute: "2-digit" })}
          </span>
        ) : null}

        <div className="ml-auto flex gap-2">
          <Button
            onClick={() => void runPostAction("draft")}
            aria-label="Save draft"
            aria-describedby={readOnlyNoticeId}
            variant="outline"
            size="sm"
            disabled={actionsDisabled}
            focusableWhenDisabled={readOnly || draftPending}
          >
            {draftPending ? (
              <Loader2
                data-icon="inline-start"
                className="animate-spin"
                aria-hidden
              />
            ) : null}
            Save draft
          </Button>

          <Button
            onClick={() => void runPostAction("published")}
            aria-labelledby={publishLabelId}
            aria-describedby={readOnlyNoticeId}
            size="sm"
            disabled={actionsDisabled}
            focusableWhenDisabled={readOnly || publishPending}
          >
            <span id={publishLabelId} className="sr-only">
              {publishPending ? "Publishing update" : "Publish"}
            </span>
            {publishPending ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <span aria-hidden>Publish</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PostComposerCard({
  vm,
  headingRef,
}: {
  vm: ReturnType<typeof useWorkerFeedPageView>;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const titleId = useId();
  const noticeId = useId();
  const readOnlyNoticeId = vm.canWrite ? undefined : noticeId;
  const editing = vm.editingPostId !== null;
  const isComposerEmpty = isPostContentEmpty(vm.postContent);
  const postActionDisabled =
    vm.isSaving || vm.isUploading || isComposerEmpty || !vm.canWrite;

  return (
    <Card role="region" aria-labelledby={titleId}>
      <CardHeader>
        <CardTitle>
          <h2
            id={titleId}
            ref={headingRef}
            tabIndex={-1}
            className="outline-none"
          >
            {editing ? "Edit update" : "Share an update"}
          </h2>
        </CardTitle>
        <CardDescription>
          {editing
            ? "Your changes show once you publish."
            : vm.postPrivacy === "partners"
              ? "Only you can see partners-only updates for now."
              : "Supporters see it in their Updates feed."}
        </CardDescription>
        {editing ? (
          <CardAction>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                vm.cancelEditing();
                // This button leaves with the edit; the heading stays.
                headingRef.current?.focus();
              }}
            >
              Cancel editing
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!vm.canWrite ? (
          <p
            id={noticeId}
            role="status"
            className="text-sm text-muted-foreground"
          >
            Your updates are read-only.{" "}
            {vm.hasUnsavedWriting
              ? "Your readable draft is kept, but cannot be submitted."
              : "Changes cannot be submitted."}
          </p>
        ) : null}
        <ToggleGroup
          aria-label="Type of update"
          aria-describedby={readOnlyNoticeId}
          disabled={!vm.canWrite}
          spacing={2}
          value={[vm.postType]}
          // Pressing the chosen type sends an empty list; one type stays on.
          onValueChange={(next) => {
            const type = next[0];
            if (type) vm.setPostType(type);
          }}
          className="grid w-auto grid-cols-2 gap-2 sm:flex sm:flex-wrap"
        >
          {POST_TYPES.map((type) => (
            <ToggleGroupItem
              key={type}
              value={type}
              // The item brings the toggle behavior; Button keeps the chip look.
              render={(props, state) => (
                <Button
                  {...props}
                  className={undefined}
                  size="sm"
                  variant={state.pressed ? "default" : "outline"}
                />
              )}
            >
              {postTypeLabel(type)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Input
          aria-label="Title"
          placeholder="Title (optional)"
          maxLength={TITLE_MAX}
          readOnly={!vm.canWrite}
          aria-describedby={readOnlyNoticeId}
          value={vm.postTitle}
          onChange={(event) => vm.setPostTitle(event.target.value)}
        />
        <RichTextEditor
          aria-label="Ministry post content"
          aria-describedby={readOnlyNoticeId}
          imagePurpose="feed"
          value={vm.postContent}
          onChange={vm.setPostContent}
          // Not disabled: that dims the kept draft below readable contrast.
          readOnly={!vm.canWrite}
          placeholder="Write an update for your partners…"
          variant="feed"
          toolbarPosition="bottom"
          proseInvert={false}
          // A read-only editor keeps this row, word count included, and drops
          // only its formatting controls.
          actions={
            <PostComposerActions
              selectedMedia={vm.selectedMedia}
              lastSaved={vm.lastSaved}
              isSaving={vm.isSaving}
              postPrivacy={vm.postPrivacy}
              postActionDisabled={postActionDisabled}
              setSelectedMedia={vm.setSelectedMedia}
              setPostPrivacy={vm.setPostPrivacy}
              handlePost={vm.handlePost}
              readOnlyNoticeId={readOnlyNoticeId}
            />
          }
        />
      </CardContent>
    </Card>
  );
}

function FeedPostsTabsSection({
  vm,
  publishedPanelRef,
  draftsPanelRef,
  requestDelete,
}: {
  vm: ReturnType<typeof useWorkerFeedPageView>;
  publishedPanelRef: React.RefObject<HTMLDivElement | null>;
  draftsPanelRef: React.RefObject<HTMLDivElement | null>;
  requestDelete: (status: PostStatus, list: Post[], index: number) => void;
}) {
  const draftsRetryButton = useRef<HTMLButtonElement>(null);
  const { failureView, ...draftsRetry } = useLoadRetry({
    retryRef: draftsRetryButton,
    error: vm.draftsError && !vm.isLoadingDrafts,
    loading: vm.isLoadingDrafts,
    onRetry: vm.reloadDrafts,
    landing: () => draftsPanelRef.current,
  });

  return (
    <Tabs
      value={vm.activeTab}
      onValueChange={(value) => vm.setActiveTab(value as PostStatus)}
      className="flex flex-col gap-4"
    >
      <TabsList aria-label="Updates">
        <TabsTrigger value="published">Published</TabsTrigger>
        <TabsTrigger value="draft">
          Drafts
          {vm.drafts.length > 0 ? (
            <Badge variant="secondary">{vm.drafts.length}</Badge>
          ) : null}
        </TabsTrigger>
      </TabsList>

      <TabsContent
        ref={publishedPanelRef}
        value="published"
        className="flex flex-col gap-6"
      >
        <PublishedFeedPane
          feedError={vm.feedError}
          hasPosts={vm.posts.length > 0}
          isLoading={vm.isLoading}
          onRetry={() => {
            void vm.reloadPosts();
          }}
        >
          {vm.posts.map((post, index) => (
            <PublishedPostCard
              key={post.id}
              post={post}
              onEdit={() => vm.requestEditPost(post)}
              onDelete={() => requestDelete("published", vm.posts, index)}
              onWithdraw={() => void vm.withdrawPost(post.id)}
            />
          ))}
        </PublishedFeedPane>
      </TabsContent>

      <TabsContent
        ref={draftsPanelRef}
        value="draft"
        className="flex flex-col gap-4"
      >
        {draftsRetry.error ? (
          <Card ref={failureView}>
            <CardContent className="flex flex-col items-start gap-3">
              <p
                key={draftsRetry.failedRetries}
                role="alert"
                className="text-sm text-foreground"
              >
                We couldn’t load your drafts.
              </p>
              <Button
                ref={draftsRetryButton}
                variant="outline"
                size="sm"
                disabled={draftsRetry.retrying}
                focusableWhenDisabled
                onClick={draftsRetry.retry}
              >
                {draftsRetry.retrying ? "Trying again…" : "Try again"}
              </Button>
            </CardContent>
          </Card>
        ) : vm.isLoadingDrafts ? (
          <div
            role="status"
            aria-label="Loading drafts"
            className="flex flex-col gap-4"
          >
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : vm.drafts.length > 0 ? (
          vm.drafts.map((draft, index) => (
            <DraftPostCard
              key={draft.id}
              post={draft}
              onEdit={() => vm.requestEditPost(draft)}
              onDelete={() => requestDelete("draft", vm.drafts, index)}
            />
          ))
        ) : (
          <EmptyState
            icon={FileText}
            title="No drafts"
            description="Save an update as a draft to finish it later."
          />
        )}
      </TabsContent>
    </Tabs>
  );
}

// On close, focus the update's own actions if it is still there, else the
// next update's, else the previous one's, else the composer heading.
function useDeleteFocusReturn(vm: ReturnType<typeof useWorkerFeedPageView>) {
  const composerHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const publishedPanelRef = useRef<HTMLDivElement | null>(null);
  const draftsPanelRef = useRef<HTMLDivElement | null>(null);
  const originRef = useRef<{ status: PostStatus; ids: string[] } | null>(null);

  const requestDelete = (status: PostStatus, list: Post[], index: number) => {
    originRef.current = {
      status,
      ids: [index, index + 1, index - 1].flatMap((at) =>
        list[at] ? [list[at].id] : [],
      ),
    };
    vm.requestDeletePost(list[index]!.id);
  };

  const finalFocus = () => {
    const origin = originRef.current;
    if (!origin) return composerHeadingRef.current;
    const list = origin.status === "draft" ? vm.drafts : vm.posts;
    const panel =
      origin.status === "draft"
        ? draftsPanelRef.current
        : publishedPanelRef.current;
    const at = origin.ids
      .map((id) => list.findIndex((post) => post.id === id))
      .find((found) => found >= 0);
    // Each card has one actions menu, in list order.
    const trigger =
      at === undefined
        ? undefined
        : panel?.querySelectorAll<HTMLElement>('[aria-haspopup="menu"]')[at];
    return trigger ?? composerHeadingRef.current;
  };

  return {
    composerHeadingRef,
    publishedPanelRef,
    draftsPanelRef,
    requestDelete,
    finalFocus,
  };
}

function DeleteUpdateDialog({
  vm,
  finalFocus,
}: {
  vm: ReturnType<typeof useWorkerFeedPageView>;
  finalFocus: () => HTMLElement | null;
}) {
  const pending = vm.pendingDelete;
  const name = pending?.title?.trim() || "this update";
  return (
    <AlertDialog
      open={pending !== null}
      onOpenChange={(open, details) => {
        if (open) return;
        if (vm.isDeleting) {
          details.cancel();
          return;
        }
        vm.cancelDeletePost();
      }}
    >
      <AlertDialogContent finalFocus={finalFocus}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            {pending?.status === "draft"
              ? "The draft will be gone for good."
              : "Partners will no longer see it, and its reactions and comments will be lost."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <p role="status" aria-atomic="true" className="sr-only">
          {vm.isDeleting ? `Deleting ${name}…` : ""}
        </p>
        {vm.deleteError ? (
          <p role="alert" className="text-sm text-destructive">
            {vm.deleteError}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={vm.isDeleting}>
            Keep it
          </AlertDialogCancel>
          {/* Not an AlertDialogAction: that closes the dialog before the delete settles. */}
          <Button
            type="button"
            variant="destructive"
            disabled={vm.isDeleting}
            focusableWhenDisabled={vm.isDeleting}
            onClick={(event) => {
              event.currentTarget.focus();
              void vm.confirmDeletePost();
            }}
          >
            {vm.isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DiscardWritingDialog({
  vm,
}: {
  vm: ReturnType<typeof useWorkerFeedPageView>;
}) {
  const target = vm.pendingEdit?.title?.trim() || "this update";
  return (
    <AlertDialog
      open={vm.pendingEdit !== null}
      onOpenChange={(open) => {
        if (!open) vm.cancelEditPost();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard what you’re writing?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Editing ${target} replaces what’s in the composer. Save a draft first to keep it.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep writing</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={vm.confirmEditPost}>
            Discard and edit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function WorkerFeedPageView() {
  const vm = useWorkerFeedPageView();
  const {
    composerHeadingRef,
    publishedPanelRef,
    draftsPanelRef,
    requestDelete,
    finalFocus,
  } = useDeleteFocusReturn(vm);
  if (!vm.canRead) {
    return <p role="status">Your updates are unavailable in this account.</p>;
  }
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-20">
      <PageHeader
        title="Updates"
        description="Share news, stories and prayer requests with your partners."
      />
      {/* Phones read composer, then requests, then the feed; wide screens
          keep requests in a side column. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8 lg:row-start-1">
          <PostComposerCard vm={vm} headingRef={composerHeadingRef} />
        </div>
        <aside className="min-w-0 lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1">
          <FollowerRequestsCard
            pendingRequests={vm.pendingRequests}
            isLoadingRequests={vm.isLoadingRequests}
            loadFailed={vm.requestsError}
            onRetry={() => void vm.reloadRequests()}
            onResolveRequest={vm.handleResolveRequest}
          />
        </aside>
        <div className="min-w-0 lg:col-span-8 lg:row-start-2">
          <FeedPostsTabsSection
            vm={vm}
            publishedPanelRef={publishedPanelRef}
            draftsPanelRef={draftsPanelRef}
            requestDelete={requestDelete}
          />
        </div>
      </div>
      <DeleteUpdateDialog vm={vm} finalFocus={finalFocus} />
      <DiscardWritingDialog vm={vm} />
    </div>
  );
}

export default function WorkerFeed() {
  return <WorkerFeedPageView />;
}
