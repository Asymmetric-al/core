"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign,
  Users,
  Repeat,
  Target,
  Activity,
  Loader2,
  FileText,
  FileDown,
  Plus,
  Search,
  Library,
  X,
  ClipboardList,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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

const DONOR_TYPE_DATA = [
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

const COLORS = ["#0f172a", "#3b82f6"];

export default function MissionControlReports() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  const generateReport = async () => {
    setIsGenerating(true);
    setReport(null);
    // Simulate data analysis
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
    <div className="space-y-12 max-w-7xl mx-auto pb-20 animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-zinc-100 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="size-2 rounded-full bg-slate-900" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
              Reports Analytics
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-zinc-900 lg:text-6xl uppercase">
            Reports & Analytics
          </h1>
          <p className="text-zinc-400 mt-3 text-sm font-bold uppercase tracking-widest leading-relaxed">
            Financial and operational insights for the organization.
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="sm"
            className="h-14 px-8 font-black border-zinc-200 text-zinc-500 uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-zinc-50 hover:text-zinc-900 transition-all"
          >
            <Library className="h-4 w-4 mr-3" /> Report Library
          </Button>
          <Button
            onClick={generateReport}
            disabled={isGenerating}
            size="sm"
            className="h-14 px-10 bg-zinc-900 text-white shadow-2xl shadow-zinc-200 uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-zinc-800 transition-all"
          >
            {isGenerating ? (
              <Loader2 className="mr-3 h-4 w-4 animate-spin" />
            ) : (
              <ClipboardList className="mr-3 h-4 w-4" />
            )}
            {isGenerating ? "Summarizing..." : "Quick Summary"}
          </Button>
        </div>
      </div>

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
                  <FileText className="h-4 w-4 text-emerald-400" /> Executive
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 pt-0 relative z-10">
                <div className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed font-bold tracking-tight text-lg">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: report.replace(/\n/g, "<br/>"),
                    }}
                  />
                </div>
              </CardContent>
              <div className="absolute top-8 right-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setReport(null)}
                  className="h-10 w-10 text-zinc-600 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Global Revenue",
            value: "$26.4M",
            trend: "+20.1%",
            icon: DollarSign,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Avg Contribution",
            value: "$420",
            trend: "+4%",
            icon: TrendingUp,
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            label: "Retention Rate",
            value: "88.4%",
            trend: "+1.2%",
            icon: Activity,
            color: "bg-indigo-50 text-indigo-600",
          },
          {
            label: "Recurring Mix",
            value: "45%",
            trend: "Stable",
            icon: Repeat,
            color: "bg-zinc-50 text-zinc-500",
          },
        ].map((kpi, i) => (
          <Card
            key={i}
            className="border-zinc-100 bg-white shadow-sm hover:border-zinc-200 transition-all rounded-3xl"
          >
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div
                  className={cn(
                    "size-12 rounded-2xl flex items-center justify-center shadow-sm",
                    kpi.color,
                  )}
                >
                  <kpi.icon className="h-5 w-5" />
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[9px] uppercase tracking-widest px-2 h-6 rounded-full">
                  {kpi.trend.includes("+") ? kpi.trend : "Live"}
                </Badge>
              </div>
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">
                {kpi.label}
              </h4>
              <div className="text-3xl font-black text-zinc-900 tracking-tighter">
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts section... */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 text-left">
        {/* Main Trend Chart */}
        <Card className="col-span-4 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider">
              Giving Trends
            </CardTitle>
            <CardDescription className="text-xs">
              Monthly volume across all regions.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={DONATION_DATA}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    stroke="#94a3b8"
                  />
                  <YAxis
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    stroke="#94a3b8"
                    tickFormatter={(v) => `$${v / 1000}k`}
                  />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #f1f5f9",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#0f172a"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAmt)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Breakdown */}
        <Card className="col-span-3 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider">
              Donor Engagement
            </CardTitle>
            <CardDescription className="text-xs">
              Retention velocity (6 Month).
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ENGAGEMENT_DATA}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  barSize={24}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="month"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    stroke="#94a3b8"
                  />
                  <YAxis
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    stroke="#94a3b8"
                  />
                  <Tooltip cursor={{ fill: "#f8fafc" }} />
                  <Bar
                    dataKey="retained"
                    name="Retained"
                    stackId="a"
                    fill="#0f172a"
                  />
                  <Bar dataKey="new" name="New" stackId="a" fill="#3b82f6" />
                  <Bar
                    dataKey="lapsed"
                    name="Lapsed"
                    stackId="a"
                    fill="#e2e8f0"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
