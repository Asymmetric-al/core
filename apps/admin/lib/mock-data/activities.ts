/**
 * Mock Activities Data
 *
 * Comprehensive mock data for tasks, activities, posts, and alerts.
 */

import type { Task, Activity, Post, Alert, FeedItem } from "./types";

export const TASKS: Task[] = [
  {
    id: "task-001",
    title: "Call donor John Smith",
    description: "Follow up on increased giving conversation from last month",
    type: "call",
    priority: "high",
    status: "pending",
    assignedTo: "staff-001",
    assignedBy: "staff-001",
    relatedTo: { type: "donor", id: "donor-001", name: "John Anderson" },
    dueDate: "2024-12-30",
    createdAt: "2024-12-15T10:00:00Z",
    updatedAt: "2024-12-15T10:00:00Z",
  },
  {
    id: "task-002",
    title: "Send newsletter draft",
    description: "Prepare and send Q4 ministry update newsletter",
    type: "email",
    priority: "medium",
    status: "pending",
    assignedTo: "miss-001",
    assignedBy: "staff-002",
    dueDate: "2024-12-31",
    createdAt: "2024-12-10T14:00:00Z",
    updatedAt: "2024-12-10T14:00:00Z",
  },
  {
    id: "task-003",
    title: "Update ministry profile",
    description: "Add recent photos and update bio section",
    type: "todo",
    priority: "low",
    status: "pending",
    assignedTo: "miss-001",
    assignedBy: "miss-001",
    dueDate: "2025-01-05",
    createdAt: "2024-12-12T09:00:00Z",
    updatedAt: "2024-12-12T09:00:00Z",
  },
  {
    id: "task-004",
    title: "Review failed payments",
    description: "Contact donors with failed recurring payments this week",
    type: "todo",
    priority: "high",
    status: "pending",
    assignedTo: "staff-003",
    assignedBy: "staff-001",
    dueDate: "2024-12-30",
    createdAt: "2024-12-20T08:00:00Z",
    updatedAt: "2024-12-20T08:00:00Z",
  },
  {
    id: "task-005",
    title: "Thank church partners",
    description: "Send personalized thank you notes to top 10 church partners",
    type: "email",
    priority: "medium",
    status: "pending",
    assignedTo: "miss-001",
    assignedBy: "miss-001",
    dueDate: "2025-01-03",
    createdAt: "2024-12-18T11:00:00Z",
    updatedAt: "2024-12-18T11:00:00Z",
  },
  {
    id: "task-006",
    title: "Review Annual Financial Report",
    description:
      "Review and approve the 2024 annual financial report for board presentation",
    type: "todo",
    priority: "high",
    status: "pending",
    assignedTo: "staff-001",
    assignedBy: "staff-001",
    dueDate: "2024-12-28",
    createdAt: "2024-12-15T09:00:00Z",
    updatedAt: "2024-12-15T09:00:00Z",
  },
  {
    id: "task-007",
    title: "Call with Major Donor: Sarah Connor",
    description: "Discuss year-end giving opportunity and 2025 partnership",
    type: "call",
    priority: "high",
    status: "pending",
    assignedTo: "staff-001",
    assignedBy: "staff-001",
    relatedTo: { type: "donor", id: "donor-004", name: "Sarah Connor" },
    dueDate: "2024-12-30",
    createdAt: "2024-12-18T14:00:00Z",
    updatedAt: "2024-12-18T14:00:00Z",
  },
  {
    id: "task-008",
    title: "Onboarding Meeting: New Missionary Team",
    description: "Welcome and orientation meeting for the Williams family",
    type: "meeting",
    priority: "medium",
    status: "pending",
    assignedTo: "staff-002",
    assignedBy: "staff-001",
    dueDate: "2025-01-02",
    createdAt: "2024-12-10T10:00:00Z",
    updatedAt: "2024-12-10T10:00:00Z",
  },
  {
    id: "task-009",
    title: "Update Organization Compliance Docs",
    description: "Annual update of compliance documentation for audit",
    type: "todo",
    priority: "low",
    status: "pending",
    assignedTo: "staff-003",
    assignedBy: "staff-001",
    dueDate: "2025-01-10",
    createdAt: "2024-12-05T15:00:00Z",
    updatedAt: "2024-12-05T15:00:00Z",
  },
  {
    id: "task-010",
    title: "Send Year-End Tax Statements",
    description: "Generate and email tax statements to all donors",
    type: "email",
    priority: "high",
    status: "pending",
    assignedTo: "staff-003",
    assignedBy: "staff-001",
    dueDate: "2025-01-15",
    createdAt: "2024-12-01T09:00:00Z",
    updatedAt: "2024-12-01T09:00:00Z",
  },
  {
    id: "task-011",
    title: "Follow up with Church of Grace",
    description:
      "Their monthly pledge is 2 months past due - sensitive conversation needed",
    type: "call",
    priority: "high",
    status: "pending",
    assignedTo: "staff-001",
    assignedBy: "staff-001",
    relatedTo: { type: "donor", id: "donor-007", name: "Church of Grace" },
    dueDate: "2024-12-30",
    createdAt: "2024-12-20T10:00:00Z",
    updatedAt: "2024-12-20T10:00:00Z",
  },
  {
    id: "task-012",
    title: "Pastoral check-in with Olivia Martin",
    description: "She has been flagged as at-risk - schedule video call",
    type: "call",
    priority: "urgent",
    status: "pending",
    assignedTo: "staff-002",
    assignedBy: "staff-002",
    relatedTo: { type: "missionary", id: "miss-004", name: "Olivia Martin" },
    dueDate: "2024-12-29",
    createdAt: "2024-12-18T16:00:00Z",
    updatedAt: "2024-12-18T16:00:00Z",
  },
  {
    id: "task-013",
    title: "Schedule Q1 strategy meeting",
    description: "Coordinate calendars for January leadership planning retreat",
    type: "meeting",
    priority: "medium",
    status: "completed",
    assignedTo: "staff-001",
    assignedBy: "staff-001",
    dueDate: "2024-12-20",
    completedAt: "2024-12-19T14:00:00Z",
    createdAt: "2024-12-10T09:00:00Z",
    updatedAt: "2024-12-19T14:00:00Z",
  },
];

export const ACTIVITIES: Activity[] = [
  {
    id: "act-001",
    type: "video_call",
    entityType: "missionary",
    entityId: "miss-004",
    title: "Pastoral Check-in Call",
    description:
      "Discussed financial stress due to rising inflation in Lima. Olivia is feeling overwhelmed and hasn't had a day off in 3 weeks.",
    date: "2024-12-15T14:00:00Z",
    authorId: "staff-002",
    authorName: "David Rodriguez",
    isPrivate: false,
  },
  {
    id: "act-002",
    type: "pastoral_note",
    entityType: "missionary",
    entityId: "miss-004",
    title: "Private Care Note",
    description:
      "Olivia mentioned marriage stress during our call. She asked this stay confidential. Following up next week.",
    date: "2024-12-15T15:00:00Z",
    authorId: "staff-002",
    authorName: "David Rodriguez",
    isPrivate: true,
  },
  {
    id: "act-003",
    type: "meeting",
    entityType: "donor",
    entityId: "donor-002",
    title: "Q4 Strategy Session",
    description:
      "Discussed scaling the water project in Ghana. Alice is very interested in a multi-year commitment.",
    date: "2024-12-18T10:00:00Z",
    authorId: "staff-001",
    authorName: "Emily Thompson",
    isPrivate: false,
  },
  {
    id: "act-004",
    type: "gift",
    entityType: "donor",
    entityId: "donor-002",
    title: "Corporate Grant Received",
    description: "TechFoundations Q4 grant for Clean Water Initiative",
    amount: 25000,
    date: "2024-11-15T09:00:00Z",
    authorId: "staff-003",
    authorName: "Rachel Kim",
    isPrivate: false,
  },
  {
    id: "act-005",
    type: "call",
    entityType: "donor",
    entityId: "donor-001",
    title: "Year-end Giving Discussion",
    description:
      "John is considering an additional year-end gift. Will follow up after Christmas.",
    date: "2024-12-12T11:00:00Z",
    authorId: "staff-001",
    authorName: "Emily Thompson",
    isPrivate: false,
  },
  {
    id: "act-006",
    type: "note",
    entityType: "missionary",
    entityId: "miss-002",
    title: "Customs Delay Update",
    description:
      "Medical supplies still held at customs. Sarah is working with local contacts to expedite.",
    date: "2024-12-19T08:00:00Z",
    authorId: "staff-002",
    authorName: "David Rodriguez",
    isPrivate: false,
  },
  {
    id: "act-007",
    type: "stage_change",
    entityType: "donor",
    entityId: "donor-005",
    title: "Donor Stage Updated",
    description: "Moved from Prospect to New Donor after first gift",
    date: "2024-09-15T10:00:00Z",
    authorId: "staff-001",
    authorName: "Emily Thompson",
    isPrivate: false,
    metadata: { previousStage: "prospect", newStage: "new" },
  },
  {
    id: "act-008",
    type: "email",
    entityType: "donor",
    entityId: "donor-006",
    title: "Re-engagement Email Sent",
    description:
      "Sent personalized email with ministry impact updates to encourage renewed giving",
    date: "2024-12-01T09:00:00Z",
    authorId: "staff-001",
    authorName: "Emily Thompson",
    isPrivate: false,
  },
];

export const POSTS: Post[] = [
  {
    id: "post-001",
    authorId: "miss-001",
    type: "update",
    title: "The school year begins in Chiang Mai",
    content:
      "Thanks to monthly partners, 50 children received uniforms and books this week. The joy on their faces as they walked into class for the first time is something I'll never forget. Each uniform represents a family that chose education over labor, hope over despair. Thank you for making this possible!",
    imageUrl:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&h=800&fit=crop",
    isPublic: true,
    isPinned: true,
    likes: 47,
    comments: 12,
    prayers: 23,
    fires: 8,
    createdAt: "2024-12-18T09:00:00Z",
    updatedAt: "2024-12-18T09:00:00Z",
  },
  {
    id: "post-002",
    authorId: "miss-002",
    type: "prayer_request",
    title: "Urgent: Customs Delay",
    content:
      "Our medical supplies have been held at customs for two weeks now. We're running low on essential medications and the delay is impacting our ability to serve patients. Please pray for a breakthrough and that the supplies would be released quickly.",
    isPublic: true,
    isPinned: false,
    likes: 32,
    comments: 8,
    prayers: 156,
    fires: 2,
    createdAt: "2024-12-17T11:00:00Z",
    updatedAt: "2024-12-17T11:00:00Z",
  },
  {
    id: "post-003",
    authorId: "miss-003",
    type: "update",
    title: "New Community Center Opening",
    content:
      "After months of preparation, we're thrilled to announce the opening of our new community center! This space will serve as a hub for refugee families to access resources, learn new skills, and build community. None of this would be possible without your generous support.",
    imageUrl:
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&h=800&fit=crop",
    isPublic: true,
    isPinned: false,
    likes: 89,
    comments: 24,
    prayers: 15,
    fires: 34,
    createdAt: "2024-12-15T14:00:00Z",
    updatedAt: "2024-12-15T14:00:00Z",
  },
  {
    id: "post-004",
    authorId: "miss-001",
    type: "praise_report",
    title: "Just reached 75% of our monthly goal!",
    content:
      "Thank you partners! We're 75% of the way to our monthly support goal. Your faithfulness makes our work possible. With the remaining 25%, we'll be able to expand our tutoring program to two additional villages.",
    isPublic: true,
    isPinned: false,
    likes: 28,
    comments: 5,
    prayers: 8,
    fires: 12,
    createdAt: "2024-12-20T08:00:00Z",
    updatedAt: "2024-12-20T08:00:00Z",
  },
  {
    id: "post-005",
    authorId: "miss-001",
    type: "update",
    title: "New team member joining us in Nairobi next month",
    content:
      "We're excited to welcome the Williams family to our team! They'll be focusing on community health education in partnership with local churches. Please join us in praying for their transition.",
    isPublic: true,
    isPinned: false,
    likes: 45,
    comments: 15,
    prayers: 67,
    fires: 5,
    createdAt: "2024-12-19T10:00:00Z",
    updatedAt: "2024-12-19T10:00:00Z",
  },
  {
    id: "post-006",
    authorId: "miss-004",
    type: "prayer_request",
    title: "Need wisdom and rest",
    content:
      "Friends, I'm feeling stretched thin. Between the rising costs here in Lima and the growing needs in our youth programs, I'm struggling to find balance. Please pray for wisdom in prioritizing and for opportunities to rest and recharge.",
    isPublic: true,
    isPinned: false,
    likes: 22,
    comments: 18,
    prayers: 89,
    fires: 1,
    createdAt: "2024-12-16T16:00:00Z",
    updatedAt: "2024-12-16T16:00:00Z",
  },
  {
    id: "post-007",
    authorId: "miss-005",
    type: "update",
    title: "Digital Ministry Training Complete!",
    content:
      "We just wrapped up our largest training cohort yet! 45 missionaries from 12 different organizations now have the digital tools they need to expand their reach. So grateful for partners who funded this program.",
    imageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=800&fit=crop",
    isPublic: true,
    isPinned: false,
    likes: 67,
    comments: 9,
    prayers: 4,
    fires: 28,
    createdAt: "2024-12-10T06:00:00Z",
    updatedAt: "2024-12-10T06:00:00Z",
  },
];

export const ALERTS: Alert[] = [
  {
    id: "alert-001",
    type: "warning",
    severity: "high",
    title: "3 recurring gifts failed this week",
    message:
      "Review failed payments and contact donors to update payment information",
    relatedTo: { type: "donations", id: "failed" },
    isRead: false,
    createdAt: "2024-12-20T08:00:00Z",
  },
  {
    id: "alert-002",
    type: "warning",
    severity: "medium",
    title: "Pledge from Church of Grace is past due",
    message:
      "Monthly pledge of $2,000 has been missed for 2 consecutive months",
    relatedTo: { type: "donor", id: "donor-007" },
    isRead: false,
    createdAt: "2024-12-15T10:00:00Z",
  },
  {
    id: "alert-003",
    type: "info",
    severity: "low",
    title: "Year-end giving deadline approaching",
    message:
      "Remind donors that December 31 is the deadline for 2024 tax-deductible gifts",
    isRead: true,
    createdAt: "2024-12-10T09:00:00Z",
  },
  {
    id: "alert-004",
    type: "error",
    severity: "high",
    title: "Missionary care flag: Olivia Martin",
    message:
      "At-risk status triggered based on health signals. Immediate pastoral care recommended.",
    relatedTo: { type: "missionary", id: "miss-004" },
    isRead: false,
    createdAt: "2024-12-18T16:00:00Z",
  },
  {
    id: "alert-005",
    type: "success",
    severity: "low",
    title: "Monthly support goal reached",
    message: "William Kim has reached 95% of monthly support goal",
    relatedTo: { type: "missionary", id: "miss-005" },
    isRead: true,
    createdAt: "2024-12-19T12:00:00Z",
  },
];

export const FEED_ITEMS: FeedItem[] = [
  {
    id: "miller",
    workerId: "miss-001",
    workerName: "The Miller Family",
    location: "Chiang Mai, Thailand",
    activity: "Education & Development",
    impact: "50 children received uniforms and books this week.",
    status: "active",
    lastUpdate: "2 hours ago",
  },
  {
    id: "smith",
    workerId: "miss-002",
    workerName: "Dr. Sarah Smith",
    location: "Nairobi, Kenya",
    activity: "Medical Mission",
    impact: "Customs delay on medical supplies. Pray for breakthrough.",
    status: "urgent",
    lastUpdate: "Yesterday",
  },
  {
    id: "chen",
    workerId: "miss-003",
    workerName: "Michael Chen",
    location: "Lesbos, Greece",
    activity: "Refugee Ministry",
    impact: "New community center opened serving 200+ families weekly.",
    status: "active",
    lastUpdate: "3 days ago",
  },
  {
    id: "martin",
    workerId: "miss-004",
    workerName: "Olivia Martin",
    location: "Lima, Peru",
    activity: "Youth Arts Program",
    impact: "25 at-risk youth enrolled in new arts program.",
    status: "active",
    lastUpdate: "1 week ago",
  },
  {
    id: "kim",
    workerId: "miss-005",
    workerName: "William Kim",
    location: "Seoul, South Korea",
    activity: "Digital Ministry",
    impact: "45 missionaries trained in digital tools this month.",
    status: "active",
    lastUpdate: "2 weeks ago",
  },
  {
    id: "lee",
    workerId: "miss-006",
    workerName: "Jackson Lee",
    location: "Nairobi, Kenya",
    activity: "Community Health",
    impact: "12 new community health workers trained and deployed.",
    status: "active",
    lastUpdate: "5 days ago",
  },
];

export function getTasksByAssignee(assigneeId: string): Task[] {
  return TASKS.filter((t) => t.assignedTo === assigneeId);
}

export function getPendingTasks(): Task[] {
  return TASKS.filter((t) => t.status === "pending");
}

export function getOverdueTasks(): Task[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return TASKS.filter((t) => {
    const dueDate = new Date(t.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return t.status === "pending" && dueDate < today;
  });
}

export function getHighPriorityTasks(): Task[] {
  return TASKS.filter(
    (t) =>
      (t.priority === "high" || t.priority === "urgent") &&
      t.status === "pending",
  );
}

export function getActivitiesByEntity(
  entityType: string,
  entityId: string,
): Activity[] {
  return ACTIVITIES.filter(
    (a) => a.entityType === entityType && a.entityId === entityId,
  );
}

export function getPublicActivities(): Activity[] {
  return ACTIVITIES.filter((a) => !a.isPrivate);
}

export function getPostsByAuthor(authorId: string): Post[] {
  return POSTS.filter((p) => p.authorId === authorId);
}

export function getPublicPosts(): Post[] {
  return POSTS.filter((p) => p.isPublic);
}

export function getRecentPosts(limit = 10): Post[] {
  return [...POSTS]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
}

export function getUnreadAlerts(): Alert[] {
  return ALERTS.filter((a) => !a.isRead);
}

export function getHighSeverityAlerts(): Alert[] {
  return ALERTS.filter((a) => a.severity === "high" && !a.isRead);
}

export function getFeedItemById(id: string): FeedItem | undefined {
  return FEED_ITEMS.find((f) => f.id === id);
}

export function getFeedItemsByWorker(workerId: string): FeedItem[] {
  return FEED_ITEMS.filter((f) => f.workerId === workerId);
}
