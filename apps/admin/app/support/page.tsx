"use client";

import { motion } from "@asym/lib/motion";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { PageShell } from "@asym/ui/components/shadcn/page-shell";
import { Inbox, Users, Tag, Zap, BookOpen, Clock } from "lucide-react";
import Link from "next/link";

export default function SupportHubPage() {
  return (
    <PageShell
      title="Support Hub"
      description="View and respond to tickets, manage contacts, and track SLAs."
    >
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Open Tickets", value: "24", sub: "awaiting response" },
            {
              label: "Avg Response Time",
              value: "2.4h",
              sub: "within SLA",
              subClass: "text-zinc-600",
            },
            { label: "Resolved (7d)", value: "89", sub: "tickets closed" },
            { label: "Escalated", value: "3", sub: "needs attention" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                ease: [0.25, 0.1, 0.25, 1],
                delay: index * 0.05,
              }}
              className="rounded-2xl border border-zinc-100 bg-white shadow-sm px-6 py-4"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                {stat.label}
              </span>
              <p className="text-3xl font-black tabular-nums tracking-tight text-zinc-900 mt-1">
                {stat.value}
              </p>
              <p
                className={
                  stat.subClass
                    ? `text-xs ${stat.subClass} mt-1`
                    : "text-xs text-muted-foreground mt-1"
                }
              >
                {stat.sub}
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
          <Card className="border-zinc-200 bg-zinc-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-zinc-700">
                <Clock className="h-4 w-4" /> SLA Breach Warning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-700">
                2 tickets approaching first reply SLA. Review immediately.
              </p>
              <Link href="#">
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                >
                  View Urgent
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Module cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Inbox,
              title: "Inbox",
              desc: "View and respond to tickets",
              href: "#",
              btn: "Open Inbox",
            },
            {
              icon: Users,
              title: "Contacts",
              desc: "Linked CRM people and churches",
              href: "#",
              btn: "View Contacts",
            },
            {
              icon: Tag,
              title: "Tags & Queues",
              desc: "Finance, tech, member care",
              href: "#",
              btn: "Manage Tags",
            },
            {
              icon: Zap,
              title: "Macros",
              desc: "Saved replies with merge variables",
              href: "#",
              btn: "View Macros",
            },
            {
              icon: BookOpen,
              title: "Knowledge Base",
              desc: "Internal docs and FAQs",
              href: "#",
              btn: "Browse Docs",
            },
          ].map((mod, index) => (
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
              <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
                <CardHeader className="pb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                    <mod.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{mod.title}</CardTitle>
                  <CardDescription>{mod.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={mod.href}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-xl font-bold uppercase tracking-widest text-[10px]"
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
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <ul className="list-disc list-inside space-y-1 ml-2">
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
