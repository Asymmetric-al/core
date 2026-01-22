"use client";

import React from "react";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { MapPin, Activity, Info } from "lucide-react";
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
    <Card className="bg-zinc-900 border-none shadow-xl overflow-hidden relative group rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white opacity-[0.02] rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
      <CardContent className="p-6 md:p-8 relative z-10">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <Info className="h-4 w-4 text-emerald-400" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Ministry Impact Summary
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {briefingItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                  {item.workerName}
                </span>
              </div>
              <p className="text-lg text-zinc-300 leading-tight font-bold tracking-tight">
                {item.impact}
              </p>
              <div className="flex items-center gap-6 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                <span className="flex items-center gap-2 transition-colors hover:text-zinc-400 cursor-default">
                  <MapPin className="h-3.5 w-3.5" /> {item.location}
                </span>
                <span className="flex items-center gap-2 transition-colors hover:text-zinc-400 cursor-default">
                  <Activity className="h-3.5 w-3.5" /> {item.activity}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
