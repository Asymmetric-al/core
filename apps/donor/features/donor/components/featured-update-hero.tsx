"use client";

import {
  formatPostRelativeTime,
  postAuthorName,
  postCategory,
  postImages,
  postPlainText,
  postTitle,
} from "@asym/database/hooks";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { buttonVariants } from "@asym/ui/components/shadcn/button";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { ArrowRight, Rss, TriangleAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { DonorFeedPost } from "@asym/database/hooks";

/**
 * The donor's newest ministry update from the feed. Callers key this by post
 * id so a failed image does not carry over to the next post.
 */
export function FeaturedUpdateHero({
  post,
  isLoading,
  error,
}: {
  post: DonorFeedPost | null;
  isLoading: boolean;
  error?: unknown;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  if (isLoading) {
    return (
      <Skeleton
        role="status"
        className="h-80 w-full rounded-xl sm:h-87.5 lg:h-100"
        aria-label="Loading the latest ministry update"
      />
    );
  }

  if (error || !post) {
    const failed = Boolean(error);
    return (
      <Card className="h-full">
        <CardContent className="flex h-full items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                {failed ? <TriangleAlert aria-hidden /> : <Rss aria-hidden />}
              </EmptyMedia>
              <EmptyTitle>
                {failed
                  ? "Updates couldn't load right now"
                  : "No ministry updates yet"}
              </EmptyTitle>
              <EmptyDescription>
                {failed
                  ? "Your latest story will appear here once updates load again."
                  : "Stories from the missionaries you support will appear here."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link
                href="/donor-dashboard/feed"
                className={buttonVariants({ variant: "outline" })}
              >
                Go to Updates
              </Link>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  const [image] = postImages(post);
  const excerpt = postPlainText(post.content);
  const category = postCategory(post) ?? "Ministry update";
  const meta = `${postAuthorName(post)} · ${formatPostRelativeTime(post.created_at)}`;
  const title = postTitle(post);

  if (!image || imageFailed) {
    // Without a usable photo, size to the story instead of leaving an empty
    // dark media frame.
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{category}</Badge>
            <span className="text-sm font-medium text-muted-foreground">
              {meta}
            </span>
          </div>
          <h2 className="text-balance text-2xl font-semibold leading-tight tracking-normal text-foreground sm:text-3xl">
            {title}
          </h2>
          {excerpt ? (
            <p className="line-clamp-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {excerpt}
            </p>
          ) : null}
          <div className="pt-2">
            <Link
              href={`/donor-dashboard/feed#update-${post.id}`}
              className={buttonVariants({ variant: "default" })}
            >
              Read the full update
              <ArrowRight aria-hidden data-icon="inline-end" />
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    // A minimum height, not a fixed one: a long title on a phone grows the
    // story instead of pushing the badge and byline off the top.
    <article className="relative flex min-h-80 flex-col justify-end overflow-hidden rounded-xl border border-background/5 bg-invert text-media-foreground shadow-sm sm:min-h-87.5 lg:min-h-100">
      <Image
        src={image}
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 66vw"
        className="object-cover"
        onError={() => setImageFailed(true)}
      />

      {/* At least a 75% scrim behind every line keeps text legible on
          bright photos. */}
      <div className="relative z-10 flex flex-col gap-4 bg-linear-to-t from-media-scrim/95 to-media-scrim/75 p-6 text-left md:p-10">
        <div
          aria-hidden="true"
          data-slot="hero-scrim-fade"
          className="pointer-events-none absolute inset-x-0 bottom-full h-16 bg-linear-to-t from-media-scrim/75 to-transparent md:h-24"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Badge>{category}</Badge>
          <span className="text-sm font-medium text-media-foreground/80">
            {meta}
          </span>
        </div>
        <h2 className="text-balance text-2xl font-semibold leading-tight tracking-normal sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        {excerpt ? (
          <p className="line-clamp-2 max-w-xl text-sm font-medium leading-relaxed text-media-foreground/80">
            {excerpt}
          </p>
        ) : null}
        <div className="pt-2">
          <Link
            href={`/donor-dashboard/feed#update-${post.id}`}
            className={buttonVariants({ variant: "inverse" })}
          >
            Read the full update
            <ArrowRight aria-hidden data-icon="inline-end" />
          </Link>
        </div>
      </div>
    </article>
  );
}
