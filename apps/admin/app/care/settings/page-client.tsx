"use client";

import { siteConfig } from "@asym/config/site-client";
import { useWithinViewTransitionRouteLayer } from "@asym/lib/view-transitions";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
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
import React from "react";
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

function CareSettingsHeader() {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 text-left">
        Care Settings
      </h2>
      <p className="text-zinc-600 mt-1 text-sm font-medium text-left">
        Configure regional defaults and care workflow integrations.
      </p>
    </div>
  );
}

function RegionalLocalizationCard() {
  return (
    <Card className="border-zinc-200 shadow-sm overflow-hidden rounded-[2rem]">
      <CardHeader className="border-b border-zinc-50 bg-zinc-50/30">
        <div className="flex items-center gap-3">
          <Globe className="size-5 text-zinc-400" />
          <div>
            <CardTitle className="text-lg font-semibold text-zinc-900">
              Regional Localization
            </CardTitle>
            <CardDescription className="text-xs font-medium text-zinc-500">
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
              className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-1"
            >
              Default Region
            </Label>
            <Select defaultValue="se-asia">
              <SelectTrigger className="h-10 border-zinc-200 rounded-xl">
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
              className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-1"
            >
              My Timezone
            </Label>
            <Select defaultValue="utc-5">
              <SelectTrigger className="h-10 border-zinc-200 rounded-xl">
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
    <Card className="border-zinc-200 shadow-sm overflow-hidden rounded-[2rem]">
      <CardHeader className="border-b border-zinc-50 bg-zinc-50/30">
        <div className="flex items-center gap-3">
          <LinkIcon className="size-5 text-zinc-400" />
          <div>
            <CardTitle className="text-lg font-semibold text-zinc-900">
              Connected Services
            </CardTitle>
            <CardDescription className="text-xs font-medium text-zinc-500">
              Sync check-ins and appointments with external tools.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {CONNECTED_SERVICES.map((service) => (
          <div
            key={service.name}
            className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-white group hover:border-zinc-200 transition-colors"
          >
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-900">
                  {service.name}
                </span>
                {service.connected && (
                  <Check className="size-3 text-zinc-900" />
                )}
              </div>
              <p className="text-xs font-medium text-zinc-400">
                {service.desc}
              </p>
            </div>
            {service.readonly ? (
              <Badge
                variant="secondary"
                className="text-[10px] font-semibold uppercase tracking-widest bg-zinc-100 text-zinc-500 border-none"
              >
                System Link
              </Badge>
            ) : (
              <Button
                variant={service.connected ? "outline" : "default"}
                size="sm"
                className={cn(
                  "h-8 text-[10px] font-semibold uppercase tracking-widest px-4 rounded-lg",
                  service.connected
                    ? "border-zinc-200 text-zinc-500 hover:text-zinc-900"
                    : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-200/50",
                )}
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
  return (
    <Card className="border-zinc-200 shadow-sm overflow-hidden rounded-[2rem]">
      <CardHeader className="border-b border-zinc-50 bg-zinc-50/30">
        <div className="flex items-center gap-3">
          <Bell className="size-5 text-zinc-400" />
          <div>
            <CardTitle className="text-lg font-semibold text-zinc-900">
              Alert Preferences
            </CardTitle>
            <CardDescription className="text-xs font-medium text-zinc-500">
              Manage how you receive wellness and crisis updates.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {ALERT_PREFERENCES.map((pref) => (
          <div key={pref.label} className="flex items-center justify-between">
            <div className="space-y-0.5 text-left">
              <Label className="text-sm font-semibold text-zinc-900">
                {pref.label}
              </Label>
              <p className="text-xs font-medium text-zinc-400">{pref.desc}</p>
            </div>
            <Switch
              defaultChecked={pref.defaultChecked}
              className="data-[state=checked]:bg-zinc-900"
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
  return (
    <Card className="border-zinc-900 bg-zinc-900 text-white shadow-xl shadow-zinc-300/40 overflow-hidden rounded-2xl sticky top-6">
      <CardContent className="p-6 space-y-5">
        <div className="space-y-2">
          <h3 className="font-semibold text-xl tracking-tight">Save Changes</h3>
          <p className="text-xs font-medium text-zinc-300 leading-relaxed">
            Update your global preferences. Changes apply immediately across the
            Member Care module.
          </p>
        </div>
        <Button
          onClick={onSave}
          disabled={saving}
          className="w-full bg-white text-zinc-900 hover:bg-zinc-100 font-semibold h-10 shadow-lg rounded-xl"
        >
          {saving ? (
            "Updating..."
          ) : (
            <>
              <Save className="mr-2 size-4" /> Update Settings
            </>
          )}
        </Button>
        <div className="pt-5 border-t border-zinc-800 flex items-start gap-3">
          <Shield className="size-4 text-zinc-300 shrink-0" />
          <p className="text-xs font-medium text-zinc-300 text-left leading-relaxed">
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
    <Card className="border-zinc-200 bg-white shadow-sm overflow-hidden rounded-2xl">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-2 text-zinc-900">
          <Info className="size-4" />
          <h4 className="text-sm font-semibold">Module Info</h4>
        </div>
        <div className="space-y-4 text-left">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400 font-medium">Active Module</span>
            <span className="font-semibold text-zinc-900">Member Care</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-medium">Status</span>
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 h-5 font-semibold shadow-none">
              Active
            </Badge>
          </div>

          <div className="pt-4 border-t border-zinc-100 space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-zinc-500">
                Tenant Website
              </span>
              <span className="text-xs font-semibold text-zinc-900">
                {siteConfig.name}
              </span>
            </div>
            <Button
              variant="outline"
              className="w-full h-10 rounded-xl border-zinc-200 text-sm font-semibold text-zinc-900 group"
              asChild
            >
              <a
                href={siteConfig.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Home Page
                <ExternalLink className="ml-2 size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </Button>
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
    <div
      className={cn(
        "p-6 space-y-6 pb-20",
        !withinRouteVt && "animate-in fade-in duration-300",
      )}
    >
      <CareSettingsHeader />

      <div className="grid gap-6 lg:grid-cols-12">
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
    </div>
  );
}
