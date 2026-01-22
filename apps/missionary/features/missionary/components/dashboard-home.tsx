"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@asym/ui/components/shadcn/card";
import { Button } from "@asym/ui/components/shadcn/button";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@asym/ui/components/shadcn/avatar";
import { PageHeader } from "@asym/ui/components/page-header";
import {
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Circle,
  ArrowRight,
  Activity,
  
  
} from "lucide-react";
import { GivingBreakdownChart } from "./giving-breakdown-chart";
import { MetricTiles } from "./metric-tiles";
import { useAuth } from "@asym/lib/hooks";

const DEMO_MISSIONARY_ID = "b378164f-8a6a-42c8-883f-59815d01e48c";

const MOCK_TASKS = [
  {
    id: 1,
    title: "Call donor John Smith",
    completed: false,
    priority: "high",
    dueDate: "Today",
  },
  {
    id: 2,
    title: "Send newsletter draft",
    completed: false,
    priority: "medium",
    dueDate: "Tomorrow",
  },
  {
    id: 3,
    title: "Update ministry profile",
    completed: false,
    priority: "low",
    dueDate: "Dec 30",
  },
  {
    id: 4,
    title: "Review failed payments",
    completed: false,
    priority: "high",
    dueDate: "Today",
  },
  {
    id: 5,
    title: "Thank church partners",
    completed: false,
    priority: "medium",
    dueDate: "Friday",
  },
];

const MOCK_POSTS = [
  {
    id: 1,
    content: "Just reached 75% of our monthly goal! Thank you partners.",
    timestamp: "2h ago",
  },
  {
    id: 2,
    content: "New team member joining us in Nairobi next month.",
    timestamp: "5h ago",
  },
];

interface DashboardHomeProps {
  setActiveTab?: (tab: string) => void;
  missionaryId?: string;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  setActiveTab,
  missionaryId,
}) => {
  const { user, loading } = useAuth();

  let effectiveMissionaryId: string;
  if (missionaryId) {
    effectiveMissionaryId = missionaryId;
  } else if (!loading && user?.id) {
    effectiveMissionaryId = user.id;
  } else {
    effectiveMissionaryId = DEMO_MISSIONARY_ID;
  }

  const alerts = [
    { id: 1, text: "3 recurring gifts failed this week", severity: "high" },
    {
      id: 2,
      text: "Pledge from Church of Grace is past due",
      severity: "medium",
    },
  ];

  return (
    <div className="section-gap animate-in fade-in duration-500">
      <PageHeader
        title="Dashboard"
        description="Your ministry support at a glance."
      >
        <Button
          variant="outline"
          size="sm"
          className="h-8 sm:h-9 px-3 sm:px-4 text-xs font-medium"
        >
          Download Report
        </Button>
      </PageHeader>

      <MetricTiles missionaryId={effectiveMissionaryId} />

      <Card className="border-zinc-200 shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-0.5 border-b border-zinc-50 space-y-2 sm:space-y-0 px-3 sm:px-4 pt-2.5">
          <div>
            <CardTitle className="text-sm sm:text-base font-bold text-zinc-900 leading-none">
              Giving Breakdown
            </CardTitle>
            <CardDescription className="text-[9px] sm:text-[10px] mt-0.5">
              Monthly support trends over the last 13 months.
            </CardDescription>
          </div>
          {setActiveTab && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[9px] font-bold text-zinc-500 hover:text-zinc-900 px-2 rounded-md border border-zinc-100 hover:border-zinc-200 transition-all w-full sm:w-auto"
              onClick={() => setActiveTab("analytics")}
            >
              Analytics
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-2 pb-1 px-0.5 sm:px-2 md:px-4">
          <GivingBreakdownChart missionaryId={effectiveMissionaryId} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-6">
        <div className="lg:col-span-7 space-y-3 sm:space-y-4">
          <Card className="bg-zinc-900 text-zinc-50 border-zinc-800 shadow-xl relative overflow-hidden group rounded-xl">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-br from-zinc-700/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 blur-[40px] pointer-events-none" />

            <CardContent className="p-3 sm:p-4 relative z-10">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                <div>
                  <h2 className="text-zinc-500 font-bold text-[9px] uppercase tracking-[0.2em] mb-1 leading-none">
                    Monthly Support Goal
                  </h2>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter text-white leading-none">
                      $4,560
                    </span>
                    <span className="text-zinc-600 text-sm sm:text-base font-medium leading-none">
                      / $6,000
                    </span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-1.5 py-0 text-[8px] font-bold uppercase tracking-wider w-fit"
                >
                  On Track
                </Badge>
              </div>

              <div className="mt-2.5">
                <div className="flex justify-between text-[9px] mb-1 text-zinc-500 font-bold leading-none">
                  <span>76% Funded</span>
                  <span className="text-zinc-400">$1,440 remaining</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                    style={{ width: "76%" }}
                  />
                </div>
              </div>

              <div className="mt-2.5 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-y-2 sm:gap-x-8 pt-2.5 border-t border-zinc-800/50">
                <div className="flex flex-col gap-0">
                  <span className="text-zinc-600 text-[8px] uppercase tracking-[0.1em] font-bold leading-none">
                    New Partners
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white mt-0.5 leading-none">
                    +12
                  </span>
                </div>
                <div className="flex flex-col gap-0">
                  <span className="text-zinc-600 text-[8px] uppercase tracking-[0.1em] font-bold leading-none">
                    Active Donors
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white mt-0.5 leading-none">
                    142
                  </span>
                </div>
                <div className="flex flex-col gap-0">
                  <span className="text-zinc-600 text-[8px] uppercase tracking-[0.1em] font-bold leading-none">
                    MoM Growth
                  </span>
                  <span className="text-sm sm:text-base font-bold text-emerald-400 flex items-center gap-1 mt-0.5 leading-none">
                    <TrendingUp size={14} /> 12%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 shadow-sm bg-white rounded-xl overflow-hidden">
            <CardHeader className="pb-1 flex flex-row items-center justify-between space-y-0 pt-2.5 px-3 sm:px-4">
              <div className="flex items-center gap-1.5">
                <Activity className="h-3 w-3 text-zinc-400" />
                <CardTitle className="text-xs sm:text-sm font-bold text-zinc-900 leading-none">
                  Latest Updates
                </CardTitle>
              </div>
              {setActiveTab && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-md"
                  onClick={() => setActiveTab("feed")}
                >
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 sm:px-4 sm:pb-3">
              {MOCK_POSTS.map((post) => (
                <div
                  key={post.id}
                  className="group flex gap-2 p-1.5 rounded-lg border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50 transition-all cursor-pointer"
                >
                  <Avatar className="h-6 w-6 shrink-0 border border-white shadow-sm">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.id}`}
                    />
                    <AvatarFallback className="text-[8px]">JM</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-zinc-700 leading-tight font-medium line-clamp-2">
                      {post.content}
                    </p>
                    <p className="text-[8px] text-zinc-400 mt-0.5 font-bold uppercase tracking-wider">
                      {post.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              {setActiveTab && (
                <Button
                  variant="outline"
                  className="sm:col-span-2 w-full text-[9px] font-bold h-7 border-dashed border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-all"
                  onClick={() => setActiveTab("feed")}
                >
                  Compose New Update
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-3 sm:space-y-4">
          <Card className="flex flex-col h-auto border-zinc-200 shadow-sm bg-white overflow-hidden rounded-xl">
            <CardHeader className="pb-1.5 border-b border-zinc-50 bg-zinc-50/10 space-y-0 pt-2.5 px-3 sm:px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-bold text-zinc-900 leading-none">
                  Tasks & Alerts
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-white text-zinc-600 border border-zinc-100 text-[8px] font-bold px-1 py-0"
                >
                  {MOCK_TASKS.filter((t) => !t.completed).length} Pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {alerts.length > 0 && (
                  <div className="p-1.5 bg-amber-50/10 space-y-1 border-b border-amber-50/50">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="flex gap-1.5 items-start bg-white p-1.5 rounded-md border border-amber-100/50 shadow-sm"
                      >
                        <AlertCircle className="h-2.5 w-2.5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[9px] font-bold text-amber-900 leading-tight">
                          {alert.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="divide-y divide-zinc-50">
                  {MOCK_TASKS.filter((t) => !t.completed)
                    .slice(0, 4)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="group p-2 px-3 sm:px-3.5 hover:bg-zinc-50/50 transition-all flex items-start gap-2 cursor-pointer touch-target"
                      >
                        <Circle className="h-3 w-3 text-zinc-300 group-hover:text-zinc-600 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-zinc-800 truncate tracking-tight leading-none">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 leading-none flex-wrap">
                            {task.priority === "high" && (
                              <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border-none text-[7px] h-3 font-black uppercase tracking-widest px-1">
                                Urgent
                              </Badge>
                            )}
                            <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">
                              Due {task.dueDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="p-1.5 bg-zinc-50/10 border-t border-zinc-50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-[8px] font-black text-zinc-500 hover:text-zinc-900 h-6 justify-between group rounded-md uppercase tracking-wider touch-target"
                >
                  View All Tasks{" "}
                  <ArrowRight className="h-2 w-2 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-zinc-200 shadow-sm rounded-xl p-3 sm:p-3.5">
            <h4 className="text-[8px] font-black text-zinc-900 uppercase tracking-[0.2em] mb-1 leading-none">
              Ministry Tip
            </h4>
            <p className="text-[9px] sm:text-[10px] text-zinc-600 leading-tight font-medium">
              &ldquo;Missionaries who send updates twice a month see 15% higher
              donor retention.&rdquo;
            </p>
            <Button
              variant="link"
              className="p-0 h-auto text-[8px] font-black text-zinc-900 mt-1.5 hover:no-underline flex items-center gap-1 group uppercase tracking-wider"
            >
              Best practices{" "}
              <ArrowRight className="h-2 w-2 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
