"use client";
import { useLocaleFormat } from "@asym/lib/hooks/use-locale-format";
import {
  MetricCard,
  MetricGrid,
} from "@asym/ui/components/primitives/metric-card";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@asym/ui/components/shadcn/alert";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@asym/ui/components/shadcn/card";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@asym/ui/components/shadcn/empty";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  RichTextViewer,
  extractPlainText,
  parseContent,
} from "@asym/ui/components/shadcn/rich-text-editor";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@asym/ui/components/shadcn/select";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@asym/ui/components/shadcn/tabs";
import { useState } from "react";

import {
  useModerationFeed,
  type ModerationAuthor,
  type ModerationPostsResponse,
} from "./use-moderation-feed";

const POST_STATUSES: Record<
  string,
  {
    label: string;
    variant:
      "success" | "warning" | "destructive-subtle" | "secondary" | "outline";
  }
> = {
  published: { label: "Published", variant: "success" },
  pending_review: { label: "Waiting for review", variant: "warning" },
  flagged: { label: "Flagged", variant: "destructive-subtle" },
  hidden: { label: "Hidden", variant: "secondary" },
  draft: { label: "Draft", variant: "outline" },
  archived: { label: "Archived", variant: "secondary" },
};

function staffLabel(value: string | null | undefined, fallback: string) {
  const words = value?.trim().replaceAll(/[_-]+/g, " ").toLowerCase();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : fallback;
}

function authorName(author: ModerationAuthor | null) {
  return (
    author?.full_name?.trim() ||
    [author?.first_name, author?.last_name].filter(Boolean).join(" ").trim() ||
    "Unknown person"
  );
}
function bodyText(content: string) {
  const parsed = parseContent(content);
  if (typeof parsed === "string")
    return extractPlainText(
      parsed.replace(/<\/(?:p|div|li|h[1-6])>|<br\s*\/?>/gi, " "),
    );
  function words(
    node: Exclude<ReturnType<typeof parseContent>, string>,
  ): string {
    if (node.type === "text") return node.text ?? "";
    if (node.type === "hardBreak") return "\n";
    const text = (node.content ?? []).map(words).join("");
    return (
      text +
      (["paragraph", "heading", "listItem", "blockquote"].includes(
        node.type ?? "",
      )
        ? "\n"
        : "")
    );
  }
  return words(parsed).trim();
}
function LoadError({
  name,
  error,
  retry,
}: {
  name: string;
  error: Error | null;
  retry: () => void;
}) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Couldn’t load {name}</AlertTitle>
      <AlertDescription>
        <p>{error?.message}</p>
        <Button variant="outline" size="sm" onClick={retry}>
          Retry {name}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
function Loading({ name }: { name: string }) {
  return (
    <div role="status" aria-label={`Loading ${name}`}>
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
function PostFilter({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select<string>
      items={items}
      value={value}
      onValueChange={(next) => next && onChange(next)}
    >
      <SelectTrigger aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function Posts({ data }: { data: ModerationPostsResponse }) {
  const { formatDateTime } = useLocaleFormat();
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [postType, setPostType] = useState("all");
  const [sort, setSort] = useState("newest");
  const filtered =
    search.trim() !== "" || visibility !== "all" || postType !== "all";
  const engagement = (post: ModerationPostsResponse["posts"][number]) =>
    [
      post.like_count,
      post.prayer_count,
      post.fires_count,
      post.comment_count,
    ].reduce<number>((sum, value) => sum + (value ?? 0), 0);
  const updates = data.posts
    .filter(
      (post) =>
        (visibility === "all" || post.visibility === visibility) &&
        (postType === "all" || post.post_type === postType) &&
        `${post.title ?? ""} ${bodyText(post.content ?? "")} ${authorName(post.author)}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
    )
    // filter() returns a fresh array, so sorting it in place is safe.
    .sort((a, b) =>
      sort === "engagement"
        ? engagement(b) - engagement(a)
        : (sort === "oldest" ? 1 : -1) *
          (a.created_at ?? "").localeCompare(b.created_at ?? ""),
    );
  const values = (key: "visibility" | "post_type", label: string) => [
    { value: "all", label },
    ...[...new Set(data.posts.map((post) => post[key]).filter(Boolean))].map(
      (value) => ({
        value,
        label: staffLabel(value, "Unavailable"),
      }),
    ),
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          aria-label="Search loaded updates"
          placeholder="Search loaded updates…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <PostFilter
          label="Filter visibility"
          items={values("visibility", "All visibility")}
          value={visibility}
          onChange={setVisibility}
        />
        <PostFilter
          label="Filter post type"
          items={values("post_type", "All post types")}
          value={postType}
          onChange={setPostType}
        />
        <PostFilter
          label="Sort updates"
          items={[
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "engagement", label: "Engagement" },
          ]}
          value={sort}
          onChange={setSort}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Showing the latest {data.posts.length} of {data.total} updates.
      </p>
      <p className="text-xs text-muted-foreground">
        Search, filters and sorting apply to these loaded updates only.
        {filtered ? ` ${updates.length} match.` : ""}
      </p>
      {updates.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {filtered ? "No updates match" : "No updates in this list"}
            </EmptyTitle>
            <EmptyDescription>
              {filtered
                ? "Try another search or filter."
                : "Ministry updates will appear here when they are posted."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-4">
          {updates.map((post) => (
            <li key={post.id}>
              <Card>
                <CardHeader>
                  <CardTitle role="heading" aria-level={3}>
                    {post.title || authorName(post.author)}
                  </CardTitle>
                  {post.title ? (
                    <p className="text-sm text-muted-foreground">
                      By {authorName(post.author)}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={POST_STATUSES[post.status]?.variant ?? "outline"}
                    >
                      {POST_STATUSES[post.status]?.label ??
                        staffLabel(post.status, "Status unavailable")}
                    </Badge>
                    <Badge variant="outline">
                      {staffLabel(post.post_type, "Post type unavailable")}
                    </Badge>
                    <Badge variant="outline">
                      {staffLabel(post.visibility, "Visibility unavailable")}
                    </Badge>
                  </div>
                  {post.created_at ? (
                    <time
                      className="text-xs text-muted-foreground"
                      dateTime={post.created_at}
                    >
                      {formatDateTime(post.created_at, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </time>
                  ) : null}
                </CardHeader>
                <CardContent>
                  {post.content ? (
                    <RichTextViewer value={post.content} />
                  ) : (
                    <p className="text-sm text-muted-foreground">No content</p>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ContentModerationPage() {
  const { posts, review, comments } = useModerationFeed();
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const tab =
    selectedTab ??
    (review.isSuccess && review.data.posts.length === 0 ? "all" : "review");
  return (
    <PageShell
      title="Moderation"
      description="Review real ministry updates and recent comments from your organization."
      density="compact"
    >
      <div className="flex flex-col gap-4 sm:gap-6">
        <Alert role="note">
          <AlertTitle>Read-only for now</AlertTitle>
          <AlertDescription>
            Approving, hiding, pinning and deleting are not connected here yet.
            Missionaries publish updates from their app feed. Website ministry
            updates are managed separately in Web Studio.
          </AlertDescription>
        </Alert>
        {posts.isSuccess ? (
          <MetricGrid label="Moderation summary">
            <MetricCard
              compactOnPhone
              label="Posts"
              value={posts.data.stats.total}
              detail="All posts in your organization"
            />
            <MetricCard
              compactOnPhone
              label="Flagged posts"
              value={posts.data.stats.flagged}
              detail="Flagged by readers"
            />
            <MetricCard
              compactOnPhone
              label="Waiting for review"
              state={
                review.isPending
                  ? "loading"
                  : review.isError
                    ? "unavailable"
                    : "ready"
              }
              unavailableReason="Couldn’t load the review count."
              value={review.data?.total}
              detail="Flagged, hidden or pending review"
            />
            <MetricCard
              compactOnPhone
              label="Hidden posts"
              value={posts.data.stats.hidden}
              detail="Hidden from the feed"
            />
          </MetricGrid>
        ) : null}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-12">
          <section aria-label="Updates" className="min-w-0 xl:col-span-8">
            <Tabs value={tab} onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="review">Queue</TabsTrigger>
                <TabsTrigger value="all">All posts</TabsTrigger>
              </TabsList>
              <TabsContent value="review">
                {review.isError ? (
                  <LoadError
                    name="review queue"
                    error={review.error}
                    retry={() => void review.refetch()}
                  />
                ) : review.isPending ? (
                  <Loading name="review queue" />
                ) : (
                  <Posts data={review.data} />
                )}
              </TabsContent>
              <TabsContent value="all">
                {posts.isError ? (
                  <LoadError
                    name="posts"
                    error={posts.error}
                    retry={() => void posts.refetch()}
                  />
                ) : posts.isPending ? (
                  <Loading name="posts" />
                ) : (
                  <Posts data={posts.data} />
                )}
              </TabsContent>
            </Tabs>
            {posts.isError && tab !== "all" ? (
              <LoadError
                name="post counts"
                error={posts.error}
                retry={() => void posts.refetch()}
              />
            ) : null}
          </section>
          <section
            aria-labelledby="moderation-comments"
            className="xl:col-span-4"
          >
            <Card>
              <CardHeader>
                <CardTitle
                  role="heading"
                  aria-level={2}
                  id="moderation-comments"
                >
                  Recent comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {comments.isError ? (
                  <LoadError
                    name="comments"
                    error={comments.error}
                    retry={() => void comments.refetch()}
                  />
                ) : comments.isPending ? (
                  <Loading name="comments" />
                ) : (
                  <div className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                      {comments.data.total === null
                        ? `Showing up to 20 recent comments; total unavailable.`
                        : `Showing the latest ${comments.data.comments.length} of ${comments.data.total} comments.`}
                    </p>
                    {comments.data.comments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No comments yet.
                      </p>
                    ) : (
                      <ul className="flex flex-col gap-4">
                        {comments.data.comments.map((comment) => (
                          <li key={comment.id}>
                            <p className="text-sm font-medium">
                              {authorName(comment.author)}
                            </p>
                            <RichTextViewer value={comment.content ?? ""} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
