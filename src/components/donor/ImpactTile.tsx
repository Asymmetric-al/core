"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { LucideIcon, Sparkles } from "lucide-react";

interface ImpactTileProps {
  title: string;
  value?: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  contextKeys?: string[];
  feeds?: any[];
}

export function ImpactTile({
  title,
  value,
  icon: Icon,
  colorClass,
  bgClass,
  contextKeys,
  feeds,
}: ImpactTileProps) {
  const isAI = value === undefined;

  const aiValue =
    isAI && contextKeys && feeds
      ? contextKeys.includes("miller")
        ? "50 Students"
        : "Breakthrough"
      : value;

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow h-full bg-white overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div
            className={cn(
              "p-2 rounded-2xl transition-transform group-hover:scale-110",
              bgClass,
              colorClass,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          {isAI && (
            <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
              <Sparkles className="h-2 w-2 text-amber-500" />
              AI Derived
            </div>
          )}
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            {title}
          </h4>
          <p
            className={cn(
              "text-2xl font-bold tracking-tight",
              isAI ? "text-slate-900" : "text-slate-900",
            )}
          >
            {aiValue || "---"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
