"use client";

import React from "react";
import { useCarePersonnel } from "@/features/mission-control/care/hooks/use-care";
import { PersonnelList } from "@/features/mission-control/care/components/PersonnelList";
import { Button } from "@asym/ui/components/shadcn/button";
import { Plus, Download, Filter } from "lucide-react";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@asym/ui/components/shadcn/card";
import { PageShell } from "@asym/ui/components/shadcn/page-shell";
import { FilterBar } from "@asym/ui/components/shadcn/filter-bar";

export default function CareDirectoryPage() {
  const { data: personnel, isLoading } = useCarePersonnel();

  const actions = (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-14 px-8 font-black border-zinc-200 text-zinc-500 uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-zinc-50 hover:text-zinc-900 transition-all"
      >
        <Download className="mr-3 h-4 w-4 text-zinc-400" /> Export
      </Button>
      <Button className="h-14 px-10 font-black bg-zinc-900 text-white hover:bg-zinc-800 shadow-2xl shadow-zinc-200 uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all">
        <Plus className="mr-3 h-4 w-4" /> Add Personnel
      </Button>
    </>
  );

  return (
    <PageShell
      badge="Care Protocol"
      title="Personnel Directory"
      description="Manage and monitor all global team members."
      actions={actions}
    >
      <Card className="shadow-sm border-zinc-100 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="border-b border-zinc-50 p-10 bg-zinc-50/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">
                All Personnel
              </CardTitle>
              <p className="text-2xl font-black text-zinc-900 tracking-tight mt-1">
                Global Workforce Matrix
              </p>
            </div>

            <FilterBar
              className="w-full md:w-auto"
              actions={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 px-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-zinc-100 rounded-xl hover:bg-white hover:text-zinc-900 transition-all"
                >
                  <Filter className="mr-3 h-4 w-4" /> Advanced Filters
                </Button>
              }
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6">
            <PersonnelList data={personnel || []} isLoading={isLoading} />
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
