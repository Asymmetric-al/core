"use client";

import { motion } from "@asym/lib/motion";
import { Avatar, AvatarFallback } from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { DataTableColumnHeader } from "@asym/ui/components/shadcn/data-table";
import { DataTableWrapper } from "@asym/ui/components/shadcn/data-table/data-table-wrapper";
import { type ColumnDef } from "@asym/ui/components/shadcn/data-table/tanstack";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { Progress } from "@asym/ui/components/shadcn/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@asym/ui/components/shadcn/sheet";
import { Tabs, TabsList, TabsTrigger } from "@asym/ui/components/shadcn/tabs";
import { cn } from "@asym/ui/lib/utils";
import {
  Calendar,
  ClipboardCheck,
  Filter,
  GraduationCap,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plane,
  Plus,
  Search,
  Users,
} from "lucide-react";
import * as React from "react";

import { STAGE_VARIANTS } from "./stage-colors";

import type { LucideIcon } from "lucide-react";

export type Stage = "Applied" | "Vetting" | "Training" | "Ready" | "Deployed";

export type MobilizeTab = "all" | "applied" | "vetting" | "training" | "ready";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  stage: Stage;
  readiness: number;
  appliedDate: string;
  avatar?: string;
  tags: string[];
}

interface MobilizeStats {
  applied: number;
  vetting: number;
  training: number;
  ready: number;
}

const TABLE_TABS: readonly MobilizeTab[] = [
  "all",
  "applied",
  "vetting",
  "training",
  "ready",
];

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  context,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  context: string;
}) => (
  <div className="rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="text-left">
        <h3 className="text-3xl font-semibold tabular-nums tracking-tight text-foreground mt-0.5">
          {value}
        </h3>
        <p className="mt-1 text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs font-medium text-muted-foreground">
          {context}
        </p>
      </div>
      <div
        className={cn(
          "size-10 rounded-lg flex items-center justify-center bg-muted",
        )}
      >
        <Icon className={cn("size-5", color)} />
      </div>
    </div>
  </div>
);

export function MobilizeStatsRow({ stats }: { stats: MobilizeStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.25,
          ease: [0.25, 0.1, 0.25, 1],
          delay: 0 * 0.06,
        }}
        whileHover={{ y: -2 }}
      >
        <StatCard
          title="New Applicants"
          value={stats.applied}
          icon={Users}
          color="text-muted-foreground"
          context="New files to triage"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.25,
          ease: [0.25, 0.1, 0.25, 1],
          delay: 1 * 0.06,
        }}
        whileHover={{ y: -2 }}
      >
        <StatCard
          title="In Vetting"
          value={stats.vetting}
          icon={ClipboardCheck}
          color="text-info"
          context="Active review workflow"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.25,
          ease: [0.25, 0.1, 0.25, 1],
          delay: 2 * 0.06,
        }}
        whileHover={{ y: -2 }}
      >
        <StatCard
          title="In Training"
          value={stats.training}
          icon={GraduationCap}
          color="text-info"
          context="Preparing for deployment"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.25,
          ease: [0.25, 0.1, 0.25, 1],
          delay: 3 * 0.06,
        }}
        whileHover={{ y: -2 }}
      >
        <StatCard
          title="Ready"
          value={stats.ready}
          icon={Plane}
          color="text-success"
          context="Cleared for placement"
        />
      </motion.div>
    </div>
  );
}

interface MobilizePipelineTableProps {
  activeTab: MobilizeTab;
  searchTerm: string;
  candidates: Candidate[];
  isLoading?: boolean;
  onTabChange: (tab: MobilizeTab) => void;
  onSearchTermChange: (value: string) => void;
  onSelectCandidate: (candidate: Candidate) => void;
}

export function MobilizePipelineTable({
  activeTab,
  searchTerm,
  candidates,
  isLoading,
  onTabChange,
  onSearchTermChange,
  onSelectCandidate,
}: MobilizePipelineTableProps) {
  const columns = React.useMemo<ColumnDef<Candidate>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Candidate" />
        ),
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => onSelectCandidate(row.original)}
            className="flex w-full items-center gap-2.5 py-1 text-left"
          >
            <Avatar className="size-8 bg-muted border border-border rounded-lg">
              <AvatarFallback className="text-xs font-semibold text-muted-foreground">
                {row.original.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="text-sm font-semibold text-foreground leading-tight">
                {row.original.name}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground leading-tight">
                {row.original.email}
              </div>
            </div>
          </button>
        ),
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Role" />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold text-foreground leading-tight">
              {row.original.role}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="size-3" /> {row.original.location}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "stage",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Stage" />
        ),
        cell: ({ row }) => (
          <Badge variant={STAGE_VARIANTS[row.original.stage]}>
            {row.original.stage}
          </Badge>
        ),
      },
      {
        accessorKey: "readiness",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Readiness" />
        ),
        cell: ({ row }) => (
          <div className="w-28 space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>{row.original.readiness}% ready</span>
            </div>
            <Progress
              aria-label="Training completion"
              value={row.original.readiness}
              className="h-1.5 rounded-full"
            />
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex justify-end pr-2">
            <Button
              aria-label={`Open ${row.original.name}`}
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg"
              onClick={() => onSelectCandidate(row.original)}
            >
              <MoreHorizontal className="size-4 text-muted-foreground" />
            </Button>
          </div>
        ),
      },
    ],
    [onSelectCandidate],
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="p-3 border-b border-border flex flex-col lg:flex-row justify-between items-center gap-3 bg-muted/50">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (TABLE_TABS.includes(value as MobilizeTab)) {
              onTabChange(value as MobilizeTab);
            }
          }}
          className="w-full overflow-x-auto lg:w-auto"
        >
          <TabsList className="h-auto w-max min-w-full justify-start">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="applied">Applied</TabsTrigger>
            <TabsTrigger value="vetting">Vetting</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="ready">Ready</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-60">
            <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
            <Input
              aria-label="Search candidates"
              placeholder="Search candidates..."
              className="pl-8"
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
            />
          </div>
          <Button
            aria-label="Open candidate filters"
            variant="outline"
            size="icon"
          >
            <Filter className="size-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <DataTableWrapper
        columns={columns}
        data={candidates}
        isLoading={isLoading}
        config={{
          enableRowSelection: false,
          enableColumnVisibility: false,
          enablePagination: true,
          enableFilters: false,
          enableSorting: true,
        }}
        emptyState={{
          title: "No candidates found",
          description:
            "Adjust the current search or stage filter to find candidates.",
        }}
      />
    </div>
  );
}

interface MobilizeAddCandidateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobilizeAddCandidateSheet({
  open,
  onOpenChange,
}: MobilizeAddCandidateSheetProps) {
  const fieldId = React.useId();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 gap-0 flex flex-col h-full">
        <SheetHeader className="px-6 py-5 bg-card border-b border-border">
          <SheetTitle className="text-xl font-semibold flex items-center gap-2">
            <Plus className="size-5 text-muted-foreground" /> New Candidate
            Profile
          </SheetTitle>
          <SheetDescription>Start a new mobilization file.</SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6 text-left">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${fieldId}-first-name`}>First Name</Label>
              <Input
                id={`${fieldId}-first-name`}
                autoComplete="given-name"
                placeholder="Jane"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${fieldId}-last-name`}>Last Name</Label>
              <Input
                id={`${fieldId}-last-name`}
                autoComplete="family-name"
                placeholder="Doe"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-email`}>Email Address</Label>
            <Input
              id={`${fieldId}-email`}
              autoComplete="email"
              type="email"
              placeholder="jane@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-interest-role`}>Interest Role</Label>
            <Input
              id={`${fieldId}-interest-role`}
              placeholder="e.g. Medical Officer"
            />
          </div>
        </div>
        <SheetFooter className="p-6 border-t bg-card mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button>Create Profile</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

interface MobilizeCandidateDetailSheetProps {
  candidate: Candidate | null;
  onOpenChange: (open: boolean) => void;
}

export function MobilizeCandidateDetailSheet({
  candidate,
  onOpenChange,
}: MobilizeCandidateDetailSheetProps) {
  return (
    <Sheet open={Boolean(candidate)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0 gap-0 overflow-hidden bg-muted shadow-2xl border-l border-border flex flex-col h-full">
        <SheetHeader className="sr-only">
          <SheetTitle>Candidate Profile: {candidate?.name}</SheetTitle>
          <SheetDescription>
            View detailed candidate information and manage mobilization process.
          </SheetDescription>
        </SheetHeader>

        {candidate && (
          <>
            <div className="bg-card border-b border-border p-8 pb-0">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-5">
                  <Avatar className="size-20 border-4 border-border shadow-sm">
                    <AvatarFallback className="text-xl bg-muted text-muted-foreground font-semibold">
                      {candidate.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <h2 className="text-2xl font-semibold text-foreground">
                      {candidate.name}
                    </h2>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                      <MapPin className="size-4" /> {candidate.location}
                      <span className="text-muted-foreground">•</span>
                      <span>{candidate.role}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Badge variant={STAGE_VARIANTS[candidate.stage]}>
                        {candidate.stage}
                      </Badge>
                      {candidate.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl border-border font-semibold uppercase tracking-widest"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    className="h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary font-semibold uppercase tracking-widest"
                  >
                    Contact
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-transparent h-auto p-0 gap-6">
                  <TabsTrigger
                    value="overview"
                    className="bg-transparent border-b-2 border-transparent data-active:border-border data-active:shadow-none rounded-none px-1 py-3 text-sm font-medium text-muted-foreground data-active:text-foreground transition-[color,border-color]"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="vetting"
                    className="bg-transparent border-b-2 border-transparent data-active:border-border data-active:shadow-none rounded-none px-1 py-3 text-sm font-medium text-muted-foreground data-active:text-foreground transition-[color,border-color]"
                  >
                    Vetting Checklist
                  </TabsTrigger>
                  <TabsTrigger
                    value="placement"
                    className="bg-transparent border-b-2 border-transparent data-active:border-border data-active:shadow-none rounded-none px-1 py-3 text-sm font-medium text-muted-foreground data-active:text-foreground transition-[color,border-color]"
                  >
                    Placement
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="space-y-6">
                <Card className="text-left shadow-sm">
                  <CardHeader className="pb-3 border-b border-border">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 grid grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-semibold mb-1">
                        <Mail className="size-3" /> Email
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {candidate.email}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-semibold mb-1">
                        <Phone className="size-3" /> Phone
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {candidate.phone}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-semibold mb-1">
                        <Calendar className="size-3" /> Applied Date
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {candidate.appliedDate}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-left shadow-sm">
                  <CardHeader className="pb-3 border-b border-border">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Readiness Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-3xl font-semibold text-foreground">
                        {candidate.readiness}%
                      </span>
                      <span className="text-sm text-muted-foreground font-medium mb-1">
                        Training Completion
                      </span>
                    </div>
                    <Progress
                      aria-label="Training completion"
                      value={candidate.readiness}
                      className="h-3"
                    />
                    <p className="text-xs text-muted-foreground mt-4">
                      Based on completed modules, vetting interviews, and
                      document submission.
                    </p>
                  </CardContent>
                </Card>

                <div className="space-y-3 text-left">
                  <h3 className="text-sm font-semibold text-foreground">
                    Recent Activity
                  </h3>
                  <div className="bg-card border border-border rounded-lg p-4 flex gap-4 items-start shadow-sm">
                    <div className="mt-1 size-2 rounded-full bg-info shrink-0" />
                    <div>
                      <p className="text-sm text-foreground font-medium">
                        Background Check Cleared
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        2 days ago by Compliance Team
                      </p>
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 flex gap-4 items-start shadow-sm">
                    <div className="mt-1 size-2 rounded-full bg-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm text-foreground font-medium">
                        Application Submitted
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Oct 1, 2023
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter className="p-4 border-t bg-card flex justify-between items-center sm:justify-between">
              <Button
                variant="outline"
                className="rounded-xl font-semibold uppercase tracking-widest text-destructive hover:text-destructive border-destructive/25 hover:bg-destructive/10"
              >
                Reject
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="rounded-xl font-semibold uppercase tracking-widest"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
                <Button>Advance Stage</Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
