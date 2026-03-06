"use client";

import { siteConfig } from "@asym/config/site-client";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { Switch } from "@asym/ui/components/shadcn/switch";
import {
  AlertTriangle,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Gift,
  Globe,
  Layout,
  Mail,
  RefreshCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import * as React from "react";

import { PageHeader } from "@/components/page-header";

interface NotificationSetting {
  description: string;
  email: boolean;
  icon: React.ElementType;
  id: string;
  inApp: boolean;
  label: string;
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

function NotificationRow({
  setting,
  onChange,
}: {
  setting: NotificationSetting;
  onChange: (
    id: string,
    channel: "inApp" | "email" | "sms",
    value: boolean
  ) => void;
}) {
  const Icon = setting.icon;
  return (
    <div className="group flex flex-col justify-between gap-6 border-zinc-50 border-b py-6 last:border-0 sm:flex-row sm:items-center">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 transition-colors group-hover:bg-white">
          <Icon className="h-5 w-5 text-zinc-400 transition-colors group-hover:text-zinc-900" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm text-zinc-900 leading-none tracking-tight">
            {setting.label}
          </p>
          <p className="mt-1.5 font-medium text-xs text-zinc-400">
            {setting.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 pl-14 sm:gap-10 sm:pl-0">
        <div className="flex flex-col items-center gap-2">
          <Label className="font-black text-[9px] text-zinc-300 uppercase tracking-widest">
            In-App
          </Label>
          <Switch
            checked={setting.inApp}
            className="data-[state=checked]:bg-zinc-900"
            onCheckedChange={(checked) =>
              onChange(setting.id, "inApp", checked)
            }
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Label className="font-black text-[9px] text-zinc-300 uppercase tracking-widest">
            Email
          </Label>
          <Switch
            checked={setting.email}
            className="data-[state=checked]:bg-zinc-900"
            onCheckedChange={(checked) =>
              onChange(setting.id, "email", checked)
            }
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Label className="font-black text-[9px] text-zinc-300 uppercase tracking-widest">
            SMS
          </Label>
          <Switch
            checked={setting.sms}
            className="data-[state=checked]:bg-zinc-900"
            onCheckedChange={(checked) => onChange(setting.id, "sms", checked)}
          />
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = React.useState(INITIAL_NOTIFICATION_SETTINGS);
  const [hasChanges, setHasChanges] = React.useState(false);

  const handleChange = (
    id: string,
    channel: "inApp" | "email" | "sms",
    value: boolean
  ) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [channel]: value } : s))
    );
    setHasChanges(true);
  };

  return (
    <div className="fade-in animate-in space-y-6 duration-500">
      <PageHeader
        description="Manage your account, notifications, and ministry preferences."
        title="Settings"
      >
        <Button
          className="h-9 px-4 font-medium text-xs disabled:opacity-50"
          disabled={!hasChanges}
          onClick={() => setHasChanges(false)}
          size="sm"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Preferences
        </Button>
      </PageHeader>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-8">
          <Card className="overflow-hidden rounded-[2.5rem] border-zinc-200 bg-white shadow-sm">
            <CardHeader className="border-zinc-50 border-b bg-zinc-50/30 px-8 py-6">
              <CardTitle className="font-black text-[10px] text-zinc-400 uppercase tracking-[0.2em]">
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-2.5">
                  <Label className="px-1 font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                    Email Address
                  </Label>
                  <Input
                    className="h-12 rounded-xl border-zinc-100 bg-zinc-50/50 font-bold text-sm text-zinc-500"
                    disabled
                    value="sarah.mitchell@example.com"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="px-1 font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                    Two-Factor Authentication
                  </Label>
                  <div className="flex h-12 items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-zinc-900" />
                      <span className="font-bold text-xs text-zinc-900">
                        Active
                      </span>
                    </div>
                    <Button
                      className="h-8 rounded-lg font-black text-[10px] text-zinc-900 uppercase tracking-widest hover:bg-white"
                      size="sm"
                      variant="ghost"
                    >
                      Configure
                    </Button>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <Button
                  className="h-11 rounded-2xl border-zinc-200 px-6 font-black text-[10px] text-zinc-500 uppercase tracking-widest transition-all hover:text-zinc-900"
                  variant="outline"
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-[2.5rem] border-zinc-200 bg-white shadow-sm">
            <CardHeader className="border-zinc-50 border-b bg-zinc-50/30 px-8 py-6">
              <CardTitle className="font-black text-[10px] text-zinc-400 uppercase tracking-[0.2em]">
                Notification Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-2">
                {settings.map((setting) => (
                  <NotificationRow
                    key={setting.id}
                    onChange={handleChange}
                    setting={setting}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8 lg:col-span-4">
          <Card className="overflow-hidden rounded-[2rem] border-zinc-200 bg-white shadow-sm">
            <CardHeader className="px-8 pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-50">
                  <Globe className="h-5 w-5 text-zinc-400" />
                </div>
                <CardTitle className="font-black text-[10px] text-zinc-400 uppercase tracking-[0.2em]">
                  Identity
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-8 pb-8">
              <div className="flex flex-col gap-1">
                <p className="font-bold text-sm text-zinc-900">
                  {siteConfig.name}
                </p>
                <p className="font-medium text-[10px] text-zinc-500 leading-relaxed">
                  Access your public ministry home page and donor portal.
                </p>
              </div>
              <Button
                asChild
                className="group h-11 w-full rounded-2xl border-zinc-200 font-black text-[10px] text-zinc-900 uppercase tracking-widest"
                variant="outline"
              >
                <a
                  href={siteConfig.url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Visit Website
                  <ExternalLink className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden rounded-[2rem] border-none bg-zinc-900 text-white shadow-2xl shadow-zinc-300/50">
            <div className="absolute top-0 right-0 p-8 opacity-10 transition-all duration-700 group-hover:rotate-12 group-hover:scale-110">
              <Layout className="h-32 w-32" />
            </div>
            <CardHeader className="relative z-10 px-8 pt-8">
              <CardTitle className="font-black text-2xl tracking-tight">
                Integrations
              </CardTitle>
              <CardDescription className="font-medium text-zinc-500">
                Connect your ministry tools.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4 px-8 pt-2 pb-8">
              <div className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:bg-white/10">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                    <Mail className="h-5 w-5 text-zinc-900" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-sm">Mailchimp</span>
                    <span className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest transition-colors group-hover:text-white">
                      Connected
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-white" />
              </div>

              <div className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/20 border-dashed bg-white/5 p-5 transition-all hover:bg-white/10">
                <div className="flex items-center gap-4 opacity-50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Layout className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-sm">Zapier</span>
                    <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-widest">
                      Not Connected
                    </span>
                  </div>
                </div>
                <Button
                  className="h-8 rounded-lg font-black text-[10px] text-white uppercase tracking-widest hover:bg-white/10"
                  size="sm"
                  variant="ghost"
                >
                  Link
                </Button>
              </div>

              <div className="border-white/5 border-t pt-6">
                <p className="font-bold text-[10px] text-zinc-500 uppercase leading-relaxed tracking-widest">
                  Need a custom integration? Contact our support team for API
                  access.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-[2rem] border-zinc-200 bg-white shadow-sm">
            <CardHeader className="px-8 pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50">
                  <Sparkles className="h-5 w-5 text-violet-600" />
                </div>
                <CardTitle className="font-black text-[10px] text-zinc-400 uppercase tracking-[0.2em]">
                  System Preferences
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-bold text-sm text-zinc-900">
                    Developer Mode
                  </p>
                  <p className="font-medium text-[10px] text-zinc-400">
                    Access advanced API tools
                  </p>
                </div>
                <Switch className="data-[state=checked]:bg-zinc-900" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-bold text-sm text-zinc-900">
                    Beta Features
                  </p>
                  <p className="font-medium text-[10px] text-zinc-400">
                    Try new dashboard widgets
                  </p>
                </div>
                <Switch
                  className="data-[state=checked]:bg-zinc-900"
                  defaultChecked
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
