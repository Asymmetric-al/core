"use client";

import { motion, LayoutGroup } from "@asym/lib/motion";
import {
  MISSIONARY_SETTINGS_HEADER_VT_NAME,
  useWithinViewTransitionRouteLayer,
} from "@asym/lib/view-transitions";
import { PageHeader } from "@asym/ui/components/page-header";
import { Button } from "@asym/ui/components/shadcn/button";
import { AlertCircle } from "lucide-react";
import { useRef } from "react";

import { ProfileFormColumn } from "./profile-form-column";
import {
  fadeInUp,
  gentleTransition,
  springTransition,
  staggerContainer,
} from "./profile-motion";
import { ProfilePreviewColumn } from "./profile-preview";
import {
  ProfileHeaderActions,
  ProfileSkeleton,
  UnsavedChangesBar,
} from "./profile-primitives";
import { useProfilePageView } from "./use-profile-page-view";

export function ProfilePageClient() {
  const vm = useProfilePageView();
  const headerRef = useRef<HTMLDivElement>(null);
  // Route VT owns the entrance when active (incl. the shared title morph);
  // only stagger on plain mounts.
  const withinRouteVt = useWithinViewTransitionRouteLayer();

  if (vm.isLoading) {
    return <ProfileSkeleton />;
  }

  if (!vm.canRead) {
    return (
      <p role="status">Your giving page is unavailable in this account.</p>
    );
  }

  if (vm.fetchError) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-20 gap-y-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={gentleTransition}
      >
        <motion.div
          className="size-12 rounded-full bg-destructive/10 flex items-center justify-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...springTransition, delay: 0.1 }}
        >
          <AlertCircle className="size-6 text-destructive" />
        </motion.div>
        <p className="text-muted-foreground">{vm.fetchError}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try again
        </Button>
      </motion.div>
    );
  }

  return (
    <LayoutGroup>
      <motion.div
        className="space-y-6 pb-20"
        initial={withinRouteVt ? false : "initial"}
        animate="animate"
        variants={staggerContainer}
      >
        {!vm.canWrite ? (
          <p role="status">
            Your giving page is read-only.{" "}
            {vm.hasChanges
              ? "Your readable draft is kept, but cannot be submitted."
              : "Changes cannot be submitted."}
          </p>
        ) : null}
        <motion.div
          ref={headerRef}
          tabIndex={-1}
          className="outline-none"
          variants={fadeInUp}
          transition={gentleTransition}
        >
          <PageHeader
            title="Giving page"
            titleViewTransitionName={MISSIONARY_SETTINGS_HEADER_VT_NAME}
            description="Edit what supporters will see on your giving page. It isn’t live for supporters yet."
          >
            <ProfileHeaderActions
              canWrite={vm.canWrite}
              hasChanges={vm.hasChanges}
              isSaving={vm.isSaving}
              saveSuccess={vm.saveSuccess}
              onDiscard={vm.handleDiscard}
              onSave={vm.handleSave}
            />
          </PageHeader>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-12">
          <ProfileFormColumn
            profile={vm.profile}
            validationErrors={vm.validationErrors}
            bioWordCount={vm.bioWordCount}
            initials={vm.initials}
            updateProfile={vm.updateProfile}
            onSave={vm.handleSave}
          />

          <ProfilePreviewColumn
            profile={vm.profile}
            previewMode={vm.previewMode}
            initials={vm.initials}
            setPreviewMode={vm.setPreviewMode}
          />
        </div>

        {vm.hasChanges ? (
          <UnsavedChangesBar returnFocusTo={headerRef}>
            <ProfileHeaderActions
              canWrite={vm.canWrite}
              hasChanges={vm.hasChanges}
              isSaving={vm.isSaving}
              saveSuccess={vm.saveSuccess}
              onDiscard={vm.handleDiscard}
              onSave={vm.handleSave}
            />
          </UnsavedChangesBar>
        ) : null}
      </motion.div>
    </LayoutGroup>
  );
}
