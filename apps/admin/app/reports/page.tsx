"use client";

import { SafeHtml } from "@asym/lib/components/safe-html";
import { motion, AnimatePresence } from "@asym/lib/motion";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@asym/ui/components/shadcn/card";
import { PageShell } from "@asym/ui/components/shadcn/page-shell";
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

const _COLORS = ["#0f172a", "#3b82f6"];

const ReportsCharts = dynamic(
  () => import("./reports-charts").then((mod) => mod.ReportsCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 text-left">
        <Card className="col-span-4 border-zinc-100 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider">
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
            <CardTitle className="text-sm font-bold uppercase tracking-wider">
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
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-11 px-4 rounded-xl border-zinc-200 hover:bg-zinc-50 transition-all font-bold uppercase tracking-widest text-[10px] gap-2"
          >
            <Library className="size-4" />
            Report Library
          </Button>
          <Button
            onClick={generateReport}
            disabled={isGenerating}
            className="h-11 px-6 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-zinc-200 gap-2"
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
      <div className="space-y-10">
        {/* AI Summary */}
        <AnimatePresence>
          {report && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="overflow-hidden"
            >
              <Card className="border-none bg-zinc-900 text-white shadow-2xl relative overflow-hidden rounded-[2.5rem]">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
                <CardHeader className="p-10 pb-4 relative z-10">
                  <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] flex items-center gap-3">
                    <FileText className="size-4 text-emerald-400" /> Executive
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 pt-0 relative z-10">
                  <SafeHtml
                    className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed font-bold tracking-tight text-lg"
                    html={report.replace(/\n/g, "<br/>")}
                  />
                </CardContent>
                <div className="absolute top-8 right-8">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setReport(null)}
                    className="h-10 w-10 text-zinc-600 hover:text-white hover:bg-white/10 rounded-full transition-all"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* KPI Cards — neutral, consistent */}
        <div className="flex flex-wrap gap-4">
          {[
            {
              label: "Global Revenue",
              value: "$26.4M",
              trend: "+20.1%",
              icon: DollarSign,
            },
            {
              label: "Avg Contribution",
              value: "$420",
              trend: "+4%",
              icon: TrendingUp,
            },
            {
              label: "Retention Rate",
              value: "88.4%",
              trend: "+1.2%",
              icon: Activity,
            },
            {
              label: "Recurring Mix",
              value: "45%",
              trend: "Stable",
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
              <div className="flex items-center gap-4 px-6 py-5 rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all min-w-[160px]">
                <div className="flex flex-col">
                  <span className="text-3xl font-black tabular-nums tracking-tight text-zinc-900">
                    {kpi.value}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mt-0.5">
                    {kpi.label}
                  </span>
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
