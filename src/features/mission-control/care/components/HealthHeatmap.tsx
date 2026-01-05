'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeatmapProps {
  data: { date: string; intensity: number; type: string }[];
  days?: number;
}

export function HealthHeatmap({ data, days = 90 }: HeatmapProps) {
  // Generate dates for the last N days
  const dates = Array.from({ length: days }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return d.toISOString().split('T')[0];
  });

  const getColor = (intensity: number) => {
    switch (intensity) {
      case 0: return 'bg-slate-100 dark:bg-slate-800';
      case 1: return 'bg-emerald-200 dark:bg-emerald-900/40';
      case 2: return 'bg-emerald-400 dark:bg-emerald-700';
      case 3: return 'bg-emerald-600 dark:bg-emerald-500';
      case 4: return 'bg-emerald-800 dark:bg-emerald-300';
      default: return 'bg-slate-100';
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1">
        {dates.map((date) => {
          const entry = data.find(d => d.date === date);
          const intensity = entry?.intensity || 0;
          
          return (
            <Tooltip key={date}>
              <TooltipTrigger asChild>
                <div 
                  className={cn(
                    "w-3 h-3 rounded-sm cursor-pointer transition-colors hover:ring-1 hover:ring-slate-400",
                    getColor(intensity)
                  )}
                />
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs font-medium">{date}</p>
                <p className="text-[10px] text-slate-500">
                  {intensity > 0 ? `${entry?.type} intensity: ${intensity}` : 'No activity logged'}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
