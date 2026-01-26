import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Button } from "@asym/ui/components/shadcn/button";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Avatar, AvatarFallback } from "@asym/ui/components/shadcn/avatar";
import { Sparkles, ArrowUpRight } from "lucide-react";

interface Activity {
  id: number;
  type: string;
  donor: string;
  amount: number;
  isNew?: boolean;
  date: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="border-zinc-100 bg-white shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-5 pb-3 border-b border-zinc-50">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100/50">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 leading-none mb-1">
              Live Updates
            </CardTitle>
            <p className="text-lg font-bold text-zinc-900 tracking-tighter">
              Recent Contributions
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 rounded-md text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"
          asChild
        >
          <Link href="/missionary-dashboard/donors">
            Full Log <ArrowUpRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-zinc-50">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-zinc-50/30"
            >
              <Avatar className="h-9 w-9 border border-zinc-100 shadow-sm rounded-lg">
                <AvatarFallback
                  className={`text-[10px] font-bold rounded-lg ${activity.type === "gift" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400"}`}
                >
                  {activity.donor
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-zinc-900 tracking-tight">
                    {activity.donor}
                  </p>
                  {activity.isNew && (
                    <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black uppercase tracking-widest px-1.5 h-3.5 rounded">
                      NEW
                    </Badge>
                  )}
                </div>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  {activity.type === "gift" ? "Strategic Gift" : "Sustaining"} ·{" "}
                  {activity.date}
                </p>
              </div>
              <p className="text-sm font-bold text-emerald-600 tracking-tighter">
                +${activity.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
