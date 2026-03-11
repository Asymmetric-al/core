import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { AlertCircle, ChevronRight } from "lucide-react";

interface Alert {
  id: number;
  type: string;
  count: number;
  label: string;
}

interface AlertsSectionProps {
  alerts: Alert[];
}

export function AlertsSection({ alerts }: AlertsSectionProps) {
  return (
    <Card className="border-zinc-100 bg-white shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="p-5 pb-3 border-b border-zinc-50">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100/50">
            <AlertCircle className="h-4.5 w-4.5" />
          </div>
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Tactical Alerts
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-zinc-50">
          {alerts.map((alert) => (
            <Link
              key={alert.id}
              href={`/donors?filter=${alert.type}`}
              className="group flex items-center justify-between p-4 transition-all hover:bg-zinc-50/50"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    alert.type === "at-risk"
                      ? "bg-amber-500"
                      : alert.type === "new"
                        ? "bg-emerald-500"
                        : "bg-rose-500"
                  }`}
                />
                <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-tight">
                  {alert.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-zinc-100 text-zinc-900 border-none font-bold text-[9px] h-4.5 px-1.5 rounded-md">
                  {alert.count}
                </Badge>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
