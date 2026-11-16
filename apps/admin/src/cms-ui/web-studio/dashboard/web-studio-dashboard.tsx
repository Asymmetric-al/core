"use client";

import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import {
  Building2,
  FileClock,
  FileText,
  HandHeart,
  LayoutTemplate,
  Newspaper,
  Search,
  Target,
  UsersRound,
} from "lucide-react";
import { useId } from "react";

import { YourDocuments } from "./your-documents";
import { WEB_STUDIO_COLLECTION_CONFIGS } from "../collections/config";
import { Link } from "../routing";
import { StudioLayout } from "../shell/studio-layout";
import { ViewerDate } from "../shell/viewer-date";

import type {
  WebStudioDashboardAdminLink,
  WebStudioDashboardData,
  WebStudioDashboardRecent,
} from "./load-dashboard-data";
import type { ComponentType, ReactNode } from "react";

const CREATE_FLOWS = [
  {
    title: "Standard page",
    description: "About, events, campaigns",
    href: "/web-studio/pages/new-from-template",
    icon: FileText,
  },
  {
    title: "Giving page",
    description: "Support for a missionary",
    href: "/web-studio/pages/give",
    icon: HandHeart,
  },
  {
    title: "Project page",
    description: "Landing page for a fund",
    href: "/web-studio/projects/new",
    icon: Target,
  },
  {
    title: "Ministry update",
    description: "News from the field",
    href: "/web-studio/ministry-updates/new",
    icon: Newspaper,
  },
] as const;

const ADMIN_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  "cms-users": UsersRound,
  tenants: Building2,
};

/** What a row's count counts, for screen readers ("14 documents"). */
type CountUnit = { one: string; other: string };

const DOCUMENT_UNIT: CountUnit = { one: "document", other: "documents" };

const ADMIN_UNITS: Record<string, CountUnit> = {
  "cms-users": { one: "user", other: "users" },
  tenants: { one: "organization", other: "organizations" },
};

const numberFormatter = new Intl.NumberFormat("en-US");

/** Recently updated documents show the day, in the viewer's time zone. */
const UPDATED_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

function DashboardSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className={className}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>
            <h2 id={headingId}>{title}</h2>
          </CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </section>
  );
}

function CreateFlows() {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="@container flex flex-col gap-3"
    >
      <h2 id={headingId} className="text-base font-semibold">
        Create
      </h2>
      <ul className="grid grid-cols-1 gap-3 @lg:grid-cols-2 @5xl:grid-cols-4">
        {CREATE_FLOWS.map((flow) => (
          <li key={flow.href} className="flex">
            <Item
              variant="outline"
              className="w-full"
              render={<Link href={flow.href} />}
            >
              <ItemMedia variant="icon">
                <flow.icon aria-hidden="true" />
              </ItemMedia>
              <ItemContent className="min-w-0">
                <ItemTitle>{flow.title}</ItemTitle>
                <ItemDescription>{flow.description}</ItemDescription>
              </ItemContent>
            </Item>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CollectionCount({
  total,
  drafts = null,
  unit,
}: {
  total: number | null;
  drafts?: number | null;
  unit: CountUnit;
}) {
  if (total === null) {
    return (
      <span className="text-xs text-muted-foreground">Count unavailable</span>
    );
  }
  return (
    <span className="flex items-center gap-2">
      {drafts ? (
        <Badge variant="info">
          {numberFormatter.format(drafts)} {drafts === 1 ? "draft" : "drafts"}
        </Badge>
      ) : null}
      <span className="text-sm font-medium tabular-nums">
        {numberFormatter.format(total)}
        <span className="sr-only"> {total === 1 ? unit.one : unit.other}</span>
      </span>
    </span>
  );
}

/** One row style for every list inside a dashboard card. */
function DashboardRow({
  href,
  icon: Icon,
  title,
  description,
  trailing,
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  title: ReactNode;
  description: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <li className="flex">
      <Item size="sm" className="w-full" render={<Link href={href} />}>
        <ItemMedia>
          <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
        </ItemMedia>
        <ItemContent className="min-w-0">
          <ItemTitle className="w-full">{title}</ItemTitle>
          <ItemDescription className="truncate">{description}</ItemDescription>
        </ItemContent>
        {trailing ? <ItemActions>{trailing}</ItemActions> : null}
      </Item>
    </li>
  );
}

function DirectoryGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-1">
      <h3 id={headingId} className="text-xs font-medium text-muted-foreground">
        {label}
      </h3>
      <ul className="-mx-4 flex flex-col divide-y">{children}</ul>
    </section>
  );
}

function CollectionDirectory({
  groups,
  admin,
}: {
  groups: WebStudioDashboardData["groups"];
  admin: WebStudioDashboardAdminLink[];
}) {
  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <DirectoryGroup key={group.id} label={group.label}>
          {group.collections.map((collection) => (
            <DashboardRow
              key={collection.slug}
              href={collection.href}
              icon={WEB_STUDIO_COLLECTION_CONFIGS[collection.slug].icon}
              title={collection.title}
              description={collection.description}
              trailing={
                <CollectionCount
                  total={collection.total}
                  drafts={collection.drafts}
                  unit={DOCUMENT_UNIT}
                />
              }
            />
          ))}
        </DirectoryGroup>
      ))}
      {admin.length > 0 ? (
        <DirectoryGroup label="Administration">
          {admin.map((link) => (
            <DashboardRow
              key={link.slug}
              href={link.href}
              icon={ADMIN_ICONS[link.slug] ?? UsersRound}
              title={link.title}
              description={link.description}
              trailing={
                <CollectionCount
                  total={link.total}
                  unit={ADMIN_UNITS[link.slug] ?? DOCUMENT_UNIT}
                />
              }
            />
          ))}
        </DirectoryGroup>
      ) : null}
    </div>
  );
}

function RecentStatusBadge({
  status,
}: {
  status: WebStudioDashboardRecent["status"];
}) {
  // The collection lists' words and colours: "Changed" is live with a
  // newer draft, so it never reads as unpublished.
  if (status === "published") return <Badge variant="success">Published</Badge>;
  if (status === "changed") return <Badge variant="warning">Changed</Badge>;
  if (status === "draft") return <Badge variant="info">Draft</Badge>;
  return null;
}

function RecentDocuments({
  recent,
  failedCollections,
}: {
  recent: WebStudioDashboardRecent[];
  failedCollections: number;
}) {
  if (recent.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileClock aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>
            {failedCollections
              ? "Recent documents could not load"
              : "No documents yet"}
          </EmptyTitle>
          <EmptyDescription>
            {failedCollections
              ? "Reload to try again."
              : "New and edited documents will show up here."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
  return (
    <>
      {failedCollections > 0 ? (
        <p className="mb-3 text-sm text-muted-foreground">
          Some collections could not load. Reload to try again.
        </p>
      ) : null}
      <ul className="-mx-4 flex flex-col divide-y">
        {recent.map((doc) => (
          <DashboardRow
            key={doc.href}
            href={doc.href}
            icon={WEB_STUDIO_COLLECTION_CONFIGS[doc.collectionSlug].icon}
            title={<span className="truncate">{doc.title}</span>}
            description={
              <>
                {doc.collectionLabel}
                <span aria-hidden="true"> · </span>
                <ViewerDate value={doc.updatedAt} options={UPDATED_OPTIONS} />
              </>
            }
            trailing={<RecentStatusBadge status={doc.status} />}
          />
        ))}
      </ul>
    </>
  );
}

/**
 * The Web Studio home: create flows, the collection directory (with the
 * stock admin lists this user may read), the user's pinned and recently
 * viewed documents, and the team's latest saved changes.
 */
export function WebStudioDashboard({ data }: { data: WebStudioDashboardData }) {
  const pages = data.groups
    .flatMap((group) => group.collections)
    .find((collection) => collection.slug === "pages");

  return (
    <StudioLayout>
      <PageShell
        title="Web Studio"
        description="Create, edit and publish your public site."
        density="compact"
        actions={
          <>
            {pages ? (
              <Link
                href={pages.href}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Search aria-hidden="true" />
                Find a page
              </Link>
            ) : null}
            <Link
              href="/web-studio/templates"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <LayoutTemplate aria-hidden="true" />
              Template gallery
            </Link>
          </>
        }
      >
        <div className="flex flex-col gap-8">
          <CreateFlows />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-5 xl:items-start">
            <div className="flex flex-col gap-6 xl:col-span-2">
              <YourDocuments />
              <DashboardSection
                title="Recently updated"
                description="The latest saved changes, across your team."
              >
                <RecentDocuments
                  recent={data.recent}
                  failedCollections={data.recentFailedCollections}
                />
              </DashboardSection>
            </div>
            <DashboardSection
              title="Collections"
              description="Everything in Web Studio, by area."
              className="xl:col-span-3"
            >
              <CollectionDirectory groups={data.groups} admin={data.admin} />
            </DashboardSection>
          </div>
        </div>
      </PageShell>
    </StudioLayout>
  );
}
