"use client";

import { motion } from "@asym/lib/motion";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Button } from "@asym/ui/components/shadcn/button";
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
      actions={
        <>
          <Link href="/mc/feed/org-updates">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="h-9 gap-2 rounded-xl font-semibold">
                <PenSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Org Updates</span>
              </Button>
            </motion.div>
          </Link>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 rounded-xl"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={cn("h-4 w-4", isRefreshing && "animate-spin")}
              />
            </Button>
          </motion.div>
        </>
      }
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 sm:space-y-8"
      >
        <ContentModerationStatsSection stats={stats} />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8">
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
