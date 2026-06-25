"use client";

import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { z } from "zod";

import { getQueryClient } from "../providers/query-client";
import { adminSurfaceQueryKeys } from "../query-keys";

// Local-only transition collections for admin workspace demo surfaces. New
// product-backed admin data should use Supabase table collections or server
// read models instead of adding more mutable in-memory seed collections here.
function cloneValue<T>(value: T): T {
  return structuredClone(value);
}

const crmActivitySchema = z.object({
  id: z.string().min(1),
  type: z.enum(["note", "call", "email", "meeting", "stage_change", "gift"]),
  date: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  amount: z.number().optional(),
});

const crmContactSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  avatar: z.string().optional(),
  title: z.string().min(1),
  company: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  value: z.number(),
  stage: z.enum(["New", "Contacted", "Meeting", "Proposal", "Won"]),
  owner: z.string().min(1),
  lastActivity: z.string().min(1),
  tags: z.array(z.string()),
  city: z.string().min(1),
  bio: z.string().min(1),
  activities: z.array(crmActivitySchema),
});

const taskLinkedEntitySchema = z.object({
  id: z.string().min(1),
  type: z.enum(["donor", "missionary", "contact", "organization"]),
  name: z.string().min(1),
  avatar: z.string().optional(),
  email: z.string().optional(),
});

const taskReminderSchema = z.object({
  id: z.string().min(1),
  task_id: z.string().min(1),
  remind_at: z.string().min(1),
  type: z.enum(["email", "notification", "both"]),
  sent: z.boolean(),
});

const taskCommentSchema = z.object({
  id: z.string().min(1),
  task_id: z.string().min(1),
  user_id: z.string().min(1),
  user_name: z.string().min(1),
  user_avatar: z.string().optional(),
  content: z.string().min(1),
  created_at: z.string().min(1),
});

const taskSchema = z.object({
  id: z.string().min(1),
  tenant_id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["urgent", "high", "medium", "low"]),
  status: z.enum(["todo", "in_progress", "completed", "cancelled"]),
  type: z.enum(["call", "email", "meeting", "follow_up", "todo", "review"]),
  due_date: z.string().optional(),
  due_time: z.string().optional(),
  created_by: z.string().min(1),
  assigned_to: z.string().optional(),
  assigned_to_name: z.string().optional(),
  assigned_to_avatar: z.string().optional(),
  linked_entity: taskLinkedEntitySchema.optional(),
  reminders: z.array(taskReminderSchema),
  comments: z.array(taskCommentSchema),
  tags: z.array(z.string()),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
  completed_at: z.string().optional(),
});

const taskStaffSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  avatar_url: z.string().optional(),
  role: z.string().min(1),
});

const carePersonnelSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  location: z.string().min(1),
  timezone: z.string().min(1),
  status: z.enum(["Healthy", "Needs Attention", "At Risk", "Crisis"]),
  lastCheckIn: z.string().min(1),
  nextScheduledCheckIn: z.string().optional(),
  initials: z.string().min(1),
  avatarUrl: z.string().optional(),
  role: z.string().min(1),
  region: z.enum([
    "Africa",
    "SE Asia",
    "Europe",
    "Latin America",
    "Middle East",
    "North America",
  ]),
  healthSignals: z.object({
    emotional: z.number(),
    spiritual: z.number(),
    physical: z.number(),
    financial: z.number(),
  }),
  careGaps: z.array(z.string()),
  manualAttention: z.boolean().optional(),
});

const careActivitySchema = z.object({
  id: z.string().min(1),
  personnelId: z.string().min(1),
  type: z.enum([
    "Video Call",
    "In-Person Visit",
    "Check-in",
    "Pastoral Note",
    "Care Plan Update",
    "Crisis Intervention",
    "Birthday",
    "Prayer Request",
  ]),
  content: z.string().min(1),
  date: z.string().min(1),
  authorId: z.string().min(1),
  authorName: z.string().min(1),
  isPrivate: z.boolean(),
  threadId: z.string().optional(),
});

const attendeeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  ticketType: z.string().min(1),
  status: z.enum(["Registered", "Checked In", "Cancelled", "Waitlist"]),
  paymentStatus: z.enum(["Paid", "Pending", "Refunded", "Due"]),
  checkInTime: z.string().optional(),
  organization: z.string().optional(),
  jobTitle: z.string().optional(),
  registrationDate: z.string().min(1),
  dietaryRestrictions: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
  tshirtSize: z.string().optional(),
  notes: z.string().optional(),
  assignedSessions: z.array(z.string()),
  assignedHotelId: z.string().optional(),
  assignedRoomNumber: z.string().optional(),
  avatar: z.string().optional(),
  isVip: z.boolean().optional(),
});

const mobilizeCandidateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  role: z.string().min(1),
  location: z.string().min(1),
  stage: z.enum(["Applied", "Vetting", "Training", "Ready", "Deployed"]),
  readiness: z.number(),
  appliedDate: z.string().min(1),
  avatar: z.string().optional(),
  tags: z.array(z.string()),
});

const teamSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  membersCount: z.number(),
  status: z.string().min(1),
  avatar: z.string().min(1),
  color: z.string().min(1),
  permissions: z.record(z.string(), z.enum(["Admin", "Manage", "View"])),
});

const teamMemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string().min(1),
  status: z.string().min(1),
  team: z.string().min(1),
});

export type AdminCrmContact = z.infer<typeof crmContactSchema>;
export type AdminTask = z.infer<typeof taskSchema>;
export type AdminTaskStaffMember = z.infer<typeof taskStaffSchema>;
export type AdminTaskLinkedEntity = z.infer<typeof taskLinkedEntitySchema>;
export type AdminCarePersonnel = z.infer<typeof carePersonnelSchema>;
export type AdminCareActivity = z.infer<typeof careActivitySchema>;
export type AdminEventAttendee = z.infer<typeof attendeeSchema>;
export type AdminMobilizeCandidate = z.infer<typeof mobilizeCandidateSchema>;
export type AdminTeam = z.infer<typeof teamSchema>;
export type AdminTeamMember = z.infer<typeof teamMemberSchema>;

const CRM_CONTACTS_SEED: AdminCrmContact[] = [
  {
    id: "crm-1",
    name: "Alice Johnson",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60",
    title: "Director of Giving",
    company: "TechFoundations",
    email: "alice@techfoundations.org",
    phone: "+1 555-0101",
    value: 50000,
    stage: "Proposal",
    owner: "Me",
    lastActivity: "2 hours ago",
    tags: ["High Value"],
    city: "San Francisco",
    bio: "Alice leads philanthropy for TechFoundations and is focused on sustainable water projects.",
    activities: [
      {
        id: "crm-a1",
        type: "meeting",
        date: "2024-12-18T10:00:00Z",
        title: "Q4 Strategy Session",
        description: "Discussed scaling the well project in Chiang Mai.",
      },
      {
        id: "crm-a2",
        type: "gift",
        date: "2024-11-15T09:00:00Z",
        title: "Corporate Grant",
        amount: 25000,
      },
    ],
  },
  {
    id: "crm-2",
    name: "Clara Wilson",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60",
    title: "Foundation Manager",
    company: "Wilson Family Trust",
    email: "clara@wilsontrust.org",
    phone: "+1 555-0103",
    value: 75000,
    stage: "Won",
    owner: "Me",
    lastActivity: "3 days ago",
    tags: ["Major Donor", "High Value"],
    city: "Chicago",
    bio: "Clara manages a family foundation focused on education and clean water initiatives.",
    activities: [
      {
        id: "crm-c1",
        type: "gift",
        date: "2024-12-10T09:00:00Z",
        title: "Annual Grant",
        amount: 75000,
      },
    ],
  },
  {
    id: "crm-3",
    name: "David Chen",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60",
    title: "Senior Partner",
    company: "Chen & Associates",
    email: "david@chenassociates.com",
    phone: "+1 555-0104",
    value: 8500,
    stage: "Contacted",
    owner: "Sarah",
    lastActivity: "5 days ago",
    tags: ["New Lead"],
    city: "Los Angeles",
    bio: "David is exploring philanthropic opportunities in Southeast Asia.",
    activities: [
      {
        id: "crm-d1",
        type: "email",
        date: "2024-12-05T14:00:00Z",
        title: "Initial Outreach",
        description:
          "Sent intro email about GiveHope's mission and Southeast Asia work.",
      },
    ],
  },
];

const TASK_STAFF_SEED: AdminTaskStaffMember[] = [
  {
    id: "staff-1",
    name: "Sarah Johnson",
    email: "sarah@givehope.org",
    avatar_url:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    role: "Development Director",
  },
  {
    id: "staff-2",
    name: "Michael Chen",
    email: "michael@givehope.org",
    avatar_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    role: "Donor Relations",
  },
  {
    id: "staff-3",
    name: "Emily Rodriguez",
    email: "emily@givehope.org",
    avatar_url:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    role: "Admin",
  },
  {
    id: "staff-4",
    name: "David Kim",
    email: "david@givehope.org",
    avatar_url:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    role: "Finance",
  },
];

const TASK_LINKED_ENTITIES_SEED: AdminTaskLinkedEntity[] = [
  {
    id: "donor-1",
    type: "donor",
    name: "Alice Johnson",
    email: "alice@techfoundations.org",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
  },
  {
    id: "donor-2",
    type: "donor",
    name: "Clara Wilson",
    email: "clara@wilsontrust.org",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
  },
  {
    id: "missionary-1",
    type: "missionary",
    name: "John Martinez",
    email: "john.m@givehope.org",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
  {
    id: "contact-1",
    type: "contact",
    name: "Frank Miller",
    email: "frank@millerfoundation.org",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
  },
];

const TASKS_SEED: AdminTask[] = [
  {
    id: "task-1",
    tenant_id: "tenant-1",
    title: "Follow up with Alice Johnson about annual giving pledge",
    description:
      "Schedule a call to discuss Alice's philanthropic goals and how GiveHope can partner with her vision.",
    priority: "urgent",
    status: "todo",
    type: "call",
    due_date: "2026-04-08",
    due_time: "14:00",
    created_by: "staff-1",
    assigned_to: "staff-1",
    assigned_to_name: "Sarah Johnson",
    assigned_to_avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    linked_entity: TASK_LINKED_ENTITIES_SEED[0],
    reminders: [
      {
        id: "rem-1",
        task_id: "task-1",
        remind_at: "2026-04-08T13:00:00Z",
        type: "notification",
        sent: false,
      },
    ],
    comments: [
      {
        id: "task-comment-1",
        task_id: "task-1",
        user_id: "staff-2",
        user_name: "Michael Chen",
        content:
          "Alice is very interested in our water project. Keep the call focused on long-term partnership.",
        created_at: "2026-04-07T15:00:00Z",
      },
    ],
    tags: ["major-donor", "stewardship"],
    created_at: "2026-04-06T10:00:00Z",
    updated_at: "2026-04-07T15:00:00Z",
  },
  {
    id: "task-2",
    tenant_id: "tenant-1",
    title: "Send year-end tax receipts to all donors",
    description:
      "Generate and send 2025 tax receipts to all donors who gave $250 or more.",
    priority: "high",
    status: "in_progress",
    type: "email",
    due_date: "2026-04-09",
    created_by: "staff-3",
    assigned_to: "staff-3",
    assigned_to_name: "Emily Rodriguez",
    assigned_to_avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    reminders: [],
    comments: [],
    tags: ["annual", "compliance", "tax-receipt"],
    created_at: "2026-04-05T09:00:00Z",
    updated_at: "2026-04-08T08:30:00Z",
  },
  {
    id: "task-3",
    tenant_id: "tenant-1",
    title: "Schedule onboarding call with new missionary team",
    description:
      "Set up an initial onboarding call to discuss support raising strategy for the Martinez family.",
    priority: "medium",
    status: "todo",
    type: "meeting",
    due_date: "2026-04-15",
    due_time: "10:00",
    created_by: "staff-2",
    assigned_to: "staff-2",
    assigned_to_name: "Michael Chen",
    assigned_to_avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    linked_entity: TASK_LINKED_ENTITIES_SEED[2],
    reminders: [
      {
        id: "rem-2",
        task_id: "task-3",
        remind_at: "2026-04-10T09:00:00Z",
        type: "email",
        sent: false,
      },
    ],
    comments: [],
    tags: ["onboarding", "support-raising"],
    created_at: "2026-04-07T09:00:00Z",
    updated_at: "2026-04-07T09:00:00Z",
  },
  {
    id: "task-4",
    tenant_id: "tenant-1",
    title: "Review Clara Wilson foundation grant proposal",
    description:
      "Review the revised multi-year infrastructure grant proposal and prepare feedback for Clara.",
    priority: "high",
    status: "todo",
    type: "review",
    due_date: "2026-04-08",
    created_by: "staff-1",
    assigned_to: "staff-4",
    assigned_to_name: "David Kim",
    assigned_to_avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    linked_entity: TASK_LINKED_ENTITIES_SEED[1],
    reminders: [],
    comments: [
      {
        id: "task-comment-2",
        task_id: "task-4",
        user_id: "staff-1",
        user_name: "Sarah Johnson",
        content:
          "This is a significant grant. Please prioritize the financial review section.",
        created_at: "2026-04-07T11:30:00Z",
      },
    ],
    tags: ["grant", "major-donor"],
    created_at: "2026-04-06T11:00:00Z",
    updated_at: "2026-04-07T11:30:00Z",
  },
];

const CARE_PERSONNEL_SEED: AdminCarePersonnel[] = [
  {
    id: "care-1",
    name: "Olivia Martin",
    location: "Lima, Peru",
    timezone: "America/Lima",
    status: "At Risk",
    lastCheckIn: "2026-04-05T15:00:00Z",
    initials: "OM",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
    role: "Community Development",
    region: "Latin America",
    healthSignals: {
      emotional: 42,
      spiritual: 67,
      physical: 58,
      financial: 35,
    },
    careGaps: ["Rest rhythm", "Financial stress"],
    manualAttention: true,
  },
  {
    id: "care-2",
    name: "Samuel Adeyemi",
    location: "Accra, Ghana",
    timezone: "Africa/Accra",
    status: "Healthy",
    lastCheckIn: "2026-04-07T09:00:00Z",
    initials: "SA",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    role: "Church Partnerships",
    region: "Africa",
    healthSignals: {
      emotional: 82,
      spiritual: 88,
      physical: 79,
      financial: 73,
    },
    careGaps: [],
  },
  {
    id: "care-3",
    name: "Grace Lee",
    location: "Chiang Mai, Thailand",
    timezone: "Asia/Bangkok",
    status: "Healthy",
    lastCheckIn: "2026-04-06T12:00:00Z",
    initials: "GL",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    role: "Medical Outreach",
    region: "SE Asia",
    healthSignals: {
      emotional: 76,
      spiritual: 91,
      physical: 74,
      financial: 69,
    },
    careGaps: ["Scheduled counseling follow-up"],
  },
];

const CARE_ACTIVITY_SEED: AdminCareActivity[] = [
  {
    id: "care-activity-1",
    personnelId: "care-1",
    type: "Video Call",
    content:
      "Discussed financial stress due to inflation and set a follow-up check-in for next week.",
    date: "2026-04-05T14:00:00Z",
    authorId: "staff-2",
    authorName: "David Rodriguez",
    isPrivate: false,
  },
  {
    id: "care-activity-2",
    personnelId: "care-1",
    type: "Pastoral Note",
    content:
      "Olivia asked for confidential follow-up around marriage stress during the last call.",
    date: "2026-04-05T15:00:00Z",
    authorId: "staff-2",
    authorName: "David Rodriguez",
    isPrivate: true,
  },
  {
    id: "care-activity-3",
    personnelId: "care-2",
    type: "Check-in",
    content: "Samuel reported a healthy support rhythm and no urgent needs.",
    date: "2026-04-07T09:00:00Z",
    authorId: "staff-1",
    authorName: "Emily Thompson",
    isPrivate: false,
  },
];

const EVENT_ATTENDEES_SEED: AdminEventAttendee[] = [
  {
    id: "attendee-1",
    name: "Naomi Carter",
    email: "naomi@example.com",
    ticketType: "Full Conference",
    status: "Checked In",
    paymentStatus: "Paid",
    checkInTime: "2026-04-08T09:15:00Z",
    organization: "WaterBridge",
    jobTitle: "Partnership Lead",
    registrationDate: "2026-03-15T09:00:00Z",
    assignedSessions: ["session-1", "session-2"],
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60",
    isVip: true,
  },
  {
    id: "attendee-2",
    name: "Marcus Rivera",
    email: "marcus@example.com",
    ticketType: "Day Pass",
    status: "Registered",
    paymentStatus: "Pending",
    organization: "CityServe",
    jobTitle: "Pastor",
    registrationDate: "2026-03-20T12:00:00Z",
    assignedSessions: ["session-3"],
  },
  {
    id: "attendee-3",
    name: "Lydia Owens",
    email: "lydia@example.com",
    ticketType: "Volunteer",
    status: "Waitlist",
    paymentStatus: "Due",
    registrationDate: "2026-03-28T15:30:00Z",
    assignedSessions: [],
  },
];

const MOBILIZE_CANDIDATES_SEED: AdminMobilizeCandidate[] = [
  {
    id: "candidate-1",
    name: "Sarah Jenkins",
    email: "sarah.j@example.com",
    phone: "+1 (555) 123-4567",
    role: "Medical Officer",
    location: "Denver, CO",
    stage: "Vetting",
    readiness: 45,
    appliedDate: "2026-02-01",
    tags: ["RN", "Spanish Speaker"],
  },
  {
    id: "candidate-2",
    name: "Michael Ross",
    email: "mike.ross@example.com",
    phone: "+1 (555) 987-6543",
    role: "Education Specialist",
    location: "Austin, TX",
    stage: "Training",
    readiness: 85,
    appliedDate: "2026-01-15",
    tags: ["ESL Certified", "Leadership"],
  },
  {
    id: "candidate-3",
    name: "David Kim",
    email: "d.kim@example.com",
    phone: "+1 (555) 222-3333",
    role: "Community Development",
    location: "Chicago, IL",
    stage: "Ready",
    readiness: 100,
    appliedDate: "2025-12-10",
    tags: ["Agriculture", "French Speaker"],
  },
];

const TEAMS_SEED: AdminTeam[] = [
  {
    id: "team-1",
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
    id: "team-2",
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
    id: "team-3",
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

const TEAM_MEMBERS_SEED: AdminTeamMember[] = [
  {
    id: "member-1",
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "Owner",
    status: "Active",
    team: "Executive Leadership",
  },
  {
    id: "member-2",
    name: "Sarah Chen",
    email: "sarah@example.com",
    role: "Admin",
    status: "Active",
    team: "Executive Leadership",
  },
  {
    id: "member-3",
    name: "Mike Ross",
    email: "mike@example.com",
    role: "Member",
    status: "Active",
    team: "Field Mobilizers",
  },
  {
    id: "member-4",
    name: "Rachel Zane",
    email: "rachel@example.com",
    role: "Member",
    status: "Pending",
    team: "Member Care",
  },
];

let adminTaskRows = cloneValue(TASKS_SEED);

function refreshAdminTaskRows() {
  adminTaskRows = cloneValue(adminTaskRows);
}

export const crmContactsCollection = createCollection(
  queryCollectionOptions({
    id: "admin_crm_contacts",
    queryKey: [...adminSurfaceQueryKeys.crmContacts],
    queryClient: getQueryClient(),
    schema: crmContactSchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(CRM_CONTACTS_SEED),
  }),
);

export const taskStaffCollection = createCollection(
  queryCollectionOptions({
    id: "admin_task_staff",
    queryKey: [...adminSurfaceQueryKeys.taskStaff],
    queryClient: getQueryClient(),
    schema: taskStaffSchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(TASK_STAFF_SEED),
  }),
);

export const taskLinkedEntitiesCollection = createCollection(
  queryCollectionOptions({
    id: "admin_task_linked_entities",
    queryKey: [...adminSurfaceQueryKeys.taskLinkedEntities],
    queryClient: getQueryClient(),
    schema: taskLinkedEntitySchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(TASK_LINKED_ENTITIES_SEED),
  }),
);

export const adminTasksCollection = createCollection(
  queryCollectionOptions({
    id: "admin_tasks",
    queryKey: [...adminSurfaceQueryKeys.tasks],
    queryClient: getQueryClient(),
    schema: taskSchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(adminTaskRows),
    onInsert: async ({ transaction }) => {
      adminTaskRows = [
        ...adminTaskRows,
        ...transaction.mutations.map((mutation) =>
          cloneValue(mutation.modified),
        ),
      ];
      refreshAdminTaskRows();
    },
    onUpdate: async ({ transaction }) => {
      adminTaskRows = adminTaskRows.map((task) => {
        const mutation = transaction.mutations.find(
          (entry) => entry.key === task.id,
        );
        return mutation ? cloneValue(mutation.modified) : task;
      });
      refreshAdminTaskRows();
    },
    onDelete: async ({ transaction }) => {
      const idsToDelete = new Set(
        transaction.mutations.map((mutation) => mutation.key as string),
      );
      adminTaskRows = adminTaskRows.filter((task) => !idsToDelete.has(task.id));
      refreshAdminTaskRows();
    },
  }),
);

export const carePersonnelCollection = createCollection(
  queryCollectionOptions({
    id: "admin_care_personnel",
    queryKey: [...adminSurfaceQueryKeys.carePersonnel],
    queryClient: getQueryClient(),
    schema: carePersonnelSchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(CARE_PERSONNEL_SEED),
  }),
);

export const careActivityCollection = createCollection(
  queryCollectionOptions({
    id: "admin_care_activity",
    queryKey: [...adminSurfaceQueryKeys.careActivity],
    queryClient: getQueryClient(),
    schema: careActivitySchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(CARE_ACTIVITY_SEED),
  }),
);

export const eventAttendeesCollection = createCollection(
  queryCollectionOptions({
    id: "admin_event_attendees",
    queryKey: [...adminSurfaceQueryKeys.eventAttendees],
    queryClient: getQueryClient(),
    schema: attendeeSchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(EVENT_ATTENDEES_SEED),
  }),
);

export const mobilizeCandidatesCollection = createCollection(
  queryCollectionOptions({
    id: "admin_mobilize_candidates",
    queryKey: [...adminSurfaceQueryKeys.mobilizeCandidates],
    queryClient: getQueryClient(),
    schema: mobilizeCandidateSchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(MOBILIZE_CANDIDATES_SEED),
  }),
);

export const teamsCollection = createCollection(
  queryCollectionOptions({
    id: "admin_teams",
    queryKey: [...adminSurfaceQueryKeys.teams],
    queryClient: getQueryClient(),
    schema: teamSchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(TEAMS_SEED),
  }),
);

export const teamMembersCollection = createCollection(
  queryCollectionOptions({
    id: "admin_team_members",
    queryKey: [...adminSurfaceQueryKeys.teamMembers],
    queryClient: getQueryClient(),
    schema: teamMemberSchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(TEAM_MEMBERS_SEED),
  }),
);
