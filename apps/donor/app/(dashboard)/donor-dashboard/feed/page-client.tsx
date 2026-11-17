"use client";

import {
  formatPostRelativeTime,
  postAuthorName,
  postCategory,
  postImages,
  postReadTime,
  postTitle,
  useDonorFeedPostPages,
} from "@asym/database/hooks";
import { motion } from "@asym/lib/motion";
import {
  MinistryUpdateMediaUnavailable,
  ReactionBar,
} from "@asym/ui/components/ministry-update";
import { PageHeader } from "@asym/ui/components/page-header";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@asym/ui/components/shadcn/carousel";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { PostContent } from "@asym/ui/components/shadcn/rich-text-editor";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@asym/ui/components/shadcn/toggle-group";
import Image from "next/image";
import React, { useEffect, useId, useMemo, useRef, useState } from "react";

import { updateAnchor, useFeedRecovery } from "./use-feed-recovery";

import type { PostWithAuthor } from "@asym/database/types";

interface Post {
  id: string | number;
  workerId: string;
  workerName: string;
  workerAvatar: string;
  time: string;
  readTime?: string;
  /** The author's update type ("Story", "Prayer request"), when set. */
  category?: string;
  title?: string;
  content: string; // HTML allowed
  images?: string[];
  likes: number;
  prayers: number;
  commentCount: number;
  liked?: boolean;
  prayed?: boolean;
}

const ALL = "All";
const EVERYONE = "everyone";

/** Update types read in sentence case ("Prayer request"). */
function categoryLabel(category: string) {
  return category.charAt(0) + category.slice(1).toLowerCase();
}

function PostPhoto({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="h-32 overflow-hidden rounded-xl border border-border">
        <MinistryUpdateMediaUnavailable className="size-full" />
      </div>
    );
  }
  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 700px"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

/** Every photo in an update: one stands alone, several become a carousel. */
function PostPhotos({ post }: { post: Post }) {
  const photos = post.images ?? [];
  if (photos.length === 0) return null;
  const alt = post.title?.trim() || "Photo from this update";
  if (photos.length === 1) return <PostPhoto src={photos[0]!} alt={alt} />;
  return (
    <Carousel
      aria-label={`Photos from ${post.title?.trim() || post.workerName}`}
    >
      <CarouselContent>
        {photos.map((src, index) => (
          <CarouselItem key={src}>
            <PostPhoto
              src={src}
              alt={`${alt} (${index + 1} of ${photos.length})`}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious placement="inside" />
      <CarouselNext placement="inside" />
    </Carousel>
  );
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "?"
  );
}

function PostCard({ post }: { post: Post }) {
  const titleId = useId();
  const authorId = useId();
  const metaId = useId();
  return (
    <motion.article
      id={updateAnchor(post.id)}
      aria-labelledby={post.title ? titleId : authorId}
      tabIndex={-1}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="scroll-mt-24 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="overflow-hidden">
        <CardContent>
          <div className="mb-6 flex items-center gap-3">
            <Avatar size="lg">
              {post.workerAvatar ? (
                <AvatarImage src={post.workerAvatar} alt="" />
              ) : null}
              <AvatarFallback>{initials(post.workerName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  id={authorId}
                  className="text-sm font-medium text-foreground"
                >
                  {post.workerName}
                </p>
                {post.category ? (
                  <Badge variant="outline">
                    {categoryLabel(post.category)}
                  </Badge>
                ) : null}
              </div>
              <p id={metaId} className="mt-1 text-sm text-muted-foreground">
                {[post.readTime, post.time].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {post.title ? (
              <h2
                id={titleId}
                className="text-2xl font-semibold leading-tight tracking-tight text-foreground"
              >
                {post.title}
              </h2>
            ) : null}

            <PostPhotos post={post} />

            <PostContent value={post.content} />
          </div>

          <div className="mt-4 flex items-center">
            <ReactionBar
              update={{
                id: post.id,
                likes: post.likes,
                prayers: post.prayers,
                liked: post.liked,
                prayed: post.prayed,
                comment_count: post.commentCount,
              }}
              reactions={["love", "prayer"]}
              appearance="quiet"
              comments="read"
              describedBy={post.title ? titleId : `${authorId} ${metaId}`}
            />
          </div>
        </CardContent>
      </Card>
    </motion.article>
  );
}

/** Map a server feed post (`PostWithAuthor`) into the feed's view shape. */
function toFeedPost(post: PostWithAuthor): Post {
  return {
    id: post.id,
    workerId: post.missionary_id,
    workerName: postAuthorName(post),
    workerAvatar: post.author.avatar_url ?? "",
    time: formatPostRelativeTime(post.created_at),
    readTime: postReadTime(post),
    category: postCategory(post),
    title: postTitle(post),
    content: post.content,
    images: postImages(post),
    likes: post.like_count,
    prayers: post.prayer_count,
    commentCount: post.comment_count,
    liked: post.user_liked ?? false,
    prayed: post.user_prayed ?? false,
  };
}

/** The shared `scroll-fade-x` fade width (calc(var(--spacing) * 6)). */
const CHIP_REVEAL_INSET = 24;

/**
 * Scrolls a keyboard-focused chip clear of the faded edge of the chip row, so
 * the whole chip and its focus ring show. Only the row scrolls, never the
 * page. A tap or click focuses the chip too, but scrolling then would move
 * another chip under the pointer before the press lands.
 */
function revealFocusedChip(event: React.FocusEvent<HTMLElement>) {
  const chip = event.target;
  const rail = event.currentTarget.querySelector<HTMLElement>(
    '[data-slot="scroll-area-viewport"]',
  );
  if (!rail || !(chip instanceof HTMLElement) || chip === rail) return;
  if (!chip.matches(":focus-visible")) return;
  const railBounds = rail.getBoundingClientRect();
  const chipBounds = chip.getBoundingClientRect();
  if (chipBounds.right > railBounds.right - CHIP_REVEAL_INSET) {
    rail.scrollLeft += chipBounds.right - railBounds.right + CHIP_REVEAL_INSET;
  } else if (chipBounds.left < railBounds.left + CHIP_REVEAL_INSET) {
    rail.scrollLeft = Math.max(
      0,
      rail.scrollLeft - (railBounds.left - chipBounds.left) - CHIP_REVEAL_INSET,
    );
  }
}

function FeedFilters({
  categories,
  category,
  onCategoryChange,
  authors,
  author,
  onAuthorChange,
}: {
  categories: string[];
  category: string;
  onCategoryChange: (value: string) => void;
  authors: { id: string; name: string }[];
  author: string;
  onAuthorChange: (value: string) => void;
}) {
  if (categories.length < 2 && authors.length < 2) return null;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {categories.length >= 2 ? (
        // One row that scrolls sideways on phones rather than wrapping a
        // lone chip onto its own line. The shared scroll area hides the
        // native scrollbar and fades an edge while chips are hidden past it;
        // p-1 inside (offset by -m-1) leaves room for the focus ring.
        <ScrollArea
          edgeFade="x"
          className="-m-1 min-w-0 sm:flex-1"
          onFocusCapture={revealFocusedChip}
        >
          <ToggleGroup
            aria-label="Type of update"
            spacing={2}
            value={[category]}
            // Pressing the chosen type sends an empty list; one type stays on.
            onValueChange={(next) => {
              const value = next[0];
              if (value) onCategoryChange(value);
            }}
            className="flex w-max gap-2 p-1"
          >
            {[ALL, ...categories].map((value) => (
              <ToggleGroupItem
                key={value}
                value={value}
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
                {value === ALL ? "All" : categoryLabel(value)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </ScrollArea>
      ) : (
        <span />
      )}
      {authors.length >= 2 ? (
        <Select
          items={[
            { value: EVERYONE, label: "Everyone" },
            ...authors.map((entry) => ({ value: entry.id, label: entry.name })),
          ]}
          value={author}
          onValueChange={(next) => {
            if (next !== null) onAuthorChange(next);
          }}
        >
          <SelectTrigger aria-label="Missionary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={EVERYONE}>Everyone</SelectItem>
            {authors.map((entry) => (
              <SelectItem key={entry.id} value={entry.id}>
                {entry.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}

export default function DonorFeedPage() {
  const [category, setCategory] = useState(ALL);
  // The chosen missionary keeps their name, for when a refresh takes their
  // updates out of the loaded pages.
  const [author, setAuthor] = useState<{ id: string; name: string } | null>(
    null,
  );
  const feedQuery = useDonorFeedPostPages();

  const posts = useMemo<Post[]>(
    () => (feedQuery.data ?? []).map(toFeedPost),
    [feedQuery.data],
  );
  // Filters come from the updates themselves, so only a choice that a
  // refresh has emptied can match nothing.
  // The chosen type stays on offer, so its chip stays pressed after a
  // refresh takes its updates away.
  const categories = useMemo(
    () =>
      [
        ...new Set([
          ...posts.map((post) => post.category).filter(Boolean),
          ...(category === ALL ? [] : [category]),
        ]),
      ].sort() as string[],
    [posts, category],
  );
  const authors = useMemo(() => {
    const byId = new Map<string, string>();
    for (const post of posts) byId.set(post.workerId, post.workerName);
    // The chosen missionary stays on offer, so the filter still names them.
    if (author && !byId.has(author.id)) byId.set(author.id, author.name);
    return [...byId.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [posts, author]);

  const filteredPosts = useMemo(
    () =>
      posts.filter(
        (post) =>
          (category === ALL || post.category === category) &&
          (author === null || post.workerId === author.id),
      ),
    [posts, category, author],
  );
  const filtered = category !== ALL || author !== null;
  // Where focus lands once Load more, Try again or Show all updates is
  // answered; the recovery hook decides which.
  const pageRef = useRef<HTMLDivElement>(null);
  const loadButtonRef = useRef<HTMLButtonElement>(null);
  const showAllRef = useRef<HTMLButtonElement>(null);
  const {
    loading,
    loadFailed,
    reloading,
    accessDenied,
    failureCount,
    retryBusy,
    loadMoreBusy,
    pressLabel,
    reload,
    errorView,
    retry,
    loadMore,
    showAll,
  } = useFeedRecovery(
    { feedQuery, posts, filteredPosts },
    { page: pageRef, loadButton: loadButtonRef, showAll: showAllRef },
  );
  const matchCount = filteredPosts.length;
  // Naming the filters and the loaded total changes the text whenever either
  // does, so the region speaks for two filters with equal counts and for a
  // loaded page that brought no new match.
  const activeFilters = [
    category === ALL ? null : categoryLabel(category),
    author?.name,
  ]
    .filter(Boolean)
    .join(", ");
  const matchText =
    matchCount === 0
      ? "No updates match"
      : `${matchCount} ${matchCount === 1 ? "update matches" : "updates match"}`;
  const filterAnnouncement =
    !filtered || loading || loadFailed
      ? ""
      : `${matchText}: ${activeFilters}, out of ${posts.length} loaded`;

  // A link to one update ("#update-…") opens the feed on it once it loads.
  const openedLinkedUpdate = useRef(false);
  useEffect(() => {
    if (openedLinkedUpdate.current || posts.length === 0) return;
    const id = window.location.hash.slice(1);
    if (!id.startsWith(updateAnchor(""))) return;
    const target = document.getElementById(id);
    if (!target) return;
    openedLinkedUpdate.current = true;
    target.scrollIntoView({ block: "start" });
    target.focus({ preventScroll: true });
  }, [posts]);

  return (
    <div
      ref={pageRef}
      className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-20"
    >
      <PageHeader
        title="Updates"
        description="News, stories and prayer requests from the missionaries you support."
      />
      {/* Present from the first paint, so a filter's result is announced. */}
      <p role="status" aria-atomic="true" className="sr-only">
        {filterAnnouncement}
      </p>

      <div className="flex w-full flex-col gap-6">
        {loading && !reloading ? (
          <div
            role="status"
            aria-label="Loading updates"
            className="flex flex-col gap-6"
          >
            <Skeleton className="h-96 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : loadFailed || reloading ? (
          <Empty ref={errorView}>
            <EmptyHeader key={failureCount} role="alert">
              <EmptyTitle>
                <h2>Couldn’t load updates</h2>
              </EmptyTitle>
              <EmptyDescription>
                {accessDenied
                  ? "Your access to these updates could not be confirmed. Sign in again or try again."
                  : "Something went wrong on our side. Please try again."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                ref={loadButtonRef}
                variant="outline"
                disabled={reloading}
                focusableWhenDisabled
                onClick={reload}
              >
                {pressLabel(reloading, "Try again", "Trying again…")}
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <FeedFilters
              categories={categories}
              category={category}
              onCategoryChange={setCategory}
              authors={authors}
              author={author?.id ?? EVERYONE}
              onAuthorChange={(id) =>
                setAuthor(authors.find((entry) => entry.id === id) ?? null)
              }
            />
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {filteredPosts.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>
                    <h2>{filtered ? "No updates match" : "No updates yet"}</h2>
                  </EmptyTitle>
                  <EmptyDescription>
                    {filtered
                      ? "Try another type or missionary."
                      : "When the missionaries you support share news, it will appear here."}
                  </EmptyDescription>
                </EmptyHeader>
                {filtered ? (
                  <EmptyContent>
                    <Button
                      ref={showAllRef}
                      variant="outline"
                      onClick={() =>
                        showAll(() => {
                          setCategory(ALL);
                          setAuthor(null);
                        })
                      }
                    >
                      Show all updates
                    </Button>
                  </EmptyContent>
                ) : null}
              </Empty>
            ) : null}
            {/* Filters apply only to loaded pages, so loading more can turn
                up matches. */}
            {feedQuery.error ? (
              // Transient failures preserve loaded updates; retry the failed operation.
              <div
                ref={errorView}
                className="flex flex-col items-center gap-3 py-6 text-sm text-foreground"
              >
                {/* Only the message is re-keyed, so Try again keeps focus. */}
                <p key={failureCount} role="alert">
                  {feedQuery.isNextPageError
                    ? "Couldn’t load more updates."
                    : "Couldn’t refresh updates."}
                </p>
                <Button
                  ref={loadButtonRef}
                  variant="outline"
                  // Another press would restart the fetch.
                  disabled={retryBusy}
                  focusableWhenDisabled
                  onClick={retry}
                >
                  {pressLabel(retryBusy, "Try again", "Trying again…")}
                </Button>
              </div>
            ) : feedQuery.hasMore ? (
              <div className="flex justify-center py-6">
                <Button
                  ref={loadButtonRef}
                  variant="outline"
                  disabled={loadMoreBusy}
                  focusableWhenDisabled
                  onClick={loadMore}
                >
                  {pressLabel(loadMoreBusy, "Load more updates", "Loading…")}
                </Button>
              </div>
            ) : filteredPosts.length > 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                You’re all caught up.
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
