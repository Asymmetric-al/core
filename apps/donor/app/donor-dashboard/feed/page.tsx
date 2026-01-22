"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
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
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Check,
  BookmarkCheck,
  CornerDownRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@asym/ui/components/shadcn/avatar";
import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import { Badge } from "@asym/ui/components/shadcn/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { cn } from "@asym/lib/utils";

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
  id: number;
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

// --- Mock Data ---
const MOCK_POSTS: Post[] = [
  {
    id: 1,
    workerId: "w1",
    workerName: "The Miller Family",
    workerTitle: "Education & Development",
    workerAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80",
    location: "Chiang Mai, Thailand",
    time: "2 hours ago",
    readTime: "3 min read",
    type: "Update",
    title: "Clean Water Flowing in Northern Village",
    content: `
      <p>We are absolutely thrilled to announce that the new well in the northern village is fully operational! Over <strong>500 families</strong> now have access to clean, safe drinking water.</p>
      <p>This changes everything for this community. No more 5-mile walks for water in the scorching heat. Children can attend school on time, and waterborne diseases will drop significantly.</p>
      <blockquote>"Water is life. You have given us our future back." — Village Elder</blockquote>
      <p>Thank you to everyone who donated to the <em>Water for Life</em> campaign. This victory belongs to you as much as it belongs to them.</p>
    `,
    images: [
      "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1931&auto=format&fit=crop",
    ],
    likes: 42,
    prayers: 12,
    comments: [
      {
        id: "c1",
        author: "Jane Doe",
        avatar: "",
        text: "This is incredible news! So happy for them. 🙌",
        time: "1h ago",
        likes: 4,
        replies: [
          {
            id: "r1",
            author: "The Miller Family",
            authorTitle: "Worker",
            avatar:
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80",
            text: "Thank you Jane! Your support made this possible.",
            time: "45m ago",
            likes: 1,
          },
        ],
      },
      {
        id: "c2",
        author: "Robert Fox",
        authorTitle: "Monthly Partner",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60",
        text: "Praise God! Worth every penny.",
        time: "30m ago",
        likes: 2,
        replies: [],
      },
    ],
    saved: true,
  },
  {
    id: 2,
    workerId: "w2",
    workerName: "Dr. Sarah Smith",
    workerTitle: "Medical Mission",
    workerAvatar:
      "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?fit=facearea&facepad=2&w=256&h=256&q=80",
    location: "Nairobi, Kenya",
    time: "Yesterday",
    readTime: "1 min read",
    type: "Update",
    title: "Urgent: Customs Delay",
    content: `
      <p>Please remember our medical supply shipment in your thoughts. It has been held up at customs for 3 days now.</p>
      <p>We are running low on essential antibiotics and insulin. We have provided all requested documentation, but the process is stalled. We are trusting for a breakthrough tomorrow morning.</p>
    `,
    likes: 15,
    prayers: 89,
    comments: [],
    prayed: true,
  },
  {
    id: 3,
    workerId: "w1",
    workerName: "The Miller Family",
    workerTitle: "Education & Development",
    workerAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80",
    location: "Chiang Mai, Thailand",
    time: "3 days ago",
    readTime: "4 min read",
    type: "Story",
    title: "Dreaming Big: Meet Aroon",
    content: `
      <p>Meet Aroon. He's 8 years old and just attended his first English class today. Before our center opened, he spent his days collecting recyclables to help his family.</p>
      <p>He told us his dream is to become a <strong>pilot</strong> so he can see the world. When asked why, he said:</p>
      <p><em>"I want to see if the clouds look different in other places."</em></p>
      <p>With your support, we're helping kids like Aroon stay in school and dream big dreams. We provided him with a uniform, books, and a hot meal today.</p>
    `,
    images: [
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&auto=format&fit=crop&q=80",
    ],
    likes: 124,
    prayers: 5,
    comments: [
      {
        id: "c2",
        author: "John Doe",
        avatar: "",
        text: "Go Aroon! We are cheering for you.",
        time: "2d ago",
        likes: 1,
        replies: [],
      },
      {
        id: "c3",
        author: "Mary Johnson",
        avatar: "",
        text: "That smile says it all.",
        time: "2d ago",
        likes: 0,
        replies: [],
      },
    ],
  },
];

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
    <div className="sticky top-[0px] z-30 bg-zinc-50/90 backdrop-blur-xl border-b border-zinc-200/50 py-4 mb-8 transition-all">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1 max-w-2xl mx-auto">
        {filters.map((type) => (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={cn(
              "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border select-none whitespace-nowrap flex items-center gap-2",
              current === type
                ? "bg-zinc-900 text-white border-zinc-900 shadow-lg hover:shadow-xl transform scale-[1.02]"
                : "bg-white text-zinc-500 border-zinc-200/60 hover:bg-zinc-50 hover:border-zinc-300 hover:text-zinc-900 shadow-sm",
            )}
          >
            {type === "Saved" && (
              <BookmarkCheck
                className={cn(
                  "w-3.5 h-3.5",
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
            "flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 group hover:bg-zinc-50",
            post.liked ? "text-rose-600" : "text-zinc-500 hover:text-zinc-900",
          )}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-all",
              post.liked ? "fill-current scale-110" : "group-hover:scale-110",
            )}
            strokeWidth={post.liked ? 0 : 1.5}
          />
          <span className="text-xs font-bold">{post.likes}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onPray}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 group hover:bg-zinc-50",
            post.prayed ? "text-blue-600" : "text-zinc-500 hover:text-zinc-900",
          )}
        >
          <Globe
            className={cn(
              "h-5 w-5 transition-all",
              post.prayed ? "scale-110" : "group-hover:scale-110",
            )}
            strokeWidth={1.5}
          />
          <span className="text-xs font-bold">{post.prayers}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onToggleComments}
          className="flex items-center gap-2 px-3 py-2 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-all group"
        >
          <MessageCircle
            className="h-5 w-5 group-hover:scale-110 transition-transform"
            strokeWidth={1.5}
          />
          <span className="text-xs font-bold">{post.comments.length}</span>
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
              "h-4 w-4 transition-all",
              post.saved ? "fill-current scale-110" : "",
            )}
            strokeWidth={1.5}
          />
        </motion.button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <Share2 className="h-4 w-4" strokeWidth={1.5} />
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Share Update
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {typeof navigator !== "undefined" &&
              typeof (navigator as any).share === "function" && (
                <DropdownMenuItem onClick={handleNativeShare}>
                  <Share2 className="mr-2 h-4 w-4" /> Share via...
                </DropdownMenuItem>
              )}
            <DropdownMenuItem onClick={handleCopyLink}>
              {copied ? (
                <Check className="mr-2 h-4 w-4 text-green-600" />
              ) : (
                <LinkIcon className="mr-2 h-4 w-4" />
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
              <Facebook className="mr-2 h-4 w-4 text-blue-600" /> Facebook
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
                  "_blank",
                )
              }
            >
              <Twitter className="mr-2 h-4 w-4 text-sky-500" /> X / Twitter
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                window.open(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
                  "_blank",
                )
              }
            >
              <Linkedin className="mr-2 h-4 w-4 text-blue-700" /> LinkedIn
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                window.open(
                  `mailto:?subject=${encodeURIComponent(post.title || "Update from Give Hope")}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`,
                )
              }
            >
              <Mail className="mr-2 h-4 w-4" /> Email
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
      <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">
        Discussion ({comments.length})
      </h4>

      <div className="space-y-6 mb-8">
        {comments.map((comment) => (
          <div key={comment.id} className="group">
            <div className="flex gap-4">
              <Avatar className="h-9 w-9 border border-white shadow-sm mt-1">
                <AvatarImage src={comment.avatar} />
                <AvatarFallback className="bg-white text-zinc-700 text-xs font-bold border border-zinc-100">
                  {comment.author[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900 uppercase tracking-tight">
                      {comment.author}
                    </span>
                    {comment.authorTitle && (
                      <Badge
                        variant="secondary"
                        className="text-[9px] h-4 px-1.5 bg-zinc-200/50 text-zinc-600 font-bold uppercase tracking-widest"
                      >
                        {comment.authorTitle}
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                    {comment.time}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                  {comment.text}
                </p>
                <button
                  className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest"
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
                    <Avatar className="h-7 w-7 border border-white shadow-sm mt-1">
                      <AvatarImage src={reply.avatar} />
                      <AvatarFallback className="bg-white text-zinc-700 text-[10px] font-bold border border-zinc-100">
                        {reply.author[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-900 uppercase tracking-tight">
                          {reply.author}
                        </span>
                        {reply.authorTitle && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] h-4 px-1.5 bg-zinc-900 text-white font-bold uppercase tracking-widest"
                          >
                            {reply.authorTitle}
                          </Badge>
                        )}
                        <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">
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
                    autoFocus
                    placeholder={`Reply to ${comment.author}...`}
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
                    <CornerDownRight className="h-3.5 w-3.5" />
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
        <Avatar className="h-9 w-9 border border-zinc-200 hidden sm:block">
          <AvatarFallback className="bg-zinc-900 text-white text-xs font-bold">
            ME
          </AvatarFallback>
        </Avatar>
        <div className="relative flex-1 group">
          <Input
            placeholder="Write a supportive comment..."
            className="pr-12 bg-white border-zinc-200/80 focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 rounded-xl h-12 transition-all shadow-sm pl-5"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="absolute right-1.5 top-1.5 p-2 text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg disabled:opacity-0 disabled:scale-90 transition-all shadow-sm w-9 h-9 flex items-center justify-center"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const PostCard: React.FC<{
  post: Post;
  onLike: (id: number) => void;
  onPray: (id: number) => void;
  onSave: (id: number) => void;
  onAddComment: (id: number, text: string, parentId?: string) => void;
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
      className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 sm:p-8 overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      {/* Meta Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <Avatar className="h-10 w-10 border border-zinc-100 shadow-sm transition-transform group-hover:scale-105">
              <AvatarImage src={post.workerAvatar} />
              <AvatarFallback className="bg-zinc-100 font-bold text-zinc-600 uppercase">
                {post.workerName[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-zinc-900 text-sm leading-none cursor-pointer hover:underline decoration-2 decoration-zinc-200 underline-offset-4 uppercase tracking-tight">
                {post.workerName}
              </h3>
              <button className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">
                Follow
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">
              <span>{post.readTime || "3 min read"}</span>
              <span className="text-zinc-200">•</span>
              <span>{post.time}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-300 hover:text-zinc-600 hover:bg-transparent -mr-2"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest">
                Mute Updates
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest text-rose-600">
                Report
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest">
                Copy Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 text-left">
        {post.title && (
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tighter leading-tight uppercase">
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
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                sizes="(max-width: 768px) 100vw, 700px"
                onError={() => setImageError(true)}
              />
            </div>
          )}

        {/* Fallback if image errors */}
        {imageError && (
          <div className="rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50 h-32 flex items-center justify-center text-zinc-400">
            <div className="flex flex-col items-center gap-2">
              <ImageOff className="h-6 w-6" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Image unavailable
              </span>
            </div>
          </div>
        )}

        <div
          className="prose prose-zinc prose-sm sm:prose-base max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-zinc-600 prose-p:font-medium prose-blockquote:border-l-4 prose-blockquote:border-zinc-900 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:font-bold prose-blockquote:text-zinc-800 prose-a:text-zinc-900 prose-a:underline hover:prose-a:opacity-70 prose-img:rounded-xl uppercase tracking-tight"
          dangerouslySetInnerHTML={{ __html: post.content }}
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

export default function DonorFeedPage() {
  const [filter, setFilter] = useState<FilterType>("All");
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);

  // --- Filter Logic ---
  const filteredPosts = useMemo(() => {
    if (filter === "All") return posts;
    if (filter === "Saved") return posts.filter((p) => p.saved);
    return posts.filter((p) => p.type === filter);
  }, [posts, filter]);

  // --- Handlers ---
  const handleLike = (id: number) => {
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

  const handlePray = (id: number) => {
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

  const handleSave = (id: number) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)),
    );
  };

  const handleAddComment = (id: number, text: string, parentId?: string) => {
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
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-zinc-900 mb-4 uppercase">
          Ministry Updates
        </h1>
        <p className="text-lg text-zinc-400 font-bold uppercase tracking-widest leading-relaxed max-w-lg">
          Field stories, urgent needs, and joyful updates from the partners you
          empower.
        </p>
      </div>

      {/* Filter Tabs */}
      <FeedFilter current={filter} onChange={setFilter} />

      {/* Feed Stream */}
      <div className="space-y-6">
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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-50 text-zinc-200 mb-6">
              <BookmarkCheck className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2 uppercase tracking-tighter">
              No posts found
            </h3>
            <p className="text-zinc-400 max-w-xs mx-auto text-xs font-bold uppercase tracking-widest">
              {filter === "Saved"
                ? "You haven't bookmarked any updates yet. Tap the bookmark icon on any post to save it here."
                : "Try changing the filter or check back later for new stories."}
            </p>
            {filter === "Saved" && (
              <Button
                variant="link"
                onClick={() => setFilter("All")}
                className="mt-4 text-zinc-900 font-black uppercase tracking-widest text-[10px]"
              >
                Browse All Updates
              </Button>
            )}
          </div>
        )}
      </div>

      {/* End of Feed Indicator */}
      {filteredPosts.length > 0 && (
        <div className="flex flex-col items-center py-20 space-y-4 opacity-40 hover:opacity-100 transition-opacity">
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          </div>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pt-2">
            You&apos;re all caught up
          </p>
        </div>
      )}
    </div>
  );
}
