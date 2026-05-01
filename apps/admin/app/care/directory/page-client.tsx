"use client";

import { FilterBar } from "@asym/ui/components/primitives/filter-bar";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Plus, Download, Filter } from "lucide-react";
import React from "react";

import { PersonnelList } from "@/features/mission-control/care/components/PersonnelList";
import { useCarePersonnel } from "@/features/mission-control/care/hooks/use-care";

export default function CareDirectoryPage() {
  const { data: personnel, isLoading } = useCarePersonnel();

  const actions = (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-10 rounded-xl border-zinc-200 px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
      >
        <Download className="mr-2 h-4 w-4 text-zinc-500" /> Export
      </Button>
      <Button className="h-10 rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800">
        <Plus className="mr-2 h-4 w-4" /> Add Personnel
      </Button>
    </>
  );

  return (
    <PageShell
      title="Personnel Directory"
      description="Manage and monitor all global team members."
      actions={actions}
    >
      <Card className="overflow-hidden rounded-2xl border-zinc-200/70 shadow-sm">
        <CardHeader className="border-b border-zinc-100 bg-zinc-50/30 p-5">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <CardTitle className="text-base font-semibold text-zinc-950">
                All Personnel
              </CardTitle>
              <p className="mt-1 text-sm font-medium text-zinc-600">
                Global workforce matrix and care visibility.
              </p>
            </div>

            <FilterBar
              className="w-full md:w-auto"
              actions={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-xl border-zinc-200 px-4 text-sm font-semibold text-zinc-700 hover:bg-white hover:text-zinc-950"
                >
                  <Filter className="mr-2 h-4 w-4" /> Advanced Filters
                </Button>
              }
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4">
            <PersonnelList data={personnel || []} isLoading={isLoading} />
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
