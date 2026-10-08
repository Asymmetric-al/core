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
import { ImageUpload } from "@asym/ui/components/primitives/image-upload";
import { SettingsCard, SettingsLayout } from "@asym/ui/components/settings";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@asym/ui/components/shadcn/input-group";
import { Label } from "@asym/ui/components/shadcn/label";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Switch } from "@asym/ui/components/shadcn/switch";
import { TabsContent } from "@asym/ui/components/shadcn/tabs";
import { cn } from "@asym/ui/lib/utils";
import {
  User,
  Bell,
  Shield,
  Mail,
  Phone,
  MapPin,
  Camera,
  Check,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Laptop,
  History,
  Receipt,
  Heart,
  Globe,
  AlertTriangle,
} from "lucide-react";
import React, { useId, useState } from "react";

// --- Types ---
type TabId = "profile" | "notifications" | "security";

interface SettingTab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const TABS: SettingTab[] = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

// --- Helper Components ---

const PasswordInput = ({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-foreground font-medium">
        {label}
      </Label>
      <InputGroup>
        <InputGroupInput
          id={id}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            size="icon-sm"
            onClick={() => setIsVisible(!isVisible)}
            aria-label={`${isVisible ? "Hide" : "Show"} ${label}`}
            aria-pressed={isVisible}
          >
            {isVisible ? (
              <EyeOff aria-hidden="true" />
            ) : (
              <Eye aria-hidden="true" />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};

// --- Tabs ---

const COMING_SOON = "Coming soon — not editable here yet.";

type ProfileFormFields = {
  avatarUrl: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

function ProfileTabLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading profile">
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}

function ProfileTabError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="text-left">
      <CardContent className="p-6 space-y-3">
        <p role="alert" className="text-sm font-medium text-destructive">
          We couldn&apos;t load your profile.
        </p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}

function ProfileAvatarCard({
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
      title="Public Avatar"
      description="Displayed on your profile and interactions."
    >
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <ImageUpload
          value={avatarUrl}
          onChange={onAvatarUrlChange}
          path="avatars"
          aspect={1}
          triggerAriaLabel="Upload public avatar"
        >
          <div className="relative group cursor-pointer">
            <Avatar className="size-20 border-4 border-background shadow-md ring-1 ring-border">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-foreground text-background text-2xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-media-scrim/60 rounded-full flex items-center justify-center   transition-opacity">
              <Camera className="text-media-foreground size-6" />
            </div>
          </div>
        </ImageUpload>
        <div className="flex flex-col gap-3 text-center sm:text-left">
          <div>
            <h3 className="font-semibold text-foreground tracking-tight">
              Profile Photo
            </h3>
            <p className="text-sm font-medium text-muted-foreground mt-1 ">
              JPG, GIF or PNG. Large files auto-optimized.
            </p>
          </div>
          <div className="flex gap-3 justify-center sm:justify-start">
            <ImageUpload
              value={avatarUrl}
              onChange={onAvatarUrlChange}
              path="avatars"
            >
              <Button variant="outline" size="sm">
                Upload New
              </Button>
            </ImageUpload>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAvatarUrlChange("")}
              className="text-destructive h-8 font-semibold hover:text-destructive rounded-lg px-4"
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

function ProfilePersonalInfoCard({
  errorMessage,
  form,
  onFieldChange,
  onSave,
  saving,
  success,
}: {
  errorMessage: string | null;
  form: ProfileFormFields;
  onFieldChange: (key: keyof ProfileFormFields, value: string) => void;
  onSave: () => void;
  saving: boolean;
  success: boolean;
}) {
  return (
    <SettingsCard
      title="Personal Information"
      description="Update your identity and contact details."
      footer={
        <div className="flex w-full flex-col-reverse sm:flex-row justify-between items-center gap-4">
          <p role="status" aria-atomic="true" className="sr-only">
            {saving ? "Saving profile…" : success ? "Profile saved." : ""}
          </p>
          <p
            role={errorMessage ? "alert" : undefined}
            className={cn(
              "text-sm font-medium ",
              errorMessage ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {errorMessage ?? "Changes sync to your giving record."}
          </p>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              onClick={onSave}
              disabled={saving}
              focusableWhenDisabled={saving}
              className={cn("min-w-30 w-full sm:w-auto")}
            >
              {saving ? (
                <Loader2 className="mr-2 size-3 animate-spin" />
              ) : success ? (
                <Check className="mr-2 size-3" />
              ) : null}
              {saving ? "Saving..." : success ? "Saved" : "Save Changes"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label
              htmlFor="firstName"
              className="text-sm font-medium text-muted-foreground"
            >
              First Name
            </Label>
            <Input
              id="firstName"
              autoComplete="given-name"
              value={form.firstName}
              onChange={(event) =>
                onFieldChange("firstName", event.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="lastName"
              className="text-sm font-medium text-muted-foreground"
            >
              Last Name
            </Label>
            <Input
              id="lastName"
              autoComplete="family-name"
              value={form.lastName}
              onChange={(event) =>
                onFieldChange("lastName", event.target.value)
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-muted-foreground"
            >
              Email Address
            </Label>
            <InputGroup>
              <InputGroupAddon>
                <Mail aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                autoComplete="email"
                type="email"
                value={form.email}
                disabled
                aria-describedby="email-note"
              />
            </InputGroup>
            <p id="email-note" className="text-xs text-muted-foreground">
              Contact support to change your email.
            </p>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-muted-foreground"
            >
              Phone Number
            </Label>
            <InputGroup>
              <InputGroupAddon>
                <Phone aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                id="phone"
                autoComplete="tel"
                type="tel"
                value={form.phone}
                onChange={(event) => onFieldChange("phone", event.target.value)}
              />
            </InputGroup>
          </div>
        </div>

        {/* Mailing address — not yet editable via the portal API. */}
        <fieldset
          disabled
          aria-describedby="address-note"
          className="space-y-4 pt-2 opacity-60"
        >
          <legend className="sr-only">Mailing address</legend>
          <div className="flex items-center gap-2">
            <Label
              htmlFor="address"
              className="text-sm font-medium text-muted-foreground"
            >
              Street Address
            </Label>
            <Badge variant="secondary">Coming soon</Badge>
          </div>
          <InputGroup>
            <InputGroupAddon>
              <MapPin aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              id="address"
              autoComplete="street-address"
              placeholder="123 Mission Way"
            />
          </InputGroup>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            <Input
              placeholder="City"
              autoComplete="address-level2"
              aria-label="City"
            />
            <Input
              placeholder="State"
              autoComplete="address-level1"
              aria-label="State"
            />
            <Input
              placeholder="Postal Code"
              autoComplete="postal-code"
              className="col-span-2 md:col-span-1"
              aria-label="Postal code"
            />
          </div>
          <p id="address-note" className="text-xs text-muted-foreground">
            {COMING_SOON}
          </p>
        </fieldset>
      </div>
    </SettingsCard>
  );
}

const ProfileTab = () => {
  const snapshot = useDonorPortalSnapshot();
  const update = useUpdateDonorPortal();

  const [form, setForm] = useState<ProfileFormFields>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatarUrl: "",
  });
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Prefill once from the live snapshot; don't clobber in-progress edits.
  // Set-state-during-render (React-recommended) instead of a synchronous
  // setState inside an effect, which the react-hooks rule flags for cascading
  // renders. Behaviour is identical: hydrate once when data first arrives.
  if (!hydrated && snapshot.data) {
    setHydrated(true);
    setForm(
      buildProfileFormState({
        displayName: snapshot.data.profile.displayName,
        email: snapshot.data.profile.email,
        phone: snapshot.data.profile.phone,
        avatarUrl: snapshot.data.profile.avatarUrl,
      }),
    );
  }

  const setField = (key: keyof ProfileFormFields, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      setErrorMessage("Couldn't save your changes.");
    }
  };

  if (snapshot.isLoading) {
    return <ProfileTabLoading />;
  }

  if (snapshot.error) {
    return <ProfileTabError onRetry={() => snapshot.refetch()} />;
  }

  const initials =
    `${form.firstName[0] ?? ""}${form.lastName[0] ?? ""}`.toUpperCase() || "··";
  const saving = update.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <ProfileAvatarCard
        avatarUrl={form.avatarUrl}
        initials={initials}
        onAvatarUrlChange={(url) => setField("avatarUrl", url)}
      />
      <ProfilePersonalInfoCard
        errorMessage={errorMessage}
        form={form}
        onFieldChange={setField}
        onSave={() => {
          void handleSave();
        }}
        saving={saving}
        success={success}
      />
    </motion.div>
  );
};

interface NotificationPreferences {
  receipts: boolean;
  monthlyStatement: boolean;
  fieldUpdates: boolean;
  videoStories: boolean;
  newsletters: boolean;
  emergencyAppeals: boolean;
  smsAlerts: boolean;
}

type NotificationPreferenceKey = keyof NotificationPreferences;

interface NotificationCategoryItem {
  key: NotificationPreferenceKey;
  label: string;
  desc: string;
  recommended?: boolean;
}

interface NotificationCategory {
  title: string;
  icon: React.ElementType;
  color: string;
  items: NotificationCategoryItem[];
}

const NotificationsTab = () => {
  const pendingActionLabelId = useId();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    receipts: true,
    monthlyStatement: true,
    fieldUpdates: true,
    videoStories: true,
    newsletters: false,
    emergencyAppeals: true,
    smsAlerts: false,
  });

  const handleToggle = (key: NotificationPreferenceKey) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    if (success) setSuccess(false);
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    }, 1200);
  };

  const categories: NotificationCategory[] = [
    {
      title: "Billing & Receipts",
      icon: Receipt,
      color: "text-info bg-info/10",
      items: [
        {
          key: "receipts",
          label: "Instant Donation Receipts",
          desc: "Email receipt after every donation.",
        },
        {
          key: "monthlyStatement",
          label: "Monthly Statements",
          desc: "Consolidated summary sent on the 1st.",
        },
      ],
    },
    {
      title: "Impact Updates",
      icon: Heart,
      color: "text-destructive bg-destructive/10",
      items: [
        {
          key: "fieldUpdates",
          label: "Field Partner Updates",
          desc: "Stories directly from the workers you support.",
          recommended: true,
        },
        {
          key: "videoStories",
          label: "Video Stories",
          desc: "Links to video messages and reports.",
        },
      ],
    },
    {
      title: "Organization",
      icon: Globe,
      color: "text-success bg-success/10",
      items: [
        {
          key: "newsletters",
          label: "Quarterly Newsletter",
          desc: "High-level vision and stats.",
        },
        {
          key: "emergencyAppeals",
          label: "Emergency Appeals",
          desc: "Notifications about urgent crises.",
        },
      ],
    },
  ];

  return (
    <SettingsCard
      title="Notification Preferences"
      description="Customize how you want to hear from us."
      footer={
        <div className="flex w-full flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm font-medium text-muted-foreground italic flex items-center gap-2 text-center sm:text-left">
            <AlertTriangle className="size-3 text-warning" />
            System alerts cannot be disabled.
          </p>
          <Button
            aria-labelledby={`${pendingActionLabelId}-20`}
            focusableWhenDisabled={loading}
            onClick={handleSave}
            disabled={loading || success}
            className="min-w-35 w-full sm:w-auto"
          >
            {loading ? (
              <Loader2 className="mr-2 size-3 animate-spin" />
            ) : success ? (
              <Check className="mr-2 size-3" />
            ) : null}
            <span id={`${pendingActionLabelId}-20`}>
              {loading
                ? "Saving..."
                : success
                  ? "Changes Saved"
                  : "Save Preferences"}
            </span>
          </Button>
        </div>
      }
    >
      <div className="divide-y divide-border">
        {categories.map((category) => (
          <div key={category.title} className="py-6 first:pt-0 last:pb-0">
            <div className="flex flex-col md:flex-row md:gap-12 gap-6">
              <div className="md:w-48 shrink-0 flex items-start gap-3">
                <div className={cn("p-2 rounded-lg shrink-0", category.color)}>
                  <category.icon className="size-4" />
                </div>
                <h3 className="text-sm font-medium text-foreground mt-1.5">
                  {category.title}
                </h3>
              </div>

              <div className="flex-1 space-y-6">
                {category.items.map((item) => (
                  <Field key={item.key} orientation="horizontal">
                    <FieldContent>
                      <div className="flex items-center gap-2">
                        <FieldLabel htmlFor={item.key}>{item.label}</FieldLabel>
                        {item.recommended && (
                          <Badge variant="secondary">Recommended</Badge>
                        )}
                      </div>
                      <FieldDescription id={`${item.key}-description`}>
                        {item.desc}
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id={item.key}
                      aria-describedby={`${item.key}-description`}
                      checked={preferences[item.key]}
                      onCheckedChange={() => handleToggle(item.key)}
                    />
                  </Field>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
};

const SecurityTab = () => {
  const pendingActionLabelId = useId();

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password Strength Logic
  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[!@#$%^&*]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    return score;
  };

  const strengthScore = getStrength(passwords.new);
  const strengthColor =
    strengthScore < 2
      ? "bg-destructive"
      : strengthScore < 4
        ? "bg-warning"
        : "bg-success";
  const widthPercent = Math.min((strengthScore / 4) * 100, 100);

  const handleUpdate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      setPasswords({ current: "", new: "", confirm: "" });
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 max-w-4xl text-left"
    >
      {/* 1. Login & Password Card */}
      <SettingsCard
        title={
          <span className="flex items-center gap-2">
            <Lock className="size-4" aria-hidden="true" />
            Login &amp; Password
          </span>
        }
        description="Manage your password to keep your account secure."
        footer={
          <div className="w-full flex justify-end">
            <Button
              aria-labelledby={`${pendingActionLabelId}-21`}
              focusableWhenDisabled={loading}
              onClick={handleUpdate}
              disabled={
                loading ||
                strengthScore < 3 ||
                passwords.new !== passwords.confirm
              }
              className="min-w-35 w-full sm:w-auto"
            >
              {loading ? (
                <Loader2 className="mr-2 size-3 animate-spin" />
              ) : success ? (
                <Check className="mr-2 size-3" />
              ) : null}
              <span id={`${pendingActionLabelId}-21`}>
                {loading
                  ? "Updating..."
                  : success
                    ? "Password Updated"
                    : "Update Password"}
              </span>
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {/* Left Col: Current Password */}
          <div className="space-y-6">
            <PasswordInput
              id="current"
              label="Current Password"
              value={passwords.current}
              onChange={(e) =>
                setPasswords({ ...passwords, current: e.target.value })
              }
              placeholder="Enter current password"
            />

            <div className="bg-background rounded-xl p-4 border border-border shadow-inner">
              <div className="flex gap-3">
                <div className="p-1.5 bg-card rounded-lg shadow-sm text-foreground border border-border h-fit">
                  <History className="size-3.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-foreground">
                    Forgot your password?
                  </h4>
                  <Button variant="link">Reset via Email</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: New Password */}
          <div className="space-y-5">
            <PasswordInput
              id="new"
              label="New Password"
              value={passwords.new}
              onChange={(e) =>
                setPasswords({ ...passwords, new: e.target.value })
              }
              placeholder="Enter new password"
            />

            {/* Strength Meter */}
            <div className="space-y-1.5">
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                {/* Animate transform: scaleX (GPU, no layout) instead of width */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: Math.min(widthPercent, 100) / 100 }}
                  className={cn(
                    "h-full w-full origin-left transition-colors",
                    strengthColor,
                  )}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Strength
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {strengthScore >= 4
                    ? "Strong"
                    : strengthScore >= 2
                      ? "Medium"
                      : "Weak"}
                </span>
              </div>
            </div>

            <PasswordInput
              id="confirm"
              label="Confirm New Password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
              placeholder="Confirm new password"
            />
          </div>
        </div>
      </SettingsCard>

      {/* 2. Additional Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SettingsCard
          title={
            <span className="flex items-center gap-2">
              <Shield className="size-4" aria-hidden="true" />
              Two-Factor Auth
            </span>
          }
          footer={
            <div className="w-full">
              <Button variant="outline" className="w-full">
                Configure 2FA
              </Button>
            </div>
          }
        >
          <p className="text-sm font-medium tracking-tight text-muted-foreground leading-relaxed mb-4">
            Secure your account by requiring a verification code when signing
            in.
          </p>
          <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border shadow-inner">
            <span className="text-sm font-medium text-foreground">Status</span>
            <Badge variant="outline">Disabled</Badge>
          </div>
        </SettingsCard>

        <SettingsCard
          title={
            <span className="flex items-center gap-2">
              <Laptop className="size-4" aria-hidden="true" />
              Active Sessions
            </span>
          }
          footer={
            <div className="w-full">
              <Button variant="ghost" className="w-full">
                Sign out other devices
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg text-muted-foreground border border-border">
                <Laptop className="size-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground tracking-tight">
                  Macbook Pro
                </p>
                <p className="text-sm font-medium text-muted-foreground ">
                  San Francisco • Active now
                </p>
              </div>
              <div className="size-2 bg-success rounded-full animate-pulse shadow-sm" />
            </div>
          </div>
        </SettingsCard>
      </div>
    </motion.div>
  );
};

export default function DonorSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  // Route VT owns the entrance when active; only animate on plain mounts.
  const withinRouteVt = useWithinViewTransitionRouteLayer();

  return (
    <div
      className={cn(
        "max-w-5xl mx-auto space-y-8 pb-20 pt-4 text-left",
        !withinRouteVt && "animate-in fade-in duration-300",
      )}
    >
      {/* Header */}
      <div className="space-y-1.5 px-1 text-left">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight ">
          Settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your profile and preferences.
        </p>
      </div>

      <SettingsLayout
        value={activeTab}
        onValueChange={(value) => {
          if (
            value === "profile" ||
            value === "notifications" ||
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
        <TabsContent value="profile">
          {activeTab === "profile" && <ProfileTab />}
        </TabsContent>
        <TabsContent value="notifications">
          {activeTab === "notifications" && <NotificationsTab />}
        </TabsContent>
        <TabsContent value="security">
          {activeTab === "security" && <SecurityTab />}
        </TabsContent>
      </SettingsLayout>
    </div>
  );
}
