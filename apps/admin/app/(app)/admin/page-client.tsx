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
  Bot,
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
    title: "Eve Governance",
    desc: "Observe Eve's release gate, emergency state, and policy readiness.",
    icon: Bot,
    href: "/mc/admin/eve",
    action: "View Eve Status",
  },
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
    id: "separate-development",
    order: 4,
    text: "Maintain separate development environments for testing.",
  },
];

export default function AdminPage() {
  // Route VT owns the entrance when active; only animate on plain mounts.
  const withinRouteVt = useWithinViewTransitionRouteLayer();
  const unavailableActionsDescriptionId = React.useId();

  return (
    <PageShell
      title="Administration"
      description="Global system configuration and security oversight."
      density="compact"
      actions={
        <>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled
              aria-describedby={unavailableActionsDescriptionId}
            >
              <Activity
                className="size-4 text-muted-foreground"
                data-icon="inline-start"
              />{" "}
              Audit Logs
            </Button>
            <Button disabled aria-describedby={unavailableActionsDescriptionId}>
              <Shield className="size-4" data-icon="inline-start" /> Security
              Scan
            </Button>
          </div>
          <p
            id={unavailableActionsDescriptionId}
            className="basis-full text-xs text-muted-foreground"
          >
            Audit logs and security scans are not available from this page.
          </p>
        </>
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
              <Link
                href={item.href}
                className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Card className="h-full overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <item.icon className="size-5" />
                    </div>
                    <CardTitle className="text-base font-bold text-foreground transition-colors group-hover:text-muted-foreground text-left">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm text-muted-foreground mt-1 text-left">
                      {item.desc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors mt-auto">
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-foreground">
                Service Operational Status
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Integration status preview. Live health checks are not
                connected.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {SERVICES.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                >
                  <span className="text-sm font-medium text-muted-foreground">
                    {service.name}
                  </span>
                  <Badge variant="success">
                    <div className="mr-1.5 size-1.5 rounded-full bg-success" />
                    {service.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-foreground">
                Security Best Practices
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Essential security measures for administrators.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl bg-muted/30 border border-border p-4 space-y-3">
                {SECURITY_TIPS.map((tip) => (
                  <div key={tip.id} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm">
                      <span className="text-xs font-bold">{tip.order}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {tip.text}
                    </span>
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
