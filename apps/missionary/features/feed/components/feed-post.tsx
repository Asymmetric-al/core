"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader } from "@asym/ui/components/shadcn/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@asym/ui/components/shadcn/carousel";
import { cn } from "@asym/ui/lib/utils";
import type { PostWithAuthor } from "@asym/database/types";
import { CommentsDialog } from "./comments-dialog";

interface FeedPostProps {
  post: PostWithAuthor;
  onLike: (postId: string, liked: boolean) => void;
  onPrayer: (postId: string, prayed: boolean) => void;
}

const FloatingEmoji = ({
  emoji,
  offsetX,
  offsetRotate,
}: {
  emoji: string;
  offsetX: number;
  offsetRotate: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: 0, x: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1.8, 1.2, 0.8],
        y: [-20, -120],
        x: offsetX,
        rotate: offsetRotate,
      }}
      transition={{
        duration: 1.2,
        ease: "easeOut",
        times: [0, 0.2, 0.8, 1],
      }}
      className="absolute pointer-events-none z-50 text-2xl filter drop-shadow-md"
    >
      {emoji}
    </motion.div>
  );
};

const ReactionButton = ({
  isActive,
  count,
  type,
  label,
  onClick,
}: {
  isActive: boolean;
  count: number;
  type: "heart" | "fire" | "prayer";
  label: string;
  onClick: () => void;
}) => {
  const [particles, setParticles] = useState<
    { id: number; emoji: string; offsetX: number; offsetRotate: number }[]
  >([]);

  const config = {
    heart: {
      emoji: "❤️",
      activeColor: "text-rose-600",
      bg: "bg-rose-50/80",
      hoverBg: "hover:bg-rose-50",
      glowColor: "rgba(225, 29, 72, 0.2)",
    },
    fire: {
      emoji: "🔥",
      activeColor: "text-amber-600",
      bg: "bg-amber-50/80",
      hoverBg: "hover:bg-amber-100",
      glowColor: "rgba(217, 119, 6, 0.2)",
    },
    prayer: {
      emoji: "🙏",
      activeColor: "text-indigo-600",
      bg: "bg-indigo-50/80",
      hoverBg: "hover:bg-indigo-50",
      glowColor: "rgba(79, 70, 229, 0.2)",
    },
  };

  const { emoji, activeColor, bg, hoverBg, glowColor } = config[type];

  const handleClick = () => {
    if (!isActive) {
      const newParticles = Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        emoji: emoji,
        offsetX: (Math.random() - 0.5) * 80,
        offsetRotate: (Math.random() - 0.5) * 90,
      }));
      setParticles((prev) => [...prev, ...newParticles]);
      setTimeout(() => {
        setParticles((prev) =>
          prev.filter((p) => !newParticles.find((np) => np.id === p.id)),
        );
      }, 1500);
    }
    onClick();
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {particles.map((p) => (
          <FloatingEmoji
            key={p.id}
            emoji={p.emoji}
            offsetX={p.offsetX}
            offsetRotate={p.offsetRotate}
          />
        ))}
      </AnimatePresence>
      <motion.button
        whileHover={{
          scale: 1.1,
          y: -4,
          boxShadow: `0 12px 24px -8px ${glowColor}`,
        }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        className={cn(
          "relative flex items-center gap-2.5 px-5 py-2.5 rounded-2xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest overflow-hidden group h-10",
          isActive
            ? cn(bg, activeColor, "shadow-lg ring-1 ring-black/5")
            : "text-slate-400 hover:text-slate-600 bg-white border border-slate-100",
          !isActive && hoverBg,
        )}
      >
        <motion.div
          className="text-lg relative z-10 select-none"
          animate={
            isActive
              ? {
                  scale: [1, 1.4, 1],
                  rotate: [0, 15, -15, 0],
                }
              : {}
          }
          transition={{ duration: 0.4 }}
        >
          {emoji}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.span
            key={count}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="relative z-10 tabular-nums min-w-[1ch]"
          >
            {count > 0 ? count : label}
          </motion.span>
        </AnimatePresence>

        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent pointer-events-none"
          />
        )}
      </motion.button>
    </div>
  );
};

export function FeedPost({ post, onLike, onPrayer }: FeedPostProps) {
  const [liked, setLiked] = useState(post.user_liked ?? false);
  const [prayed, setPrayed] = useState(post.user_prayed ?? false);
  const [fired, setFired] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [prayerCount, setPrayerCount] = useState(post.prayer_count);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev: number) => (newLiked ? prev + 1 : prev - 1));
    onLike(post.id, newLiked);
  };

  const handlePrayer = () => {
    const newPrayed = !prayed;
    setPrayed(newPrayed);
    setPrayerCount((prev: number) => (newPrayed ? prev + 1 : prev - 1));
    onPrayer(post.id, newPrayed);
  };

  const handleFire = () => {
    setFired(!fired);
  };

  const initials = `${post.author.first_name[0]}${post.author.last_name[0]}`;

  return (
    <>
      <Card className="overflow-hidden border-none shadow-lg ring-1 ring-black/5 dark:ring-white/10">
        <CardHeader className="flex-row items-center gap-3 space-y-0 bg-muted/30 pb-4">
          <Avatar className="size-10 ring-2 ring-primary/10">
            {post.author.avatar_url && (
              <AvatarImage
                src={post.author.avatar_url}
                alt={post.author.first_name}
              />
            )}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold tracking-tight">
              {post.author.first_name} {post.author.last_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
              })}
            </p>
          </div>
        </CardHeader>

        {post.media && post.media.length > 0 && (
          <div className="relative">
            {post.media.length === 1 && post.media[0] ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-[4/3] w-full overflow-hidden"
              >
                {post.media[0].type === "video" ? (
                  <video
                    src={post.media[0].url}
                    controls
                    className="size-full object-cover"
                    aria-label="Post video"
                  />
                ) : (
                  <Image
                    src={post.media[0].url}
                    alt="Post media"
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 600px"
                    priority
                  />
                )}
              </motion.div>
            ) : (
              <Carousel className="w-full">
                <CarouselContent className="-ml-0">
                  {post.media.map((item: any, index: number) => (
                    <CarouselItem key={index} className="pl-0">
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        {item.type === "video" ? (
                          <video
                            src={item.url}
                            controls
                            className="size-full object-cover"
                            aria-label={`Post video ${index + 1}`}
                          />
                        ) : (
                          <Image
                            src={item.url}
                            alt={`Post media ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 600px"
                          />
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            )}
          </div>
        )}

        <CardContent className="space-y-4 pt-4">
          <div className="flex items-center gap-3">
            <ReactionButton
              isActive={liked}
              count={likeCount}
              type="heart"
              label="Love"
              onClick={handleLike}
            />
            <ReactionButton
              isActive={prayed}
              count={prayerCount}
              type="prayer"
              label="Pray"
              onClick={handlePrayer}
            />
            <ReactionButton
              isActive={fired}
              count={0}
              type="fire"
              label="Hot"
              onClick={handleFire}
            />

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-slate-100 transition-colors h-10 w-10"
              onClick={() => setShowComments(true)}
            >
              <MessageCircle className="size-5 text-slate-400" />
            </Button>
          </div>

          <div className="flex gap-4 text-xs font-medium text-muted-foreground/80 px-1">
            <span className={cn(liked && "text-rose-500 font-bold")}>
              {likeCount} likes
            </span>
            <span className={cn(prayed && "text-indigo-500 font-bold")}>
              {prayerCount} prayers
            </span>
            <span>{post.comment_count} comments</span>
          </div>

          <div className="space-y-2">
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {post.comment_count > 0 && (
            <Button
              variant="link"
              className="h-auto p-0 text-xs font-semibold text-primary hover:no-underline"
              onClick={() => setShowComments(true)}
            >
              View all {post.comment_count} comments
            </Button>
          )}
        </CardContent>
      </Card>

      <CommentsDialog
        postId={post.id}
        open={showComments}
        onOpenChange={setShowComments}
      />
    </>
  );
}
