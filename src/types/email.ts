/**
 * SendGrid Multi-Tenant Email Integration Types
 * 
 * This module defines all types for the SendGrid integration, including:
 * - Tenant email settings and credentials
 * - Email templates and campaigns
 * - Event webhooks and analytics
 * - Compliance and preferences
 */

// =============================================================================
// CORE ENUMS AND CONSTANTS
// =============================================================================

export type EmailMessageType = 'transactional' | 'marketing'

export type EmailTemplateCategory = 'transactional' | 'campaign' | 'system'

export type CampaignStatus = 
  | 'draft' 
  | 'scheduled' 
  | 'sending' 
  | 'paused' 
  | 'sent' 
  | 'partially_sent' 
  | 'cancelled'

export type CampaignAudienceType = 'all' | 'segment' | 'list' | 'manual'

export type EmailSendStatus = 'pending' | 'sent' | 'failed' | 'bounced'

export type SuppressionType = 'unsubscribe' | 'bounce' | 'spam' | 'manual'

export type SuppressionSource = 'sendgrid' | 'user' | 'admin' | 'import'

export type BounceType = 'hard' | 'soft' | 'blocked'

export type DMARCPolicy = 'none' | 'quarantine' | 'reject'

export type DeliverabilityCheckStatus = 'passed' | 'warning' | 'failed' | 'pending'

// SendGrid event types from webhook
export type SendGridEventType = 
  | 'processed'
  | 'delivered'
  | 'bounce'
  | 'dropped'
  | 'deferred'
  | 'open'
  | 'click'
  | 'unsubscribe'
  | 'spamreport'
  | 'group_unsubscribe'
  | 'group_resubscribe'

// =============================================================================
// TENANT EMAIL SETTINGS
// =============================================================================

export interface TenantEmailSettings {
  id: string
  tenant_id: string
  
  // Connection status
  is_connected: boolean
  connection_verified_at: string | null
  last_error: string | null
  
  // Sender defaults (not encrypted)
  default_from_email: string
  default_from_name: string
  reply_to_email: string | null
  
  // API key hint (last 4 chars for display)
  sendgrid_api_key_hint: string | null
  
  // Deliverability status
  domain_authenticated: boolean
  dkim_verified: boolean
  spf_verified: boolean
  dmarc_policy: DMARCPolicy | null
  deliverability_score: number | null
  
  // Webhook config
  webhook_url: string | null
  
  // Rate limits
  daily_send_limit: number
  sends_today: number
  limit_reset_at: string | null
  
  // Audit
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface TenantEmailSettingsInsert {
  tenant_id: string
  default_from_email: string
  default_from_name: string
  reply_to_email?: string | null
}

export interface TenantEmailSettingsUpdate {
  default_from_email?: string
  default_from_name?: string
  reply_to_email?: string | null
  is_connected?: boolean
  connection_verified_at?: string | null
  last_error?: string | null
  domain_authenticated?: boolean
  dkim_verified?: boolean
  spf_verified?: boolean
  dmarc_policy?: DMARCPolicy | null
  deliverability_score?: number | null
  webhook_url?: string | null
  daily_send_limit?: number
  sends_today?: number
  limit_reset_at?: string | null
}

// =============================================================================
// SENDER PROFILES
// =============================================================================

export interface EmailSenderProfile {
  id: string
  tenant_id: string
  name: string
  from_email: string
  from_name: string
  reply_to_email: string | null
  is_default: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface EmailSenderProfileInsert {
  tenant_id: string
  name: string
  from_email: string
  from_name: string
  reply_to_email?: string | null
  is_default?: boolean
}

export interface EmailSenderProfileUpdate {
  name?: string
  from_name?: string
  reply_to_email?: string | null
  is_default?: boolean
  is_verified?: boolean
}

// =============================================================================
// EMAIL TEMPLATES
// =============================================================================

export interface EmailTemplate {
  id: string
  tenant_id: string
  name: string
  description: string | null
  category: EmailTemplateCategory
  
  // Unlayer design (source of truth)
  design_json: Record<string, unknown>
  
  // Exported HTML (cached for sending)
  html_content: string | null
  html_exported_at: string | null
  
  // Email metadata
  default_subject: string | null
  default_preheader: string | null
  
  // Status
  is_active: boolean
  is_system: boolean
  
  // Versioning
  version: number
  
  // Audit
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface EmailTemplateInsert {
  tenant_id: string
  name: string
  description?: string | null
  category?: EmailTemplateCategory
  design_json: Record<string, unknown>
  html_content?: string | null
  default_subject?: string | null
  default_preheader?: string | null
  is_active?: boolean
  is_system?: boolean
  created_by?: string | null
}

export interface EmailTemplateUpdate {
  name?: string
  description?: string | null
  category?: EmailTemplateCategory
  design_json?: Record<string, unknown>
  html_content?: string | null
  html_exported_at?: string | null
  default_subject?: string | null
  default_preheader?: string | null
  is_active?: boolean
  version?: number
}

// =============================================================================
// EMAIL CAMPAIGNS
// =============================================================================

export interface EmailCampaign {
  id: string
  tenant_id: string
  name: string
  description: string | null
  
  // Content
  template_id: string | null
  subject: string
  preheader_text: string | null
  
  // Sender
  sender_profile_id: string | null
  
  // Audience
  audience_type: CampaignAudienceType
  audience_query: Record<string, unknown> | null
  recipient_count: number | null
  
  // Status & scheduling
  status: CampaignStatus
  scheduled_at: string | null
  timezone: string
  
  // Progress
  started_at: string | null
  completed_at: string | null
  sent_count: number
  failed_count: number
  
  // Tracking settings
  track_opens: boolean
  track_clicks: boolean
  
  // Suppression group
  suppression_group_id: string | null
  
  // Audit
  created_at: string
  updated_at: string
  created_by: string | null
  version: number
}

export interface EmailCampaignInsert {
  tenant_id: string
  name: string
  subject: string
  description?: string | null
  template_id?: string | null
  preheader_text?: string | null
  sender_profile_id?: string | null
  audience_type: CampaignAudienceType
  audience_query?: Record<string, unknown> | null
  recipient_count?: number | null
  scheduled_at?: string | null
  timezone?: string
  track_opens?: boolean
  track_clicks?: boolean
  suppression_group_id?: string | null
  created_by?: string | null
}

export interface EmailCampaignUpdate {
  name?: string
  description?: string | null
  template_id?: string | null
  subject?: string
  preheader_text?: string | null
  sender_profile_id?: string | null
  audience_type?: CampaignAudienceType
  audience_query?: Record<string, unknown> | null
  recipient_count?: number | null
  status?: CampaignStatus
  scheduled_at?: string | null
  timezone?: string
  started_at?: string | null
  completed_at?: string | null
  sent_count?: number
  failed_count?: number
  track_opens?: boolean
  track_clicks?: boolean
  suppression_group_id?: string | null
  version?: number
}

export interface EmailCampaignWithRelations extends EmailCampaign {
  template?: EmailTemplate | null
  sender_profile?: EmailSenderProfile | null
  suppression_group?: EmailSuppressionGroup | null
}

// =============================================================================
// CAMPAIGN RECIPIENTS
// =============================================================================

export interface EmailCampaignRecipient {
  id: string
  campaign_id: string
  tenant_id: string
  recipient_email: string
  recipient_name: string | null
  personalization_data: Record<string, unknown> | null
  status: EmailSendStatus
  sendgrid_message_id: string | null
  sent_at: string | null
  error_message: string | null
  batch_number: number | null
}

export interface EmailCampaignRecipientInsert {
  campaign_id: string
  tenant_id: string
  recipient_email: string
  recipient_name?: string | null
  personalization_data?: Record<string, unknown> | null
  batch_number?: number | null
}

export interface EmailCampaignRecipientUpdate {
  status?: EmailSendStatus
  sendgrid_message_id?: string | null
  sent_at?: string | null
  error_message?: string | null
}

// =============================================================================
// SEND LOG (IDEMPOTENCY)
// =============================================================================

export interface EmailSendLog {
  id: string
  tenant_id: string
  idempotency_key: string
  correlation_id: string
  status: EmailSendStatus
  sendgrid_message_id: string | null
  recipient_count: number
  message_type: EmailMessageType
  template_id: string | null
  campaign_id: string | null
  requested_at: string
  sent_at: string | null
  error_code: string | null
  error_message: string | null
  retry_count: number
}

export interface EmailSendLogInsert {
  tenant_id: string
  idempotency_key: string
  correlation_id: string
  status: EmailSendStatus
  recipient_count: number
  message_type: EmailMessageType
  requested_at: string
  template_id?: string | null
  campaign_id?: string | null
  sendgrid_message_id?: string | null
  error_code?: string | null
  error_message?: string | null
}

// =============================================================================
// EVENT TRACKING
// =============================================================================

export interface EmailEvent {
  id: string
  tenant_id: string
  sendgrid_message_id: string
  event_type: SendGridEventType
  recipient_email: string
  timestamp: string
  bounce_type: BounceType | null
  bounce_reason: string | null
  click_url: string | null
  user_agent: string | null
  ip_address: string | null
  campaign_id: string | null
  raw_event: Record<string, unknown> | null
  created_at: string
}

export interface EmailEventInsert {
  tenant_id: string
  sendgrid_message_id: string
  event_type: SendGridEventType
  recipient_email: string
  timestamp: string
  bounce_type?: BounceType | null
  bounce_reason?: string | null
  click_url?: string | null
  user_agent?: string | null
  ip_address?: string | null
  campaign_id?: string | null
  raw_event?: Record<string, unknown> | null
}

// =============================================================================
// SUPPRESSION GROUPS & SUPPRESSIONS
// =============================================================================

export interface EmailSuppressionGroup {
  id: string
  tenant_id: string
  name: string
  description: string | null
  is_default: boolean
  created_at: string
}

export interface EmailSuppressionGroupInsert {
  tenant_id: string
  name: string
  description?: string | null
  is_default?: boolean
}

export interface EmailSuppression {
  id: string
  tenant_id: string
  email: string
  suppression_type: SuppressionType
  group_id: string | null
  reason: string | null
  source: SuppressionSource | null
  created_at: string
}

export interface EmailSuppressionInsert {
  tenant_id: string
  email: string
  suppression_type: SuppressionType
  group_id?: string | null
  reason?: string | null
  source?: SuppressionSource | null
}

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

// Connect SendGrid
export interface ConnectSendGridRequest {
  apiKey: string
  defaultFromEmail: string
  defaultFromName: string
  replyToEmail?: string
}

export interface SendGridAccountInfo {
  type: 'free' | 'essentials' | 'pro' | 'premier'
  monthlyLimit: number
  usedThisMonth: number
}

export interface SenderIdentity {
  id: number
  nickname: string
  from_email: string
  from_name: string
  reply_to_email: string | null
  verified: boolean
}

export interface DomainAuthentication {
  id: number
  domain: string
  subdomain: string | null
  valid: boolean
  dns: {
    dkim1: { valid: boolean; host: string; data: string }
    dkim2: { valid: boolean; host: string; data: string }
    mail_cname?: { valid: boolean; host: string; data: string }
  }
}

export interface DeliverabilityWarning {
  code: string
  message: string
  severity: 'info' | 'warning' | 'error'
  helpUrl?: string
}

export interface ConnectSendGridResponse {
  success: boolean
  connectionId?: string
  account?: SendGridAccountInfo
  senderIdentities?: SenderIdentity[]
  domainAuthentication?: DomainAuthentication[]
  deliverabilityScore?: number
  warnings?: DeliverabilityWarning[]
  error?: string
}

// Send Email
export interface EmailRecipient {
  email: string
  name?: string
  mergeTags?: Record<string, string>
  metadata?: Record<string, unknown>
}

export interface EmailSendRequest {
  tenantId: string
  messageType: EmailMessageType
  
  // Content (one of these required)
  templateId?: string
  designJson?: Record<string, unknown>
  html?: string
  
  subject: string
  preheaderText?: string
  
  // Recipients
  recipients: EmailRecipient[]
  
  // Personalization
  globalMergeTags?: Record<string, string>
  
  // Metadata
  campaignId?: string
  correlationId: string
  idempotencyKey: string
  
  // Options
  sendAt?: string // ISO date string
  trackOpens?: boolean
  trackClicks?: boolean
  bypassListManagement?: boolean
}

export interface EmailError {
  email?: string
  code: string
  message: string
}

export interface EmailSendResult {
  success: boolean
  messageId?: string
  correlationId: string
  recipientCount: number
  errors?: EmailError[]
  rateLimited?: boolean
  retryAfter?: number
}

// =============================================================================
// DELIVERABILITY TYPES
// =============================================================================

export interface DeliverabilityCheck {
  id: string
  name: string
  status: DeliverabilityCheckStatus
  required: boolean
  message: string
  helpUrl: string
  lastChecked: string | null
}

export interface DeliverabilityStatus {
  score: number // 0-100
  checks: DeliverabilityCheck[]
  passedCount: number
  warningCount: number
  failedCount: number
  pendingCount: number
  lastChecked: string | null
}

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

export interface CampaignOverviewStats {
  sent: number
  delivered: number
  deliveryRate: number
  bounced: number
  bounceRate: number
}

export interface CampaignEngagementStats {
  opened: number
  openRate: number
  uniqueOpens: number
  clicked: number
  clickRate: number
  uniqueClicks: number
  clickToOpenRate: number
}

export interface CampaignIssueStats {
  unsubscribed: number
  spamReports: number
  softBounces: number
  hardBounces: number
}

export interface CampaignTimelinePoint {
  hour: string
  sent: number
  delivered: number
  opened: number
  clicked: number
}

export interface CampaignAnalytics {
  overview: CampaignOverviewStats
  engagement: CampaignEngagementStats
  issues: CampaignIssueStats
  timeline: CampaignTimelinePoint[]
}

export interface TenantEmailAnalytics {
  period: {
    start: string
    end: string
  }
  totals: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    unsubscribed: number
    spamReports: number
  }
  rates: {
    deliveryRate: number
    openRate: number
    clickRate: number
    bounceRate: number
    unsubscribeRate: number
  }
  recentCampaigns: Array<{
    id: string
    name: string
    sentAt: string
    recipientCount: number
    deliveryRate: number
    openRate: number
    clickRate: number
  }>
}

// =============================================================================
// MERGE TAG TYPES
// =============================================================================

export type MergeTagType = 'string' | 'currency' | 'date' | 'url' | 'number'

export interface MergeTagDefinition {
  type: MergeTagType
  required: boolean
  sample: string
  auto?: boolean // Auto-generated (e.g., unsubscribe_link)
  description?: string
}

export interface MergeTagError {
  tag: string
  message: string
  position?: { line: number; column: number }
}

export interface MergeTagWarning {
  tag: string
  message: string
}

export interface MergeTagValidation {
  valid: boolean
  errors: MergeTagError[]
  warnings: MergeTagWarning[]
  usedTags: string[]
  missingRequiredTags: string[]
}

// =============================================================================
// PREFERENCES TYPES
// =============================================================================

export interface EmailPreferencesData {
  email: string
  tenantName: string
  tenantLogo?: string
  subscriptions: Array<{
    groupId: string
    groupName: string
    description: string | null
    isSubscribed: boolean
  }>
  globalUnsubscribed: boolean
}

export interface UpdatePreferencesRequest {
  subscriptions: Array<{
    groupId: string
    isSubscribed: boolean
  }>
  globalUnsubscribe?: boolean
}

// =============================================================================
// WEBHOOK TYPES
// =============================================================================

export interface SendGridWebhookEvent {
  email: string
  timestamp: number
  event: SendGridEventType
  sg_message_id: string
  sg_event_id: string
  
  // Optional based on event type
  reason?: string
  type?: string // bounce type
  url?: string // click URL
  useragent?: string
  ip?: string
  
  // Custom args passed during send
  campaign_id?: string
  tenant_id?: string
  
  // Additional fields
  [key: string]: unknown
}

// =============================================================================
// SERVICE CONFIGURATION TYPES
// =============================================================================

export interface RateLimitConfig {
  maxRequestsPerMinute: number
  maxRecipientsPerRequest: number
  maxDailyEmails: number
  burstSize: number
}

export interface RetryConfig {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  retryableStatuses: number[]
  retryableErrors: string[]
}

export interface BatchConfig {
  recipientsPerBatch: number
  delayBetweenBatchesMs: number
  maxConcurrentBatches: number
  pauseOnErrorThreshold: number
}

export interface AlertConfig {
  bounceRateThreshold: number
  spamReportThreshold: number
  alertRecipients: string[]
  pauseCampaignOnThreshold: boolean
}

export interface EmailServiceConfig {
  rateLimit: RateLimitConfig
  retry: RetryConfig
  batch: BatchConfig
  alerts: AlertConfig
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const TRANSACTIONAL_EMAIL_TYPES = [
  'donation_receipt',
  'password_reset',
  'account_verification',
  'payment_failed',
  'scheduled_gift_reminder',
  'support_ticket_update',
] as const

export type TransactionalEmailType = typeof TRANSACTIONAL_EMAIL_TYPES[number]

export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequestsPerMinute: 500,
  maxRecipientsPerRequest: 1000,
  maxDailyEmails: 10000,
  burstSize: 100,
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  retryableStatuses: [429, 500, 502, 503, 504],
  retryableErrors: ['ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND'],
}

export const DEFAULT_BATCH_CONFIG: BatchConfig = {
  recipientsPerBatch: 500,
  delayBetweenBatchesMs: 1000,
  maxConcurrentBatches: 5,
  pauseOnErrorThreshold: 0.1,
}

export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  bounceRateThreshold: 0.05,
  spamReportThreshold: 0.001,
  alertRecipients: [],
  pauseCampaignOnThreshold: true,
}

export const SENDGRID_REQUIRED_SCOPES = ['mail.send'] as const
export const SENDGRID_OPTIONAL_SCOPES = [
  'tracking_settings.read',
  'suppression.read',
  'user.webhooks.event_settings.read',
] as const
