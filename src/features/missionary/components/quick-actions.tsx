import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface Action {
  icon: LucideIcon;
  label: string;
  href: string;
  bgColor: string;
  iconColor: string;
}

interface QuickActionsProps {
  actions: Action[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <Card className="border-zinc-100 bg-white shadow-sm rounded-xl">
      <CardHeader className="p-5 pb-3 border-b border-zinc-50">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Control Center
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 p-5">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group flex flex-col items-center justify-center gap-2 rounded-lg bg-zinc-50/50 p-4 transition-all hover:bg-zinc-100/50 border border-zinc-50 hover:border-zinc-200"
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.bgColor} border border-white shadow-sm transition-transform group-hover:scale-105`}
            >
              <action.icon className={`h-4.5 w-4.5 ${action.iconColor}`} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-900 transition-colors">
              {action.label}
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
