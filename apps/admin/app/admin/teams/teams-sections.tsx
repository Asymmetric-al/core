"use client";

import { tiles } from "@asym/config/tiles";
import { Avatar, AvatarFallback } from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { DataTableColumnHeader } from "@asym/ui/components/shadcn/data-table";
import { DataTableWrapper } from "@asym/ui/components/shadcn/data-table/data-table-wrapper";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { Separator } from "@asym/ui/components/shadcn/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@asym/ui/components/shadcn/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Activity,
  ChevronRight,
  ExternalLink,
  Info,
  Lock,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  Shield,
  ShieldCheck,
  Trash2,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";
import React from "react";

import { DynamicIcon } from "@/features/mission-control/components/icons";

export type PermissionLevel = "Admin" | "Manage" | "View";

export type Team = {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  status: string;
  avatar: string;
  color: string;
  permissions: Partial<Record<string, PermissionLevel>>;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  team: string;
};

export const TEAMS: Team[] = [
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
    color: "bg-zinc-100 text-zinc-700",
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

export const MEMBERS: Member[] = [
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

const TileIcon = React.memo(function TileIcon({
  iconName,
}: {
  iconName: string;
}) {
  return <DynamicIcon name={iconName} className="size-4" />;
});

function getPermissionColor(level: string) {
  switch (level) {
    case "Admin":
      return "text-rose-600 bg-rose-50 border-rose-100";
    case "Manage":
      return "text-amber-600 bg-amber-50 border-amber-100";
    case "View":
      return "text-blue-600 bg-blue-50 border-blue-100";
    default:
      return "text-zinc-400 bg-zinc-50 border-zinc-100";
  }
}

/** Primary action for Mission Control PageShell header (Create Team dialog). */
export function TeamsPageActions() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button className="h-11 rounded-xl bg-zinc-900 font-semibold uppercase tracking-widest text-[10px] text-white shadow-xl hover:bg-zinc-800" />
        }
      >
        <Plus className="mr-2 size-4" />
        Create Team
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
            <Input id="name" placeholder="e.g. Marketing, Crisis Response" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="Brief purpose of this team" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Create Team</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TeamPermissionsTab({ selectedTeam }: { selectedTeam: Team }) {
  return (
    <TabsContent value="permissions" className="flex-1 overflow-y-auto p-6 m-0">
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Info className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-blue-900">
                Granular Access Control
              </span>
              <span className="text-xs text-blue-700 font-medium leading-relaxed">
                Changes here apply to all members assigned to this team.
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
            Module Access
          </h3>
          <div className="grid gap-2">
            {tiles.map((tile) => {
              const currentLevel = selectedTeam.permissions[tile.id] ?? "None";
              return (
                <div
                  key={tile.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 hover:border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-50 text-zinc-500 border border-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                      <TileIcon iconName={tile.icon} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-zinc-900">
                        {tile.title}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-medium">
                        /{tile.id}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select defaultValue={currentLevel}>
                      <SelectTrigger className="w-[110px] h-8 text-[11px] font-semibold border-zinc-200">
                        <SelectValue placeholder="Access Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="None"
                          className="text-[11px] font-semibold"
                        >
                          None
                        </SelectItem>
                        <SelectItem
                          value="View"
                          className="text-[11px] font-semibold"
                        >
                          View
                        </SelectItem>
                        <SelectItem
                          value="Manage"
                          className="text-[11px] font-semibold"
                        >
                          Manage
                        </SelectItem>
                        <SelectItem
                          value="Admin"
                          className="text-[11px] font-semibold"
                        >
                          Admin
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center justify-center size-8 rounded-lg bg-zinc-50 border border-zinc-100 text-zinc-400">
                      {currentLevel === "Admin" ? (
                        <ShieldCheck className="size-4 text-emerald-600" />
                      ) : (
                        <Lock className="size-4" />
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
  );
}

function TeamMembersTab({
  selectedTeam,
  members,
}: {
  selectedTeam: Team;
  members: Member[];
}) {
  return (
    <TabsContent value="members" className="flex-1 overflow-y-auto p-6 m-0">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
            Team Members
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-lg border-zinc-200 text-xs font-semibold"
          >
            <UserPlus className="size-3.5 mr-1" /> Add Member
          </Button>
        </div>
        <div className="grid gap-3">
          {members
            .filter((member) => member.team === selectedTeam.name)
            .map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-white shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-9 border-2 border-white shadow-sm">
                    <AvatarFallback className="bg-zinc-100 text-zinc-600 font-semibold text-xs">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold text-zinc-900 text-sm">
                      {member.name}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-medium">
                      {member.email}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-semibold px-1.5 py-0 bg-zinc-100 text-zinc-600 border-transparent shadow-none"
                  >
                    {member.role}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Open actions for ${member.name}`}
                    className="size-7 text-zinc-500 hover:text-zinc-900"
                  >
                    <MoreHorizontal className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </TabsContent>
  );
}

function TeamSettingsTab({ selectedTeam }: { selectedTeam: Team }) {
  return (
    <TabsContent value="settings" className="flex-1 overflow-y-auto p-6 m-0">
      <div className="space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label className="text-xs font-semibold text-zinc-500 uppercase">
              Team Branding Name
            </Label>
            <Input
              defaultValue={selectedTeam.name}
              className="h-10 font-semibold border-zinc-200"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-xs font-semibold text-zinc-500 uppercase">
              Team Description
            </Label>
            <Input
              defaultValue={selectedTeam.description}
              className="h-10 font-medium border-zinc-200"
            />
          </div>
        </div>
        <Separator className="border-zinc-100" />
        <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-rose-800">
            <Trash2 className="size-4" />
            <span className="text-sm font-semibold">Danger Zone</span>
          </div>
          <p className="text-[11px] text-rose-700 font-medium">
            Deleting this team will immediately revoke access for all members
            assigned to it. This action cannot be undone.
          </p>
          <Button
            variant="destructive"
            size="sm"
            className="h-8 text-[11px] font-semibold bg-rose-600 hover:bg-rose-700 shadow-sm"
          >
            Permanently Delete Team
          </Button>
        </div>
      </div>
    </TabsContent>
  );
}

function TeamManagementSheet({
  selectedTeam,
  members,
  onClose,
}: {
  selectedTeam: Team | null;
  members: Member[];
  onClose: () => void;
}) {
  return (
    <SheetContent className="sm:max-w-xl p-0">
      {selectedTeam && (
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-2 bg-zinc-50/80 border-b border-zinc-100">
            <div className="flex items-center gap-4">
              <div
                className={`flex size-12 shrink-0 items-center justify-center rounded-2xl font-semibold text-lg shadow-md ${selectedTeam.color}`}
              >
                {selectedTeam.avatar}
              </div>
              <div>
                <SheetTitle className="text-2xl font-semibold text-zinc-900">
                  {selectedTeam.name}
                </SheetTitle>
                <SheetDescription className="text-zinc-500 font-medium">
                  Manage members and granular access for this team.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <Tabs
            defaultValue="permissions"
            className="flex-1 overflow-hidden flex flex-col"
          >
            <div className="px-6 bg-zinc-50/80 border-b border-zinc-100">
              <TabsList className="bg-transparent h-12 gap-6 rounded-none p-0 border-b-0">
                <TabsTrigger
                  value="permissions"
                  className="rounded-none border-b-2 border-transparent data-active:border-zinc-900 data-active:bg-transparent data-active:shadow-none font-semibold text-zinc-500 data-active:text-zinc-900 px-0 h-12"
                >
                  <ShieldCheck className="size-4 mr-2" /> Permissions
                </TabsTrigger>
                <TabsTrigger
                  value="members"
                  className="rounded-none border-b-2 border-transparent data-active:border-zinc-900 data-active:bg-transparent data-active:shadow-none font-semibold text-zinc-500 data-active:text-zinc-900 px-0 h-12"
                >
                  <Users className="size-4 mr-2" /> Members (
                  {selectedTeam.membersCount})
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="rounded-none border-b-2 border-transparent data-active:border-zinc-900 data-active:bg-transparent data-active:shadow-none font-semibold text-zinc-500 data-active:text-zinc-900 px-0 h-12"
                >
                  <Settings2 className="size-4 mr-2" /> Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <TeamPermissionsTab selectedTeam={selectedTeam} />
            <TeamMembersTab selectedTeam={selectedTeam} members={members} />
            <TeamSettingsTab selectedTeam={selectedTeam} />
          </Tabs>

          <SheetFooter className="p-6 pt-4 bg-zinc-50/80 border-t border-zinc-100 mt-auto">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-zinc-500">
                <Activity className="size-3.5" />
                <span className="text-xs font-medium">
                  Last edit: 2 mins ago
                </span>
              </div>
              <div className="flex gap-2">
                <SheetClose
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-4 text-xs font-semibold border-zinc-200 shadow-none"
                    />
                  }
                >
                  Cancel
                </SheetClose>
                <Button
                  size="sm"
                  className="h-9 px-6 text-xs font-semibold bg-zinc-900 text-white shadow-lg shadow-zinc-200"
                  onClick={onClose}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </SheetFooter>
        </div>
      )}
    </SheetContent>
  );
}

interface TeamsTableCardProps {
  teams: Team[];
  members: Member[];
  isLoading?: boolean;
  searchTerm: string;
  selectedTeam: Team | null;
  onSearchTermChange: (value: string) => void;
  onSelectTeam: (team: Team | null) => void;
}

export function TeamsTableCard({
  teams,
  members,
  isLoading,
  searchTerm,
  selectedTeam,
  onSearchTermChange,
  onSelectTeam,
}: TeamsTableCardProps) {
  const columns = React.useMemo<ColumnDef<Team>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Team Name" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3 py-1">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl font-semibold text-xs shadow-sm ${row.original.color}`}
            >
              {row.original.avatar}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-zinc-900">
                {row.original.name}
              </span>
              <span className="text-xs text-zinc-500 line-clamp-1">
                {row.original.description}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: "permissions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Permissions Preview" />
        ),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(row.original.permissions)
              .slice(0, 3)
              .map(([key, level]) => (
                <Badge
                  key={key}
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 capitalize border-zinc-200 font-medium ${getPermissionColor(level as string)}`}
                >
                  {key}: {level}
                </Badge>
              ))}
            {Object.keys(row.original.permissions).length > 3 && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 border-zinc-200 text-zinc-400"
              >
                +{Object.keys(row.original.permissions).length - 3} more
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "membersCount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Members" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex -gap-x-2 mr-2">
              {["A", "B", "C"].map((initial) => (
                <div
                  key={initial}
                  className="size-6 rounded-full border-2 border-white bg-zinc-200 flex items-center justify-center text-[10px] font-semibold text-zinc-500 shadow-sm"
                >
                  {initial}
                </div>
              ))}
            </div>
            <span className="text-xs font-semibold text-zinc-600">
              {row.original.membersCount}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex justify-end pr-2">
            <Sheet onOpenChange={(open) => !open && onSelectTeam(null)}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 hover:bg-zinc-200/50 font-semibold text-zinc-600 gap-1"
                    onClick={() => onSelectTeam(row.original)}
                  />
                }
              >
                Manage <ChevronRight className="size-4" />
              </SheetTrigger>
              <TeamManagementSheet
                selectedTeam={selectedTeam}
                members={members}
                onClose={() => onSelectTeam(null)}
              />
            </Sheet>
          </div>
        ),
      },
    ],
    [members, onSelectTeam, selectedTeam],
  );

  return (
    <Card className="border-zinc-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-y-0 bg-zinc-50/50 border-b border-zinc-100 py-4">
        <div>
          <CardTitle className="text-lg font-semibold">
            Organization Teams
          </CardTitle>
          <CardDescription>
            Managed permission groups for Mission Control.
          </CardDescription>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 size-4 text-zinc-500" />
          <Input
            placeholder="Search teams..."
            className="pl-9 bg-white border-zinc-200 h-9"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <DataTableWrapper
          columns={columns}
          data={teams}
          isLoading={isLoading}
          config={{
            enableRowSelection: false,
            enableColumnVisibility: false,
            enablePagination: true,
            enableFilters: false,
            enableSorting: true,
          }}
          emptyState={{
            title: "No teams found",
            description: "Adjust the current search to find a team.",
          }}
        />
      </CardContent>
    </Card>
  );
}

export function SystemUsersCard({ members }: { members: Member[] }) {
  return (
    <Card className="border-zinc-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-y-0 border-b border-zinc-50 py-4">
        <div>
          <CardTitle className="text-lg font-semibold">System Users</CardTitle>
          <CardDescription>
            Manage individual user access and roles across teams.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="bg-white border-zinc-200 h-9 font-semibold text-zinc-700"
        >
          <UserPlus className="mr-2 size-4" /> Invite User
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-zinc-50">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 transition-all hover:bg-zinc-50/50"
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-10 border-2 border-white shadow-sm">
                  <AvatarFallback className="bg-zinc-200 text-zinc-600 font-semibold">
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900">
                      {member.name}
                    </span>
                    {member.role === "Owner" && (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px] h-4 font-semibold">
                        OWNER
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
                    <Mail className="size-3" />
                    {member.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400">
                    Team
                  </span>
                  <span className="text-xs font-semibold text-zinc-700">
                    {member.team}
                  </span>
                </div>
                <div className="hidden sm:flex flex-col items-end mr-4">
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400">
                    Role
                  </span>
                  <span className="text-xs font-semibold text-zinc-700">
                    {member.role}
                  </span>
                </div>
                <Badge
                  variant={member.status === "Active" ? "secondary" : "outline"}
                  className={
                    member.status === "Active"
                      ? "bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100 text-[10px] font-semibold"
                      : "text-zinc-400 border-zinc-200 text-[10px] font-semibold"
                  }
                >
                  {member.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-zinc-400 hover:text-zinc-900"
                      />
                    }
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="font-semibold text-xs">
                      User Options
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer font-semibold text-xs py-2">
                      <UserCog className="mr-2 size-4 text-zinc-400" /> Change
                      Role
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer font-semibold text-xs py-2">
                      <Shield className="mr-2 size-4 text-zinc-400" /> Assign
                      Team
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer font-semibold text-xs py-2">
                      <Settings2 className="mr-2 size-4 text-zinc-400" /> User
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer font-semibold text-xs py-2">
                      <Trash2 className="mr-2 size-4" /> Remove Access
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-zinc-50 flex justify-center bg-zinc-50/30">
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-500 hover:text-zinc-900 font-semibold text-xs"
          >
            View All 124 System Users <ExternalLink className="ml-2 size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
