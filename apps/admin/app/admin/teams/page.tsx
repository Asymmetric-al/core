"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  ChevronRight,
  ShieldCheck,
  Users,
  Settings2,
  Info,
  Lock,
  UserPlus,
  MoreHorizontal,
  Trash2,
  Activity,
  ExternalLink,
  Mail,
  UserCog,
  Shield,
} from "lucide-react";
import { DynamicIcon } from "@asym/ui/components/mission-control/icons";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@asym/ui/components/shadcn/table";
import { Input } from "@asym/ui/components/shadcn/input";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Avatar, AvatarFallback } from "@asym/ui/components/shadcn/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@asym/ui/components/shadcn/sheet";
import { Label } from "@asym/ui/components/shadcn/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";

import { Separator } from "@asym/ui/components/shadcn/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { tiles } from "@asym/config/tiles";

const TEAMS = [
  {
    id: "1",
    name: "Executive Leadership",
    description: "Main administrative and decision-making body.",
    membersCount: 5,
    status: "Active",
    avatar: "EL",
    color: "bg-indigo-100 text-indigo-700",
    permissions: {
      admin: "Admin",
      crm: "Admin",
      contributions: "Admin",
      reports: "Admin",
    },
  },
  {
    id: "2",
    name: "Technical Operations",
    description: "DevOps, infrastructure, and security management.",
    membersCount: 8,
    status: "Active",
    avatar: "TO",
    color: "bg-slate-100 text-slate-700",
    permissions: {
      admin: "Admin",
      automations: "Admin",
      "web-studio": "Manage",
    },
  },
  {
    id: "3",
    name: "Field Mobilizers",
    description: "Global support team for active missionaries.",
    membersCount: 12,
    status: "Active",
    avatar: "FM",
    color: "bg-blue-100 text-blue-700",
    permissions: {
      mobilize: "Admin",
      crm: "Manage",
      care: "View",
    },
  },
  {
    id: "4",
    name: "Member Care",
    description: "Support and health monitoring for field staff.",
    membersCount: 15,
    status: "Active",
    avatar: "MC",
    color: "bg-rose-100 text-rose-700",
    permissions: {
      care: "Admin",
      support: "Admin",
      crm: "View",
    },
  },
];

const MEMBERS = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "Owner",
    status: "Active",
    team: "Executive Leadership",
  },
  {
    id: "2",
    name: "Sarah Chen",
    email: "sarah@example.com",
    role: "Admin",
    status: "Active",
    team: "Technical Operations",
  },
  {
    id: "3",
    name: "Mike Ross",
    email: "mike@example.com",
    role: "Member",
    status: "Active",
    team: "Field Mobilizers",
  },
  {
    id: "4",
    name: "Rachel Zane",
    email: "rachel@example.com",
    role: "Member",
    status: "Pending",
    team: "Field Mobilizers",
  },
];

export default function TeamsPage() {
  const [selectedTeam, setSelectedTeam] = useState<(typeof TEAMS)[0] | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const renderIcon = (iconName: string) => {
    return <DynamicIcon name={iconName} className="h-4 w-4" />;
  };

  const getPermissionColor = (level: string) => {
    switch (level) {
      case "Admin":
        return "text-rose-600 bg-rose-50 border-rose-100";
      case "Manage":
        return "text-amber-600 bg-amber-50 border-amber-100";
      case "View":
        return "text-blue-600 bg-blue-50 border-blue-100";
      default:
        return "text-slate-400 bg-slate-50 border-slate-100";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Manage Teams
          </h2>
          <p className="text-slate-500 mt-1">
            Organize users and departments with shared, granular permissions.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 text-white shadow-xl hover:bg-slate-800">
                <Plus className="mr-2 h-4 w-4" /> Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Set up a new organizational unit. You can invite members after
                  creation.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Team Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Marketing, Crisis Response"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Brief purpose of this team"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Team</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Teams List */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-slate-50/50 border-b border-slate-100 py-4">
            <div>
              <CardTitle className="text-lg font-bold">
                Organization Teams
              </CardTitle>
              <CardDescription>
                Managed permission groups for Mission Control.
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search teams..."
                className="pl-9 bg-white border-slate-200 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-slate-50/30">
                  <TableHead className="w-[300px] py-3 font-bold text-slate-900">
                    Team Name
                  </TableHead>
                  <TableHead className="font-bold text-slate-900">
                    Permissions Preview
                  </TableHead>
                  <TableHead className="font-bold text-slate-900">
                    Members
                  </TableHead>
                  <TableHead className="text-right font-bold text-slate-900">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TEAMS.map((team) => (
                  <TableRow
                    key={team.id}
                    className="group hover:bg-slate-50/80 transition-colors"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-xs shadow-sm ${team.color}`}
                        >
                          {team.avatar}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">
                            {team.name}
                          </span>
                          <span className="text-xs text-slate-500 line-clamp-1">
                            {team.description}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(team.permissions)
                          .slice(0, 3)
                          .map(([key, level]) => (
                            <Badge
                              key={key}
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 capitalize border-slate-200 font-medium ${getPermissionColor(level as string)}`}
                            >
                              {key}: {level}
                            </Badge>
                          ))}
                        {Object.keys(team.permissions).length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 border-slate-200 text-slate-400"
                          >
                            +{Object.keys(team.permissions).length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2 mr-2">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="size-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm"
                            >
                              {String.fromCharCode(64 + i)}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-600">
                          {team.membersCount}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Sheet
                        onOpenChange={(open) => !open && setSelectedTeam(null)}
                      >
                        <SheetTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 hover:bg-slate-200/50 font-bold text-slate-600 gap-1"
                            onClick={() => setSelectedTeam(team)}
                          >
                            Manage <ChevronRight className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-xl p-0">
                          {selectedTeam && (
                            <div className="flex flex-col h-full">
                              <SheetHeader className="p-6 pb-2 bg-slate-50/80 border-b border-slate-100">
                                <div className="flex items-center gap-4">
                                  <div
                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-bold text-lg shadow-md ${selectedTeam.color}`}
                                  >
                                    {selectedTeam.avatar}
                                  </div>
                                  <div>
                                    <SheetTitle className="text-2xl font-black text-slate-900">
                                      {selectedTeam.name}
                                    </SheetTitle>
                                    <SheetDescription className="text-slate-500 font-medium">
                                      Manage members and granular access for
                                      this team.
                                    </SheetDescription>
                                  </div>
                                </div>
                              </SheetHeader>

                              <Tabs
                                defaultValue="permissions"
                                className="flex-1 overflow-hidden flex flex-col"
                              >
                                <div className="px-6 bg-slate-50/80 border-b border-slate-100">
                                  <TabsList className="bg-transparent h-12 gap-6 rounded-none p-0 border-b-0">
                                    <TabsTrigger
                                      value="permissions"
                                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold text-slate-500 data-[state=active]:text-slate-900 px-0 h-12"
                                    >
                                      <ShieldCheck className="h-4 w-4 mr-2" />{" "}
                                      Permissions
                                    </TabsTrigger>
                                    <TabsTrigger
                                      value="members"
                                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold text-slate-500 data-[state=active]:text-slate-900 px-0 h-12"
                                    >
                                      <Users className="h-4 w-4 mr-2" /> Members
                                      ({selectedTeam.membersCount})
                                    </TabsTrigger>
                                    <TabsTrigger
                                      value="settings"
                                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold text-slate-500 data-[state=active]:text-slate-900 px-0 h-12"
                                    >
                                      <Settings2 className="h-4 w-4 mr-2" />{" "}
                                      Settings
                                    </TabsTrigger>
                                  </TabsList>
                                </div>

                                <TabsContent
                                  value="permissions"
                                  className="flex-1 overflow-y-auto p-6 m-0"
                                >
                                  <div className="space-y-6">
                                    <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-4 rounded-xl">
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-600 rounded-lg text-white">
                                          <Info className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-sm font-bold text-blue-900">
                                            Granular Access Control
                                          </span>
                                          <span className="text-xs text-blue-700 font-medium leading-relaxed">
                                            Changes here apply to all members
                                            assigned to this team.
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-3">
                                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
                                        Module Access
                                      </h3>
                                      <div className="grid gap-2">
                                        {tiles.map((tile) => {
                                          const currentLevel =
                                            (selectedTeam.permissions as any)[
                                              tile.id
                                            ] || "None";
                                          return (
                                            <div
                                              key={tile.id}
                                              className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-white shadow-sm transition-all hover:shadow-md group"
                                            >
                                              <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-500 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                                  {renderIcon(tile.icon)}
                                                </div>
                                                <div className="flex flex-col">
                                                  <span className="font-bold text-slate-900">
                                                    {tile.title}
                                                  </span>
                                                  <span className="text-[11px] text-slate-500 font-medium">
                                                    /{tile.id}
                                                  </span>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-3">
                                                <Select
                                                  defaultValue={currentLevel}
                                                >
                                                  <SelectTrigger className="w-[110px] h-8 text-[11px] font-bold border-slate-200">
                                                    <SelectValue placeholder="Access Level" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem
                                                      value="None"
                                                      className="text-[11px] font-bold"
                                                    >
                                                      None
                                                    </SelectItem>
                                                    <SelectItem
                                                      value="View"
                                                      className="text-[11px] font-bold"
                                                    >
                                                      View
                                                    </SelectItem>
                                                    <SelectItem
                                                      value="Manage"
                                                      className="text-[11px] font-bold"
                                                    >
                                                      Manage
                                                    </SelectItem>
                                                    <SelectItem
                                                      value="Admin"
                                                      className="text-[11px] font-bold"
                                                    >
                                                      Admin
                                                    </SelectItem>
                                                  </SelectContent>
                                                </Select>
                                                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-400">
                                                  {currentLevel === "Admin" ? (
                                                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                                  ) : (
                                                    <Lock className="h-4 w-4" />
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent
                                  value="members"
                                  className="flex-1 overflow-y-auto p-6 m-0"
                                >
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
                                        Team Members
                                      </h3>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-[11px] font-bold border-slate-200"
                                      >
                                        <UserPlus className="h-3.5 w-3.5 mr-1" />{" "}
                                        Add Member
                                      </Button>
                                    </div>
                                    <div className="grid gap-3">
                                      {MEMBERS.filter(
                                        (m) => m.team === selectedTeam.name,
                                      ).map((member) => (
                                        <div
                                          key={member.id}
                                          className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white shadow-sm"
                                        >
                                          <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                              <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs">
                                                {member.name.charAt(0)}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                              <span className="font-bold text-slate-900 text-sm">
                                                {member.name}
                                              </span>
                                              <span className="text-[11px] text-slate-500 font-medium">
                                                {member.email}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Badge
                                              variant="secondary"
                                              className="text-[10px] font-bold px-1.5 py-0 bg-slate-100 text-slate-600 border-transparent shadow-none"
                                            >
                                              {member.role}
                                            </Badge>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-7 w-7 text-slate-400"
                                            >
                                              <MoreHorizontal className="h-3.5 w-3.5" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent
                                  value="settings"
                                  className="flex-1 overflow-y-auto p-6 m-0"
                                >
                                  <div className="space-y-6">
                                    <div className="grid gap-4">
                                      <div className="grid gap-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase">
                                          Team Branding Name
                                        </Label>
                                        <Input
                                          defaultValue={selectedTeam.name}
                                          className="h-10 font-bold border-slate-200"
                                        />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase">
                                          Team Description
                                        </Label>
                                        <Input
                                          defaultValue={
                                            selectedTeam.description
                                          }
                                          className="h-10 font-medium border-slate-200"
                                        />
                                      </div>
                                    </div>
                                    <Separator className="border-slate-100" />
                                    <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl space-y-3">
                                      <div className="flex items-center gap-2 text-rose-800">
                                        <Trash2 className="h-4 w-4" />
                                        <span className="text-sm font-bold">
                                          Danger Zone
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-rose-700 font-medium">
                                        Deleting this team will immediately
                                        revoke access for all members assigned
                                        to it. This action cannot be undone.
                                      </p>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        className="h-8 text-[11px] font-bold bg-rose-600 hover:bg-rose-700 shadow-sm"
                                      >
                                        Permanently Delete Team
                                      </Button>
                                    </div>
                                  </div>
                                </TabsContent>
                              </Tabs>

                              <SheetFooter className="p-6 pt-4 bg-slate-50/80 border-t border-slate-100 mt-auto">
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2 text-slate-500">
                                    <Activity className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                      Last edit: 2 mins ago
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    <SheetClose asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-4 text-xs font-bold border-slate-200 shadow-none"
                                      >
                                        Cancel
                                      </Button>
                                    </SheetClose>
                                    <Button
                                      size="sm"
                                      className="h-9 px-6 text-xs font-bold bg-slate-900 text-white shadow-lg shadow-slate-200"
                                    >
                                      Save Changes
                                    </Button>
                                  </div>
                                </div>
                              </SheetFooter>
                            </div>
                          )}
                        </SheetContent>
                      </Sheet>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Global Members Preview */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-50 py-4">
            <div>
              <CardTitle className="text-lg font-bold">System Users</CardTitle>
              <CardDescription>
                Manage individual user access and roles across teams.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-slate-200 h-9 font-bold text-slate-700"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Invite User
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {MEMBERS.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 transition-all hover:bg-slate-50/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-slate-200 text-slate-600 font-bold">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {member.name}
                        </span>
                        {member.role === "Owner" && (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px] h-4 font-black">
                            OWNER
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Team
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {member.team}
                      </span>
                    </div>
                    <div className="hidden sm:flex flex-col items-end mr-4">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Role
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {member.role}
                      </span>
                    </div>
                    <Badge
                      variant={
                        member.status === "Active" ? "secondary" : "outline"
                      }
                      className={
                        member.status === "Active"
                          ? "bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100 text-[10px] font-bold"
                          : "text-slate-400 border-slate-200 text-[10px] font-bold"
                      }
                    >
                      {member.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-slate-900"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="font-bold text-xs">
                          User Options
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer font-bold text-xs py-2">
                          <UserCog className="mr-2 h-4 w-4 text-slate-400" />{" "}
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer font-bold text-xs py-2">
                          <Shield className="mr-2 h-4 w-4 text-slate-400" />{" "}
                          Assign Team
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer font-bold text-xs py-2">
                          <Settings2 className="mr-2 h-4 w-4 text-slate-400" />{" "}
                          User Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer font-bold text-xs py-2">
                          <Trash2 className="mr-2 h-4 w-4" /> Remove Access
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-50 flex justify-center bg-slate-50/30">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-900 font-bold text-xs"
              >
                View All 124 System Users{" "}
                <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
