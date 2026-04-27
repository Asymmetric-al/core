"use client";

import { motion } from "@asym/lib/motion";
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
  return (
    <PageShell
      title="Administration"
      description="Global system configuration and security oversight."
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-11 px-4 rounded-xl border-zinc-200 hover:bg-zinc-50 font-bold uppercase tracking-widest text-[10px] gap-2"
          >
            <Activity className="h-4 w-4 text-zinc-600" /> Audit Logs
          </Button>
          <Button className="h-11 px-6 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-zinc-200 gap-2">
            <Shield className="h-4 w-4" /> Security Scan
          </Button>
        </div>
      }
    >
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Admin Modules */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link href={item.href} className="group block">
                <Card className="h-full overflow-hidden border border-zinc-100 bg-white shadow-sm hover-lift hover:border-zinc-200 hover:shadow-lg hover:shadow-zinc-200/50">
                  <CardHeader className="pb-4">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition-colors group-hover:bg-zinc-600 group-hover:text-white">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg font-bold text-zinc-900 group-hover:text-zinc-700 transition-colors text-left">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm text-zinc-500 mt-1.5 text-left">
                      {item.desc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center text-sm font-semibold text-zinc-600 group-hover:text-zinc-900 transition-colors mt-auto">
                      {item.action}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Service Status and Best Practices */}
        <div className="grid gap-6 md:grid-cols-2 text-left">
          <Card className="rounded-2xl border border-zinc-100 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-zinc-900">
                Service Operational Status
              </CardTitle>
              <CardDescription className="text-zinc-500">
                Real-time health check of primary integrations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    className="bg-zinc-100 text-zinc-700 hover:bg-zinc-100 border-zinc-200 shadow-none"
                  >
                    <div className="mr-1.5 h-1.5 w-1.5 rounded-full bg-zinc-500 animate-pulse" />
                    {service.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-zinc-100 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-zinc-900">
                Security Best Practices
              </CardTitle>
              <CardDescription className="text-zinc-500">
                Essential security measures for administrators.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl bg-zinc-50/50 border border-zinc-100 p-4 space-y-3">
                {SECURITY_TIPS.map((tip) => (
                  <div key={tip.id} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 shadow-sm">
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
