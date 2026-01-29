export interface Missionary {
  id: string;
  tenant_id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  bio?: string;
  profile_photo_url?: string;
  cover_photo_url?: string;
  location?: string;
  ministry_focus?: string;
  monthly_goal: number;
  current_balance: number;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  website_url?: string;
  feed_visibility: "off" | "private" | "public";
  feed_auto_approve_donors: boolean;
  comments_setting: "allow" | "approve" | "disable";
  created_at: string;
  updated_at: string;
}

export interface Donor {
  id: string;
  tenant_id: string;
  missionary_id: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  is_anonymous: boolean;
  do_not_contact: boolean;
  do_not_email: boolean;
  notes?: string;
  first_gift_date?: string;
  last_gift_date?: string;
  total_given: number;
  gift_count: number;
  status: "active" | "at_risk" | "lapsed" | "new";
  created_at: string;
  updated_at: string;
  recurring_agreement?: RecurringAgreement;
}

export interface Gift {
  id: string;
  tenant_id: string;
  missionary_id: string;
  donor_id?: string;
  donor?: Donor;
  amount: number;
  currency: string;
  gift_type: "one_time" | "recurring";
  recurring_agreement_id?: string;
  stripe_payment_id?: string;
  status: "pending" | "completed" | "failed" | "refunded";
  gift_date: string;
  notes?: string;
  created_at: string;
}

export interface RecurringAgreement {
  id: string;
  tenant_id: string;
  missionary_id: string;
  donor_id: string;
  donor?: Donor;
  amount: number;
  currency: string;
  frequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "annually";
  stripe_subscription_id?: string;
  status: "active" | "paused" | "cancelled" | "failed";
  start_date: string;
  end_date?: string;
  next_payment_date?: string;
  card_last4?: string;
  card_brand?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  failure_count: number;
  last_failure_reason?: string;
  created_at: string;
  updated_at: string;
}

export type TaskType =
  | "call"
  | "email"
  | "to_do"
  | "follow_up"
  | "thank_you"
  | "meeting";
export type TaskStatus =
  | "not_started"
  | "in_progress"
  | "waiting"
  | "completed"
  | "deferred";
export type TaskPriority = "none" | "low" | "medium" | "high";

export interface Task {
  id: string;
  missionary_id: string;
  donor_id?: string | null;
  donor?: {
    id: string;
    name: string;
    email?: string;
    avatar_url?: string | null;
  } | null;
  title: string;
  description?: string | null;
  notes?: string | null;
  task_type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
  reminder_date?: string | null;
  completed_at?: string | null;
  sort_key: number;
  is_auto_generated: boolean;
  auto_generation_source?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  notes?: string;
  task_type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: Date | null;
  reminder_date?: Date | null;
  donor_id?: string | null;
}

export interface TaskFilters {
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  task_type?: TaskType | "all";
  donor_id?: string | null;
  due_date_range?: { start?: Date; end?: Date };
  search?: string;
}

export interface Post {
  id: string;
  tenant_id: string;
  missionary_id: string;
  title?: string;
  content: string;
  media_urls: string[];
  status: "draft" | "pending" | "published" | "removed";
  is_pinned: boolean;
  like_count: number;
  prayer_count: number;
  fire_count: number;
  comment_count: number;
  published_at?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  comments?: Comment[];
  user_reactions?: {
    like: boolean;
    prayer: boolean;
    fire: boolean;
  };
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user_name?: string;
  parent_comment_id?: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

export interface Follower {
  id: string;
  missionary_id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  status: "pending" | "approved" | "denied";
  is_donor: boolean;
  created_at: string;
  approved_at?: string;
}

export interface Notification {
  id: string;
  tenant_id: string;
  user_id: string;
  missionary_id: string;
  notification_type: string;
  title: string;
  message?: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface LedgerEntry {
  id: string;
  tenant_id: string;
  missionary_id: string;
  entry_type: "income" | "expense" | "adjustment";
  amount: number;
  description?: string;
  reference_id?: string;
  source?: string;
  entry_date: string;
  created_at: string;
}

export interface DashboardStats {
  monthlySupport: number;
  monthlyGoal: number;
  percentFunded: number;
  currentBalance: number;
  balanceAsOf: string;
  activeSupporters: number;
  newSupportersThisMonth: number;
  yearToDateGiving: number;
  monthToDateGiving: number;
  atRiskDonors: number;
  failedPayments: number;
  pendingTasks: number;
  newDonors: number;
}

export interface DonorSegmentation {
  new: number;
  active: number;
  atRisk: number;
  lapsed: number;
}

export interface MonthlyGiving {
  month: string;
  amount: number;
  recurring: number;
  oneTime: number;
}
