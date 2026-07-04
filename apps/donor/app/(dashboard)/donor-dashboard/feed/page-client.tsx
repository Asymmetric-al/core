"use client";

import {
  formatPostRelativeTime,
  postAuthorName,
  postImages,
  postTitle,
  useDonorFeedPosts,
} from "@asym/database/hooks";
import { motion, AnimatePresence } from "@asym/lib/motion";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
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
import { Input } from "@asym/ui/components/shadcn/input";
import { PostContent } from "@asym/ui/components/shadcn/rich-text-editor";
import { cn } from "@asym/ui/lib/utils";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Bookmark,
  Globe,
  Send,
  ImageOff,
  Link as LinkIcon,
  Mail,
  Check,
  BookmarkCheck,
  CornerDownRight,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState, useMemo } from "react";

import type { PostWithAuthor } from "@asym/database/types";

// --- Types ---
type ContentType = "Update" | "Prayer" | "Story" | "Video";
type FilterType = "All" | "Saved" | ContentType;

interface Comment {
  id: string;
  author: string;
  authorTitle?: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  replies?: Comment[];
}

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
  comments: Comment[];
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

const PostActions = ({
  post,
  onLike,
  onPray,
  onSave,
  onToggleComments,
}: {
  post: Post;
  onLike: () => void;
  onPray: () => void;
  onSave: () => void;
  onToggleComments: () => void;
}) => {
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
    <div className="flex items-center justify-between py-2 mt-8">
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onLike}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-full transition-colors duration-150 group hover:bg-zinc-50",
            post.liked ? "text-rose-600" : "text-zinc-500 hover:text-zinc-900",
          )}
        >
          <Heart
            className={cn(
              "size-5 transition-transform duration-150",
              post.liked
                ? "fill-current scale-110"
                : "[@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-110",
            )}
            strokeWidth={post.liked ? 0 : 1.5}
          />
          <span className="text-xs font-semibold">{post.likes}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onPray}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-full transition-colors duration-150 group hover:bg-zinc-50",
            post.prayed ? "text-blue-600" : "text-zinc-500 hover:text-zinc-900",
          )}
        >
          <Globe
            className={cn(
              "size-5 transition-transform duration-150",
              post.prayed
                ? "scale-110"
                : "[@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-110",
            )}
            strokeWidth={1.5}
          />
          <span className="text-xs font-semibold">{post.prayers}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onToggleComments}
          className="flex items-center gap-2 px-3 py-2 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors duration-150 group"
        >
          <MessageCircle
            className="size-5 [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-110 transition-transform"
            strokeWidth={1.5}
          />
          <span className="text-xs font-semibold">{post.comments.length}</span>
        </motion.button>
      </div>

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
    </div>
  );
};

const CommentsSection = ({
  comments,
  onAddComment,
}: {
  comments: Comment[];
  onAddComment: (text: string, parentId?: string) => void;
}) => {
  const [text, setText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleSubmit = () => {
    if (text.trim()) {
      onAddComment(text);
      setText("");
    }
  };

  const submitReply = (parentId: string) => {
    if (replyText.trim()) {
      onAddComment(replyText, parentId);
      setReplyText("");
      setReplyingTo(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-zinc-50/50 rounded-2xl p-6 mt-4 border border-zinc-100/50"
    >
      <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-6">
        Discussion ({comments.length})
      </h4>

      <div className="space-y-6 mb-8">
        {comments.map((comment) => (
          <div key={comment.id} className="group">
            <div className="flex gap-4">
              <Avatar className="size-9 border border-white shadow-sm mt-1">
                <AvatarImage src={comment.avatar} />
                <AvatarFallback className="bg-white text-zinc-700 text-xs font-semibold border border-zinc-100">
                  {comment.author[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-900 uppercase tracking-tight">
                      {comment.author}
                    </span>
                    {comment.authorTitle && (
                      <Badge
                        variant="secondary"
                        className="text-[9px] h-4 px-1.5 bg-zinc-200/50 text-zinc-600 font-semibold uppercase tracking-widest"
                      >
                        {comment.authorTitle}
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-300 uppercase tracking-widest">
                    {comment.time}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                  {comment.text}
                </p>
                <button
                  className="text-[10px] font-semibold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest"
                  onClick={() =>
                    setReplyingTo(replyingTo === comment.id ? null : comment.id)
                  }
                >
                  Reply
                </button>
              </div>
            </div>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-12 mt-3 space-y-3 pl-3 border-l-2 border-zinc-200">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3 text-left">
                    <Avatar className="size-7 border border-white shadow-sm mt-1">
                      <AvatarImage src={reply.avatar} />
                      <AvatarFallback className="bg-white text-zinc-700 text-[10px] font-semibold border border-zinc-100">
                        {reply.author[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-900 uppercase tracking-tight">
                          {reply.author}
                        </span>
                        {reply.authorTitle && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] h-4 px-1.5 bg-zinc-900 text-white font-semibold uppercase tracking-widest"
                          >
                            {reply.authorTitle}
                          </Badge>
                        )}
                        <span className="text-[9px] font-semibold text-zinc-300 uppercase tracking-widest">
                          • {reply.time}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                        {reply.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input */}
            {replyingTo === comment.id && (
              <div className="ml-12 mt-3 pl-3">
                <div className="relative group">
                  <Input
                    placeholder={`Reply to ${comment.author}…`}
                    className="pr-10 bg-white border-zinc-200 h-9 text-xs shadow-sm pl-3 rounded-lg"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && submitReply(comment.id)
                    }
                  />
                  <button
                    onClick={() => submitReply(comment.id)}
                    disabled={!replyText.trim()}
                    className="absolute right-1 top-1 p-1 text-zinc-400 hover:text-zinc-900 transition-colors"
                  >
                    <CornerDownRight className="size-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-zinc-400 italic text-center py-4">
            No comments yet. Start the conversation.
          </p>
        )}
      </div>

      <div className="flex gap-3 items-center">
        <Avatar className="size-9 border border-zinc-200 hidden sm:block">
          <AvatarFallback className="bg-zinc-900 text-white text-xs font-semibold">
            ME
          </AvatarFallback>
        </Avatar>
        <div className="relative flex-1 group">
          <Input
            placeholder="Write a supportive comment…"
            className="pr-12 bg-white border-zinc-200/80 focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 rounded-xl h-12 transition-colors duration-150 shadow-sm pl-5"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="absolute right-1.5 top-1.5 p-2 text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg disabled:opacity-0 disabled:scale-90 transition-[background-color,opacity,transform,box-shadow] duration-150 shadow-sm size-9 flex items-center justify-center"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const PostCard: React.FC<{
  post: Post;
  onLike: (id: string | number) => void;
  onPray: (id: string | number) => void;
  onSave: (id: string | number) => void;
  onAddComment: (id: string | number, text: string, parentId?: string) => void;
}> = ({ post, onLike, onPray, onSave, onAddComment }) => {
  const [showComments, setShowComments] = useState(false);
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
      <PostActions
        post={post}
        onLike={() => onLike(post.id)}
        onPray={() => onPray(post.id)}
        onSave={() => onSave(post.id)}
        onToggleComments={() => setShowComments(!showComments)}
      />

      <AnimatePresence>
        {showComments && (
          <CommentsSection
            comments={post.comments}
            onAddComment={(text, parentId) =>
              onAddComment(post.id, text, parentId)
            }
          />
        )}
      </AnimatePresence>
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
    comments: [],
    liked: post.user_liked ?? false,
    prayed: post.user_prayed ?? false,
    saved: false,
  };
}

export default function DonorFeedPage() {
  const [filter, setFilter] = useState<FilterType>("All");
  const feedQuery = useDonorFeedPosts();
  const [posts, setPosts] = useState<Post[]>([]);

  // Seed the local, interactively-editable copy once the server feed arrives.
  // Local like/pray/save/comment state then diverges from the server snapshot.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current || feedQuery.isLoading) return;
    setPosts(feedQuery.data.map(toFeedPost));
    seededRef.current = true;
  }, [feedQuery.isLoading, feedQuery.data]);

  // --- Filter Logic ---
  const filteredPosts = useMemo(() => {
    if (filter === "All") return posts;
    if (filter === "Saved") return posts.filter((p) => p.saved);
    return posts.filter((p) => p.type === filter);
  }, [posts, filter]);

  // --- Handlers ---
  const handleLike = (id: string | number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
              liked: !p.liked,
            }
          : p,
      ),
    );
  };

  const handlePray = (id: string | number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              prayers: p.prayed ? p.prayers - 1 : p.prayers + 1,
              prayed: !p.prayed,
            }
          : p,
      ),
    );
  };

  const handleSave = (id: string | number) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)),
    );
  };

  const handleAddComment = (
    id: string | number,
    text: string,
    parentId?: string,
  ) => {
    const newComment: Comment = {
      id: `new_${Date.now()}`,
      author: "You",
      avatar: "",
      text,
      time: "Just now",
      likes: 0,
      replies: [],
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          if (parentId) {
            // Find parent and add reply
            const updatedComments = p.comments.map((c) => {
              if (c.id === parentId) {
                return { ...c, replies: [...(c.replies || []), newComment] };
              }
              return c;
            });
            return { ...p, comments: updatedComments };
          } else {
            // Add root comment
            return { ...p, comments: [...p.comments, newComment] };
          }
        }
        return p;
      }),
    );
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
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onPray={handlePray}
                  onSave={handleSave}
                  onAddComment={handleAddComment}
                />
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
