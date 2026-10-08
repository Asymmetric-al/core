"use client";

import { siteConfig } from "@asym/config/site-client";
import { MISSIONARY_SETTINGS_HEADER_VT_NAME } from "@asym/lib/view-transitions";
import { PageHeader } from "@asym/ui/components/page-header";
import {
  NotificationPreferencesMatrix,
  SettingsCard,
} from "@asym/ui/components/settings";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import { Switch } from "@asym/ui/components/shadcn/switch";
import {
  Mail,
  Gift,
  RefreshCcw,
  AlertTriangle,
  CreditCard,
  Users,
  Save,
  ShieldCheck,
  Layout,
  ChevronRight,
  Globe,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import * as React from "react";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  inApp: boolean;
  email: boolean;
  sms: boolean;
}

const INITIAL_NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    id: "new_gift",
    label: "New Gift Received",
    description: "When someone gives to your fund",
    icon: Gift,
    inApp: true,
    email: true,
    sms: false,
  },
  {
    id: "recurring_started",
    label: "New Recurring Gift",
    description: "When someone starts a recurring donation",
    icon: RefreshCcw,
    inApp: true,
    email: true,
    sms: false,
  },
  {
    id: "recurring_failed",
    label: "Recurring Gift Failed",
    description: "When a payment fails or is declined",
    icon: AlertTriangle,
    inApp: true,
    email: true,
    sms: true,
  },
  {
    id: "card_expiring",
    label: "Card Expiring Soon",
    description: "When a donor's card is about to expire",
    icon: CreditCard,
    inApp: true,
    email: false,
    sms: false,
  },
  {
    id: "new_donor",
    label: "New Donor",
    description: "When someone gives for the first time",
    icon: Users,
    inApp: true,
    email: true,
    sms: false,
  },
  {
    id: "at_risk",
    label: "At-Risk Donor Alert",
    description: "When a donor becomes at-risk",
    icon: AlertTriangle,
    inApp: true,
    email: false,
    sms: false,
  },
];

const NOTIFICATION_CHANNELS = [
  { id: "inApp", label: "In-App" },
  { id: "email", label: "Email" },
  { id: "sms", label: "SMS" },
] as const;

export default function SettingsPage() {
  const [settings, setSettings] = React.useState(INITIAL_NOTIFICATION_SETTINGS);
  const [hasChanges, setHasChanges] = React.useState(false);
  const settingsId = React.useId();

  const handleSettingFieldChange = (
    id: string,
    channel: "inApp" | "email" | "sms",
    value: boolean,
  ) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [channel]: value } : s)),
    );
    setHasChanges(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        titleViewTransitionName={MISSIONARY_SETTINGS_HEADER_VT_NAME}
        description="Manage your account, notifications, and ministry preferences."
      >
        <Button
          disabled={!hasChanges}
          onClick={() => setHasChanges(false)}
          size="sm"
        >
          <Save aria-hidden data-icon="inline-start" />
          Save Preferences
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          <SettingsCard title="Account Security">
            <div className="flex flex-col gap-6">
              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <Field data-disabled>
                  <FieldLabel htmlFor={`${settingsId}-email`}>
                    Email Address
                  </FieldLabel>
                  <Input
                    id={`${settingsId}-email`}
                    value="sarah.mitchell@example.com"
                    disabled
                  />
                </Field>
                <Field>
                  <FieldTitle>Two-Factor Authentication</FieldTitle>
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 p-3">
                    <Badge variant="secondary">Active</Badge>
                    <Button variant="ghost" size="sm">
                      Configure
                    </Button>
                  </div>
                </Field>
              </FieldGroup>
              <div>
                <Button variant="outline">
                  <ShieldCheck aria-hidden data-icon="inline-start" />
                  Update Password
                </Button>
              </div>
            </div>
          </SettingsCard>

          <SettingsCard title="Notification Channels">
            <NotificationPreferencesMatrix
              caption="Notification channel preferences"
              channels={NOTIFICATION_CHANNELS}
              rows={settings.map((setting) => {
                const Icon = setting.icon;

                return {
                  id: setting.id,
                  title: setting.label,
                  description: setting.description,
                  icon: <Icon className="size-4" aria-hidden />,
                  controls: NOTIFICATION_CHANNELS.map((channel) => (
                    <Switch
                      key={channel.id}
                      id={`${settingsId}-${setting.id}-${channel.id}`}
                      aria-label={`${channel.label}: ${setting.label}`}
                      checked={setting[channel.id]}
                      onCheckedChange={(checked) =>
                        handleSettingFieldChange(
                          setting.id,
                          channel.id,
                          checked,
                        )
                      }
                    />
                  )),
                };
              })}
            />
          </SettingsCard>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-4">
          <SettingsCard
            title={
              <span className="flex items-center gap-2">
                <Globe className="size-4 text-muted-foreground" aria-hidden />
                Identity
              </span>
            }
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">
                  {siteConfig.name}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Access your public ministry home page and donor portal.
                </p>
              </div>
              <a
                href={siteConfig.url}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline" })}
              >
                Visit Website
                <ExternalLink aria-hidden data-icon="inline-end" />
              </a>
            </div>
          </SettingsCard>

          <SettingsCard
            title="Integrations"
            description="Connect your ministry tools."
          >
            <div className="flex flex-col gap-4">
              <div className="flex min-w-0 items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Mail className="size-4 text-muted-foreground" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Mailchimp</p>
                  <p className="text-xs text-muted-foreground">Connected</p>
                </div>
                <ChevronRight
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              </div>
              <div className="flex min-w-0 items-center gap-3 rounded-lg border border-dashed border-border p-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Layout
                    className="size-4 text-muted-foreground"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Zapier</p>
                  <p className="text-xs text-muted-foreground">Not Connected</p>
                </div>
                <Button variant="ghost" size="sm">
                  Link
                </Button>
              </div>
              <p className="border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
                Need a custom integration? Contact our support team for API
                access.
              </p>
            </div>
          </SettingsCard>

          <SettingsCard
            title={
              <span className="flex items-center gap-2">
                <Sparkles
                  className="size-4 text-muted-foreground"
                  aria-hidden
                />
                System Preferences
              </span>
            }
          >
            <FieldGroup>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor={`${settingsId}-developer`}>
                    Developer Mode
                  </FieldLabel>
                  <FieldDescription>Access advanced API tools</FieldDescription>
                </FieldContent>
                <Switch
                  id={`${settingsId}-developer`}
                  aria-label="Developer Mode"
                />
              </Field>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor={`${settingsId}-beta`}>
                    Beta Features
                  </FieldLabel>
                  <FieldDescription>Try new dashboard widgets</FieldDescription>
                </FieldContent>
                <Switch
                  id={`${settingsId}-beta`}
                  aria-label="Beta Features"
                  defaultChecked
                />
              </Field>
            </FieldGroup>
          </SettingsCard>
        </div>
      </div>
    </div>
  );
}
