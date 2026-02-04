"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@asym/ui/components/shadcn/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@asym/ui/components/shadcn/sheet";
import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";
import { Progress } from "@asym/ui/components/shadcn/progress";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import {
  MoreHorizontal,
  Search,
  Filter,
  Plus,
  Users,
  UserCheck,
  GraduationCap,
  Plane,
  MapPin,
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckCircle2,
  Circle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@asym/ui/components/shadcn/table";
import { cn } from "@asym/ui/lib/utils";

// --- Types ---

type Stage = "Applied" | "Vetting" | "Training" | "Ready" | "Deployed";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  stage: Stage;
  readiness: number; // 0-100
  appliedDate: string;
  avatar?: string;
  tags: string[];
}

// --- Mock Data ---

const MOCK_CANDIDATES: Candidate[] = [
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

const STAGE_COLORS: Record<Stage, string> = {
  Applied: "bg-slate-100 text-slate-700",
  Vetting: "bg-blue-50 text-blue-700 border-blue-200",
  Training: "bg-purple-50 text-purple-700 border-purple-200",
  Ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Deployed: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

// --- Components ---

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) => (
  <Card className="border-slate-200 shadow-sm rounded-xl">
    <CardContent className="flex items-center justify-between p-4">
      <div className="text-left">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </p>
        <h3 className="text-xl font-bold text-slate-900 mt-0.5">{value}</h3>
      </div>
      <div
        className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center bg-opacity-10",
          color.replace("text-", "bg-"),
        )}
      >
        <Icon className={cn("h-5 w-5", color)} />
      </div>
    </CardContent>
  </Card>
);

export default function Mobilize() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  const filteredCandidates = MOCK_CANDIDATES.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "all" || c.stage.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  const stats = {
    applied: MOCK_CANDIDATES.filter((c) => c.stage === "Applied").length,
    vetting: MOCK_CANDIDATES.filter((c) => c.stage === "Vetting").length,
    training: MOCK_CANDIDATES.filter((c) => c.stage === "Training").length,
    ready: MOCK_CANDIDATES.filter(
      (c) => c.stage === "Ready" || c.stage === "Deployed",
    ).length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-100">
        <div className="text-left">
          <h1 className="text-3xl font-black tracking-tighter text-zinc-900 lg:text-4xl">
            Mobilization
          </h1>
          <p className="text-zinc-500 mt-1 text-xs font-bold uppercase tracking-wider">
            Manage missionary pipeline, vetting, and deployment.
          </p>
        </div>
        <Button
          className="bg-zinc-900 text-white shadow-md hover:bg-zinc-800 rounded-lg px-6 h-9 text-[10px] font-bold uppercase tracking-wider"
          onClick={() => setIsAddSheetOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Candidate
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="New Applicants"
          value={stats.applied}
          icon={Users}
          color="text-slate-600"
        />
        <StatCard
          title="In Vetting"
          value={stats.vetting}
          icon={UserCheck}
          color="text-blue-600"
        />
        <StatCard
          title="In Training"
          value={stats.training}
          icon={GraduationCap}
          color="text-purple-600"
        />
        <StatCard
          title="Ready / Deployed"
          value={stats.ready}
          icon={Plane}
          color="text-emerald-600"
        />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-3 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-3 bg-slate-50/50">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full lg:w-auto"
          >
            <TabsList className="bg-white border border-slate-200 h-8 rounded-lg p-0.5">
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
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search candidates..."
                className="pl-8 bg-white h-8 text-xs rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="bg-white border-slate-200 shadow-none h-8 w-8 rounded-lg"
            >
              <Filter className="h-3.5 w-3.5 text-slate-500" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
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
              {filteredCandidates.map((candidate) => (
                <TableRow
                  key={candidate.id}
                  className="hover:bg-slate-50/50 cursor-pointer h-12"
                  onClick={() => setSelectedCandidate(candidate)}
                >
                  <TableCell className="px-4 py-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8 bg-slate-100 border border-slate-200 rounded-lg">
                        <AvatarFallback className="text-[10px] font-bold text-slate-600">
                          {candidate.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          {candidate.name}
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight">
                          {candidate.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-700 leading-tight">
                        {candidate.role}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
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
                      <div className="flex justify-between text-[8px] uppercase font-bold text-slate-400">
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCandidate(candidate);
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4 text-slate-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCandidates.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-slate-500"
                  >
                    No candidates found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* --- ADD CANDIDATE SHEET --- */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl p-0 gap-0 bg-slate-50 flex flex-col h-full">
          <SheetHeader className="px-6 py-5 bg-white border-b border-slate-100">
            <SheetTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" /> New Candidate Profile
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
            <Button variant="outline" onClick={() => setIsAddSheetOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-slate-900 text-white">Create Profile</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* --- CANDIDATE DETAIL SHEET --- */}
      <Sheet
        open={!!selectedCandidate}
        onOpenChange={(open) => !open && setSelectedCandidate(null)}
      >
        <SheetContent className="w-full sm:max-w-2xl p-0 gap-0 overflow-hidden bg-slate-50 shadow-2xl border-l border-slate-200 flex flex-col h-full">
          <SheetHeader className="sr-only">
            <SheetTitle>
              Candidate Profile: {selectedCandidate?.name}
            </SheetTitle>
            <SheetDescription>
              View detailed candidate information and manage mobilization
              process.
            </SheetDescription>
          </SheetHeader>

          {selectedCandidate && (
            <>
              {/* Profile Header */}
              <div className="bg-white border-b border-slate-200 p-8 pb-0">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-5">
                    <Avatar className="h-20 w-20 border-4 border-slate-50 shadow-sm">
                      <AvatarFallback className="text-xl bg-slate-100 text-slate-600 font-bold">
                        {selectedCandidate.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <h2 className="text-2xl font-bold text-slate-900">
                        {selectedCandidate.name}
                      </h2>
                      <div className="flex items-center gap-2 text-slate-500 mt-1">
                        <MapPin className="h-4 w-4" />{" "}
                        {selectedCandidate.location}
                        <span className="text-slate-300">•</span>
                        <span>{selectedCandidate.role}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "border shadow-none",
                            STAGE_COLORS[selectedCandidate.stage],
                          )}
                        >
                          {selectedCandidate.stage}
                        </Badge>
                        {selectedCandidate.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="bg-white text-slate-600 border-slate-200 shadow-none"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-9">
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      className="h-9 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Contact
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="bg-transparent h-auto p-0 gap-6">
                    <TabsTrigger
                      value="overview"
                      className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-1 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 transition-all"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="vetting"
                      className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-1 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 transition-all"
                    >
                      Vetting Checklist
                    </TabsTrigger>
                    <TabsTrigger
                      value="placement"
                      className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-1 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 transition-all"
                    >
                      Placement
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-8">
                {/* Overview Tab Content */}
                <div className="space-y-6">
                  {/* Contact Card */}
                  <Card className="text-left shadow-sm">
                    <CardHeader className="pb-3 border-b border-slate-100">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 grid grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs uppercase font-bold mb-1">
                          <Mail className="h-3 w-3" /> Email
                        </div>
                        <div className="text-sm font-medium text-slate-900">
                          {selectedCandidate.email}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs uppercase font-bold mb-1">
                          <Phone className="h-3 w-3" /> Phone
                        </div>
                        <div className="text-sm font-medium text-slate-900">
                          {selectedCandidate.phone}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs uppercase font-bold mb-1">
                          <Calendar className="h-3 w-3" /> Applied Date
                        </div>
                        <div className="text-sm font-medium text-slate-900">
                          {selectedCandidate.appliedDate}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Readiness Card */}
                  <Card className="text-left shadow-sm">
                    <CardHeader className="pb-3 border-b border-slate-100">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
                        Readiness Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex items-end justify-between mb-2">
                        <span className="text-3xl font-bold text-slate-900">
                          {selectedCandidate.readiness}%
                        </span>
                        <span className="text-sm text-slate-500 font-medium mb-1">
                          Training Completion
                        </span>
                      </div>
                      <Progress
                        value={selectedCandidate.readiness}
                        className="h-3"
                      />
                      <p className="text-xs text-slate-500 mt-4">
                        Based on completed modules, vetting interviews, and
                        document submission.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Vetting Preview */}
                  <div className="space-y-3 text-left">
                    <h3 className="text-sm font-bold text-slate-900">
                      Recent Activity
                    </h3>
                    <div className="bg-white border border-slate-200 rounded-lg p-4 flex gap-4 items-start shadow-sm">
                      <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      <div>
                        <p className="text-sm text-slate-900 font-medium">
                          Background Check Cleared
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          2 days ago by Compliance Team
                        </p>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4 flex gap-4 items-start shadow-sm">
                      <div className="mt-1 h-2 w-2 rounded-full bg-slate-300 shrink-0" />
                      <div>
                        <p className="text-sm text-slate-900 font-medium">
                          Application Submitted
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Oct 1, 2023
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <SheetFooter className="p-4 border-t bg-white flex justify-between items-center sm:justify-between">
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 border-red-100 hover:bg-red-50"
                >
                  Reject
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedCandidate(null)}
                  >
                    Close
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                    Advance Stage
                  </Button>
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
