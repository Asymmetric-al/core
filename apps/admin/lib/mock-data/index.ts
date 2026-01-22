/**
 * Mock Data - Central Export
 *
 * This is the main entry point for all mock data used throughout the application.
 * Import from '@/lib/mock-data' for a clean, unified API.
 *
 * For production migration, see: docs/MOCK-DATA.md
 *
 * @example
 * import { MISSIONARIES, getDonorById, TASKS } from '@/lib/mock-data'
 */

export * from "./types";

export {
  MISSIONARIES,
  DONORS,
  STAFF,
  getMissionaryById,
  getDonorById,
  getStaffById,
  getMissionariesByRegion,
  getDonorsByStage,
  getActiveMissionaries,
  getMissionariesAtRisk,
  getDonorFullName,
  getMissionaryFullName,
} from "./users";

export {
  DONATIONS,
  PLEDGES,
  PAYMENT_METHODS,
  PROJECTS,
  getDonationsByDonor,
  getDonationsByRecipient,
  getPledgesByDonor,
  getPledgesByRecipient,
  getActivePledges,
  getFailedDonations,
  getPaymentMethodsByDonor,
  getProjectById,
  getActiveProjects,
  getProjectsByMissionary,
  calculateDonorYTDTotal,
  getRecentDonations,
} from "./donations";

export {
  TASKS,
  ACTIVITIES,
  POSTS,
  ALERTS,
  FEED_ITEMS,
  getTasksByAssignee,
  getPendingTasks,
  getOverdueTasks,
  getHighPriorityTasks,
  getActivitiesByEntity,
  getPublicActivities,
  getPostsByAuthor,
  getPublicPosts,
  getRecentPosts,
  getUnreadAlerts,
  getHighSeverityAlerts,
  getFeedItemById,
  getFeedItemsByWorker,
} from "./activities";

import { MISSIONARIES } from "./users";
import { PROJECTS, getDonationsByDonor, getPledgesByDonor } from "./donations";
import { POSTS, FEED_ITEMS } from "./activities";

export interface FieldWorker {
  id: string;
  title: string;
  location: string;
  category: string;
  description: string;
  image: string;
  raised: number;
  goal: number | null;
}

export function getFieldWorkers(): FieldWorker[] {
  return MISSIONARIES.map((m, index) => ({
    id: m.id,
    title: m.title,
    location: m.location,
    category: m.ministryFocus.split(" & ")[0] || "Ministry",
    description: m.bio,
    image: m.projectImage,
    raised: m.currentSupport * 12,
    goal: index % 3 === 2 ? null : m.monthlyGoal * 12,
  }));
}

export function getFieldWorkerById(id: string): FieldWorker | undefined {
  const m = MISSIONARIES.find((m) => m.id === id);
  if (!m) return undefined;
  return {
    id: m.id,
    title: m.title,
    location: m.location,
    category: m.ministryFocus.split(" & ")[0] || "Ministry",
    description: m.bio,
    image: m.projectImage,
    raised: m.currentSupport * 12,
    goal: m.monthlyGoal * 12,
  };
}

export function getAllProjects(): typeof PROJECTS {
  return PROJECTS;
}

export const DEMO_MISSIONARY_ID = "miss-001";
export const DEMO_DONOR_ID = "donor-001";
export const DEMO_STAFF_ID = "staff-001";

export interface RecentUpdate {
  id: number | string;
  author: string;
  title: string;
  time: string;
  image?: string;
  avatar: string;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getRecentUpdates(limit = 5): RecentUpdate[] {
  return POSTS.slice(0, limit).map((post) => {
    const author = MISSIONARIES.find((m) => m.id === post.authorId);
    return {
      id: post.id,
      author: author?.title || "Unknown",
      title: post.title,
      time: formatRelativeTime(post.createdAt),
      image: post.imageUrl,
      avatar:
        (author?.firstName?.charAt(0) || "") +
        (author?.lastName?.charAt(0) || ""),
    };
  });
}

export interface WorkerFeed {
  id: string;
  workerName: string;
  location: string;
  activity: string;
  impact: string;
  status: string;
  lastUpdate: string;
}

export function getWorkerFeeds(): WorkerFeed[] {
  return FEED_ITEMS.map((item) => ({
    id: item.id,
    workerName: item.workerName,
    location: item.location,
    activity: item.activity,
    impact: item.impact,
    status: item.status === "urgent" ? "Urgent" : "Active",
    lastUpdate: item.lastUpdate,
  }));
}

export interface TransactionRecord {
  id: string;
  date: string;
  amount: number;
  recipient: string;
  recipientAvatar: string;
  category: string;
  type: string;
  method: string;
  last4: string;
  status: string;
  receiptUrl: string;
}

export function getTransactionHistory(donorId: string): TransactionRecord[] {
  const donations = getDonationsByDonor(donorId);
  return donations.map((d) => {
    const recipient =
      d.recipientType === "missionary"
        ? MISSIONARIES.find((m) => m.id === d.recipientId)
        : PROJECTS.find((p) => p.id === d.recipientId);

    return {
      id: d.transactionId,
      date: d.date,
      amount: d.amount,
      recipient: recipient?.title || "General Fund",
      recipientAvatar:
        d.recipientType === "missionary"
          ? (recipient as (typeof MISSIONARIES)[0])?.avatarUrl || ""
          : (recipient as (typeof PROJECTS)[0])?.imageUrl || "",
      category:
        d.recipientType === "missionary"
          ? "Missionary"
          : d.recipientType === "project"
            ? "Project"
            : "General",
      type: d.isRecurring ? "Recurring" : "One-Time",
      method:
        d.paymentMethod.charAt(0).toUpperCase() + d.paymentMethod.slice(1),
      last4: d.last4,
      status: d.status.charAt(0).toUpperCase() + d.status.slice(1),
      receiptUrl: d.receiptUrl || "#",
    };
  });
}

export interface PledgeRecord {
  id: string;
  recipientName: string;
  recipientCategory: string;
  recipientAvatar: string;
  amount: number;
  frequency: string;
  nextChargeDate: string;
  status: string;
  paymentMethodId: string;
}

export function getDonorPledges(donorId: string): PledgeRecord[] {
  const pledges = getPledgesByDonor(donorId);
  return pledges.map((p) => {
    const recipient =
      p.recipientType === "missionary"
        ? MISSIONARIES.find((m) => m.id === p.recipientId)
        : PROJECTS.find((proj) => proj.id === p.recipientId);

    return {
      id: p.id,
      recipientName: recipient?.title || "General Fund",
      recipientCategory:
        p.recipientType === "missionary" ? "Missionary" : "Project",
      recipientAvatar:
        p.recipientType === "missionary"
          ? (recipient as (typeof MISSIONARIES)[0])?.avatarUrl || ""
          : (recipient as (typeof PROJECTS)[0])?.imageUrl || "",
      amount: p.amount,
      frequency:
        p.frequency.charAt(0).toUpperCase() +
        p.frequency.slice(1).replace("_", " "),
      nextChargeDate: p.nextChargeDate,
      status: p.status.charAt(0).toUpperCase() + p.status.slice(1),
      paymentMethodId: p.paymentMethodId,
    };
  });
}

export const WORKER_FEEDS = getWorkerFeeds();
export const RECENT_UPDATES = getRecentUpdates();
