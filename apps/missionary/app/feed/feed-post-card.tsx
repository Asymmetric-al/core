"use client";

import { useLocaleFormat } from "@asym/lib/hooks";
import {
  MinistryUpdateMediaUnavailable,
  ReactionBar,
} from "@asym/ui/components/ministry-update";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@asym/ui/components/shadcn/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { PostContent } from "@asym/ui/components/shadcn/rich-text-editor";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import {
  normalizeVisibility,
  postTypeLabel,
  VISIBILITY_LABELS,
  type Post,
} from "./feed-model";

const SHORT_DATE: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

function MediaImage({ url, alt }: { url: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-muted">
      {failed ? (
        <MinistryUpdateMediaUnavailable className="absolute inset-0" />
      ) : (
        <Image
          src={url}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 700px"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function PostMedia({ post }: { post: Post }) {
  const media = (post.media ?? []).filter((item) => item.type === "image");
  if (media.length === 0) return null;
  const alt = post.title?.trim() || "Photo from this update";
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {media.length === 1 ? (
        <MediaImage url={media[0]!.url} alt={alt} />
      ) : (
        <Carousel>
          <CarouselContent>
            {media.map((item, index) => (
              <CarouselItem key={`${item.type}-${item.url}`}>
                <MediaImage
                  url={item.url}
                  alt={`${alt} (${index + 1} of ${media.length})`}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious placement="inside" />
          <CarouselNext placement="inside" />
        </Carousel>
      )}
    </div>
  );
}

function PostMenu({
  onEdit,
  onDelete,
  editLabel,
}: {
  onEdit: () => void;
  onDelete: () => void;
  editLabel: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Update actions">
            <MoreHorizontal aria-hidden />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onEdit}>
            <Pencil aria-hidden />
            {editLabel}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onDelete} variant="destructive">
            <Trash2 aria-hidden />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** A published update as partners see it, with the author's own actions. */
export function PublishedPostCard({
  post,
  onEdit,
  onDelete,
}: {
  post: Post;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { formatDate } = useLocaleFormat();
  const authorName = post.author
    ? `${post.author.first_name} ${post.author.last_name}`.trim() ||
      "Unknown author"
    : "Unknown author";
  const visibility = normalizeVisibility(post.visibility);
  const headline = post.title?.trim();

  return (
    <Card>
      <CardHeader>
        <div className="flex min-w-0 items-center gap-3">
          <Avatar size="lg">
            {post.author?.avatar_url ? (
              <AvatarImage src={post.author.avatar_url} alt="" />
            ) : null}
            <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-foreground">{authorName}</p>
              <Badge variant="outline">{postTypeLabel(post.post_type)}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDate(post.created_at, SHORT_DATE)} ·{" "}
              {VISIBILITY_LABELS[visibility]}
            </p>
          </div>
        </div>
        <CardAction>
          <PostMenu onEdit={onEdit} onDelete={onDelete} editLabel="Edit" />
        </CardAction>
      </CardHeader>
      {/* Title, photos, then text: the order supporters see in their
          Updates feed, so the author previews the real layout. */}
      <CardContent className="flex flex-col gap-4">
        {headline ? (
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {headline}
          </h2>
        ) : null}
        <PostMedia post={post} />
        <PostContent value={post.content} />
        <div className="border-t border-border pt-4">
          <ReactionBar
            update={post}
            reactions={["love", "prayer"]}
            appearance="quiet"
            comments="read"
          />
        </div>
      </CardContent>
    </Card>
  );
}

/** A saved draft: what it is, when it was saved, and how to finish it. */
export function DraftPostCard({
  post,
  onEdit,
  onDelete,
}: {
  post: Post;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { formatDate } = useLocaleFormat();
  const headline = post.title?.trim() || "Untitled draft";
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{headline}</h2>
        </CardTitle>
        <CardDescription>
          {postTypeLabel(post.post_type)} · Saved{" "}
          {formatDate(post.created_at, SHORT_DATE)}
        </CardDescription>
        <CardAction>
          <PostMenu
            onEdit={onEdit}
            onDelete={onDelete}
            editLabel="Keep writing"
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="line-clamp-3 text-sm text-muted-foreground">
          <PostContent value={post.content} />
        </div>
      </CardContent>
      <CardFooter>
        <Button size="sm" onClick={onEdit}>
          Keep writing
        </Button>
      </CardFooter>
    </Card>
  );
}
