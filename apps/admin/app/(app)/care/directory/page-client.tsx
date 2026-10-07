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

const careDirectoryActions = (
  <>
    <Button variant="outline" size="sm">
      <Download className="mr-2 size-4 text-muted-foreground" /> Export
    </Button>
    <Button>
      <Plus className="mr-2 size-4" /> Add Personnel
    </Button>
  </>
);

export default function CareDirectoryPage() {
  const { data: personnel, isLoading } = useCarePersonnel();

  return (
    <PageShell
      title="Personnel Directory"
      description="Manage and monitor all global team members."
      density="compact"
      actions={careDirectoryActions}
    >
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/30 p-5">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">
                All Personnel
              </CardTitle>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Global workforce matrix and care visibility.
              </p>
            </div>

            <FilterBar
              className="w-full md:w-auto"
              actions={
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 size-4" /> Advanced Filters
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
