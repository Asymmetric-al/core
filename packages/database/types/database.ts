/**
 * MULTI-TENANCY APPROACH
 *
 * asymmetric.al Platform uses Row Level Security (RLS) with tenant_id for data isolation.
 *
 * Architecture:
 * - All tenant-scoped tables include a `tenant_id` column (UUID)
 * - Memberships are modeled in `authz.memberships` (user_id + tenant_id + role)
 * - Supabase RLS policies enforce tenant isolation at the database level
 * - BFF route and handler checks provide primary permission enforcement
 * - Database RLS policies provide defense-in-depth backup enforcement
 *
 * Example RLS Policy (to be created in Supabase):
 * ```sql
 * CREATE POLICY "Users can only view their tenant's data"
 * ON public.donations
 * FOR SELECT
 * USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);
 * ```
 *
 * Benefits:
 * - Data isolation enforced at database layer (not application layer)
 * - Single database, single schema (simpler operations)
 * - Automatic filtering on all queries
 * - No risk of cross-tenant data leaks from application bugs
 */

export type UserRole =
  | "donor"
  | "missionary"
  | "admin"
  | "staff"
  | "super_admin";
export type MembershipRole = "donor" | "missionary" | "staff";
export type StaffSubrole =
  | "finance"
  | "mobilizer"
  | "development"
  | "hr"
  | "member_care";
export type DonationStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";
export type GivingFrequency =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "yearly";
export type DonationSource =
  | "direct"
  | "one_time"
  | "pledge"
  | "import"
  | string;
export type MoneyCents = number;

export interface Profile {
  id: string;
  tenant_id: string;
  user_id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  display_name: string | null;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  user_id: string;
  tenant_id: string;
  role: MembershipRole;
  staff_role: StaffSubrole | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type OrgPostVisibility = "all_donors" | "followers_only";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  org_post_visibility: OrgPostVisibility;
  org_settings: Record<string, unknown>;
  stripe_secret_key: string | null;
  stripe_publishable_key: string | null;
  stripe_webhook_secret: string | null;
  billing_email: string | null;
  default_timezone: string;
  locale: string;
  created_at: string;
  updated_at: string;
}

export interface DonorFeedPreferences {
  id: string;
  donor_id: string;
  tenant_id: string;
  show_org_posts: boolean;
  show_missionary_posts: boolean;
  follow_org: boolean;
  email_org_posts: boolean;
  email_missionary_posts: boolean;
  push_org_posts: boolean;
  push_missionary_posts: boolean;
  created_at: string;
  updated_at: string;
}

export interface Missionary {
  id: string;
  tenant_id: string;
  profile_id: string;
  bio: string | null;
  mission_field: string | null;
  funding_goal: MoneyCents;
  current_funding: MoneyCents;
  phone: string | null;
  location: string | null;
  tagline: string | null;
  timezone: string;
  region:
    | "Africa"
    | "SE Asia"
    | "Europe"
    | "Latin America"
    | "Middle East"
    | "North America";
  health_status: "healthy" | "needs_attention" | "at_risk" | "crisis";
  last_check_in: string | null;
  manual_attention: boolean;
  health_signals: {
    emotional: number;
    spiritual: number;
    physical: number;
    financial: number;
  };
  birth_date: string | null;
  social_links: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    website?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface MissionaryWithProfile extends Missionary {
  profile: Profile;
}

export interface Donor {
  id: string;
  tenant_id: string;
  profile_id: string | null;
  missionary_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  work_phone: string | null;
  preferred_contact: string | null;
  avatar_url: string | null;
  location: string | null;
  type: string | null;
  status: string | null;
  giving_preferences: Record<string, unknown>;
  total_given: MoneyCents;
  first_gift_date: string | null;
  last_gift_date: string | null;
  last_gift_amount: MoneyCents | null;
  gift_count: number;
  frequency: string | null;
  joined_date: string | null;
  tags: string[] | null;
  score: number | null;
  address: Record<string, unknown> | null;
  work_address: Record<string, unknown> | null;
  website: string | null;
  organization: string | null;
  title: string | null;
  birthday: string | null;
  anniversary: string | null;
  spouse: string | null;
  notes: string | null;
  do_not_contact: boolean;
  do_not_email: boolean;
  receipt_email_frequency: string;
  default_update_frequency: string | null;
  preferred_language: string;
  has_active_pledge: boolean | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DonorWithProfile extends Donor {
  profile: Profile;
}

export interface Fund {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  target_amount: MoneyCents;
  goal_amount: MoneyCents;
  current_amount: MoneyCents;
  currency: string | null;
  missionary_id: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecurringGiving {
  id: string;
  tenant_id: string;
  donor_id: string;
  missionary_id: string | null;
  fund_id: string | null;
  amount: number;
  currency: string;
  frequency: GivingFrequency;
  next_charge_date: string;
  stripe_subscription_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Follow {
  id: string;
  tenant_id: string | null;
  donor_id: string | null;
  missionary_id: string | null;
  status: string;
  is_donor: boolean;
  approved_at: string | null;
  notification_frequency: string | null;
  muted: boolean;
  created_at: string;
}

export interface Donation {
  id: string;
  tenant_id: string | null;
  donor_id: string | null;
  missionary_id: string | null;
  fund_id: string | null;
  amount: MoneyCents;
  currency: string;
  status: DonationStatus;
  donation_type: string | null;
  payment_method: string | null;
  is_recurring: boolean | null;
  recurring_interval: string | null;
  notes: string | null;
  stripe_payment_intent_id: string | null;
  gift_date: string;
  campaign_id: string | null;
  pledge_id: string | null;
  processed_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
  error_code: string | null;
  error_message: string | null;
  stripe_charge_id: string | null;
  refunded_at: string | null;
  refund_amount: MoneyCents;
  source: DonationSource | null;
  created_at: string;
  updated_at: string;
}

export interface DonationWithDetails extends Donation {
  donor: Profile;
  missionary: MissionaryWithProfile;
  fund: Fund | null;
}

export interface Campaign {
  id: string;
  tenant_id: string;
  title: string;
  story: string | null;
  channel: string;
  status: string;
  audience_filter: Record<string, unknown>;
  metadata: Record<string, unknown>;
  goal_amount: MoneyCents;
  current_amount: MoneyCents;
  share_url: string | null;
  slug: string | null;
  creator_donor_id: string;
  missionary_id: string;
  start_date: string | null;
  end_date: string | null;
  scheduled_for: string | null;
  sent_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationQueueItem {
  id: string;
  tenant_id: string;
  campaign_id: string | null;
  donor_id: string | null;
  recipient_donor_id: string;
  profile_id: string | null;
  notification_type: string;
  channel: string;
  template_key: string | null;
  payload: Record<string, unknown>;
  dedupe_key: string | null;
  status: string;
  attempts: number;
  scheduled_for: string;
  available_at: string;
  processed_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface DonorActivity {
  id: string;
  donor_id: string | null;
  type: string;
  title: string;
  description: string | null;
  date: string | null;
  amount: MoneyCents | null;
  status: string | null;
  gift_type: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export type MemberCareActivityType =
  | "video_call"
  | "in_person_visit"
  | "check_in"
  | "pastoral_note"
  | "care_plan_update"
  | "crisis_intervention"
  | "birthday"
  | "prayer_request";

export interface MemberCareActivity {
  id: string;
  tenant_id: string;
  missionary_id: string;
  author_user_id: string;
  author_name_snapshot: string | null;
  type: MemberCareActivityType;
  title: string | null;
  description: string;
  occurred_at: string;
  created_at: string;
  updated_at: string;
}

export interface MemberCareGoal {
  id: string;
  tenant_id: string;
  missionary_id: string;
  title: string;
  status: "pending" | "active" | "completed";
  target_date: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberCareRequirement {
  id: string;
  tenant_id: string;
  missionary_id: string;
  activity_type: MemberCareActivityType;
  interval_days: number;
  notes: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberCarePrivateNote {
  id: string;
  tenant_id: string;
  missionary_id: string;
  author_user_id: string;
  author_name_snapshot: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface DonorPledge {
  id: string;
  tenant_id: string | null;
  donor_id: string | null;
  missionary_id: string | null;
  fund_id: string | null;
  amount: MoneyCents;
  currency: string;
  frequency: string | null;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  next_payment_date: string | null;
  stripe_subscription_id: string | null;
  billing_day_of_month: number | null;
  billing_timezone: string | null;
  stripe_payment_method_id: string | null;
  retry_count: number;
  last_charge_at: string | null;
  last_charge_attempt: string | null;
  failed_charge_count: number;
  pause_reason: string | null;
  paused_at: string | null;
  next_charge_at: string | null;
  total_paid: MoneyCents;
  total_expected: MoneyCents;
  payments_completed: number | null;
  payments_remaining: number | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

export interface PledgeChargeAttempt {
  id: string;
  tenant_id: string;
  pledge_id: string;
  donor_id: string | null;
  donation_id: string | null;
  attempt_number: number;
  status: string;
  amount: MoneyCents;
  currency: string;
  scheduled_for_date: string;
  stripe_payment_intent_id: string | null;
  gateway_response: Record<string, unknown>;
  error_code: string | null;
  error_message: string | null;
  attempted_at: string;
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  url: string;
  type: "image" | "video";
  width?: number;
  height?: number;
}

export interface Post {
  id: string;
  tenant_id: string;
  missionary_id: string;
  content: string;
  media: MediaItem[];
  like_count: number;
  prayer_count: number;
  fires_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PostPrayer {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface PostWithAuthor extends Post {
  author: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  user_liked?: boolean;
  user_prayed?: boolean;
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
