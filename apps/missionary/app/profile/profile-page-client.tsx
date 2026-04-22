"use client";

import { motion, LayoutGroup } from "@asym/lib/motion";
import { MISSIONARY_SETTINGS_HEADER_VT_NAME } from "@asym/lib/view-transitions";
import { Button } from "@asym/ui/components/shadcn/button";
import { AlertCircle } from "lucide-react";

import { ProfileFormColumn } from "./profile-form-column";
import { ProfilePreviewColumn } from "./profile-preview";
import {
  fadeInUp,
  gentleTransition,
  ProfileHeaderActions,
  ProfileSkeleton,
  springTransition,
  staggerContainer,
} from "./profile-primitives";
import { useProfilePageView } from "./use-profile-page-view";

import { PageHeader } from "@/components/page-header";

export function ProfilePageClient() {
  const vm = useProfilePageView();

  if (vm.isLoading) {
    return <ProfileSkeleton />;
  }

  if (vm.fetchError) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-20 space-y-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={gentleTransition}
      >
        <motion.div
          className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...springTransition, delay: 0.1 }}
        >
          <AlertCircle className="h-6 w-6 text-red-500" />
        </motion.div>
        <p className="text-zinc-600">{vm.fetchError}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </motion.div>
    );
  }

  return (
    <LayoutGroup>
      <motion.div
        className="space-y-6 pb-20"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} transition={gentleTransition}>
          <PageHeader
            title="Profile"
            titleViewTransitionName={MISSIONARY_SETTINGS_HEADER_VT_NAME}
            description="Update your information and how you appear to supporters."
          >
            <ProfileHeaderActions
              copiedLink={vm.copiedLink}
              profile={vm.profile}
              hasChanges={vm.hasChanges}
              isSaving={vm.isSaving}
              saveSuccess={vm.saveSuccess}
              handleCopyLink={vm.handleCopyLink}
              handleDiscard={vm.handleDiscard}
              handleSave={vm.handleSave}
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
            handleSave={vm.handleSave}
          />

          <ProfilePreviewColumn
            profile={vm.profile}
            previewMode={vm.previewMode}
            initials={vm.initials}
            setPreviewMode={vm.setPreviewMode}
          />
        </div>
      </motion.div>
    </LayoutGroup>
  );
}
