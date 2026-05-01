"use client";

import { SafeHtml } from "@asym/lib/components/safe-html";
import { motion, AnimatePresence } from "@asym/lib/motion";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@asym/ui/components/shadcn/card";
import {
  TrendingUp,
  DollarSign,
  Repeat,
  Activity,
  Loader2,
  FileText,
  Library,
  X,
  ClipboardList,
} from "lucide-react";
import dynamic from "next/dynamic";
import React, { useState } from "react";

// --- Mock Data ---

const DONATION_DATA = [
  { month: "Jan", amount: 240000 },
  { month: "Feb", amount: 139800 },
  { month: "Mar", amount: 980000 },
  { month: "Apr", amount: 390800 },
  { month: "May", amount: 480000 },
  { month: "Jun", amount: 380000 },
  { month: "Jul", amount: 430000 },
  { month: "Aug", amount: 530000 },
  { month: "Sep", amount: 480000 },
  { month: "Oct", amount: 610000 },
  { month: "Nov", amount: 720000 },
  { month: "Dec", amount: 840000 },
];

const _DONOR_TYPE_DATA = [
  { name: "Recurring", value: 45 },
  { name: "One-Time", value: 55 },
];

const ENGAGEMENT_DATA = [
  { month: "Jun", new: 120, retained: 1400, lapsed: 50 },
  { month: "Jul", new: 150, retained: 1380, lapsed: 80 },
  { month: "Aug", new: 220, retained: 1450, lapsed: 40 },
  { month: "Sep", new: 180, retained: 1550, lapsed: 60 },
  { month: "Oct", new: 250, retained: 1600, lapsed: 30 },
  { month: "Nov", new: 300, retained: 1750, lapsed: 50 },
];

const ReportsCharts = dynamic(
  () => import("./reports-charts").then((mod) => mod.ReportsCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 text-left">
        <Card className="col-span-4 border-zinc-100 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Giving Trends
            </CardTitle>
            <CardDescription className="text-xs">
              Monthly volume across all regions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] animate-pulse rounded-xl bg-zinc-100" />
          </CardContent>
        </Card>
        <Card className="col-span-3 border-zinc-100 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Donor Engagement
            </CardTitle>
            <CardDescription className="text-xs">
              Retention velocity (6 Month).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] animate-pulse rounded-xl bg-zinc-100" />
          </CardContent>
        </Card>
      </div>
    ),
  },
);

export default function MissionControlReports() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  const generateReport = async () => {
    setIsGenerating(true);
    setReport(null);
    await new Promise((r) => setTimeout(r, 1500));
    setReport(`
### 📊 Performance Summary
*   **Revenue Growth:** Org-wide revenue has peaked in Q4, showing a 25% MoM increase driven by year-end giving.
*   **Donor Retention:** Consolidated retention rates are solid at 88.4%.
*   **Actionable Item:** The Clean Water Initiative is at 83% of its annual goal. A targeted follow-up with previous supporters could close the remaining $2.5M gap by Dec 31.
    `);
    setIsGenerating(false);
  };

  return (
    <PageShell
      title="Reports"
      description="Financial and operational insights for the organization."
      density="compact"
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-10 rounded-xl border-zinc-200 px-4 text-sm font-semibold hover:bg-zinc-50"
          >
            <Library className="size-4" />
            Report Library
          </Button>
          <Button
            onClick={generateReport}
            disabled={isGenerating}
            className="h-10 rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white shadow-md shadow-zinc-200 hover:bg-zinc-800"
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ClipboardList className="size-4" />
            )}
            {isGenerating ? "Summarizing..." : "Quick Summary"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* AI Summary */}
        <AnimatePresence>
          {report && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="overflow-hidden"
            >
              <Card className="border-none bg-zinc-900 text-white shadow-2xl relative overflow-hidden rounded-3xl">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
                <CardHeader className="p-6 pb-3 relative z-10">
                  <CardTitle className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
                    <FileText className="size-4 text-emerald-400" /> Executive
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 relative z-10">
                  <SafeHtml
                    className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed font-medium"
                    html={report.replace(/\n/g, "<br/>")}
                  />
                </CardContent>
                <div className="absolute top-4 right-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setReport(null)}
                    aria-label="Dismiss report summary"
                    className="h-9 w-9 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* KPI Cards — neutral, consistent */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Global Revenue",
              value: "$26.4M",
              context: "Across all regions",
              icon: DollarSign,
            },
            {
              label: "Avg Contribution",
              value: "$420",
              context: "Per recorded gift",
              icon: TrendingUp,
            },
            {
              label: "Retention Rate",
              value: "88.4%",
              context: "Six month donor retention",
              icon: Activity,
            },
            {
              label: "Recurring Mix",
              value: "45%",
              context: "Recurring share of giving",
              icon: Repeat,
            },
          ].map((kpi, index) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                ease: [0.25, 0.1, 0.25, 1],
                delay: index * 0.05,
              }}
            >
              <div className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-100 bg-white px-5 py-4 shadow-sm">
                <div className="flex min-w-0 flex-col">
                  <span className="text-3xl font-black tabular-nums tracking-tight text-zinc-900">
                    {kpi.value}
                  </span>
                  <span className="mt-0.5 text-sm font-semibold text-zinc-800">
                    {kpi.label}
                  </span>
                  <span className="mt-1 text-xs font-medium text-zinc-500">
                    {kpi.context}
                  </span>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                  <kpi.icon className="size-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <ReportsCharts
          donationData={DONATION_DATA}
          engagementData={ENGAGEMENT_DATA}
        />
      </div>
    </PageShell>
  );
}
