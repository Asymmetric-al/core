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

/** Seed dates count from today so the sample workspace never goes stale. */
function seedDay(offsetDays: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function seedTimestamp(offsetDays: number, hour = 9): string {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
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
  email: z.email(),
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
  email: z.email(),
  avatar_url: z.string().optional(),
  role: z.string().min(1),
});

const attendeeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
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

export type AdminCrmContact = z.infer<typeof crmContactSchema>;
export type AdminTask = z.infer<typeof taskSchema>;
export type AdminTaskStaffMember = z.infer<typeof taskStaffSchema>;
export type AdminTaskLinkedEntity = z.infer<typeof taskLinkedEntitySchema>;
export type AdminEventAttendee = z.infer<typeof attendeeSchema>;

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
    due_date: seedDay(0),
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
        remind_at: seedTimestamp(0, 13),
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
        created_at: seedTimestamp(-1, 15),
      },
    ],
    tags: ["major-donor", "stewardship"],
    created_at: seedTimestamp(-2, 10),
    updated_at: seedTimestamp(-1, 15),
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
    due_date: seedDay(1),
    created_by: "staff-3",
    assigned_to: "staff-3",
    assigned_to_name: "Emily Rodriguez",
    assigned_to_avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    reminders: [],
    comments: [],
    tags: ["annual", "compliance", "tax-receipt"],
    created_at: seedTimestamp(-3),
    updated_at: seedTimestamp(0, 8),
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
    due_date: seedDay(7),
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
        remind_at: seedTimestamp(6),
        type: "email",
        sent: false,
      },
    ],
    comments: [],
    tags: ["onboarding", "support-raising"],
    created_at: seedTimestamp(-1),
    updated_at: seedTimestamp(-1),
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
    due_date: seedDay(-2),
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
        created_at: seedTimestamp(-1, 11),
      },
    ],
    tags: ["grant", "major-donor"],
    created_at: seedTimestamp(-2, 11),
    updated_at: seedTimestamp(-1, 11),
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
