"use client";

import { motion } from "@asym/lib/motion";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { cn } from "@asym/ui/lib/utils";
import { Inbox, Users, Tag, Zap, BookOpen, Clock, LifeBuoy } from "lucide-react";
import Link from "next/link";

const SUPPORT_STATS = [
  {
    label: "Open tickets",
    value: "24",
    context: "Awaiting response",
    icon: Inbox,
    className: "border-blue-200 bg-blue-50/50 text-blue-700",
  },
  {
    label: "Avg response time",
    value: "2.4h",
    context: "Inside current SLA",
    icon: Clock,
    className: "border-emerald-200 bg-emerald-50/50 text-emerald-700",
  },
  {
    label: "Resolved (7d)",
    value: "89",
    context: "Tickets closed",
    icon: LifeBuoy,
    className: "border-emerald-200 bg-emerald-50/50 text-emerald-700",
  },
  {
    label: "Escalated",
    value: "3",
    context: "Needs attention",
    icon: Clock,
    className: "border-rose-200 bg-rose-50/60 text-rose-700",
  },
] as const;

const SUPPORT_MODULES = [
  {
    icon: Inbox,
    title: "Inbox",
    desc: "Review new requests and keep first replies moving.",
    href: "#",
    btn: "Open Inbox",
  },
  {
    icon: Users,
    title: "Contacts",
    desc: "Linked CRM people, churches, and support history.",
    href: "#",
    btn: "View Contacts",
  },
  {
    icon: Tag,
    title: "Tags & Queues",
    desc: "Route finance, tech, member care, and escalations.",
    href: "#",
    btn: "Manage Tags",
  },
  {
    icon: Zap,
    title: "Macros",
    desc: "Saved replies for repeat questions and handoffs.",
    href: "#",
    btn: "View Macros",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    desc: "Internal answers, policies, and public doc links.",
    href: "#",
    btn: "Browse Docs",
  },
] as const;

export default function SupportHubPage() {
  return (
    <PageShell
      title="Support Hub"
      description="Manage donor, missionary, and staff requests through queues, macros, knowledge, and escalations."
    >
      <div className="space-y-5">
        {/* Stat cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {SUPPORT_STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                ease: [0.25, 0.1, 0.25, 1],
                delay: index * 0.05,
              }}
              className="rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-3xl font-black tabular-nums tracking-tight text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl border",
                    stat.className,
                  )}
                >
                  <stat.icon className="size-4" />
                </div>
              </div>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                {stat.context}
              </p>
            </motion.div>
          ))}
        </div>

        {/* SLA Warning card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.25,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.2,
          }}
        >
          <Card className="border-amber-200 bg-amber-50/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-amber-900">
                <Clock className="h-4 w-4 text-amber-600" /> SLA risk
              </CardTitle>
              <CardDescription className="text-amber-800/80">
                First-reply window is closing on active queue items.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-amber-950">
                2 tickets approaching first reply SLA. Review immediately.
              </p>
              <Link href="#">
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 rounded-xl border-amber-300 bg-white/80 text-sm font-semibold text-amber-950 hover:bg-white"
                >
                  View Urgent
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Module cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SUPPORT_MODULES.map((mod, index) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.25 + index * 0.05,
              }}
            >
              <Card className="group h-full cursor-pointer border-border/70 transition-[border-color,box-shadow] hover:border-primary/30 hover:shadow-md">
                <CardHeader className="gap-2 pb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <mod.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{mod.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {mod.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-1">
                  <Link href={mod.href}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-xl text-sm font-semibold"
                    >
                      {mod.btn}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Best Practices card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.25,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.5,
          }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <ul className="ml-2 list-inside list-disc space-y-1">
                <li>Triage to queues: finance, tech, member care</li>
                <li>Set clear SLAs: first reply, next reply, resolution</li>
                <li>
                  Convert long, repeat questions into public docs and link them
                  from Web Studio
                </li>
                <li>
                  Donation or account questions can open the gift drawer from
                  Contributions in a side panel
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageShell>
  );
}
