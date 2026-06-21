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
export type EmailTemplateBuilder = "unlayer" | "react_email";
export type EmailTemplateCategory = "transactional" | "campaign" | "system";

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

export type ContributionOperationSourceSurface =
  | "contribution_hub"
  | "donor_crm_record"
  | "automation"
  | "bulk_action"
  | "api";

export type ContributionCorrectionType =
  | "resend_receipt"
  | "approve_staged_gift"
  | "retry_staged_gift"
  | "crm_repost"
  | "metadata_update"
  | "refund"
  | "donor_relink"
  | "amount_correction"
  | "designation_correction"
  | "fund_correction"
  | "allocation_correction"
  | "receipt_correction"
  | "statement_correction"
  | "payment_state_correction"
  | "stripe_replay";

export type ContributionCorrectionStatus =
  | "pending"
  | "applied"
  | "failed"
  | "voided";

export interface ContributionOperationPromptSettings {
  tenant_id: string;
  default_reason_mode: "optional" | "required";
  allow_user_reason_prompt_reduction: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface ContributionOperationUserPreference {
  id: string;
  tenant_id: string;
  profile_id: string;
  reduce_reason_prompts: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContributionCorrection {
  id: string;
  tenant_id: string;
  donation_id: string;
  staged_gift_id: string | null;
  correction_type: ContributionCorrectionType;
  status: ContributionCorrectionStatus;
  reason: string;
  source_surface: ContributionOperationSourceSurface;
  actor_profile_id: string | null;
  before_summary: Record<string, unknown>;
  after_summary: Record<string, unknown>;
  provider_outcome: Record<string, unknown>;
  donor_visible_effect: Record<string, unknown>;
  receipt_effect: Record<string, unknown>;
  statement_effect: Record<string, unknown>;
  audit_event_id: string | null;
  created_at: string;
  applied_at: string | null;
  failed_at: string | null;
}

export interface ContributionOperationAuditEvent {
  id: string;
  tenant_id: string;
  actor_profile_id: string | null;
  donation_id: string | null;
  staged_gift_id: string | null;
  donor_id: string | null;
  correction_id: string | null;
  operation: string;
  resource_type: string;
  resource_id: string | null;
  source_surface: ContributionOperationSourceSurface;
  reason: string | null;
  confirmation_label: string | null;
  policy_snapshot: Record<string, unknown>;
  before_snapshot: Record<string, unknown>;
  after_snapshot: Record<string, unknown>;
  provider_outcome: Record<string, unknown>;
  downstream_effects: Record<string, unknown>;
  related_task_ids: string[];
  related_batch_id: string | null;
  correlation_id: string;
  created_at: string;
}

export interface ContributionAdjustment {
  id: string;
  tenant_id: string;
  donation_id: string;
  correction_id: string | null;
  adjustment_type: string;
  status: "applied" | "reversed";
  effective_values: Record<string, unknown>;
  reason: string;
  actor_profile_id: string | null;
  source_surface: ContributionOperationSourceSurface;
  base_revision: string | null;
  idempotency_key: string | null;
  created_at: string;
}

export interface ContributionApprovalPolicy {
  tenant_id: string;
  ownership_mode:
    | "no_approval_required"
    | "one_approver"
    | "separation_of_duties";
  suppressed_gates: string[];
  stronger_approval_categories: string[];
  reminder_hours: number;
  escalation_hours: number | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContributionCorrectionRequest {
  id: string;
  tenant_id: string;
  donation_id: string;
  action_type: string;
  payload: Record<string, unknown>;
  reason: string;
  requested_by_profile_id: string | null;
  source_surface: ContributionOperationSourceSurface;
  status: "pending" | "approved" | "rejected" | "superseded";
  expected_revision: string | null;
  idempotency_key: string | null;
  receipt_delivery_proposal: Record<string, unknown>;
  decided_by_profile_id: string | null;
  decided_at: string | null;
  decision_reason: string | null;
  applied_adjustment_id: string | null;
  approval_task_id: string | null;
  follow_up_task_id: string | null;
  created_at: string;
  updated_at: string;
}

export type ContributionNotificationMode =
  | "auto_notify"
  | "always_ask"
  | "staff_chooses";

export type ContributionNotificationDecision =
  | "sent"
  | "suppressed"
  | "blocked"
  | "failed"
  | "not_required";

export interface EmailTemplateSystemBinding {
  id: string;
  tenant_id: string;
  template_id: string;
  family_key: string;
  variant_key: string;
  required_merge_tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContributionNotificationSetting {
  id: string;
  tenant_id: string;
  action_type: string;
  mode: ContributionNotificationMode;
  suppression_reason_required: boolean;
  task_assignment_mode: "actor_only" | "queue_only" | "actor_and_queue";
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface ContributionNotificationEvent {
  id: string;
  tenant_id: string;
  operation_audit_event_id: string | null;
  correction_id: string | null;
  action_type: string;
  template_id: string | null;
  template_version_id: string | null;
  template_family: string | null;
  template_variant: string | null;
  template_version: number | null;
  decision: ContributionNotificationDecision;
  policy_snapshot: Record<string, unknown>;
  suppression_reason: string | null;
  personal_note_present: boolean;
  recipient_donor_id: string | null;
  recipient_email: string | null;
  email_send_log_id: string | null;
  provider_status: string | null;
  provider_message_id: string | null;
  error_code: string | null;
  error_message: string | null;
  task_ids: string[];
  created_at: string;
  sent_at: string | null;
}

export type MissionControlTaskStatus =
  | "open"
  | "in_progress"
  | "completed"
  | "dismissed"
  | "suppressed";
export type MissionControlTaskUrgency = "normal" | "high" | "critical";
export type MissionControlAttentionStatus =
  | "open"
  | "resolved"
  | "dismissed"
  | "suppressed";

export interface MissionControlQueue {
  id: string;
  tenant_id: string;
  key: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface MissionControlTask {
  id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  status: MissionControlTaskStatus;
  urgency: MissionControlTaskUrgency;
  queue_id: string | null;
  assignee_profile_id: string | null;
  source_module: string;
  issue_type: string;
  created_by_profile_id: string | null;
  created_by_kind: "human" | "system";
  due_at: string | null;
  completed_at: string | null;
  dismissed_at: string | null;
  dismissed_reason: string | null;
  suppressed_at: string | null;
  suppressed_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface MissionControlTaskLink {
  id: string;
  tenant_id: string;
  task_id: string;
  record_type: string;
  record_id: string;
  relationship: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface MissionControlAttentionItem {
  id: string;
  tenant_id: string;
  dedupe_key: string;
  issue_type: string;
  urgency: MissionControlTaskUrgency;
  status: MissionControlAttentionStatus;
  task_id: string | null;
  summary: string;
  details: Record<string, unknown>;
  first_seen_at: string;
  last_seen_at: string;
  resolved_at: string | null;
  dismissed_at: string | null;
  suppressed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type MissionControlAutomationMode = "simple" | "advanced";
export type MissionControlAutomationRunMode = "automatic" | "review_first";

export interface MissionControlAutomationRule {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  mode: MissionControlAutomationMode;
  trigger: Record<string, unknown>;
  conditions: unknown[];
  actions: unknown[];
  run_mode: MissionControlAutomationRunMode;
  reviewer_policy: Record<string, unknown>;
  failure_policy: Record<string, unknown>;
  activity_log_policy: Record<string, unknown>;
  enabled: boolean;
  activation_status: string;
  version: number;
  last_preview_id: string | null;
  last_test_run_id: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  disabled_at: string | null;
  disabled_by: string | null;
}

export interface MissionControlAutomationActivityLog {
  id: string;
  tenant_id: string;
  rule_id: string | null;
  run_id: string | null;
  trigger: Record<string, unknown>;
  matched_records: unknown[];
  attempted_actions: unknown[];
  completed_actions: unknown[];
  skipped_actions: unknown[];
  failures: unknown[];
  notifications: unknown[];
  created_tasks: string[];
  actor_profile_id: string | null;
  actor_kind: "human" | "system";
  created_at: string;
}

export type ContributionOperationBatchStatus =
  | "running"
  | "complete"
  | "complete_with_issues"
  | "failed"
  | "cancelled";
export type ContributionOperationBatchExecutionMode =
  | "immediate"
  | "background";
export type ContributionOperationBatchItemStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "skipped"
  | "failed";

export interface ContributionOperationBatch {
  id: string;
  tenant_id: string;
  operation: string;
  risk_level: "low" | "high";
  source_surface: string;
  selection_snapshot: Record<string, unknown>;
  preview_snapshot: Record<string, unknown>;
  preview_skipped: boolean;
  confirmation_snapshot: Record<string, unknown>;
  reason: string | null;
  status: ContributionOperationBatchStatus;
  execution_mode: ContributionOperationBatchExecutionMode;
  total_count: number;
  processed_count: number;
  succeeded_count: number;
  skipped_count: number;
  failed_count: number;
  follow_up_task_count: number;
  created_by_profile_id: string | null;
  activity_audit_event_id: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  cancelled_at: string | null;
}

export interface ContributionOperationBatchItem {
  id: string;
  batch_id: string;
  tenant_id: string;
  record_index: number;
  resource_type: string;
  resource_id: string | null;
  donation_id: string | null;
  staged_gift_id: string | null;
  status: ContributionOperationBatchItemStatus;
  skip_reason: string | null;
  error_code: string | null;
  error_message: string | null;
  payload: Record<string, unknown>;
  result: Record<string, unknown>;
  operation_audit_event_id: string | null;
  task_id: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
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

export interface EmailTemplate {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  category: EmailTemplateCategory;
  builder: EmailTemplateBuilder;
  builder_version: string | null;
  design_json: Record<string, unknown>;
  html_content: string | null;
  html_exported_at: string | null;
  text_content: string | null;
  text_exported_at: string | null;
  editor_metadata: Record<string, unknown>;
  legacy_unlayer_project_id: number | null;
  default_subject: string | null;
  default_preheader: string | null;
  is_active: boolean;
  is_system: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface EmailTemplateVersion {
  id: string;
  template_id: string;
  tenant_id: string;
  version: number;
  builder: EmailTemplateBuilder;
  builder_version: string | null;
  design_json: Record<string, unknown>;
  html_content: string | null;
  text_content: string | null;
  subject: string | null;
  preheader: string | null;
  editor_metadata: Record<string, unknown>;
  created_at: string;
  created_by: string | null;
}

export interface CrmCommandLog {
  id: string;
  tenant_id: string;
  actor_user_id: string;
  actor_profile_id: string | null;
  request_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  idempotency_key: string | null;
  status: "queued" | "attempted" | "succeeded" | "failed" | "skipped";
  command_payload: Record<string, unknown>;
  result_summary: Record<string, unknown>;
  error_message: string | null;
  created_at: string;
}

export type CrmLinkEntityType =
  | "supabase_auth_user"
  | "asym_profile"
  | "tenant_membership"
  | "crm_person"
  | "donor_profile"
  | "missionary_profile"
  | "cms_public_entity"
  | "stripe_customer"
  | "fund_or_project"
  | "pledge_or_relationship_commitment"
  | "payment_record"
  | "receipt_record"
  | "refund_record"
  | "statement_record"
  | "reconciliation_record";

export interface CrmRecordLink {
  id: string;
  tenant_id: string;
  crm_provider: "twenty";
  twenty_object_name: string;
  twenty_record_id: string;
  asym_entity_type: CrmLinkEntityType;
  asym_entity_id: string;
  relationship_type: string;
  link_status:
    | "active"
    | "suspected_duplicate"
    | "merged"
    | "archived"
    | "rejected";
  confidence: number;
  verified_at: string | null;
  verified_by_profile_id: string | null;
  last_seen_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CrmMergeCandidate {
  id: string;
  tenant_id: string;
  crm_provider: "twenty";
  source_entity_type: CrmLinkEntityType;
  source_entity_id: string;
  candidate_twenty_object_name: string;
  candidate_twenty_record_id: string;
  candidate_link_id: string | null;
  score: number;
  confidence: "low" | "medium" | "high";
  match_reasons: string[];
  match_values: Record<string, unknown>;
  status: "pending" | "approved" | "rejected" | "merged" | "superseded";
  reviewed_by_profile_id: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrmProjectionState {
  id: string;
  tenant_id: string;
  projection_name: string;
  source_system: string;
  source_entity_type: CrmLinkEntityType;
  source_entity_id: string;
  target_surface:
    | "mission_control"
    | "donor"
    | "missionary"
    | "public"
    | "cms"
    | "event"
    | "reporting";
  crm_record_link_id: string | null;
  crm_provider: "twenty";
  twenty_object_name: string | null;
  twenty_record_id: string | null;
  sync_status: "pending" | "synced" | "stale" | "failed" | "disabled";
  source_hash: string | null;
  projected_hash: string | null;
  last_projected_at: string | null;
  last_error: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type CrmSyncDomain =
  | "people"
  | "companies"
  | "churches"
  | "households"
  | "tasks"
  | "notes"
  | "ministry_activities"
  | "relationship_commitments";

export type CrmSyncRecordStatus =
  | "received"
  | "queued"
  | "processing"
  | "processed"
  | "succeeded"
  | "ignored"
  | "failed"
  | "dead_letter"
  | "paused";

export interface CrmSyncSettings {
  id: string;
  tenant_id: string;
  domain: CrmSyncDomain;
  inbound_paused: boolean;
  outbound_paused: boolean;
  replay_paused: boolean;
  paused_reason: string | null;
  paused_by_profile_id: string | null;
  paused_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CrmWebhookEvent {
  id: string;
  tenant_id: string | null;
  crm_provider: "twenty";
  webhook_event_key: string;
  twenty_event_type: string;
  twenty_object_name: string;
  twenty_record_id: string | null;
  domain: CrmSyncDomain | null;
  event_action: string;
  webhook_timestamp: string;
  received_at: string;
  signature_hash: string;
  payload_hash: string;
  payload: Record<string, unknown>;
  status: CrmSyncRecordStatus;
  process_attempts: number;
  replay_count: number;
  ignored_reason: string | null;
  last_error: string | null;
  processed_at: string | null;
  replayed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrmOutboundJob {
  id: string;
  tenant_id: string;
  domain: CrmSyncDomain;
  job_type: "create" | "update" | "delete" | "upsert" | "reconcile";
  twenty_object_name: string;
  source_entity_type: CrmLinkEntityType | null;
  source_entity_id: string | null;
  crm_record_link_id: string | null;
  idempotency_key: string;
  status: CrmSyncRecordStatus;
  priority: number;
  attempt_count: number;
  max_attempts: number;
  next_attempt_at: string;
  locked_at: string | null;
  locked_by: string | null;
  payload: Record<string, unknown>;
  result_summary: Record<string, unknown>;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrmReconciliationRun {
  id: string;
  tenant_id: string | null;
  domain: CrmSyncDomain | null;
  reconciliation_type: string;
  status: "queued" | "running" | "succeeded" | "failed";
  checked_counts: Record<string, number>;
  findings: Record<string, unknown>;
  last_error: string | null;
  requested_by_profile_id: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrmSyncLog {
  id: string;
  tenant_id: string | null;
  direction: "inbound" | "outbound" | "replay" | "reconciliation";
  domain: CrmSyncDomain | null;
  status: CrmSyncRecordStatus;
  source_table: string;
  source_id: string;
  message: string;
  details: Record<string, unknown>;
  created_at: string;
}
