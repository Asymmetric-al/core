"use client";

import React from "react";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Sparkles, MapPin, Activity } from "lucide-react";
import { motion } from "motion/react";

export function MissionBriefing({
  feeds,
  activeSupport,
}: {
  feeds: any[];
  activeSupport: string[];
}) {
  const briefingItems = feeds.filter((f) => activeSupport.includes(f.id));

  return (
    <Card className="bg-slate-900 border-none shadow-xl overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-transparent pointer-events-none" />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">
              Intelligent Mission Briefing
            </h3>
          </div>
          <Badge
            variant="outline"
            className="border-slate-700 text-slate-400 text-[10px] font-bold uppercase tracking-wider"
          >
            AI Generated
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {briefingItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wide">
                  {item.workerName}
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {item.impact}
              </p>
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {item.location}
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="h-3 w-3" /> {item.activity}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
