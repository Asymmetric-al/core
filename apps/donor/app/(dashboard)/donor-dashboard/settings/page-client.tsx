"use client";

import {
  buildDonorProfileSettingsPatch,
  buildProfileFormState,
  type DonorAddressFormState,
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
import { UnsavedChangesGuard } from "@asym/ui/components/primitives/unsaved-changes-guard";
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
  FieldLegend,
  FieldSet,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Switch } from "@asym/ui/components/shadcn/switch";
import { TabsContent } from "@asym/ui/components/shadcn/tabs";
import { cn } from "@asym/ui/lib/utils";
import { Loader2, Lock, Mail, UserRound } from "lucide-react";
import React, { useId, useState } from "react";

type TabId = "profile" | "email" | "security";

const TABS: Array<{ id: TabId; label: string; icon: React.ElementType }> = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "email", label: "Email & privacy", icon: Mail },
  { id: "security", label: "Security", icon: Lock },
];

const EMPTY_ADDRESS: DonorAddressFormState = {
  street: "",
  street2: "",
  city: "",
  state: "",
  zip: "",
  country: "",
};

type ProfileFormFields = {
  avatarUrl: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: DonorAddressFormState;
};

type TextField = Exclude<keyof ProfileFormFields, "address">;

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
            A square JPG or PNG works best.
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
  errorMessage,
  form,
  onFieldChange,
  onAddressChange,
  onSave,
  saving,
  success,
}: {
  errorMessage: string | null;
  form: ProfileFormFields;
  onFieldChange: (key: TextField, value: string) => void;
  onAddressChange: (key: keyof DonorAddressFormState, value: string) => void;
  onSave: () => void;
  saving: boolean;
  success: boolean;
}) {
  const address = form.address;
  const addressHintId = useId();
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
            disabled={saving}
            focusableWhenDisabled={saving}
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

        <FieldSet aria-describedby={addressHintId}>
          <FieldLegend>Mailing address</FieldLegend>
          <FieldDescription id={addressHintId}>
            Optional. Missionaries you support can use it to send you letters.
          </FieldDescription>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Field className="col-span-2">
              <FieldLabel htmlFor="settings-street-address">
                Street address
              </FieldLabel>
              <Input
                id="settings-street-address"
                autoComplete="address-line1"
                value={address.street}
                onChange={(event) =>
                  onAddressChange("street", event.target.value)
                }
              />
            </Field>
            <Field className="col-span-2">
              <FieldLabel htmlFor="settings-apartment-suite">
                Apartment, suite
              </FieldLabel>
              <Input
                id="settings-apartment-suite"
                autoComplete="address-line2"
                value={address.street2}
                onChange={(event) =>
                  onAddressChange("street2", event.target.value)
                }
              />
            </Field>
            <Field className="col-span-2 md:col-span-1">
              <FieldLabel htmlFor="settings-city">City</FieldLabel>
              <Input
                id="settings-city"
                autoComplete="address-level2"
                value={address.city}
                onChange={(event) =>
                  onAddressChange("city", event.target.value)
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="settings-state">State</FieldLabel>
              <Input
                id="settings-state"
                autoComplete="address-level1"
                value={address.state}
                onChange={(event) =>
                  onAddressChange("state", event.target.value)
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="settings-zip-code">ZIP code</FieldLabel>
              <Input
                id="settings-zip-code"
                autoComplete="postal-code"
                inputMode="numeric"
                value={address.zip}
                onChange={(event) => onAddressChange("zip", event.target.value)}
              />
            </Field>
            <Field className="col-span-2 md:col-span-1">
              <FieldLabel htmlFor="settings-country">Country</FieldLabel>
              <Input
                id="settings-country"
                autoComplete="country-name"
                value={address.country}
                onChange={(event) =>
                  onAddressChange("country", event.target.value)
                }
              />
            </Field>
          </div>
        </FieldSet>
      </FieldGroup>
    </SettingsCard>
  );
}

function ProfileTab() {
  const snapshot = useDonorPortalSnapshot();
  const update = useUpdateDonorPortal();

  const [form, setForm] = useState<ProfileFormFields>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatarUrl: "",
    address: EMPTY_ADDRESS,
  });
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Prefill once from the snapshot without overwriting edits in progress.
  if (!hydrated && snapshot.data) {
    setHydrated(true);
    setForm({
      ...buildProfileFormState({
        displayName: snapshot.data.profile.displayName,
        email: snapshot.data.profile.email,
        phone: snapshot.data.profile.phone,
        avatarUrl: snapshot.data.profile.avatarUrl,
      }),
      address: { ...EMPTY_ADDRESS, ...snapshot.data.donor?.address },
    });
  }

  const setField = (key: TextField, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    setSuccess(false);
    setErrorMessage(null);
  };
  const setAddressField = (key: keyof DonorAddressFormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [key]: value },
    }));
    setDirty(true);
    setSuccess(false);
    setErrorMessage(null);
  };

  const handleSave = async () => {
    setErrorMessage(null);
    const savePatch = buildDonorProfileSettingsPatch(form);
    if (!savePatch.ok) {
      setErrorMessage(savePatch.errorMessage);
      return;
    }
    try {
      await update.mutateAsync(savePatch.patch);
      setDirty(false);
      setSuccess(true);
    } catch {
      setErrorMessage("Couldn’t save your changes. Try again.");
    }
  };

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
      <UnsavedChangesGuard when={dirty} />
      <PhotoCard
        avatarUrl={form.avatarUrl}
        initials={initials}
        onAvatarUrlChange={(url) => setField("avatarUrl", url)}
      />
      <DetailsCard
        errorMessage={errorMessage}
        form={form}
        onFieldChange={setField}
        onAddressChange={setAddressField}
        onSave={() => {
          void handleSave();
        }}
        saving={update.isPending}
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

  if (snapshot.isLoading) return <TabLoading label="Loading email settings" />;
  if (snapshot.error || !snapshot.data) {
    return <TabError onRetry={() => snapshot.refetch()} />;
  }

  const donor = snapshot.data.donor;
  const givingPreferences = donor?.givingPreferences ?? {};
  const news = pending.news ?? !donor?.doNotEmail;
  const showName =
    pending.showName ?? givingPreferences.defaultAnonymousToRecipient !== true;

  const save = async (
    key: "news" | "showName",
    value: boolean,
    patch: Parameters<typeof update.mutateAsync>[0],
  ) => {
    setPending((current) => ({ ...current, [key]: value }));
    setStatus("idle");
    try {
      await update.mutateAsync(patch);
      setStatus("saved");
    } catch {
      setStatus("error");
    } finally {
      setPending((current) => ({ ...current, [key]: undefined }));
    }
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
        <TabsContent value="email">
          {activeTab === "email" && <EmailPrivacyTab />}
        </TabsContent>
        <TabsContent value="security">
          {activeTab === "security" && <SecurityTab />}
        </TabsContent>
      </SettingsLayout>
    </div>
  );
}
