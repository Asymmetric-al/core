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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Facebook, Linkedin, Twitter } from "@asym/ui/components/shadcn/icons";
import { PostContent } from "@asym/ui/components/shadcn/rich-text-editor";
import { cn } from "@asym/ui/lib/utils";
import {
  MoreHorizontal,
  Share2,
  Bookmark,
  Globe,
  ImageOff,
  Link as LinkIcon,
  Mail,
  Check,
  BookmarkCheck,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import React, { useState, useMemo } from "react";

import type { PostWithAuthor } from "@asym/database/types";

// --- Types ---
type ContentType = "Update" | "Prayer" | "Story" | "Video";
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
  const filters: FilterType[] = ["All", "Update", "Story", "Video", "Saved"];

  return (
    <div className="sticky top-[0px] z-30 bg-zinc-50/90 backdrop-blur-xl border-b border-zinc-200/50 py-4 mb-8 transition-[background-color,border-color,backdrop-filter] duration-200">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1 max-w-2xl mx-auto">
        {filters.map((type) => (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={cn(
              "px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-widest transition-[background-color,border-color,color,box-shadow,transform] duration-200 border select-none whitespace-nowrap flex items-center gap-2",
              current === type
                ? "bg-zinc-900 text-white border-zinc-900 shadow-lg [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-xl scale-[1.02]"
                : "bg-white text-zinc-500 border-zinc-200/60 hover:bg-zinc-50 hover:border-zinc-300 hover:text-zinc-900 shadow-sm",
            )}
          >
            {type === "Saved" && (
              <BookmarkCheck
                className={cn(
                  "size-3.5",
                  current === type ? "text-white" : "text-zinc-400",
                )}
              />
            )}
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};

const PostActions = ({ post, onSave }: { post: Post; onSave: () => void }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://givehope.app/posts/${post.id}`; // Mock URL
  const shareText = `Check out this update from ${post.workerName} on Give Hope!`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: post.title || "Update from Give Hope",
          text: shareText,
          url: shareUrl,
        })
        .catch(console.error);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onSave}
        className={cn(
          "p-2.5 rounded-full transition-colors",
          post.saved
            ? "text-zinc-900 bg-zinc-100"
            : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100",
        )}
        title={post.saved ? "Remove from bookmarks" : "Save this post"}
      >
        <Bookmark
          className={cn(
            "size-4 transition-transform duration-150",
            post.saved ? "fill-current scale-110" : "",
          )}
          strokeWidth={1.5}
        />
      </motion.button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <motion.button
              aria-label="Share post"
              whileTap={{ scale: 0.9 }}
              className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <Share2 className="size-4" strokeWidth={1.5} />
            </motion.button>
          }
        />
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            Share Update
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {typeof navigator !== "undefined" &&
            typeof navigator.share === "function" && (
              <DropdownMenuItem onClick={handleNativeShare}>
                <Share2 className="mr-2 size-4" /> Share via…
              </DropdownMenuItem>
            )}
          <DropdownMenuItem onClick={handleCopyLink}>
            {copied ? (
              <Check className="mr-2 size-4 text-green-600" />
            ) : (
              <LinkIcon className="mr-2 size-4" />
            )}
            {copied ? "Copied!" : "Copy Link"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              window.open(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                "_blank",
              )
            }
          >
            <Facebook className="mr-2 size-4 text-blue-600" /> Facebook
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
                "_blank",
              )
            }
          >
            <Twitter className="mr-2 size-4 text-sky-500" /> X / Twitter
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              window.open(
                `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
                "_blank",
              )
            }
          >
            <Linkedin className="mr-2 size-4 text-blue-700" /> LinkedIn
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              window.open(
                `mailto:?subject=${encodeURIComponent(post.title || "Update from Give Hope")}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`,
              )
            }
          >
            <Mail className="mr-2 size-4" /> Email
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
      className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 sm:p-8 overflow-hidden [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-md transition-shadow duration-300"
    >
      {/* Meta Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <Avatar className="size-10 border border-zinc-100 shadow-sm transition-transform [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.02]">
              <AvatarImage src={post.workerAvatar} />
              <AvatarFallback className="bg-zinc-100 font-semibold text-zinc-600 uppercase">
                {post.workerName[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-zinc-900 text-sm leading-none cursor-pointer hover:underline decoration-2 decoration-zinc-200 underline-offset-4 uppercase tracking-tight">
                {post.workerName}
              </h3>
              <button className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">
                Follow
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400 mt-1 uppercase tracking-widest">
              <span>{post.readTime || "3 min read"}</span>
              <span className="text-zinc-200">•</span>
              <span>{post.time}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  aria-label="Open post actions"
                  variant="ghost"
                  size="icon"
                  className="text-zinc-300 hover:text-zinc-600 hover:bg-transparent -mr-2"
                >
                  <MoreHorizontal className="size-5" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="text-[10px] font-semibold uppercase tracking-widest">
                Mute Updates
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[10px] font-semibold uppercase tracking-widest text-rose-600">
                Report
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[10px] font-semibold uppercase tracking-widest">
                Copy Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 text-left">
        {post.title && (
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tighter leading-tight uppercase">
            {post.title}
          </h2>
        )}

        {/* Images - Edge to Edge look but contained */}
        {post.images &&
          post.images.length > 0 &&
          post.images[0] &&
          !imageError && (
            <div className="rounded-xl overflow-hidden shadow-sm border border-zinc-100 bg-zinc-50 relative h-[300px] sm:h-[400px]">
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
          <div className="rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50 h-32 flex items-center justify-center text-zinc-400">
            <div className="flex flex-col items-center gap-2">
              <ImageOff className="size-6" />
              <span className="text-[10px] font-semibold uppercase tracking-widest">
                Image unavailable
              </span>
            </div>
          </div>
        )}

        <PostContent
          value={post.content}
          richTextClassName="prose prose-zinc prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-zinc-600 prose-p:font-medium prose-blockquote:border-l-4 prose-blockquote:border-zinc-900 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:font-semibold prose-blockquote:text-zinc-800 prose-a:text-zinc-900 prose-a:underline hover:prose-a:opacity-70 prose-img:rounded-xl uppercase tracking-tight"
          htmlClassName="prose prose-zinc prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-zinc-600 prose-p:font-medium prose-blockquote:border-l-4 prose-blockquote:border-zinc-900 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:font-semibold prose-blockquote:text-zinc-800 prose-a:text-zinc-900 prose-a:underline hover:prose-a:opacity-70 prose-img:rounded-xl uppercase tracking-tight"
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
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-zinc-900 mb-4 uppercase">
          Ministry Updates
        </h1>
        <p className="text-lg text-zinc-400 font-semibold uppercase tracking-widest leading-relaxed max-w-lg">
          Field stories, urgent needs, and joyful updates from the partners you
          empower.
        </p>
      </div>

      {/* Filter Tabs */}
      <FeedFilter current={filter} onChange={setFilter} />

      {/* Feed Stream */}
      <div className="space-y-6">
        {feedQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="size-8 text-muted-foreground animate-spin" />
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              Loading updates…
            </p>
          </div>
        ) : feedQuery.error ? (
          <div className="py-32 text-center">
            <div className="inline-flex items-center justify-center size-20 rounded-full bg-destructive/10 text-destructive mb-6">
              <Globe className="size-10" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2 uppercase tracking-tighter">
              Couldn&apos;t load updates
            </h3>
            <p className="text-muted-foreground max-w-xs mx-auto text-xs font-semibold uppercase tracking-widest">
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
                <div className="inline-flex items-center justify-center size-20 rounded-full bg-zinc-50 dark:bg-muted text-zinc-200 dark:text-muted-foreground mb-6">
                  <BookmarkCheck className="size-10" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-foreground mb-2 uppercase tracking-tighter">
                  No posts found
                </h3>
                <p className="text-zinc-400 dark:text-muted-foreground max-w-xs mx-auto text-xs font-semibold uppercase tracking-widest">
                  {filter === "Saved"
                    ? "You haven't bookmarked any updates yet. Tap the bookmark icon on any post to save it here."
                    : "Check back later for new stories from the partners you empower."}
                </p>
                {filter === "Saved" && (
                  <Button
                    variant="link"
                    onClick={() => setFilter("All")}
                    className="mt-4 text-zinc-900 dark:text-foreground font-semibold uppercase tracking-widest text-[10px]"
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
            <div className="size-1.5 rounded-full bg-zinc-400" />
            <div className="size-1.5 rounded-full bg-zinc-400" />
            <div className="size-1.5 rounded-full bg-zinc-400" />
          </div>
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest pt-2">
            You&apos;re all caught up
          </p>
        </div>
      )}
    </div>
  );
}
