"use client";

import { motion, LayoutGroup } from "@asym/lib/motion";
import {
  MISSIONARY_SETTINGS_HEADER_VT_NAME,
  useWithinViewTransitionRouteLayer,
} from "@asym/lib/view-transitions";
import { PageHeader } from "@asym/ui/components/page-header";
import { Button } from "@asym/ui/components/shadcn/button";
import { pageHeading, useLoadRetry } from "@asym/ui/hooks";
import { AlertCircle } from "lucide-react";
import { useEffect, useId, useRef } from "react";

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
  RefreshFailure,
  UnsavedChangesBar,
} from "./profile-primitives";
import { useProfilePageView } from "./use-profile-page-view";

const UNAVAILABLE = "Your giving page is unavailable in this account.";

export function ProfilePageClient() {
  const vm = useProfilePageView();
  const headerRef = useRef<HTMLDivElement>(null);
  const formId = useId();
  const readOnlyNoticeId = useId();
  // Route VT owns the entrance when active (incl. the shared title morph);
  // only stagger on plain mounts.
  const withinRouteVt = useWithinViewTransitionRouteLayer();
  const unavailableNotice = useRef<HTMLParagraphElement>(null);
  const accessAnnouncer = useRef<HTMLParagraphElement>(null);
  const wasRevoked = useRef(vm.readRevoked);
  // Read access can end while the page is open (a 401 or 403 answer). If that
  // removed the focused control, focus goes to the notice saying so;
  // otherwise focus stays put and a live region says it. Declared before the
  // retries, which then leave focus where it is.
  useEffect(() => {
    const ended = !wasRevoked.current && vm.readRevoked;
    wasRevoked.current = vm.readRevoked;
    if (!ended) return;
    const active = document.activeElement;
    if (!active || active === document.body) {
      unavailableNotice.current?.focus();
    } else if (accessAnnouncer.current) {
      accessAnnouncer.current.textContent = UNAVAILABLE;
    }
  }, [vm.readRevoked]);
  const loadRetryButton = useRef<HTMLButtonElement>(null);
  const { failureView, ...loadRetry } = useLoadRetry({
    retryRef: loadRetryButton,
    error: vm.fetchError,
    loading: vm.isLoading,
    onRetry: vm.refetch,
    landing: pageHeading,
  });
  // A failed refetch over loaded data keeps the editor; its alert has its
  // own Try again. The raw error goes in, so a retry is held as usual.
  const refreshRetryButton = useRef<HTMLButtonElement>(null);
  const refreshRetry = useLoadRetry({
    retryRef: refreshRetryButton,
    error: vm.refreshError,
    loading: false,
    onRetry: vm.refetch,
    landing: pageHeading,
  });
  // Set only when nothing is loaded. A retry then reads as pending again; the
  // error view stays up meanwhile so its focused Try again is not replaced.
  const loadFailed = loadRetry.error !== null;

  // Read access can end with a retry's answer, or before the page mounts.
  // The notice then takes the error view's place inside the page frame, so
  // the heading stays mounted. A revoked read skips the skeleton, which
  // would wait on a disabled query; with no session yet, it waits for one.
  const unavailable = !vm.canRead;

  if (vm.isLoading && !vm.readRevoked && !loadRetry.retrying) {
    return <ProfileSkeleton />;
  }

  const showsProfile = !loadFailed && !unavailable;
  // An old failure stays hidden while a newer refetch runs, unless it is
  // the alert's own retry.
  const refreshFailure =
    refreshRetry.retrying || !vm.isFetching ? refreshRetry.error : null;

  // The error view shares the page frame, so the heading a successful retry
  // lands on is the same element that was there when Try again was pressed.
  return (
    <LayoutGroup>
      <motion.div
        className="space-y-6 pb-20"
        initial={withinRouteVt ? false : "initial"}
        animate="animate"
        variants={staggerContainer}
      >
        <p ref={accessAnnouncer} role="status" className="sr-only" />
        {!vm.canWrite && showsProfile ? (
          <p id={readOnlyNoticeId} role="status">
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
            description={
              unavailable
                ? undefined
                : "Edit what supporters will see on your giving page. It isn’t live for supporters yet."
            }
          >
            {/* Save and Discard need a loaded profile. */}
            {showsProfile ? (
              <ProfileHeaderActions
                canWrite={vm.canWrite}
                hasChanges={vm.hasChanges}
                isSaving={vm.isSaving}
                saveSuccess={vm.saveSuccess}
                onDiscard={vm.handleDiscard}
                form={formId}
              />
            ) : null}
          </PageHeader>
        </motion.div>

        {unavailable ? (
          <p ref={unavailableNotice} tabIndex={-1} className="outline-none">
            {UNAVAILABLE}
          </p>
        ) : loadFailed ? (
          <motion.div
            ref={failureView}
            className="flex flex-col items-center justify-center py-20 gap-y-4"
            variants={fadeInUp}
            transition={gentleTransition}
          >
            <motion.div
              className="size-12 rounded-full bg-destructive/10 flex items-center justify-center"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...springTransition, delay: 0.1 }}
            >
              <AlertCircle aria-hidden className="size-6 text-destructive" />
            </motion.div>
            <p
              key={loadRetry.failedRetries}
              role="alert"
              className="text-muted-foreground"
            >
              {loadRetry.error}
            </p>
            <Button
              ref={loadRetryButton}
              variant="outline"
              disabled={loadRetry.retrying}
              focusableWhenDisabled
              onClick={loadRetry.retry}
            >
              {loadRetry.retrying ? "Trying again…" : "Try again"}
            </Button>
          </motion.div>
        ) : (
          <>
            {refreshFailure !== null ? (
              <RefreshFailure
                error={refreshFailure}
                failedRetries={refreshRetry.failedRetries}
                retrying={refreshRetry.retrying}
                onRetry={refreshRetry.retry}
                retryRef={refreshRetryButton}
                returnFocusTo={headerRef}
              />
            ) : null}
            <div className="grid gap-6 lg:grid-cols-12">
              <ProfileFormColumn
                formId={formId}
                profile={vm.profile}
                validationErrors={vm.validationErrors}
                rejectedSaveCount={vm.rejectedSaveCount}
                readOnlyNoticeId={vm.canWrite ? undefined : readOnlyNoticeId}
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
          </>
        )}

        {vm.hasChanges && showsProfile ? (
          <UnsavedChangesBar returnFocusTo={headerRef}>
            <ProfileHeaderActions
              canWrite={vm.canWrite}
              hasChanges={vm.hasChanges}
              isSaving={vm.isSaving}
              saveSuccess={vm.saveSuccess}
              onDiscard={vm.handleDiscard}
              form={formId}
            />
          </UnsavedChangesBar>
        ) : null}
      </motion.div>
    </LayoutGroup>
  );
}
