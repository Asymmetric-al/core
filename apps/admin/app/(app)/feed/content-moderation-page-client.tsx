"use client";

import { motion } from "@asym/lib/motion";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Button, ButtonLink } from "@asym/ui/components/shadcn/button";
import { cn } from "@asym/ui/lib/utils";
import { Download, PenSquare, RefreshCw } from "lucide-react";
import Link from "next/link";

import {
  ContentModerationSidebarSection,
  ContentModerationStatsSection,
  ContentModerationTabsSection,
} from "./content-moderation-sections";
import { useContentModerationPage } from "./use-content-moderation-page";

export default function ContentModerationPage() {
  const {
    activeTab,
    dispatchUi,
    filterType,
    filterVisibility,
    flaggedComments,
    flaggedPosts,
    handleCommentAction,
    handlePostAction,
    handleRefresh,
    isLoading,
    isRefreshing,
    posts,
    searchQuery,
    sortBy,
    stats,
  } = useContentModerationPage();

  return (
    <PageShell
      title="Moderation"
      description="Review flagged content, moderate posts, and manage comments."
      density="compact"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              focusableWhenDisabled={isRefreshing}
              aria-label="Refresh moderation queue"
            >
              <RefreshCw
                className={cn("size-4", isRefreshing && "animate-spin")}
              />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="outline" aria-label="Export moderation queue">
              <Download className="size-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </motion.div>
          <ButtonLink
            render={<Link href="/feed/org-updates" aria-label="Org Updates" />}
          >
            <PenSquare className="size-4" aria-hidden />
            <span className="hidden sm:inline">Org Updates</span>
          </ButtonLink>
        </div>
      }
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-5 sm:space-y-6"
      >
        <ContentModerationStatsSection stats={stats} />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6">
          <div className="xl:col-span-8 space-y-6">
            <ContentModerationTabsSection
              activeTab={activeTab}
              searchQuery={searchQuery}
              filterVisibility={filterVisibility}
              filterType={filterType}
              sortBy={sortBy}
              flaggedPosts={flaggedPosts}
              posts={posts}
              isLoading={isLoading}
              dispatchUi={dispatchUi}
              onPostAction={handlePostAction}
            />
          </div>
          <ContentModerationSidebarSection
            flaggedComments={flaggedComments}
            onCommentAction={handleCommentAction}
          />
        </div>
      </motion.div>
    </PageShell>
  );
}
