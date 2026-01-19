import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface Metric {
  icon: LucideIcon;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}

export function MetricCard({ metric }: { metric: Metric }) {
  return (
    <Card className="border-zinc-100 bg-white shadow-sm hover:border-zinc-200 transition-all rounded-xl">
      <CardContent className="flex items-center gap-3 p-3.5">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${metric.color}`}
        >
          <metric.icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 leading-none mb-1">
            {metric.title}
          </p>
          <div className="flex items-baseline gap-1">
            <p className="text-xl font-bold tracking-tighter text-zinc-900">
              {metric.value}
            </p>
          </div>
          <p className="truncate text-[9px] font-bold text-zinc-500 uppercase tracking-tight">
            {metric.subtitle}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
