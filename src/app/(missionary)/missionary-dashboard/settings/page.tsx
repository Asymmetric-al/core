"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import {
  Bell,
  Mail,
  Smartphone,
  Gift,
  RefreshCcw,
  AlertTriangle,
  CreditCard,
  Users,
  MessageCircle,
  Heart,
  Settings as SettingsIcon,
  Save,
  ShieldCheck,
  Layout,
  ChevronRight,
  Globe,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

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

function NotificationRow({
  setting,
  onChange,
}: {
  setting: NotificationSetting;
  onChange: (
    id: string,
    channel: "inApp" | "email" | "sms",
    value: boolean,
  ) => void;
}) {
  const Icon = setting.icon;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-6 group border-b border-zinc-50 last:border-0">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-2xl bg-zinc-50 flex items-center justify-center shrink-0 border border-zinc-100 group-hover:bg-white transition-colors">
          <Icon className="h-5 w-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm tracking-tight text-zinc-900 leading-none">
            {setting.label}
          </p>
          <p className="text-xs font-medium text-zinc-400 mt-1.5">
            {setting.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 sm:gap-10 pl-14 sm:pl-0">
        <div className="flex flex-col items-center gap-2">
          <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-300">
            In-App
          </Label>
          <Switch
            checked={setting.inApp}
            onCheckedChange={(checked) =>
              onChange(setting.id, "inApp", checked)
            }
            className="data-[state=checked]:bg-zinc-900"
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-300">
            Email
          </Label>
          <Switch
            checked={setting.email}
            onCheckedChange={(checked) =>
              onChange(setting.id, "email", checked)
            }
            className="data-[state=checked]:bg-zinc-900"
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-300">
            SMS
          </Label>
          <Switch
            checked={setting.sms}
            onCheckedChange={(checked) => onChange(setting.id, "sms", checked)}
            className="data-[state=checked]:bg-zinc-900"
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
    value: boolean,
  ) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [channel]: value } : s)),
    );
    setHasChanges(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Settings"
        description="Manage your account, notifications, and ministry preferences."
      >
        <Button
          disabled={!hasChanges}
          onClick={() => setHasChanges(false)}
          size="sm"
          className="h-9 px-4 text-xs font-medium disabled:opacity-50"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Preferences
        </Button>
      </PageHeader>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-10">
          <Card className="border-zinc-200 bg-white shadow-sm overflow-hidden rounded-[2.5rem]">
            <CardHeader className="border-b border-zinc-50 bg-zinc-50/30 px-8 py-6">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
                    Email Address
                  </Label>
                  <Input
                    value="sarah.mitchell@example.com"
                    disabled
                    className="h-12 rounded-xl border-zinc-100 bg-zinc-50/50 text-zinc-500 font-bold text-sm"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
                    Two-Factor Authentication
                  </Label>
                  <div className="flex items-center justify-between h-12 px-4 rounded-xl border border-zinc-100 bg-zinc-50/50">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-zinc-900" />
                      <span className="text-xs font-bold text-zinc-900">
                        Active
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-900 hover:bg-white"
                    >
                      Configure
                    </Button>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <Button
                  variant="outline"
                  className="h-11 rounded-2xl border-zinc-200 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-all"
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 bg-white shadow-sm overflow-hidden rounded-[2.5rem]">
            <CardHeader className="border-b border-zinc-50 bg-zinc-50/30 px-8 py-6">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Notification Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-2">
                {settings.map((setting) => (
                  <NotificationRow
                    key={setting.id}
                    setting={setting}
                    onChange={handleChange}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="border-zinc-200 bg-white shadow-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="pt-8 px-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-zinc-50 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-zinc-400" />
                </div>
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Identity
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-zinc-900">
                  {siteConfig.name}
                </p>
                <p className="text-[10px] font-medium text-zinc-500 leading-relaxed">
                  Access your public ministry home page and donor portal.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full h-11 rounded-2xl border-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-900 group"
                asChild
              >
                <a
                  href={siteConfig.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Website
                  <ExternalLink className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none bg-zinc-900 text-white shadow-2xl shadow-zinc-300/50 rounded-[2rem] overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
              <Layout className="h-32 w-32" />
            </div>
            <CardHeader className="pt-8 px-8 relative z-10">
              <CardTitle className="text-2xl font-black tracking-tight">
                Integrations
              </CardTitle>
              <CardDescription className="text-zinc-500 font-medium">
                Connect your ministry tools.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-2 space-y-4 relative z-10">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center">
                    <Mail className="h-5 w-5 text-zinc-900" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black">Mailchimp</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest transition-colors group-hover:text-white">
                      Connected
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors" />
              </div>

              <div className="p-5 bg-white/5 rounded-2xl border border-dashed border-white/20 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4 opacity-50">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Layout className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black">Zapier</span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      Not Connected
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10"
                >
                  Link
                </Button>
              </div>

              <div className="pt-6 border-t border-white/5">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                  Need a custom integration? Contact our support team for API
                  access.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 bg-white shadow-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="pt-8 px-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-violet-50 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-violet-600" />
                </div>
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  System Preferences
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-zinc-900">
                    Developer Mode
                  </p>
                  <p className="text-[10px] font-medium text-zinc-400">
                    Access advanced API tools
                  </p>
                </div>
                <Switch className="data-[state=checked]:bg-zinc-900" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-zinc-900">
                    Beta Features
                  </p>
                  <p className="text-[10px] font-medium text-zinc-400">
                    Try new dashboard widgets
                  </p>
                </div>
                <Switch
                  defaultChecked
                  className="data-[state=checked]:bg-zinc-900"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
