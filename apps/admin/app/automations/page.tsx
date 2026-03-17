"use client";

import { motion } from "@asym/lib/motion";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@asym/ui/components/shadcn/card";
import { Input } from "@asym/ui/components/shadcn/input";
import { PageShell } from "@asym/ui/components/shadcn/page-shell";
import { cn } from "@asym/ui/lib/utils";
import {
  Zap,
  Link2,
  AlertTriangle,
  History,
  Play,
  CheckCircle,
  Plus,
  Search,
  MoreHorizontal,
  ArrowUpRight,
  Settings,
} from "lucide-react";
import React from "react";

interface AutomationFlow {
  name: string;
  trigger: string;
  app: string;
  status: "Active" | "Paused";
}

interface IntegrationConnection {
  name: string;
  status: "Operational" | "Issue Detected";
  icon: React.ComponentType<{ className?: string }>;
  iconContainerClassName: string;
}

const RECENT_FLOWS: AutomationFlow[] = [
  {
    name: "mobilize.advance-to-interview",
    trigger: "Stage Change",
    app: "Mobilize",
    status: "Active",
  },
  {
    name: "giving.send-thank-you",
    trigger: "New Gift",
    app: "Stripe",
    status: "Active",
  },
  {
    name: "care.alert-on-gap",
    trigger: "Inactivity",
    app: "Reports",
    status: "Active",
  },
  {
    name: "crm.sync-to-mailchimp",
    trigger: "New Contact",
    app: "CRM",
    status: "Paused",
  },
];

const INTEGRATION_CONNECTIONS: IntegrationConnection[] = [
  {
    name: "Stripe",
    status: "Operational",
    icon: Link2,
    iconContainerClassName: "bg-blue-50 text-blue-600 border border-blue-100",
  },
  {
    name: "Mailchimp",
    status: "Operational",
    icon: Link2,
    iconContainerClassName:
      "bg-amber-50 text-amber-600 border border-amber-100",
  },
  {
    name: "Slack",
    status: "Issue Detected",
    icon: AlertTriangle,
    iconContainerClassName: "bg-rose-50 text-rose-600 border border-rose-100",
  },
  {
    name: "Postmark",
    status: "Operational",
    icon: Link2,
    iconContainerClassName:
      "bg-emerald-50 text-emerald-600 border border-emerald-100",
  },
];

const STAT_CARDS = [
  {
    label: "Active Flows",
    value: "28",
    sub: "across 12 integrations",
    icon: Zap,
    iconClassName: "text-amber-500",
  },
  {
    label: "Executions (24h)",
    value: "1,247",
    sub: "99.2% success",
    icon: Play,
    iconClassName: "text-blue-600",
    hasCheck: true,
  },
  {
    label: "Connections",
    value: "12",
    sub: "all systems operational",
    icon: Link2,
    iconClassName: "text-indigo-600",
  },
  {
    label: "Failed Runs",
    value: "8",
    sub: "require manual review",
    icon: AlertTriangle,
    iconClassName: "text-rose-600",
    valueClassName: "text-rose-600",
  },
];

function AutomationStatsRow() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 text-left">
      {STAT_CARDS.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
        >
          <div className="rounded-2xl border border-zinc-100 bg-white shadow-sm p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                {stat.label}
              </span>
              <stat.icon className={cn("h-4 w-4", stat.iconClassName)} />
            </div>
            <div>
              <div
                className={cn(
                  "text-3xl font-black tabular-nums tracking-tight text-zinc-900",
                  stat.valueClassName,
                )}
              >
                {stat.value}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {stat.hasCheck && (
                  <CheckCircle className="h-3 w-3 text-emerald-600" />
                )}
                <span className="text-xs text-zinc-500">{stat.sub}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function RecentFlowsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="col-span-4 shadow-sm border-zinc-200">
        <CardHeader className="border-b border-zinc-50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">Recent Flows</CardTitle>
            <CardDescription className="text-xs">
              Your most active automation workflows.
            </CardDescription>
          </div>
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <Input
              placeholder="Filter flows..."
              className="pl-8 h-8 text-xs bg-zinc-50 border-none"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-50">
            {RECENT_FLOWS.map((flow) => (
              <div
                key={flow.name}
                className="flex items-center justify-between p-4 hover:bg-zinc-50/50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center border",
                      flow.status === "Active"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-zinc-50 text-zinc-400 border-zinc-100",
                    )}
                  >
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      {flow.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Trigger: {flow.trigger} • via {flow.app}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-bold h-5 shadow-none",
                      flow.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-zinc-100 text-zinc-500 border-zinc-200",
                    )}
                  >
                    {flow.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-400 group-hover:text-zinc-900"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <div className="p-3 border-t border-zinc-50 bg-zinc-50/30 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-zinc-500 hover:text-zinc-900 w-full h-8 group"
          >
            View All Flows{" "}
            <ArrowUpRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function IntegrationHealthCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
    >
      <Card className="col-span-3 shadow-sm border-zinc-200">
        <CardHeader className="border-b border-zinc-50">
          <CardTitle className="text-base font-bold">
            Integration Health
          </CardTitle>
          <CardDescription className="text-xs">
            Status of third-party platform connections.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {INTEGRATION_CONNECTIONS.map((conn) => (
            <div
              key={conn.name}
              className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-zinc-50/50"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center",
                    conn.iconContainerClassName,
                  )}
                >
                  <conn.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-zinc-700">
                  {conn.name}
                </span>
              </div>
              <Badge
                className={cn(
                  "text-[10px] font-bold h-5 shadow-none",
                  conn.status === "Operational"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200",
                )}
              >
                {conn.status}
              </Badge>
            </div>
          ))}
          <Button
            variant="outline"
            className="w-full h-11 px-4 rounded-xl border-zinc-200 hover:bg-zinc-50 font-bold uppercase tracking-widest text-[10px] text-zinc-600 gap-2 mt-2"
          >
            <Settings className="mr-2 h-3.5 w-3.5" /> Manage Connections
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AutomationBestPracticesCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="border-zinc-200 text-left">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400">
            Automation Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-600 space-y-2">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              Use{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-900">
                idempotency keys
              </code>{" "}
              on all create actions to prevent duplicates.
            </li>
            <li>
              Always prefix flow names by domain:{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-900">
                mobilize.
              </code>
              ,{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-900">
                giving.
              </code>
              , etc.
            </li>
            <li>Owners must subscribe to failure alerts via Slack or Email.</li>
            <li>
              Test flows in isolation before deploying to production streams.
            </li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AutomationsPage() {
  return (
    <PageShell
      title="Automations"
      description="Workflow automation and integration management."
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-11 px-4 rounded-xl border-zinc-200 hover:bg-zinc-50 font-bold uppercase tracking-widest text-[10px] gap-2"
          >
            <History className="h-4 w-4 text-zinc-400" /> History
          </Button>
          <Button className="h-11 px-6 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-zinc-200 gap-2">
            <Plus className="h-4 w-4" /> New Flow
          </Button>
        </div>
      }
    >
      <div className="space-y-8 animate-in fade-in duration-500">
        <AutomationStatsRow />

        <div className="grid gap-6 md:grid-cols-7 text-left">
          <RecentFlowsCard />
          <IntegrationHealthCard />
        </div>

        <AutomationBestPracticesCard />
      </div>
    </PageShell>
  );
}
