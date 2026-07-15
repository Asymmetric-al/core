"use client";

import {
  CRM_RELATIONSHIP_DOMAIN_OPTIONS,
  useAdminCrmRelationshipsGrid,
} from "@asym/database/hooks";
import { formatCurrency } from "@asym/lib/utils";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Alert } from "@asym/ui/components/shadcn/alert";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import { DataTableResponsive } from "@asym/ui/components/shadcn/data-table";
import { Input } from "@asym/ui/components/shadcn/input";
import { cn } from "@asym/ui/lib/utils";
import {
  ArrowLeft,
  Building2,
  FileText,
  HandCoins,
  Home,
  Network,
  RefreshCcw,
  Search,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { getCrmRelationshipColumns } from "./columns";

import type { ReactNode } from "react";

import { CRM_RELATIONSHIPS_PAGE_META } from "@/components/table-page-meta";

const DOMAIN_ICON_CLASS = "size-4 text-muted-foreground";

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

export default function CrmRelationshipsPageClient() {
  const {
    clearDomains,
    domains,
    isLoading,
    missing,
    mode,
    onDomainToggle,
    onRefresh,
    onSearchChange,
    onSortingChange,
    relationships,
    report,
    rollback,
    search,
    sorting,
    tableError,
  } = useAdminCrmRelationshipsGrid();
  const columns = useMemo(() => getCrmRelationshipColumns(), []);
  const isPermissionDenied =
    tableError?.message.toLowerCase().includes("forbidden") ||
    tableError?.message.toLowerCase().includes("unauthorized");

  return (
    <PageShell
      title={CRM_RELATIONSHIPS_PAGE_META.title}
      description={CRM_RELATIONSHIPS_PAGE_META.description}
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/crm"
            className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          >
            <ArrowLeft className="size-4" />
            CRM
          </Link>
          <Link
            href="/crm/notes"
            className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          >
            <FileText className="size-4" />
            Notes
          </Link>
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
            icon={<Network className={DOMAIN_ICON_CLASS} />}
            label="Relationships"
            value={String(report?.totalRows ?? 0)}
            sublabel="Tenant-scoped CRM records"
          />
          <Metric
            icon={<HandCoins className={DOMAIN_ICON_CLASS} />}
            label="Commitments"
            value={formatCurrency(report?.pledgeCommitmentTotalCents ?? 0)}
            sublabel={`${report?.pledgeCommitmentCount ?? 0} relationship commitments`}
          />
          <Metric
            icon={<Home className={DOMAIN_ICON_CLASS} />}
            label="Households"
            value={String(report?.householdCount ?? 0)}
            sublabel="Deterministic member groups"
          />
          <Metric
            icon={<Building2 className={DOMAIN_ICON_CLASS} />}
            label="Activity"
            value={String(report?.recentActivityCount ?? 0)}
            sublabel={`${report?.excludedCareActivityCount ?? 0} care rows excluded`}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-md">
            {mode === "twenty" ? "CRM live" : "Queue only"}
          </Badge>
          <Badge variant="outline" className="rounded-md">
            {report?.sourceSystems.finance ??
              "Asym owns payment execution, receipts, statements, refunds, and reconciliation."}
          </Badge>
          <Badge variant="outline" className="rounded-md">
            {report?.sourceSystems.care ??
              "Asym owns care plans and private care notes."}
          </Badge>
          {rollback ? (
            <Badge variant="outline" className="rounded-md">
              Rollback: {rollback.existingCrmPath}
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search CRM relationships"
              className="pl-9"
              placeholder="Search relationships"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={domains.length === 0 ? "default" : "outline"}
              size="sm"
              onClick={clearDomains}
            >
              All
            </Button>
            {CRM_RELATIONSHIP_DOMAIN_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={domains.includes(option.value) ? "default" : "outline"}
                size="sm"
                onClick={() => onDomainToggle(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {missing.length > 0 ? (
          <Alert className="rounded-lg border-amber-200 bg-amber-50 text-amber-900">
            <ShieldAlert className="size-4" />
            <div className="text-sm">
              CRM reads are not configured in this environment.
            </div>
          </Alert>
        ) : null}

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
          data={relationships}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          onRefresh={() => void onRefresh()}
          onSortingChange={onSortingChange}
          emptyState={
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-lg bg-muted p-4">
                <Network className="size-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No CRM relationships</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {tableError
                  ? tableError.message
                  : "No relationship records match the current filters."}
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
            manualSorting: true,
            mobileBreakpoint: 0,
            stickyHeader: true,
            virtualization: {
              containerHeight: 680,
              enabled: true,
              estimateSize: 78,
              overscan: 10,
            },
          }}
          initialState={{
            sorting,
          }}
          mobileCardConfig={{
            badgeField: "domain",
            primaryField: "displayName",
            secondaryField: "secondaryLabel",
            renderCard: (row) => {
              const relationship = row.original;
              return (
                <div className="space-y-3 p-4 text-left">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {relationship.displayName}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {relationship.secondaryLabel ??
                          relationship.authorityLabel}
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-md text-[9px]">
                      {relationship.domain}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {relationship.sourceSystem}
                  </p>
                </div>
              );
            },
          }}
        />
      </div>
    </PageShell>
  );
}
