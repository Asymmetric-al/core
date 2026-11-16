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
import React, { useEffect, useId, useRef, useState } from "react";

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

function responseStatus(error: unknown): number | null {
  return error instanceof Error &&
    "status" in error &&
    typeof error.status === "number"
    ? error.status
    : null;
}

function TabLoading({ label }: { label: string }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label={label}>
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}

function TabError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-6">
        <p role="alert" className="text-sm font-medium text-destructive">
          We couldn’t load your settings.
        </p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}

function PhotoCard({
  avatarUrl,
  initials,
  onAvatarUrlChange,
}: {
  avatarUrl: string;
  initials: string;
  onAvatarUrlChange: (url: string) => void;
}) {
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
            >
              <Button variant="outline" size="sm">
                {avatarUrl ? "Change photo" : "Upload photo"}
              </Button>
            </ImageUpload>
            {avatarUrl ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAvatarUrlChange("")}
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
  onFieldChange,
  onSave,
  saving,
  success,
}: {
  canWrite: boolean;
  errorMessage: string | null;
  form: ProfileFormFields;
  onFieldChange: (key: TextField, value: string) => void;
  onSave: () => void;
  saving: boolean;
  success: boolean;
}) {
  return (
    <SettingsCard
      title="Your details"
      description="Your name and contact details on your giving record."
      footer={
        <div className="flex w-full flex-col-reverse items-center justify-between gap-3 sm:flex-row">
          <p role="status" aria-atomic="true" className="sr-only">
            {saving ? "Saving…" : success ? "Saved." : ""}
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
          <Button
            onClick={onSave}
            disabled={saving || !canWrite}
            focusableWhenDisabled={saving || !canWrite}
          >
            {saving ? (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            ) : null}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      }
    >
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="settings-first-name">First name</FieldLabel>
            <Input
              id="settings-first-name"
              autoComplete="given-name"
              value={form.firstName}
              onChange={(event) =>
                onFieldChange("firstName", event.target.value)
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="settings-last-name">Last name</FieldLabel>
            <Input
              id="settings-last-name"
              autoComplete="family-name"
              value={form.lastName}
              onChange={(event) =>
                onFieldChange("lastName", event.target.value)
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="settings-phone">Phone</FieldLabel>
            <Input
              id="settings-phone"
              type="tel"
              autoComplete="tel"
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
  );
}

function ProfileTab() {
  const snapshot = useDonorPortalSnapshot();
  const update = useUpdateDonorPortal();

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
  };
  const handleSave = async () => {
    if (!retained.canWrite || retained.isSaving || update.isPending) return;
    setErrorMessage(null);
    const savePatch = buildDonorProfileSettingsPatch(form);
    if (!savePatch.ok) {
      setErrorMessage(savePatch.errorMessage);
      return;
    }
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
  if (snapshot.isLoading) return <TabLoading label="Loading profile" />;
  if (snapshot.error) return <TabError onRetry={() => snapshot.refetch()} />;

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
        initials={initials}
        onAvatarUrlChange={(url) => setField("avatarUrl", url)}
      />
      <DetailsCard
        canWrite={retained.canWrite}
        errorMessage={errorMessage}
        form={form}
        onFieldChange={setField}
        onSave={() => {
          void handleSave();
        }}
        saving={update.isPending || retained.isSaving}
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

  if (snapshot.isLoading) return <TabLoading label="Loading email settings" />;
  if (snapshot.error || !snapshot.data) {
    return <TabError onRetry={() => snapshot.refetch()} />;
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
      </SettingsLayout>
    </div>
  );
}
