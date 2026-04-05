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
import { Input } from "@asym/ui/components/shadcn/input";
import { Progress } from "@asym/ui/components/shadcn/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@asym/ui/components/shadcn/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@asym/ui/components/shadcn/table";
import { Tabs, TabsList, TabsTrigger } from "@asym/ui/components/shadcn/tabs";
import { cn } from "@asym/ui/lib/utils";
import {
  Calendar,
  Filter,
  GraduationCap,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plane,
  Plus,
  Search,
  UserCheck,
  Users,
} from "lucide-react";

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

const STAGE_COLORS: Record<Stage, string> = {
  Applied: "bg-zinc-100 text-zinc-700",
  Vetting: "bg-blue-50 text-blue-700 border-blue-200",
  Training: "bg-purple-50 text-purple-700 border-purple-200",
  Ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Deployed: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

const TABLE_TABS: readonly MobilizeTab[] = [
  "all",
  "applied",
  "vetting",
  "training",
  "ready",
];

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: "1",
    name: "Sarah Jenkins",
    email: "sarah.j@example.com",
    phone: "+1 (555) 123-4567",
    role: "Medical Officer",
    location: "Denver, CO",
    stage: "Vetting",
    readiness: 45,
    appliedDate: "2023-10-01",
    tags: ["RN", "Spanish Speaker"],
  },
  {
    id: "2",
    name: "Michael Ross",
    email: "mike.ross@example.com",
    phone: "+1 (555) 987-6543",
    role: "Education Specialist",
    location: "Austin, TX",
    stage: "Training",
    readiness: 85,
    appliedDate: "2023-09-15",
    tags: ["ESL Certified", "Leadership"],
  },
  {
    id: "3",
    name: "Emily Blunt",
    email: "emily.b@example.com",
    phone: "+1 (555) 456-7890",
    role: "Logistics Coordinator",
    location: "Seattle, WA",
    stage: "Applied",
    readiness: 10,
    appliedDate: "2023-10-20",
    tags: ["Supply Chain"],
  },
  {
    id: "4",
    name: "David Kim",
    email: "d.kim@example.com",
    phone: "+1 (555) 222-3333",
    role: "Community Development",
    location: "Chicago, IL",
    stage: "Ready",
    readiness: 100,
    appliedDate: "2023-08-10",
    tags: ["Agriculture", "French Speaker"],
  },
  {
    id: "5",
    name: "Jessica Chen",
    email: "jess.chen@example.com",
    phone: "+1 (555) 444-5555",
    role: "Medical Officer",
    location: "Boston, MA",
    stage: "Deployed",
    readiness: 100,
    appliedDate: "2023-06-01",
    tags: ["MD", "Trauma Care"],
  },
];

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
}) => (
  <div className="rounded-2xl border border-zinc-100 bg-white shadow-sm px-6 py-5">
    <div className="flex items-center justify-between">
      <div className="text-left">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
          {title}
        </p>
        <h3 className="text-3xl font-black tabular-nums tracking-tight text-zinc-900 mt-0.5">
          {value}
        </h3>
      </div>
      <div
        className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center bg-opacity-10",
          color.replace("text-", "bg-"),
        )}
      >
        <Icon className={cn("h-5 w-5", color)} />
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
          color="text-zinc-600"
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
          icon={UserCheck}
          color="text-blue-600"
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
          color="text-purple-600"
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
          title="Ready / Deployed"
          value={stats.ready}
          icon={Plane}
          color="text-emerald-600"
        />
      </motion.div>
    </div>
  );
}

interface MobilizePipelineTableProps {
  activeTab: MobilizeTab;
  searchTerm: string;
  candidates: Candidate[];
  onTabChange: (tab: MobilizeTab) => void;
  onSearchTermChange: (value: string) => void;
  onSelectCandidate: (candidate: Candidate) => void;
}

export function MobilizePipelineTable({
  activeTab,
  searchTerm,
  candidates,
  onTabChange,
  onSearchTermChange,
  onSelectCandidate,
}: MobilizePipelineTableProps) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-3 border-b border-zinc-100 flex flex-col lg:flex-row justify-between items-center gap-3 bg-zinc-50/50">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (TABLE_TABS.includes(value as MobilizeTab)) {
              onTabChange(value as MobilizeTab);
            }
          }}
          className="w-full lg:w-auto"
        >
          <TabsList className="bg-white border border-zinc-200 h-8 rounded-lg p-0.5">
            <TabsTrigger
              value="all"
              className="h-7 text-[10px] uppercase font-bold px-3 rounded-md"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="applied"
              className="h-7 text-[10px] uppercase font-bold px-3 rounded-md"
            >
              Applied
            </TabsTrigger>
            <TabsTrigger
              value="vetting"
              className="h-7 text-[10px] uppercase font-bold px-3 rounded-md"
            >
              Vetting
            </TabsTrigger>
            <TabsTrigger
              value="training"
              className="h-7 text-[10px] uppercase font-bold px-3 rounded-md"
            >
              Training
            </TabsTrigger>
            <TabsTrigger
              value="ready"
              className="h-7 text-[10px] uppercase font-bold px-3 rounded-md"
            >
              Ready
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-60">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
            <Input
              placeholder="Search candidates..."
              className="pl-8 bg-white h-8 text-xs rounded-lg"
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="bg-white border-zinc-200 shadow-none h-8 w-8 rounded-lg"
          >
            <Filter className="h-3.5 w-3.5 text-zinc-500" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="h-10 hover:bg-transparent">
              <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10 px-4">
                Candidate
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10 px-4">
                Role
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10 px-4">
                Stage
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10 px-4">
                Readiness
              </TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider h-10 px-4">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate) => (
              <TableRow
                key={candidate.id}
                className="hover:bg-zinc-50/50 cursor-pointer h-12"
                onClick={() => onSelectCandidate(candidate)}
              >
                <TableCell className="px-4 py-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8 bg-zinc-100 border border-zinc-200 rounded-lg">
                      <AvatarFallback className="text-[10px] font-bold text-zinc-600">
                        {candidate.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <div className="text-xs font-bold text-zinc-900 leading-tight">
                        {candidate.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 leading-tight">
                        {candidate.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-2">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-zinc-700 leading-tight">
                      {candidate.role}
                    </span>
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" /> {candidate.location}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-bold border shadow-none px-1.5 py-0 rounded-md uppercase tracking-wider",
                      STAGE_COLORS[candidate.stage],
                    )}
                  >
                    {candidate.stage}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-2">
                  <div className="w-24 space-y-1">
                    <div className="flex justify-between text-[8px] uppercase font-bold text-zinc-400">
                      <span>{candidate.readiness}%</span>
                    </div>
                    <Progress
                      value={candidate.readiness}
                      className="h-1 rounded-full"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right px-4 py-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelectCandidate(candidate);
                    }}
                  >
                    <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {candidates.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-zinc-500"
                >
                  No candidates found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
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
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 gap-0 bg-zinc-50 flex flex-col h-full">
        <SheetHeader className="px-6 py-5 bg-white border-b border-zinc-100">
          <SheetTitle className="text-xl font-bold flex items-center gap-2">
            <Plus className="h-5 w-5 text-zinc-600" /> New Candidate Profile
          </SheetTitle>
          <SheetDescription>Start a new mobilization file.</SheetDescription>
        </SheetHeader>
        <div className="p-6 flex flex-col gap-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">First Name</span>
              <Input placeholder="Jane" />
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">Last Name</span>
              <Input placeholder="Doe" />
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Email Address</span>
            <Input placeholder="jane@example.com" />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Interest Role</span>
            <Input placeholder="e.g. Medical Officer" />
          </div>
        </div>
        <SheetFooter className="p-6 border-t bg-white mt-auto">
          <Button
            variant="outline"
            className="rounded-xl border-zinc-200 font-bold uppercase tracking-widest text-[10px]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-black uppercase tracking-widest text-[10px]">
            Create Profile
          </Button>
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
      <SheetContent className="w-full sm:max-w-2xl p-0 gap-0 overflow-hidden bg-zinc-50 shadow-2xl border-l border-zinc-200 flex flex-col h-full">
        <SheetHeader className="sr-only">
          <SheetTitle>Candidate Profile: {candidate?.name}</SheetTitle>
          <SheetDescription>
            View detailed candidate information and manage mobilization process.
          </SheetDescription>
        </SheetHeader>

        {candidate && (
          <>
            <div className="bg-white border-b border-zinc-200 p-8 pb-0">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-5">
                  <Avatar className="h-20 w-20 border-4 border-zinc-50 shadow-sm">
                    <AvatarFallback className="text-xl bg-zinc-100 text-zinc-600 font-bold">
                      {candidate.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <h2 className="text-2xl font-bold text-zinc-900">
                      {candidate.name}
                    </h2>
                    <div className="flex items-center gap-2 text-zinc-500 mt-1">
                      <MapPin className="h-4 w-4" /> {candidate.location}
                      <span className="text-zinc-300">•</span>
                      <span>{candidate.role}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "border shadow-none",
                          STAGE_COLORS[candidate.stage],
                        )}
                      >
                        {candidate.stage}
                      </Badge>
                      {candidate.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="bg-white text-zinc-600 border-zinc-200 shadow-none"
                        >
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
                    className="h-9 rounded-xl border-zinc-200 font-bold uppercase tracking-widest text-[10px]"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    className="h-9 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-black uppercase tracking-widest text-[10px]"
                  >
                    Contact
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-transparent h-auto p-0 gap-6">
                  <TabsTrigger
                    value="overview"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:shadow-none rounded-none px-1 py-3 text-sm font-medium text-zinc-500 data-[state=active]:text-zinc-900 transition-all"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="vetting"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:shadow-none rounded-none px-1 py-3 text-sm font-medium text-zinc-500 data-[state=active]:text-zinc-900 transition-all"
                  >
                    Vetting Checklist
                  </TabsTrigger>
                  <TabsTrigger
                    value="placement"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:shadow-none rounded-none px-1 py-3 text-sm font-medium text-zinc-500 data-[state=active]:text-zinc-900 transition-all"
                  >
                    Placement
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="space-y-6">
                <Card className="text-left shadow-sm">
                  <CardHeader className="pb-3 border-b border-zinc-100">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 grid grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase font-bold mb-1">
                        <Mail className="h-3 w-3" /> Email
                      </div>
                      <div className="text-sm font-medium text-zinc-900">
                        {candidate.email}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase font-bold mb-1">
                        <Phone className="h-3 w-3" /> Phone
                      </div>
                      <div className="text-sm font-medium text-zinc-900">
                        {candidate.phone}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase font-bold mb-1">
                        <Calendar className="h-3 w-3" /> Applied Date
                      </div>
                      <div className="text-sm font-medium text-zinc-900">
                        {candidate.appliedDate}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-left shadow-sm">
                  <CardHeader className="pb-3 border-b border-zinc-100">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                      Readiness Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-3xl font-bold text-zinc-900">
                        {candidate.readiness}%
                      </span>
                      <span className="text-sm text-zinc-500 font-medium mb-1">
                        Training Completion
                      </span>
                    </div>
                    <Progress value={candidate.readiness} className="h-3" />
                    <p className="text-xs text-zinc-500 mt-4">
                      Based on completed modules, vetting interviews, and
                      document submission.
                    </p>
                  </CardContent>
                </Card>

                <div className="space-y-3 text-left">
                  <h3 className="text-sm font-bold text-zinc-900">
                    Recent Activity
                  </h3>
                  <div className="bg-white border border-zinc-200 rounded-lg p-4 flex gap-4 items-start shadow-sm">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                    <div>
                      <p className="text-sm text-zinc-900 font-medium">
                        Background Check Cleared
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        2 days ago by Compliance Team
                      </p>
                    </div>
                  </div>
                  <div className="bg-white border border-zinc-200 rounded-lg p-4 flex gap-4 items-start shadow-sm">
                    <div className="mt-1 h-2 w-2 rounded-full bg-zinc-300 shrink-0" />
                    <div>
                      <p className="text-sm text-zinc-900 font-medium">
                        Application Submitted
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Oct 1, 2023
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter className="p-4 border-t bg-white flex justify-between items-center sm:justify-between">
              <Button
                variant="outline"
                className="rounded-xl font-bold uppercase tracking-widest text-[10px] text-red-600 hover:text-red-700 border-red-100 hover:bg-red-50"
              >
                Reject
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="rounded-xl font-bold uppercase tracking-widest text-[10px]"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
                <Button className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-black uppercase tracking-widest text-[10px]">
                  Advance Stage
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
