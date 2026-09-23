"use client";

import { tiles } from "@asym/config/tiles";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@asym/ui/components/shadcn/alert";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { DataTableColumnHeader } from "@asym/ui/components/shadcn/data-table";
import { DataTableWrapper } from "@asym/ui/components/shadcn/data-table/data-table-wrapper";
import { type ColumnDef } from "@asym/ui/components/shadcn/data-table/tanstack";
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@asym/ui/components/shadcn/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
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

function getPermissionVariant(
  level: string,
): "default" | "secondary" | "outline" {
  switch (level) {
    case "Admin":
      return "default";
    case "Manage":
      return "secondary";
    default:
      return "outline";
  }
}

/** Primary action for Mission Control PageShell header (Create Team dialog). */
export function TeamsPageActions() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="maia" size="lg">
            <Plus data-icon="inline-start" />
            Create Team
          </Button>
        }
      />
      <DialogContent scrollable className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Set up a new organizational unit. You can invite members after
            creation.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Team Name</FieldLabel>
            <Input id="name" placeholder="e.g. Marketing, Crisis Response" />
          </Field>
          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Input id="description" placeholder="Brief purpose of this team" />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button type="submit">Create Team</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TeamPermissionsTab({ selectedTeam }: { selectedTeam: Team }) {
  return (
    <TabsContent value="permissions" className="min-h-0 overflow-y-auto p-4">
      <div className="flex flex-col gap-6">
        <Alert>
          <Info />
          <AlertTitle>Granular Access Control</AlertTitle>
          <AlertDescription>
            Changes here apply to all members assigned to this team.
          </AlertDescription>
        </Alert>
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Module Access
          </h3>
          <div className="grid gap-2">
            {tiles.map((tile) => {
              const currentLevel = selectedTeam.permissions[tile.id] ?? "None";
              return (
                <div
                  key={tile.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                      <TileIcon iconName={tile.icon} />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="break-words font-semibold text-foreground">
                        {tile.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        /{tile.id}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select
                      defaultValue={currentLevel}
                      items={[
                        { value: "None", label: "None" },
                        { value: "View", label: "View" },
                        { value: "Manage", label: "Manage" },
                        { value: "Admin", label: "Admin" },
                      ]}
                    >
                      <SelectTrigger
                        size="sm"
                        aria-label={`${tile.title} access level`}
                      >
                        <SelectValue placeholder="Access Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="View">View</SelectItem>
                          <SelectItem value="Manage">Manage</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-foreground">
                      {currentLevel === "Admin" ? (
                        <ShieldCheck className="size-4" />
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
    <TabsContent value="members" className="min-h-0 overflow-y-auto p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Team Members
          </h3>
          <Button variant="outline" size="sm">
            <UserPlus data-icon="inline-start" />
            Add Member
          </Button>
        </div>
        <div className="grid gap-3">
          {members
            .filter((member) => member.team === selectedTeam.name)
            .map((member) => (
              <div
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <span className="break-words text-sm font-semibold text-foreground">
                      {member.name}
                    </span>
                    <span className="break-all text-xs text-muted-foreground">
                      {member.email}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{member.role}</Badge>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Open actions for ${member.name}`}
                  >
                    <MoreHorizontal />
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
  const id = React.useId();
  return (
    <TabsContent value="settings" className="min-h-0 overflow-y-auto p-4">
      <div className="flex flex-col gap-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={`${id}-name`}>Team Branding Name</FieldLabel>
            <Input id={`${id}-name`} defaultValue={selectedTeam.name} />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-description`}>
              Team Description
            </FieldLabel>
            <Input
              id={`${id}-description`}
              defaultValue={selectedTeam.description}
            />
          </Field>
        </FieldGroup>
        <Separator />
        <div className="flex flex-col items-start gap-3">
          <Alert variant="destructive">
            <Trash2 />
            <AlertTitle>Danger Zone</AlertTitle>
            <AlertDescription>
              Deleting this team will immediately revoke access for all members
              assigned to it. This action cannot be undone.
            </AlertDescription>
          </Alert>
          <Button variant="destructive" size="sm">
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
    <SheetContent className="w-full sm:max-w-xl">
      {selectedTeam && (
        <div className="flex min-h-0 flex-1 flex-col">
          <SheetHeader>
            <div className="flex min-w-0 items-center gap-3 pr-6">
              <Avatar size="lg">
                <AvatarFallback>{selectedTeam.avatar}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 break-words">
                <SheetTitle className="text-xl">{selectedTeam.name}</SheetTitle>
                <SheetDescription>
                  Manage members and granular access for this team.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <Tabs defaultValue="permissions" className="min-h-0 flex-1">
            <div
              className="overflow-x-auto scroll-px-4 px-4 pb-2"
              onFocus={(event) => {
                event.target.scrollIntoView({
                  block: "nearest",
                  inline: "nearest",
                });
              }}
            >
              <TabsList variant="line">
                <TabsTrigger value="permissions">
                  <ShieldCheck />
                  Permissions
                </TabsTrigger>
                <TabsTrigger value="members">
                  <Users />
                  Members ({selectedTeam.membersCount})
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings2 />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>
            <TeamPermissionsTab selectedTeam={selectedTeam} />
            <TeamMembersTab selectedTeam={selectedTeam} members={members} />
            <TeamSettingsTab selectedTeam={selectedTeam} />
          </Tabs>
          <SheetFooter>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="size-3.5" />
                <span className="text-xs">Last edit: 2 mins ago</span>
              </div>
              <div className="flex gap-2">
                <SheetClose
                  render={
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                  }
                />
                <Button size="sm" onClick={onClose}>
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
          <div className="flex min-w-0 items-center gap-3 py-1">
            <Avatar size="lg">
              <AvatarFallback>{row.original.avatar}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="break-words font-semibold text-foreground">
                {row.original.name}
              </span>
              <span className="line-clamp-1 text-xs text-muted-foreground">
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
                  variant={getPermissionVariant(level as string)}
                >
                  {key}: {level}
                </Badge>
              ))}
            {Object.keys(row.original.permissions).length > 3 && (
              <Badge variant="outline">
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
            <AvatarGroup>
              {["A", "B", "C"].map((initial) => (
                <Avatar key={initial} size="sm">
                  <AvatarFallback>{initial}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
            <span className="text-xs font-semibold text-foreground">
              {row.original.membersCount}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Team actions</span>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectTeam(row.original)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.stopPropagation();
                    }
                  }}
                >
                  Manage
                  <ChevronRight data-icon="inline-end" />
                </Button>
              }
            />
          </div>
        ),
      },
    ],
    [onSelectTeam],
  );
  return (
    <Sheet
      open={selectedTeam !== null}
      onOpenChange={(open) => !open && onSelectTeam(null)}
    >
      <Card className="min-w-0">
        <CardHeader>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <CardTitle>Organization Teams</CardTitle>
              <CardDescription>
                Managed permission groups for Mission Control.
              </CardDescription>
            </div>
            <div className="w-full sm:w-64">
              <InputGroup>
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  aria-label="Search teams"
                  placeholder="Search teams..."
                  value={searchTerm}
                  onChange={(event) => onSearchTermChange(event.target.value)}
                />
              </InputGroup>
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-w-0">
          <div className="max-w-full overflow-x-auto">
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
          </div>
        </CardContent>
      </Card>
      <TeamManagementSheet
        selectedTeam={selectedTeam}
        members={members}
        onClose={() => onSelectTeam(null)}
      />
    </Sheet>
  );
}

export function SystemUsersCard({ members }: { members: Member[] }) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>System Users</CardTitle>
            <CardDescription>
              Manage individual user access and roles across teams.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <UserPlus data-icon="inline-start" />
            Invite User
          </Button>
        </div>
      </CardHeader>
      <CardContent className="min-w-0">
        <div className="divide-y divide-border">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex min-w-0 flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar size="lg">
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="break-words font-semibold text-foreground">
                      {member.name}
                    </span>
                    {member.role === "Owner" && <Badge>OWNER</Badge>}
                  </div>
                  <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="size-3 shrink-0" />
                    <span className="break-all">{member.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="hidden min-w-0 flex-col items-end sm:flex">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    Team
                  </span>
                  <span className="break-words text-xs font-semibold text-foreground">
                    {member.team}
                  </span>
                </div>
                <div className="hidden flex-col items-end sm:flex">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    Role
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {member.role}
                  </span>
                </div>
                <Badge
                  variant={member.status === "Active" ? "secondary" : "outline"}
                >
                  {member.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Open user options for ${member.name}`}
                      >
                        <MoreHorizontal />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>User Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <UserCog />
                        Change Role
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Shield />
                        Assign Team
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings2 />
                        User Settings
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem variant="destructive">
                        <Trash2 />
                        Remove Access
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="ghost" size="sm">
          View All 124 System Users
          <ExternalLink data-icon="inline-end" />
        </Button>
      </CardFooter>
    </Card>
  );
}
