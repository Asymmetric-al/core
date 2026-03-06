"use client";

import { siteConfig } from "@asym/config/site-client";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  Check,
  ExternalLink,
  Globe,
  Info,
  Link as LinkIcon,
  Save,
  Shield,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface ConnectedService {
  connected: boolean;
  desc: string;
  name: string;
  readonly?: boolean;
}

interface AlertPreference {
  defaultChecked: boolean;
  desc: string;
  label: string;
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
      <h2 className="text-left font-black text-3xl text-zinc-900 tracking-tight">
        Care Settings
      </h2>
      <p className="mt-1 text-left font-medium text-zinc-500">
        Configure regional defaults and care workflow integrations.
      </p>
    </div>
  );
}

function RegionalLocalizationCard() {
  return (
    <Card className="overflow-hidden rounded-[2rem] border-zinc-200 shadow-sm">
      <CardHeader className="border-zinc-50 border-b bg-zinc-50/30">
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-zinc-400" />
          <div>
            <CardTitle className="font-bold text-lg text-zinc-900">
              Regional Localization
            </CardTitle>
            <CardDescription className="font-medium text-xs text-zinc-500">
              Define your default focus area and timezone.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 text-left">
            <Label
              className="px-1 font-black text-[10px] text-zinc-400 uppercase tracking-wider"
              htmlFor="region"
            >
              Default Region
            </Label>
            <Select defaultValue="se-asia">
              <SelectTrigger className="h-10 rounded-xl border-zinc-200">
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
              className="px-1 font-black text-[10px] text-zinc-400 uppercase tracking-wider"
              htmlFor="timezone"
            >
              My Timezone
            </Label>
            <Select defaultValue="utc-5">
              <SelectTrigger className="h-10 rounded-xl border-zinc-200">
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
    <Card className="overflow-hidden rounded-[2rem] border-zinc-200 shadow-sm">
      <CardHeader className="border-zinc-50 border-b bg-zinc-50/30">
        <div className="flex items-center gap-3">
          <LinkIcon className="h-5 w-5 text-zinc-400" />
          <div>
            <CardTitle className="font-bold text-lg text-zinc-900">
              Connected Services
            </CardTitle>
            <CardDescription className="font-medium text-xs text-zinc-500">
              Sync check-ins and appointments with external tools.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {CONNECTED_SERVICES.map((service) => (
          <div
            className="group flex items-center justify-between rounded-xl border border-zinc-100 bg-white p-4 transition-colors hover:border-zinc-200"
            key={service.name}
          >
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-zinc-900">
                  {service.name}
                </span>
                {service.connected && (
                  <Check className="h-3 w-3 text-zinc-900" />
                )}
              </div>
              <p className="font-medium text-xs text-zinc-400">
                {service.desc}
              </p>
            </div>
            {service.readonly ? (
              <Badge
                className="border-none bg-zinc-100 font-bold text-[10px] text-zinc-500 uppercase tracking-widest"
                variant="secondary"
              >
                System Link
              </Badge>
            ) : (
              <Button
                className={cn(
                  "h-8 rounded-lg px-4 font-black text-[10px] uppercase tracking-widest",
                  service.connected
                    ? "border-zinc-200 text-zinc-500 hover:text-zinc-900"
                    : "bg-zinc-900 text-white shadow-lg shadow-zinc-200/50 hover:bg-zinc-800"
                )}
                size="sm"
                variant={service.connected ? "outline" : "default"}
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
    <Card className="overflow-hidden rounded-[2rem] border-zinc-200 shadow-sm">
      <CardHeader className="border-zinc-50 border-b bg-zinc-50/30">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-zinc-400" />
          <div>
            <CardTitle className="font-bold text-lg text-zinc-900">
              Alert Preferences
            </CardTitle>
            <CardDescription className="font-medium text-xs text-zinc-500">
              Manage how you receive wellness and crisis updates.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {ALERT_PREFERENCES.map((pref) => (
          <div className="flex items-center justify-between" key={pref.label}>
            <div className="space-y-0.5 text-left">
              <Label className="font-bold text-sm text-zinc-900">
                {pref.label}
              </Label>
              <p className="font-medium text-xs text-zinc-400">{pref.desc}</p>
            </div>
            <Switch
              className="data-[state=checked]:bg-zinc-900"
              defaultChecked={pref.defaultChecked}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface SaveChangesCardProps {
  onSave: () => void;
  saving: boolean;
}

function SaveChangesCard({ saving, onSave }: SaveChangesCardProps) {
  return (
    <Card className="sticky top-6 overflow-hidden rounded-[2rem] border-zinc-900 bg-zinc-900 text-white shadow-2xl shadow-zinc-300/50">
      <CardContent className="space-y-6 p-8">
        <div className="space-y-2">
          <h3 className="font-black text-xl tracking-tight">Save Changes</h3>
          <p className="font-medium text-[10px] text-zinc-500 uppercase leading-relaxed tracking-widest">
            Update your global preferences. Changes apply immediately across the
            Member Care module.
          </p>
        </div>
        <Button
          className="h-12 w-full rounded-2xl bg-white font-black text-[10px] text-zinc-900 uppercase tracking-widest shadow-lg hover:bg-zinc-100"
          disabled={saving}
          onClick={onSave}
        >
          {saving ? (
            "Updating..."
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Update Settings
            </>
          )}
        </Button>
        <div className="flex items-start gap-3 border-zinc-800 border-t pt-6">
          <Shield className="h-4 w-4 shrink-0 text-zinc-500" />
          <p className="text-left font-medium text-[10px] text-zinc-500 leading-relaxed">
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
    <Card className="overflow-hidden rounded-[2rem] border-zinc-200 bg-white shadow-sm">
      <CardContent className="space-y-6 p-8">
        <div className="flex items-center gap-2 text-zinc-900">
          <Info className="h-4 w-4" />
          <h4 className="font-black text-[10px] uppercase tracking-widest">
            Module Info
          </h4>
        </div>
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-400">Active Module</span>
            <span className="font-bold text-zinc-900">Member Care</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-400">Status</span>
            <Badge className="h-5 border-none bg-zinc-100 px-2 font-bold text-[10px] text-zinc-900 uppercase tracking-widest">
              Active
            </Badge>
          </div>

          <div className="space-y-4 border-zinc-100 border-t pt-4">
            <div className="flex flex-col gap-1">
              <span className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                Tenant Website
              </span>
              <span className="font-bold text-xs text-zinc-900">
                {siteConfig.name}
              </span>
            </div>
            <Button
              asChild
              className="group h-10 w-full rounded-xl border-zinc-200 font-black text-[10px] text-zinc-900 uppercase tracking-widest"
              variant="outline"
            >
              <a
                href={siteConfig.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                Visit Home Page
                <ExternalLink className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings updated successfully");
    }, 1000);
  };

  return (
    <div className="fade-in animate-in space-y-8 p-6 pb-20 duration-500">
      <CareSettingsHeader />

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <RegionalLocalizationCard />
          <ConnectedServicesCard />
          <AlertPreferencesCard />
        </div>

        <div className="space-y-6 lg:col-span-4">
          <SaveChangesCard onSave={handleSave} saving={saving} />
          <ModuleInfoCard />
        </div>
      </div>
    </div>
  );
}
