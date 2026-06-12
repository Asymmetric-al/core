"use client";

import { motion } from "@asym/lib/motion";
import { useWithinViewTransitionRouteLayer } from "@asym/lib/view-transitions";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@asym/ui/components/shadcn/card";
import { cn } from "@asym/ui/lib/utils";
import {
  Shield,
  Globe,
  Key,
  Sparkles,
  Download,
  Activity,
  ArrowRight,
  Lock,
  Users,
} from "lucide-react";
import Link from "next/link";
import React from "react";

const MODULES = [
  {
    title: "Teams & Users",
    desc: "Manage organizational units, member invites, and global permissions.",
    icon: Users,
    href: "/mc/admin/teams",
    action: "Manage Teams",
  },
  {
    title: "Domains & Certificates",
    desc: "Configure custom domains for Web Studio, Email, and Callbacks.",
    icon: Globe,
    href: "/mc/admin/domains",
    action: "Manage Domains",
  },
  {
    title: "API Keys & Secrets",
    desc: "Securely manage integration credentials and service tokens.",
    icon: Key,
    href: "/mc/admin/keys",
    action: "View Keys",
  },
  {
    title: "AI Model Settings",
    desc: "Configure LLM providers, API keys, and model parameters.",
    icon: Sparkles,
    href: "/mc/admin/ai",
    action: "Configure AI",
  },
  {
    title: "Data Exports",
    desc: "Schedule and manage periodic data dumps for audit or backup.",
    icon: Download,
    href: "/mc/admin/exports",
    action: "View Exports",
  },
  {
    title: "Security & Auth",
    desc: "Configure MFA, session policies, and SSO integrations.",
    icon: Lock,
    href: "/mc/admin/security",
    action: "Security Settings",
  },
];

const SERVICES = [
  { name: "Supabase Database", status: "Operational" },
  { name: "Stripe Payments", status: "Operational" },
  { name: "Postmark Email", status: "Operational" },
  { name: "Cloud Deployment", status: "Operational" },
];

const SECURITY_TIPS = [
  {
    id: "rotate-api-keys",
    order: 1,
    text: "Rotate API keys and service tokens quarterly.",
  },
  {
    id: "enforce-mfa",
    order: 2,
    text: "Enforce MFA for all user accounts with MC access.",
  },
  {
    id: "review-audit-logs",
    order: 3,
    text: "Review audit logs weekly for unusual access patterns.",
  },
  {
    id: "separate-staging",
    order: 4,
    text: "Maintain separate staging environments for testing.",
  },
];

export default function AdminPage() {
  // Route VT owns the entrance when active; only animate on plain mounts.
  const withinRouteVt = useWithinViewTransitionRouteLayer();

  return (
    <PageShell
      title="Administration"
      description="Global system configuration and security oversight."
      density="compact"
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-10 rounded-xl border-zinc-200 px-4 text-sm font-semibold hover:bg-zinc-50"
          >
            <Activity className="size-4 text-zinc-600" /> Audit Logs
          </Button>
          <Button className="h-10 rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800">
            <Shield className="size-4" /> Security Scan
          </Button>
        </div>
      }
    >
      <div
        className={cn(
          "space-y-6",
          !withinRouteVt && "animate-in fade-in duration-300",
        )}
      >
        {/* Admin Modules */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((item, i) => (
            <motion.div
              key={item.title}
              initial={withinRouteVt ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link href={item.href} className="group block">
                <Card className="h-full overflow-hidden border border-zinc-100 bg-white shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-zinc-200 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 transition-colors group-hover:bg-zinc-900 group-hover:text-white">
                      <item.icon className="size-5" />
                    </div>
                    <CardTitle className="text-base font-bold text-zinc-900 transition-colors group-hover:text-zinc-700 text-left">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm text-zinc-600 mt-1 text-left">
                      {item.desc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center text-sm font-semibold text-zinc-600 group-hover:text-zinc-900 transition-colors mt-auto">
                      {item.action}
                      <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Service Status and Best Practices */}
        <div className="grid gap-4 md:grid-cols-2 text-left">
          <Card className="rounded-2xl border border-zinc-100 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-zinc-900">
                Service Operational Status
              </CardTitle>
              <CardDescription className="text-zinc-600">
                Real-time health check of primary integrations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {SERVICES.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/50 p-3"
                >
                  <span className="text-sm font-medium text-zinc-700">
                    {service.name}
                  </span>
                  <Badge
                    variant="secondary"
                    className="border-emerald-200 bg-emerald-50 text-emerald-700 shadow-none hover:bg-emerald-50"
                  >
                    <div className="mr-1.5 size-1.5 rounded-full bg-emerald-500" />
                    {service.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-zinc-100 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-zinc-900">
                Security Best Practices
              </CardTitle>
              <CardDescription className="text-zinc-600">
                Essential security measures for administrators.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl bg-zinc-50/50 border border-zinc-100 p-4 space-y-3">
                {SECURITY_TIPS.map((tip) => (
                  <div key={tip.id} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 shadow-sm">
                      <span className="text-[10px] font-bold">{tip.order}</span>
                    </div>
                    <span className="text-sm text-zinc-600">{tip.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
