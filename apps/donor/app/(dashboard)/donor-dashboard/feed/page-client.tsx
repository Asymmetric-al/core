"use client";

import {
  formatPostRelativeTime,
  postAuthorName,
  postImages,
  postTitle,
  useDonorFeedPosts,
} from "@asym/database/hooks";
import { motion, AnimatePresence } from "@asym/lib/motion";
import { ReactionBar } from "@asym/ui/components/ministry-update";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Button } from "@asym/ui/components/shadcn/button";
import { PostContent } from "@asym/ui/components/shadcn/rich-text-editor";
import {
  Bookmark,
  Globe,
  ImageOff,
  BookmarkCheck,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import React, { useState, useMemo } from "react";

import type { PostWithAuthor } from "@asym/database/types";

// --- Types ---
// Additional categories need an evidenced mapping from a typed server discriminator.
type ContentType = "Update";
type FilterType = "All" | "Saved" | ContentType;

interface Post {
  id: string | number;
  workerId: string;
  workerName: string;
  workerTitle: string;
  workerAvatar: string;
  location: string;
  time: string;
  readTime?: string;
  type: ContentType;
  title?: string;
  content: string; // HTML allowed
  images?: string[];
  likes: number;
  prayers: number;
  commentCount: number;
  liked?: boolean;
  prayed?: boolean;
  saved?: boolean;
}

// --- Components ---

const FeedFilter = ({
  current,
  onChange,
}: {
  current: FilterType;
  onChange: (val: FilterType) => void;
}) => {
  const filters: FilterType[] = ["All", "Update", "Saved"];

  return (
    <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50 py-4 mb-8 transition-[background-color,border-color,backdrop-filter] duration-200">
      <div className="flex items-center gap-2 overflow-x-auto px-1 max-w-2xl mx-auto">
        {filters.map((type) => (
          <Button
            key={type}
            variant={current === type ? "default" : "outline"}
            aria-pressed={current === type}
            onClick={() => onChange(type)}
            className="shrink-0"
          >
            {type === "Saved" && <BookmarkCheck aria-hidden="true" />}
            {type}
          </Button>
        ))}
      </div>
    </div>
  );
};

const PostActions = ({ post, onSave }: { post: Post; onSave: () => void }) => {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onSave}
        aria-label={post.saved ? "Remove from bookmarks" : "Save this post"}
        aria-pressed={Boolean(post.saved)}
      >
        <Bookmark
          aria-hidden="true"
          className={post.saved ? "fill-current" : undefined}
        />
      </Button>
    </div>
  );
};

const PostCard: React.FC<{
  post: Post;
  onSave: (id: string | number) => void;
}> = ({ post, onSave }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8 overflow-hidden [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-md transition-shadow duration-300"
    >
      {/* Meta Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="size-10 border border-border shadow-sm">
              <AvatarImage src={post.workerAvatar} />
              <AvatarFallback className="bg-muted font-semibold text-muted-foreground ">
                {post.workerName[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground text-sm leading-none tracking-tight">
                {post.workerName}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground mt-1 ">
              <span>{post.readTime || "3 min read"}</span>
              <span className="text-muted-foreground">•</span>
              <span>{post.time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 text-left">
        {post.title && (
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-normal leading-tight ">
            {post.title}
          </h2>
        )}

        {/* Images - Edge to Edge look but contained */}
        {post.images &&
          post.images.length > 0 &&
          post.images[0] &&
          !imageError && (
            <div className="rounded-xl overflow-hidden shadow-sm border border-border bg-background relative h-75 sm:h-100">
              <Image
                src={post.images[0]}
                alt="Post content"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-[filter] duration-300 ease-out"
                sizes="(max-width: 768px) 100vw, 700px"
                onError={() => setImageError(true)}
              />
            </div>
          )}

        {/* Fallback if image errors */}
        {imageError && (
          <div className="rounded-xl overflow-hidden border border-border bg-background h-32 flex items-center justify-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <ImageOff className="size-6" />
              <span className="text-sm font-medium ">Image unavailable</span>
            </div>
          </div>
        )}

        <PostContent
          value={post.content}
          richTextClassName="prose prose-zinc prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-muted-foreground prose-p:font-medium prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:font-semibold prose-blockquote:text-foreground prose-a:text-foreground prose-a:underline hover:prose-a:opacity-70 prose-img:rounded-xl tracking-tight"
          htmlClassName="prose prose-zinc prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-muted-foreground prose-p:font-medium prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:font-semibold prose-blockquote:text-foreground prose-a:text-foreground prose-a:underline hover:prose-a:opacity-70 prose-img:rounded-xl tracking-tight"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between py-2 mt-8">
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
          comments="dialog"
        />
        <PostActions post={post} onSave={() => onSave(post.id)} />
      </div>
    </motion.article>
  );
};

/** Map a server feed post (`PostWithAuthor`) into the feed's view shape. */
function toFeedPost(post: PostWithAuthor): Post {
  return {
    id: post.id,
    workerId: post.missionary_id,
    workerName: postAuthorName(post),
    workerTitle: "Field Partner",
    workerAvatar: post.author.avatar_url ?? "",
    location: "",
    time: formatPostRelativeTime(post.created_at),
    type: "Update",
    title: postTitle(post),
    content: post.content,
    images: postImages(post),
    likes: post.like_count,
    prayers: post.prayer_count,
    commentCount: post.comment_count,
    liked: post.user_liked ?? false,
    prayed: post.user_prayed ?? false,
    saved: false,
  };
}

export default function DonorFeedPage() {
  const [filter, setFilter] = useState<FilterType>("All");
  const feedQuery = useDonorFeedPosts();

  // The server feed is the immutable base snapshot. Reactions and comments now
  // live in the shared ReactionBar (transport-backed persistence); the only
  // donor-local interaction left is the bookmark, tracked as a per-post
  // override and merged during render. Deriving (rather than syncing into state
  // via an effect) keeps a single source of truth and satisfies
  // react-hooks/set-state-in-effect.
  const basePosts = useMemo<Post[]>(
    () => (feedQuery.data ?? []).map(toFeedPost),
    [feedQuery.data],
  );
  const [overrides, setOverrides] = useState<
    Record<string | number, Partial<Post>>
  >({});
  const posts = useMemo<Post[]>(
    () =>
      basePosts.map((p) =>
        p.id in overrides ? { ...p, ...overrides[p.id] } : p,
      ),
    [basePosts, overrides],
  );

  // Resolve a post's current (base + override) value for computing the next override.
  const currentPost = (id: string | number): Post | undefined => {
    const base = basePosts.find((p) => p.id === id);
    return base ? { ...base, ...overrides[id] } : undefined;
  };

  // --- Filter Logic ---
  const filteredPosts = useMemo(() => {
    if (filter === "All") return posts;
    if (filter === "Saved") return posts.filter((p) => p.saved);
    return posts.filter((p) => p.type === filter);
  }, [posts, filter]);

  // --- Handlers ---
  const handleSave = (id: string | number) => {
    const cur = currentPost(id);
    if (!cur) return;
    setOverrides((prev) => ({
      ...prev,
      [id]: { ...prev[id], saved: !cur.saved },
    }));
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Hero Header */}
      <div className="px-1 mb-8 pt-8 text-center sm:text-left">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-normal text-foreground mb-4 ">
          Ministry Updates
        </h1>
        <p className="text-lg text-muted-foreground font-semibold leading-relaxed max-w-lg">
          Field stories, urgent needs, and joyful updates from the partners you
          empower.
        </p>
      </div>

      {/* Filter Tabs */}
      <FeedFilter current={filter} onChange={setFilter} />

      {/* Feed Stream */}
      <div className="space-y-6">
        {feedQuery.isLoading ? (
          <div
            role="status"
            aria-atomic="true"
            className="flex flex-col items-center justify-center py-32 gap-4"
          >
            <Loader2 className="size-8 text-muted-foreground animate-spin" />
            <p className="text-sm font-medium text-muted-foreground ">
              Loading updates…
            </p>
          </div>
        ) : feedQuery.error ? (
          <div role="alert" className="py-32 text-center">
            <div className="inline-flex items-center justify-center size-20 rounded-full bg-destructive/10 text-destructive mb-6">
              <Globe className="size-10" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2 tracking-normal">
              Couldn&apos;t load updates
            </h2>
            <p className="text-muted-foreground max-w-xs mx-auto text-sm font-medium">
              Something went wrong reaching the field. Please check back in a
              moment.
            </p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} onSave={handleSave} />
              ))}
            </AnimatePresence>

            {filteredPosts.length === 0 && (
              <div className="py-32 text-center">
                <div className="inline-flex items-center justify-center size-20 rounded-full bg-background dark:bg-muted text-muted-foreground dark:text-muted-foreground mb-6">
                  <BookmarkCheck className="size-10" />
                </div>
                <h2 className="text-xl font-semibold text-foreground dark:text-foreground mb-2 tracking-normal">
                  No posts found
                </h2>
                <p className="text-muted-foreground dark:text-muted-foreground max-w-xs mx-auto text-sm font-medium">
                  {filter === "Saved"
                    ? "You haven't bookmarked any updates yet. Tap the bookmark icon on any post to save it here."
                    : "Check back later for new stories from the partners you empower."}
                </p>
                {filter === "Saved" && (
                  <Button
                    variant="link"
                    onClick={() => setFilter("All")}
                    className="mt-4 text-foreground dark:text-foreground font-semibold "
                  >
                    Browse All Updates
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* End of Feed Indicator */}
      {filteredPosts.length > 0 && (
        <div className="flex flex-col items-center py-20 gap-y-4 opacity-40 hover:opacity-100 transition-opacity">
          <div className="flex gap-2">
            <div className="size-1.5 rounded-full bg-muted" />
            <div className="size-1.5 rounded-full bg-muted" />
            <div className="size-1.5 rounded-full bg-muted" />
          </div>
          <p className="text-sm font-medium text-muted-foreground pt-2">
            You&apos;re all caught up
          </p>
        </div>
      )}
    </div>
  );
}
