"use client";

import {
  CRM_PROJECTION_TARGET_SURFACE_OPTIONS,
  useAdminCrmProjectionShadowGrid,
} from "@asym/database/hooks";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Alert } from "@asym/ui/components/shadcn/alert";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { DataTableResponsive } from "@asym/ui/components/shadcn/data-table";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  ArrowLeft,
  Eye,
  GitCompareArrows,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { getCrmProjectionShadowColumns } from "./columns";

import type { ReactNode } from "react";

function Metric({
  icon,
  label,
  value,
  sublabel,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sublabel: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {icon}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>
    </div>
  );
}

export default function CrmProjectionsPageClient() {
  const {
    clearTargetSurfaces,
    isLoading,
    onRefresh,
    onSearchChange,
    onTargetSurfaceToggle,
    projections,
    report,
    rollback,
    search,
    tableError,
    targetSurfaces,
  } = useAdminCrmProjectionShadowGrid();
  const columns = useMemo(() => getCrmProjectionShadowColumns(), []);
  const isPermissionDenied =
    tableError?.message.toLowerCase().includes("forbidden") ||
    tableError?.message.toLowerCase().includes("unauthorized");

  return (
    <PageShell
      title="CRM Projections"
      description="Shadow-mode projection health across Asym surfaces."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/crm">
              <ArrowLeft className="size-4" />
              CRM
            </Link>
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => void onRefresh()}
          >
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric
            icon={<Eye className="size-4 text-muted-foreground" />}
            label="Shadowed"
            value={String(report?.totalProjections ?? 0)}
            sublabel="No user-visible dependency"
          />
          <Metric
            icon={<GitCompareArrows className="size-4 text-muted-foreground" />}
            label="Drift"
            value={String(report?.driftedProjections ?? 0)}
            sublabel={`${report?.missingInCrm ?? 0} missing CRM records`}
          />
          <Metric
            icon={<ShieldAlert className="size-4 text-muted-foreground" />}
            label="Failures"
            value={String(report?.failedRecords ?? 0)}
            sublabel={`${report?.conflictingRecords ?? 0} conflicting records`}
          />
          <Metric
            icon={<RotateCcw className="size-4 text-muted-foreground" />}
            label="Rollback"
            value={String(rollback?.disableAllProjectionNames.length ?? 0)}
            sublabel="Projection names can be disabled"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-md">
            Shadow mode
          </Badge>
          <Badge variant="outline" className="rounded-md">
            Source ownership explicit
          </Badge>
          <Badge variant="outline" className="rounded-md">
            Donor and missionary staff controls blocked
          </Badge>
          {rollback ? (
            <Badge variant="outline" className="rounded-md">
              Rollback: {rollback.hidePath}
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search CRM projections"
              className="pl-9"
              placeholder="Search projections"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={targetSurfaces.length === 0 ? "default" : "outline"}
              size="sm"
              onClick={clearTargetSurfaces}
            >
              All
            </Button>
            {CRM_PROJECTION_TARGET_SURFACE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={
                  targetSurfaces.includes(option.value) ? "default" : "outline"
                }
                size="sm"
                onClick={() => onTargetSurfaceToggle(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {isPermissionDenied ? (
          <Alert className="rounded-lg border-destructive/30 bg-destructive/10 text-destructive">
            <ShieldAlert className="size-4" />
            <div className="text-sm">
              Your account does not have staff CRM access for this tenant.
            </div>
          </Alert>
        ) : null}

        <DataTableResponsive
          columns={columns}
          data={projections}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          onRefresh={() => void onRefresh()}
          emptyState={
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-lg bg-muted p-4">
                <GitCompareArrows className="size-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No CRM projections</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {tableError
                  ? tableError.message
                  : "No projection contracts match the current filters."}
              </p>
            </div>
          }
          config={{
            enableColumnVisibility: true,
            enableFilters: false,
            enablePagination: false,
            enableRowSelection: false,
            enableSorting: true,
            enableViewToggle: false,
            mobileBreakpoint: 0,
            stickyHeader: true,
            virtualization: {
              containerHeight: 640,
              enabled: true,
              estimateSize: 72,
              overscan: 8,
            },
          }}
        />
      </div>
    </PageShell>
  );
}
