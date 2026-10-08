"use client";

import { siteConfig } from "@asym/config/site-client";
import { useWithinViewTransitionRouteLayer } from "@asym/lib/view-transitions";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@asym/ui/components/shadcn/card";
import { Label } from "@asym/ui/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { Switch } from "@asym/ui/components/shadcn/switch";
import { cn } from "@asym/ui/lib/utils";
import {
  Bell,
  Globe,
  Link as LinkIcon,
  Shield,
  Save,
  Info,
  Check,
  ExternalLink,
} from "lucide-react";
import React, { useId } from "react";
import { toast } from "sonner";

interface ConnectedService {
  name: string;
  desc: string;
  connected: boolean;
  readonly?: boolean;
}

interface AlertPreference {
  label: string;
  desc: string;
  defaultChecked: boolean;
}

const CONNECTED_SERVICES: ConnectedService[] = [
  {
    name: "Google Calendar",
    desc: "Sync scheduled check-ins to your work calendar.",
    connected: true,
  },
  {
    name: "Cal.com",
    desc: "Allow personnel to book care slots automatically.",
    connected: false,
  },
  {
    name: "Global Database",
    desc: "Import and sync financial data signals.",
    connected: true,
    readonly: true,
  },
];

const ALERT_PREFERENCES: AlertPreference[] = [
  {
    label: "Email Summaries",
    desc: "Weekly digest of personnel status changes.",
    defaultChecked: true,
  },
  {
    label: "Crisis Push Alerts",
    desc: "Immediate mobile notification for Crisis status.",
    defaultChecked: true,
  },
  {
    label: "Care Gap Reminders",
    desc: "Alert when personnel haven't checked in for 30d.",
    defaultChecked: false,
  },
];

function RegionalLocalizationCard() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <Globe className="size-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Regional Localization
            </CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground">
              Define your default focus area and timezone.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 text-left">
            <Label
              htmlFor="region"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1"
            >
              Default Region
            </Label>
            <Select
              items={[
                { value: "africa", label: "Africa" },
                { value: "se-asia", label: "SE Asia" },
                { value: "europe", label: "Europe" },
                { value: "latin-america", label: "Latin America" },
              ]}
              defaultValue="se-asia"
            >
              <SelectTrigger id="region">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="africa">Africa</SelectItem>
                <SelectItem value="se-asia">SE Asia</SelectItem>
                <SelectItem value="europe">Europe</SelectItem>
                <SelectItem value="latin-america">Latin America</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 text-left">
            <Label
              htmlFor="timezone"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1"
            >
              My Timezone
            </Label>
            <Select
              items={[
                { value: "utc-8", label: "Pacific Time (PT)" },
                { value: "utc-5", label: "Eastern Time (ET)" },
                { value: "utc-0", label: "London (GMT)" },
                { value: "utc+7", label: "Bangkok (ICT)" },
              ]}
              defaultValue="utc-5"
            >
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="utc-8">Pacific Time (PT)</SelectItem>
                <SelectItem value="utc-5">Eastern Time (ET)</SelectItem>
                <SelectItem value="utc-0">London (GMT)</SelectItem>
                <SelectItem value="utc+7">Bangkok (ICT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConnectedServicesCard() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <LinkIcon className="size-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Connected Services
            </CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground">
              Sync check-ins and appointments with external tools.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {CONNECTED_SERVICES.map((service) => (
          <div
            key={service.name}
            className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card group hover:border-border transition-colors"
          >
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {service.name}
                </span>
                {service.connected && (
                  <Check className="size-3 text-foreground" />
                )}
              </div>
              <p className="text-xs font-medium text-muted-foreground">
                {service.desc}
              </p>
            </div>
            {service.readonly ? (
              <Badge variant="secondary">System Link</Badge>
            ) : (
              <Button
                variant={service.connected ? "outline" : "default"}
                size="sm"
              >
                {service.connected ? "Disconnect" : "Connect"}
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AlertPreferencesCard() {
  const preferenceId = React.useId();
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <Bell className="size-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Alert Preferences
            </CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground">
              Manage how you receive wellness and crisis updates.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {ALERT_PREFERENCES.map((pref) => (
          <div
            key={pref.label}
            className="flex items-center justify-between gap-4"
          >
            <div className="space-y-0.5 text-left">
              <Label
                htmlFor={`${preferenceId}-${pref.label.replace(/\W+/g, "-")}`}
                className="text-sm font-semibold text-foreground"
              >
                {pref.label}
              </Label>
              <p className="text-xs font-medium text-muted-foreground">
                {pref.desc}
              </p>
            </div>
            <Switch
              id={`${preferenceId}-${pref.label.replace(/\W+/g, "-")}`}
              aria-label={pref.label}
              defaultChecked={pref.defaultChecked}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface SaveChangesCardProps {
  saving: boolean;
  onSave: () => void;
}

function SaveChangesCard({ saving, onSave }: SaveChangesCardProps) {
  const pendingActionLabelId = useId();

  return (
    <Card className="sticky top-6 overflow-hidden">
      <CardContent className="p-6 space-y-5">
        <div className="space-y-2">
          <h3 className="font-semibold text-xl tracking-tight">Save Changes</h3>
          <p className="text-xs font-medium text-muted-foreground leading-relaxed">
            Update your global preferences. Changes apply immediately across the
            Member Care module.
          </p>
        </div>
        <Button
          aria-labelledby={`${pendingActionLabelId}-0`}
          focusableWhenDisabled={saving}
          onClick={onSave}
          disabled={saving}
          className="w-full"
        >
          <span id={`${pendingActionLabelId}-0`} className="sr-only">
            {saving ? "Updating..." : "Update Settings"}
          </span>
          {saving ? (
            "Updating..."
          ) : (
            <>
              <Save className="mr-2 size-4" /> Update Settings
            </>
          )}
        </Button>
        <div className="pt-5 border-t border-border flex items-start gap-3">
          <Shield className="size-4 text-muted-foreground shrink-0" />
          <p className="text-xs font-medium text-muted-foreground text-left leading-relaxed">
            Your data access is restricted to authorized personnel records.
            Pastoral notes are stored securely.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ModuleInfoCard() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-2 text-foreground">
          <Info className="size-4" />
          <h4 className="text-sm font-semibold">Module Info</h4>
        </div>
        <div className="space-y-4 text-left">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-medium">
              Active Module
            </span>
            <span className="font-semibold text-foreground">Member Care</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-medium">Status</span>
            <Badge variant="success">Active</Badge>
          </div>

          <div className="pt-4 border-t border-border space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted-foreground">
                Tenant Website
              </span>
              <span className="text-xs font-semibold text-foreground">
                {siteConfig.name}
              </span>
            </div>
            <a
              href={siteConfig.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({
                  variant: "outline",
                  className: "group w-full",
                }),
              )}
            >
              Visit Home Page
              <ExternalLink className="ml-2 size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CareSettingsPage() {
  const [saving, setSaving] = React.useState(false);
  // Route VT owns the entrance when active; only animate on plain mounts.
  const withinRouteVt = useWithinViewTransitionRouteLayer();

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings updated successfully");
    }, 1000);
  };

  return (
    <PageShell
      title="Care Settings"
      description="Configure regional defaults and care workflow integrations."
      density="compact"
    >
      <div
        className={cn(
          "grid gap-6 lg:grid-cols-12",
          !withinRouteVt && "animate-in fade-in duration-300",
        )}
      >
        <div className="lg:col-span-8 space-y-6">
          <RegionalLocalizationCard />
          <ConnectedServicesCard />
          <AlertPreferencesCard />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <SaveChangesCard saving={saving} onSave={handleSave} />
          <ModuleInfoCard />
        </div>
      </div>
    </PageShell>
  );
}
