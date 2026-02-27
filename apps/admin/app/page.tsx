"use client";

import { motion } from "@asym/lib/motion";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { PageShell } from "@asym/ui/components/shadcn/page-shell";
import {
  TrendingUp,
  AlertCircle,
  Circle,
  ArrowRight,
  Activity,
  Download,
  ArrowUpRight,
} from "lucide-react";
import dynamic from "next/dynamic";
import React from "react";

/* ------------------------------------------------------------------ */
/*  Transitions                                                        */
/* ------------------------------------------------------------------ */

const smooth = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MONTHLY_DATA = [
  { month: "Feb", recurring: 2800, oneTime: 600, offline: 200 },
  { month: "Mar", recurring: 3100, oneTime: 800, offline: 100 },
  { month: "Apr", recurring: 2900, oneTime: 400, offline: 300 },
  { month: "May", recurring: 3200, oneTime: 900, offline: 250 },
  { month: "Jun", recurring: 3000, oneTime: 700, offline: 150 },
  { month: "Jul", recurring: 3400, oneTime: 500, offline: 200 },
  { month: "Aug", recurring: 3100, oneTime: 600, offline: 350 },
  { month: "Sep", recurring: 3300, oneTime: 800, offline: 200 },
  { month: "Oct", recurring: 3500, oneTime: 1000, offline: 300 },
  { month: "Nov", recurring: 3700, oneTime: 1200, offline: 400 },
  { month: "Dec", recurring: 4000, oneTime: 1500, offline: 500 },
  { month: "Jan", recurring: 3800, oneTime: 900, offline: 350 },
  { month: "Feb", recurring: 3600, oneTime: 700, offline: 260 },
];

const STATS = [
  { label: "This Month", value: "$4,560", change: "+8.2%", trend: "up" },
  { label: "Last Month", value: "$5,120", change: "+3.1%", trend: "up" },
  { label: "Year to Date", value: "$48,900", change: "+12%", trend: "up" },
] as const;

const ALERTS = [
  { id: 1, text: "3 recurring gifts failed this week" },
  { id: 2, text: "Pledge from Church of Grace is past due" },
];

const TASKS = [
  { id: 1, title: "Call donor John Smith", priority: "high", due: "Today" },
  {
    id: 2,
    title: "Send newsletter draft",
    priority: "medium",
    due: "Tomorrow",
  },
  { id: 3, title: "Update ministry profile", priority: "low", due: "Dec 30" },
  { id: 4, title: "Review failed payments", priority: "high", due: "Today" },
];

const POSTS = [
  {
    id: 1,
    content: "Just reached 75% of our monthly goal! Thank you partners.",
    time: "2h ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
  },
  {
    id: 2,
    content: "New team member joining us in Nairobi next month.",
    time: "5h ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
  },
];

/* ------------------------------------------------------------------ */
/*  Chart — loaded client-side only                                    */
/* ------------------------------------------------------------------ */

const DashboardChart = dynamic(
  async () => {
    const {
      Bar,
      BarChart,
      CartesianGrid,
      XAxis,
      YAxis,
      ResponsiveContainer,
      Tooltip,
    } = await import("recharts");

    /* Zinc palette — dark to light, beautiful gradation */
    const ZINC_RECURRING = "#27272a"; /* zinc-800 */
    const ZINC_ONETIME = "#71717a"; /* zinc-500 */
    const ZINC_OFFLINE = "#d4d4d8"; /* zinc-300 */

    function Chart() {
      return (
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={MONTHLY_DATA}
              margin={{ top: 8, right: 8, left: -8, bottom: 4 }}
              barCategoryGap="18%"
            >
              <defs>
                <linearGradient id="barRecurring" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3f3f46" stopOpacity={1} />
                  <stop offset="100%" stopColor="#18181b" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="barOneTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a1a1aa" stopOpacity={1} />
                  <stop offset="100%" stopColor="#71717a" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#f4f4f5"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                fontSize={10}
                fontWeight={800}
                stroke="#a1a1aa"
                dy={8}
                style={{
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={10}
                fontWeight={700}
                stroke="#a1a1aa"
                tickFormatter={(v: number) =>
                  v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                }
                width={42}
              />
              <Tooltip
                cursor={{ fill: "#fafafa", radius: 6 }}
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid #e4e4e7",
                  boxShadow:
                    "0 12px 32px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)",
                  padding: "12px 16px",
                  fontSize: 12,
                  fontWeight: 700,
                  lineHeight: 1.6,
                }}
                labelStyle={{
                  fontSize: 10,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "#a1a1aa",
                  marginBottom: 6,
                }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    recurring: "Recurring",
                    oneTime: "One-Time",
                    offline: "Offline",
                  };
                  return [`$${value.toLocaleString()}`, labels[name] ?? name];
                }}
                itemStyle={{
                  padding: "2px 0",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              />
              <Bar
                dataKey="recurring"
                stackId="giving"
                fill="url(#barRecurring)"
                animationBegin={200}
                animationDuration={800}
                animationEasing="ease-out"
              />
              <Bar
                dataKey="oneTime"
                stackId="giving"
                fill="url(#barOneTime)"
                animationBegin={400}
                animationDuration={800}
                animationEasing="ease-out"
              />
              <Bar
                dataKey="offline"
                stackId="giving"
                fill={ZINC_OFFLINE}
                radius={[4, 4, 0, 0]}
                animationBegin={600}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>

          {/* Custom legend */}
          <div className="flex items-center justify-center gap-6 pt-3">
            {[
              { label: "Recurring", color: ZINC_RECURRING },
              { label: "One-Time", color: ZINC_ONETIME },
              { label: "Offline", color: ZINC_OFFLINE },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return Chart;
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-[340px] w-full flex items-end justify-around gap-2 px-6 pb-12 animate-pulse">
        {Array.from({ length: 13 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-zinc-100 rounded-t-md"
            style={{ height: `${25 + Math.random() * 55}%` }}
          />
        ))}
      </div>
    ),
  },
);

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  return (
    <PageShell
      title="Dashboard"
      description="Your ministry support at a glance."
      actions={
        <Button
          variant="outline"
          className="h-11 px-4 rounded-xl border-zinc-200 hover:bg-zinc-50 transition-all font-bold uppercase tracking-widest text-[10px] gap-2"
        >
          <Download className="size-4" />
          Download Report
        </Button>
      }
    >
      <div className="space-y-10">
        {/* ============================================================ */}
        {/*  Metric stat cards                                            */}
        {/* ============================================================ */}
        <div className="flex flex-wrap gap-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...smooth, delay: i * 0.06 }}
              whileHover={{ y: -2 }}
              className="flex items-center gap-4 px-6 py-5 rounded-2xl border border-zinc-100 bg-white shadow-sm min-w-[160px] cursor-default"
            >
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-black tabular-nums tracking-tight text-zinc-900">
                  {stat.value}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    {stat.label}
                  </span>
                  <Badge
                    variant="secondary"
                    className="px-1.5 py-0 text-[8px] font-bold border-none bg-emerald-50 text-emerald-600"
                  >
                    {stat.change}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ============================================================ */}
        {/*  Giving Breakdown Chart                                       */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...smooth, delay: 0.2 }}
        >
          <Card className="border-zinc-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-end justify-between">
                <div>
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    Giving Breakdown
                  </CardTitle>
                  <p className="text-xs text-zinc-400 font-medium mt-1">
                    Monthly support trends over the last 13 months.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black tabular-nums tracking-tight text-zinc-900">
                    $48,900
                  </p>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                    Year to date
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-2 sm:px-4 pb-2">
              <DashboardChart />
            </CardContent>
          </Card>
        </motion.div>

        {/* ============================================================ */}
        {/*  Bottom grid: Support Goal + Updates | Tasks & Alerts         */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Monthly Support Goal — dark card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...smooth, delay: 0.3 }}
            >
              <Card className="bg-zinc-900 text-zinc-50 border-zinc-800 shadow-xl relative overflow-hidden rounded-2xl">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />

                <CardContent className="p-6 relative z-10">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div>
                      <h2 className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                        Monthly Support Goal
                      </h2>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black tracking-tighter text-white tabular-nums">
                          $4,560
                        </span>
                        <span className="text-zinc-600 text-base font-medium">
                          / $6,000
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider w-fit"
                    >
                      On Track
                    </Badge>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] mb-1.5 text-zinc-500 font-bold">
                      <span>76% Funded</span>
                      <span className="text-zinc-400">$1,440 remaining</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "76%" }}
                        transition={{
                          duration: 1.2,
                          ease: "easeOut",
                          delay: 0.5,
                        }}
                        className="h-full bg-white rounded-full"
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-4 pt-5 border-t border-zinc-800/50">
                    {[
                      { label: "New Partners", value: "+12" },
                      { label: "Active Donors", value: "142" },
                      {
                        label: "MoM Growth",
                        value: "12%",
                        icon: true,
                        color: "text-emerald-400",
                      },
                    ].map((m) => (
                      <div key={m.label} className="flex flex-col">
                        <span className="text-zinc-600 text-[9px] uppercase tracking-[0.15em] font-bold">
                          {m.label}
                        </span>
                        <span
                          className={`text-lg font-black mt-0.5 tabular-nums ${m.color ?? "text-white"}`}
                        >
                          {m.icon && (
                            <TrendingUp className="inline size-3.5 mr-1" />
                          )}
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Latest Updates */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...smooth, delay: 0.35 }}
            >
              <Card className="border-zinc-100 shadow-sm rounded-2xl">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-zinc-400" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                      Latest Updates
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-zinc-400 hover:text-zinc-900 rounded-lg"
                  >
                    <ArrowUpRight className="size-4" />
                  </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {POSTS.map((post) => (
                    <div
                      key={post.id}
                      className="group flex gap-3 p-3 rounded-xl border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50 transition-all cursor-pointer"
                    >
                      <Avatar className="size-8 shrink-0 border border-white shadow-sm">
                        <AvatarImage src={post.avatar} />
                        <AvatarFallback className="text-[9px] font-bold">
                          U
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-700 leading-relaxed font-medium line-clamp-2">
                          {post.content}
                        </p>
                        <p className="text-[9px] text-zinc-400 mt-1 font-bold uppercase tracking-wider">
                          {post.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right column — Tasks & Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smooth, delay: 0.35 }}
            className="lg:col-span-5 space-y-6"
          >
            <Card className="border-zinc-100 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="pb-2 border-b border-zinc-50 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Tasks & Alerts
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-zinc-100 text-zinc-600 border border-zinc-200 text-[9px] font-bold px-2 py-0.5"
                >
                  {TASKS.length} Pending
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                {/* Alerts */}
                <div className="p-3 space-y-2 border-b border-zinc-50">
                  {ALERTS.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex gap-2 items-start p-2.5 rounded-lg border border-amber-100 bg-amber-50/30"
                    >
                      <AlertCircle className="size-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-amber-900">
                        {alert.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Tasks */}
                <div className="divide-y divide-zinc-50">
                  {TASKS.map((task) => (
                    <div
                      key={task.id}
                      className="group p-3 px-4 hover:bg-zinc-50/50 transition-all flex items-start gap-3 cursor-pointer"
                    >
                      <Circle className="size-4 text-zinc-300 group-hover:text-zinc-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-800 truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {task.priority === "high" && (
                            <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border-none text-[8px] h-4 font-black uppercase tracking-widest px-1.5">
                              Urgent
                            </Badge>
                          )}
                          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                            Due {task.due}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-zinc-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-[9px] font-black text-zinc-500 hover:text-zinc-900 h-8 justify-between group rounded-lg uppercase tracking-wider"
                  >
                    View All Tasks
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ministry Tip */}
            <Card className="border-zinc-100 shadow-sm rounded-2xl p-5">
              <h4 className="text-[9px] font-black text-zinc-900 uppercase tracking-[0.2em] mb-2">
                Ministry Tip
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                &ldquo;Missionaries who send updates twice a month see 15%
                higher donor retention.&rdquo;
              </p>
              <Button
                variant="link"
                className="p-0 h-auto text-[9px] font-black text-zinc-900 mt-3 hover:no-underline flex items-center gap-1 group uppercase tracking-wider"
              >
                Best practices
                <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageShell>
  );
}
