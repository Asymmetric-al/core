"use client";

import {
  buildDonorProfileSettingsPatch,
  buildProfileFormState,
} from "@asym/api/donor-portal/settings-patch";
import {
  useDonorPortalSnapshot,
  useUpdateDonorPortal,
} from "@asym/database/hooks";
import { motion } from "@asym/lib/motion";
import { useWithinViewTransitionRouteLayer } from "@asym/lib/view-transitions";
import { ChangePasswordForm } from "@asym/ui/components/auth/change-password-form";
import { SignOutOtherSessions } from "@asym/ui/components/auth/sign-out-other-sessions";
import { PageHeader } from "@asym/ui/components/page-header";
import { ImageUpload } from "@asym/ui/components/primitives/image-upload";
import { ReadOnlyField } from "@asym/ui/components/primitives/read-only-field";
import { SettingsCard, SettingsLayout } from "@asym/ui/components/settings";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Switch } from "@asym/ui/components/shadcn/switch";
import { TabsContent } from "@asym/ui/components/shadcn/tabs";
import { useRetainedDraft } from "@asym/ui/hooks";
import { cn } from "@asym/ui/lib/utils";
import { Loader2, Lock, Mail, UserRound } from "lucide-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { useFocusHandoff, useLoadRetry } from "@/features/donor/focus-recovery";

type TabId = "profile" | "email" | "security";

const TABS: Array<{ id: TabId; label: string; icon: React.ElementType }> = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "email", label: "Email & privacy", icon: Mail },
  { id: "security", label: "Security", icon: Lock },
];

type ProfileFormFields = {
  avatarUrl: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

type TextField = keyof ProfileFormFields;

type NameError = { field: "firstName" | "lastName"; message: string };

function responseStatus(error: unknown): number | null {
  return error instanceof Error &&
    "status" in error &&
    typeof error.status === "number"
    ? error.status
    : null;
}

function TabLoading({ label }: { label: string }) {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}

type SettingsSnapshot = ReturnType<typeof useDonorPortalSnapshot>;

// Offline, a first load waits for the connection without fetching; it is
// still loading, not failed or empty.
function settingsLoading(snapshot: SettingsSnapshot) {
  return snapshot.isLoading || (snapshot.isPending && snapshot.isPaused);
}

type SettingsRetry = ReturnType<typeof useLoadRetry>;

const SettingsRetryContext = createContext<SettingsRetry | null>(null);

// Try again for settings that failed to load. The profile and email tabs show
// the same settings, so they share one retry: a retry pressed in one tab is
// busy in the other too, and never runs twice. Each tab keeps focus in its
// panel when the settings recover (focusTabPanel), so the retry has no
// heading of its own to move focus to.
function SettingsRetryProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useDonorPortalSnapshot();
  const noHeading = useRef<HTMLElement>(null);
  const retry = useLoadRetry(
    noHeading,
    Boolean(snapshot.error) || !snapshot.data,
    snapshot.refetch,
  );
  return <SettingsRetryContext value={retry}>{children}</SettingsRetryContext>;
}

function useSettingsRetry(): SettingsRetry {
  const retry = useContext(SettingsRetryContext);
  if (!retry) throw new Error("Settings tabs need a SettingsRetryProvider.");
  return retry;
}

// For useFocusHandoff: when the settings recover, however that happened,
// focus on the removed TabError stays in its tab panel instead of dropping
// to the page.
function focusTabPanel(from: HTMLElement) {
  from.closest<HTMLElement>('[role="tabpanel"]')?.focus();
  return true;
}

function TabError({
  retry,
  ref,
}: {
  retry: SettingsRetry;
  ref: React.Ref<HTMLDivElement>;
}) {
  return (
    <Card ref={ref}>
      <CardContent className="space-y-3 p-6">
        <p
          key={retry.failedRetries}
          role="alert"
          className="text-sm font-medium text-destructive"
        >
          We couldn’t load your settings.
        </p>
        <Button
          variant="outline"
          size="sm"
          disabled={retry.retrying}
          focusableWhenDisabled
          onClick={retry.retry}
        >
          {retry.retrying ? "Trying again…" : "Try again"}
        </Button>
      </CardContent>
    </Card>
  );
}

function PhotoCard({
  avatarUrl,
  disabled,
  initials,
  onAvatarUrlChange,
}: {
  avatarUrl: string;
  disabled: boolean;
  initials: string;
  onAvatarUrlChange: (url: string) => void;
}) {
  const uploadRef = useRef<HTMLButtonElement>(null);
  return (
    <SettingsCard
      title="Photo"
      description="Shown to the missionaries you support, unless you give anonymously."
    >
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={avatarUrl || undefined} alt="" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            JPG, PNG, WebP or GIF. Large files auto-optimized.
          </p>
          <div className="flex flex-wrap gap-2">
            <ImageUpload
              value={avatarUrl}
              onChange={onAvatarUrlChange}
              path="avatars"
              aspect={1}
              disabled={disabled}
            >
              <Button ref={uploadRef} variant="outline" size="sm">
                {avatarUrl ? "Change photo" : "Upload photo"}
              </Button>
            </ImageUpload>
            {avatarUrl ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => {
                  onAvatarUrlChange("");
                  // Remove goes away with the photo; the upload button stays.
                  uploadRef.current?.focus();
                }}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

function DetailsCard({
  canWrite,
  errorMessage,
  form,
  nameError,
  onFieldChange,
  onSave,
  pending,
  success,
}: {
  canWrite: boolean;
  errorMessage: string | null;
  form: ProfileFormFields;
  nameError: NameError | null;
  onFieldChange: (key: TextField, value: string) => void;
  onSave: () => void;
  pending: boolean;
  success: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const saveDisabled = pending || !canWrite;
  // Each failed save sets a new error, so focus returns to the field at fault.
  useEffect(() => {
    if (!nameError) return;
    (nameError.field === "firstName"
      ? firstNameRef
      : lastNameRef
    ).current?.focus();
  }, [nameError]);
  const firstNameError =
    nameError?.field === "firstName" ? nameError.message : null;
  const lastNameError =
    nameError?.field === "lastName" ? nameError.message : null;
  // A disabled submit button would drop focus to the page, so focus waits on
  // the form while the save runs and then returns to the button.
  useLayoutEffect(() => {
    if (saveDisabled) {
      if (document.activeElement === saveRef.current)
        formRef.current?.focus({ preventScroll: true });
    } else if (document.activeElement === formRef.current) {
      saveRef.current?.focus();
    }
  }, [saveDisabled]);
  return (
    <form
      ref={formRef}
      aria-label="Your details"
      noValidate
      tabIndex={-1}
      className="outline-none"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <SettingsCard
        title="Your details"
        description="Your name and contact details on your giving record."
        footer={
          <div className="flex w-full flex-col-reverse items-center justify-between gap-3 sm:flex-row">
            <p role="status" aria-atomic="true" className="sr-only">
              {pending ? "Saving…" : success ? "Saved." : ""}
            </p>
            <p
              role={errorMessage ? "alert" : undefined}
              className={cn(
                "text-sm",
                errorMessage ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {errorMessage ?? (success ? "Saved." : "")}
            </p>
            <Button ref={saveRef} type="submit" disabled={pending || !canWrite}>
              {pending ? (
                <Loader2 className="animate-spin" data-icon="inline-start" />
              ) : null}
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        }
      >
        <FieldGroup>
          <div className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={firstNameError ? true : undefined}>
              <FieldLabel htmlFor="settings-first-name">First name</FieldLabel>
              <Input
                ref={firstNameRef}
                id="settings-first-name"
                autoComplete="given-name"
                required
                maxLength={120}
                readOnly={!canWrite}
                aria-invalid={firstNameError ? true : undefined}
                aria-describedby={
                  firstNameError ? "settings-first-name-error" : undefined
                }
                value={form.firstName}
                onChange={(event) =>
                  onFieldChange("firstName", event.target.value)
                }
              />
              {firstNameError ? (
                <FieldError id="settings-first-name-error">
                  {firstNameError}
                </FieldError>
              ) : null}
            </Field>
            <Field data-invalid={lastNameError ? true : undefined}>
              <FieldLabel htmlFor="settings-last-name">Last name</FieldLabel>
              <Input
                ref={lastNameRef}
                id="settings-last-name"
                autoComplete="family-name"
                required
                maxLength={120}
                readOnly={!canWrite}
                aria-invalid={lastNameError ? true : undefined}
                aria-describedby={
                  lastNameError ? "settings-last-name-error" : undefined
                }
                value={form.lastName}
                onChange={(event) =>
                  onFieldChange("lastName", event.target.value)
                }
              />
              {lastNameError ? (
                <FieldError id="settings-last-name-error">
                  {lastNameError}
                </FieldError>
              ) : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="settings-phone">Phone</FieldLabel>
              <Input
                id="settings-phone"
                type="tel"
                autoComplete="tel"
                maxLength={80}
                readOnly={!canWrite}
                value={form.phone}
                onChange={(event) => onFieldChange("phone", event.target.value)}
              />
            </Field>
            <ReadOnlyField
              label="Sign-in email"
              value={form.email}
              description="Receipts go here. Your organization can change it."
            />
          </div>
        </FieldGroup>
      </SettingsCard>
    </form>
  );
}

function ProfileTab() {
  const snapshot = useDonorPortalSnapshot();
  const update = useUpdateDonorPortal();
  const retry = useSettingsRetry();
  const errorView = useFocusHandoff(focusTabPanel);

  const retained =
    useRetainedDraft<Omit<ProfileFormFields, "email">>("donor-profile");
  const { revokeRead } = retained;
  useEffect(() => {
    const status = responseStatus(snapshot.error);
    if (status === 401 || status === 403) revokeRead();
  }, [snapshot.error, revokeRead]);
  const baseline = buildProfileFormState({ ...snapshot.data?.profile });
  const form = { ...baseline, ...retained.value };
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nameError, setNameError] = useState<NameError | null>(null);

  const setField = (key: TextField, value: string) => {
    if (key === "email" || !retained.canWrite) return;
    const current = retained.read() ?? {
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      avatarUrl: form.avatarUrl,
    };
    const next = { ...current, [key]: value };
    retained.update(next, {
      dirty:
        next.firstName !== baseline.firstName ||
        next.lastName !== baseline.lastName ||
        next.phone !== baseline.phone ||
        next.avatarUrl !== baseline.avatarUrl,
    });
    setSuccess(false);
    setErrorMessage(null);
    if (nameError?.field === key) setNameError(null);
  };
  const handleSave = async () => {
    if (!retained.canWrite || retained.isSaving || update.isPending) return;
    setErrorMessage(null);
    const savePatch = buildDonorProfileSettingsPatch(form);
    if (!savePatch.ok) {
      // The patch checks the names first, in this order; anything else it
      // rejects stays a form-level message.
      const field = !form.firstName.trim()
        ? "firstName"
        : !form.lastName.trim()
          ? "lastName"
          : null;
      if (field) setNameError({ field, message: savePatch.errorMessage });
      else setErrorMessage(savePatch.errorMessage);
      return;
    }
    setNameError(null);
    if (!retained.read())
      retained.update({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        avatarUrl: form.avatarUrl,
      });
    const save = retained.beginSave();
    if (!save) return;
    try {
      await update.mutateAsync(savePatch.patch);
      const current = save.isCurrent();
      const matched = retained.finishSave(save, true);
      if (current) setSuccess(matched);
    } catch (error) {
      retained.finishSave(save, false);
      if (!save.isCurrent()) return;
      const status = responseStatus(error);
      if (status === 401) retained.revokeRead();
      if (status === 403) retained.revokeWrite();
      setErrorMessage("Couldn’t save your changes. Try again.");
    }
  };

  if (!retained.canRead)
    return (
      <Card>
        <CardContent>
          <p role="status">Your profile is unavailable in this account.</p>
        </CardContent>
      </Card>
    );
  // With nothing cached, a retry loads afresh; the error view stays so Try
  // again keeps focus. The form never starts from settings that did not load.
  if (settingsLoading(snapshot) && !retry.retrying)
    return <TabLoading label="Loading profile" />;
  if (snapshot.error || !snapshot.data || retry.retrying)
    return <TabError retry={retry} ref={errorView} />;

  const initials =
    `${form.firstName[0] ?? ""}${form.lastName[0] ?? ""}`.toUpperCase() || "··";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {!retained.canWrite ? (
        <p role="status">
          Your profile is read-only.{" "}
          {retained.dirty
            ? "Your readable draft is kept, but cannot be submitted."
            : "Changes cannot be submitted."}
        </p>
      ) : null}
      <PhotoCard
        avatarUrl={form.avatarUrl}
        disabled={!retained.canWrite}
        initials={initials}
        onAvatarUrlChange={(url) => setField("avatarUrl", url)}
      />
      <DetailsCard
        canWrite={retained.canWrite}
        errorMessage={errorMessage}
        form={form}
        nameError={nameError}
        onFieldChange={setField}
        onSave={() => {
          void handleSave();
        }}
        pending={update.isPending || retained.isSaving}
        success={success}
      />
    </motion.div>
  );
}

/** One preference that saves as soon as it changes. */
function PreferenceSwitch({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <Field orientation="horizontal">
      <FieldContent>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <FieldDescription id={`${id}-description`}>
          {description}
        </FieldDescription>
      </FieldContent>
      <Switch
        id={id}
        aria-describedby={`${id}-description`}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </Field>
  );
}

function EmailPrivacyTab() {
  const snapshot = useDonorPortalSnapshot();
  const update = useUpdateDonorPortal();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  // Shown optimistically while a save is in flight; the snapshot wins after.
  const [pending, setPending] = useState<{
    news?: boolean;
    showName?: boolean;
  }>({});
  // Every preference save waits for the one before it, across both switches.
  // Each save answers with the whole donor snapshot, so two in flight at once
  // could land out of order and restore a value the donor already changed.
  const queue = useRef<Promise<void>>(Promise.resolve());
  const latest = useRef<Partial<Record<"news" | "showName", number>>>({});
  const retry = useSettingsRetry();
  const errorView = useFocusHandoff(focusTabPanel);

  if (settingsLoading(snapshot) && !retry.retrying)
    return <TabLoading label="Loading email settings" />;
  if (snapshot.error || !snapshot.data || retry.retrying) {
    return <TabError retry={retry} ref={errorView} />;
  }

  const donor = snapshot.data.donor;
  const givingPreferences = donor?.givingPreferences ?? {};
  const news = pending.news ?? !donor?.doNotEmail;
  // Missionaries see a donor's name only after an explicit choice (the
  // server fails closed), so the switch starts off until then.
  const showName =
    pending.showName ?? givingPreferences.defaultAnonymousToRecipient === false;

  const save = async (
    key: "news" | "showName",
    value: boolean,
    patch: Parameters<typeof update.mutateAsync>[0],
  ) => {
    setPending((current) => ({ ...current, [key]: value }));
    setStatus("idle");
    const turn = (latest.current[key] ?? 0) + 1;
    latest.current[key] = turn;
    const run = queue.current.then(async () => {
      try {
        await update.mutateAsync(patch);
        if (latest.current[key] === turn) setStatus("saved");
      } catch {
        if (latest.current[key] === turn) setStatus("error");
      } finally {
        if (latest.current[key] === turn) {
          setPending((current) => ({ ...current, [key]: undefined }));
        }
      }
    });
    queue.current = run;
    await run;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <SettingsCard
        title="Email"
        description="Receipts and account emails always arrive, whatever you choose here."
      >
        <PreferenceSwitch
          label="News and appeals"
          description="Stories, newsletters and the occasional appeal from the organization."
          checked={news}
          onCheckedChange={(checked) =>
            void save("news", checked, { doNotEmail: !checked })
          }
        />
      </SettingsCard>
      <SettingsCard
        title="Privacy"
        description="Your organization always sees your name, so it can send receipts."
      >
        <PreferenceSwitch
          label="Show my name to the missionaries I support"
          description="When this is off, they see “Anonymous partner” instead."
          checked={showName}
          onCheckedChange={(checked) =>
            void save("showName", checked, {
              givingPreferences: {
                ...givingPreferences,
                defaultAnonymousToRecipient: !checked,
              },
            })
          }
        />
      </SettingsCard>
      <p
        role={status === "error" ? "alert" : "status"}
        className={cn(
          "text-sm",
          status === "error" ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {status === "saved"
          ? "Saved."
          : status === "error"
            ? "Couldn’t save that change. Try again."
            : ""}
      </p>
    </motion.div>
  );
}

function SecurityTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <SettingsCard
        title="Password"
        description="Enter your current password to choose a new one."
      >
        <ChangePasswordForm />
      </SettingsCard>
      <SettingsCard
        title="Signed-in devices"
        description="Lost a phone or used a shared computer? Sign out everywhere except here."
      >
        <SignOutOtherSessions />
      </SettingsCard>
    </motion.div>
  );
}

export default function DonorSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  // Route VT owns the entrance when active; only animate on plain mounts.
  const withinRouteVt = useWithinViewTransitionRouteLayer();

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col gap-6 pb-20",
        !withinRouteVt && "animate-in fade-in duration-300",
      )}
    >
      <PageHeader
        title="Settings"
        description="Your details, email choices and sign-in security."
      />

      <SettingsLayout
        value={activeTab}
        onValueChange={(value) => {
          if (
            value === "profile" ||
            value === "email" ||
            value === "security"
          ) {
            setActiveTab(value);
          }
        }}
        ariaLabel="Settings sections"
        tabs={TABS.map((tab) => ({
          value: tab.id,
          label: tab.label,
          icon: <tab.icon aria-hidden="true" />,
        }))}
      >
        <SettingsRetryProvider>
          {/* Stays mounted while hidden, so unsaved edits survive a look at
              another tab. */}
          <TabsContent value="profile" keepMounted>
            <ProfileTab />
          </TabsContent>
          <TabsContent value="email" keepMounted>
            <EmailPrivacyTab />
          </TabsContent>
          <TabsContent value="security">
            {activeTab === "security" && <SecurityTab />}
          </TabsContent>
        </SettingsRetryProvider>
      </SettingsLayout>
    </div>
  );
}
