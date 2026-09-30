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
