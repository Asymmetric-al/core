"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@asym/ui/components/shadcn/button";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { formatCurrency } from "@asym/lib/utils";
import Link from "next/link";
import {
  Heart,
  Rss,
  ArrowRight,
  Activity,
  Map,
  FileText,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@asym/ui/components/shadcn/card";

import {
  ImpactTile,
  DashboardSkeleton,
  Greeting,
} from "@/features/donor/components";
import { RECENT_UPDATES } from "@/lib/mock-data";

export default function DonorDashboardPage() {
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (!isPageLoaded) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6 pb-6 border-b border-zinc-100">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 tracking-tighter flex items-center gap-2 sm:gap-3 flex-wrap">
            <Greeting />, John.
          </h1>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] mt-1.5">
            Thank you for your partnership.
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none h-9 rounded-lg border-zinc-100 text-zinc-500 font-bold uppercase tracking-widest text-[10px] bg-white hover:bg-zinc-50 hover:text-zinc-900 shadow-sm transition-all"
            asChild
          >
            <Link href="/donor-dashboard/history">
              <FileText className="mr-2 h-3.5 w-3.5 text-zinc-400" /> Tax
              Receipt
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Impact Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
        <ImpactTile
          title="Total Given YTD"
          value={formatCurrency(12500)}
          icon={Heart}
          colorClass="text-zinc-900"
          bgClass="bg-zinc-100"
        />
        <ImpactTile
          title="Active Support"
          value="4 Missionaries"
          icon={Map}
          colorClass="text-zinc-900"
          bgClass="bg-zinc-100"
        />
        <ImpactTile
          title="Latest Impact"
          value="Clean Water"
          icon={Activity}
          colorClass="text-zinc-500"
          bgClass="bg-zinc-50"
          className="sm:col-span-2 md:col-span-1"
        />
      </div>

      {/* 3. Content & Updates Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area: Stories */}
        <div className="lg:col-span-8">
          <div className="relative overflow-hidden rounded-xl bg-slate-900 text-white shadow-xl h-[350px] lg:h-[400px] flex flex-col justify-end group cursor-pointer border border-white/5">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90" />

            <div className="relative z-10 p-6 md:p-10 space-y-4 text-left">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <Badge className="bg-zinc-900 hover:bg-zinc-800 text-white border-none shadow-sm text-[9px] h-5 px-2 rounded-md uppercase font-black tracking-widest">
                  FIELD UPDATE
                </Badge>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Chiang Mai, Thailand
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter text-balance leading-tight">
                The school year begins in Chiang Mai.
              </h2>
              <p className="text-slate-400 max-w-xl text-sm font-medium leading-relaxed uppercase tracking-tight line-clamp-2">
                Thanks to monthly partners, 50 children received uniforms and
                books this week.
              </p>
              <div className="pt-2">
                <Link
                  href="/donor-dashboard/feed"
                  className="inline-flex items-center px-6 py-2.5 rounded-lg bg-white text-slate-900 font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-100 transition-all shadow-xl touch-target"
                >
                  Read Full Update <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Feed */}
        <div className="lg:col-span-4 h-fit">
          <Card className="border-zinc-100 shadow-sm flex flex-col overflow-hidden bg-white text-left rounded-xl">
            <CardHeader className="p-5 pb-4 border-b border-zinc-50 bg-zinc-50/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <Rss className="h-3.5 w-3.5" /> Ministry Updates
                </CardTitle>
                <Link
                  href="/donor-dashboard/feed"
                  className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest hover:underline"
                >
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-50">
                {RECENT_UPDATES.map((update) => (
                  <Link
                    href="/donor-dashboard/feed"
                    key={update.id}
                    className="flex gap-4 p-5 hover:bg-zinc-50/50 transition-colors group touch-target"
                  >
                    <div className="shrink-0 pt-0.5">
                      {update.image ? (
                        <Image
                          src={update.image}
                          alt=""
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-lg object-cover border border-zinc-100 shadow-sm grayscale group-hover:grayscale-0 transition-all"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center font-bold text-zinc-400 text-xs uppercase">
                          {update.avatar}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5 gap-2">
                        <span className="text-[11px] font-bold text-zinc-900 truncate tracking-tight uppercase">
                          {update.author}
                        </span>
                        <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest whitespace-nowrap shrink-0">
                          {update.time}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-zinc-500 line-clamp-2 leading-snug uppercase tracking-tight">
                        {update.title}
                      </p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-200 self-center opacity-0 group-hover:opacity-100 transition-all -ml-1.5 shrink-0 hidden sm:block" />
                  </Link>
                ))}
              </div>
            </CardContent>
            <Button
              variant="ghost"
              className="w-full h-10 text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-50/30 hover:bg-zinc-100 hover:text-zinc-900 transition-all rounded-none border-t border-zinc-50 touch-target"
              asChild
            >
              <Link href="/donor-dashboard/feed">
                View All Ministry Updates
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
