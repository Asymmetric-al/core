"use client";

export {
  usePostsWithAuthors,
  usePostsForFollowedMissionaries,
  useDonorGivingHistory,
  useMissionarySupporters,
  useCommentsWithAuthors,
  useFundsWithProgress,
  useMissionaryDashboard,
  useMissionaryStats,
} from "./hooks";
export { useContributionsLiveRows } from "./admin-contributions";
export { useAdminContributionsInfiniteGrid } from "./admin-contributions-infinite";
export { useAdminCrmRecordsInfiniteGrid } from "./admin-crm-infinite";
export {
  ADMIN_CRM_RECORD_DETAIL_QUERY_KEY,
  ADMIN_CRM_RECORDS_QUERY_KEY,
  useAdminCrmRecordDetail,
  useCreateLinkedCrmNote,
} from "./admin-crm-detail";
export { useAdminCrmNotesGrid } from "./admin-crm-notes";
export {
  ADMIN_CRM_NAMED_VIEWS_QUERY_KEY,
  useCreateCrmNamedView,
  useCrmNamedViews,
  useDeleteCrmNamedView,
  useUpdateCrmNamedView,
} from "./admin-crm-named-views";
export {
  ADMIN_CRM_TABLE_PREFERENCES_QUERY_KEY,
  useCrmTablePreferences,
  useSaveCrmRowActionPin,
  useSaveCrmViewSettings,
} from "./admin-crm-table-preferences";
export {
  CRM_RELATIONSHIP_DOMAIN_OPTIONS,
  useAdminCrmRelationshipsGrid,
} from "./admin-crm-relationships";
export {
  CRM_PROJECTION_TARGET_SURFACE_OPTIONS,
  useAdminCrmProjectionShadowGrid,
} from "./admin-crm-projections";
export { useDonorHistoryTransactions } from "./donor-history";
export {
  useCareDashboard,
  useMemberCareDashboardQuery,
  useMemberCareDetailQuery,
  useCarePersonnel,
  useCareActivity,
  useCareProfile,
  useCarePrivateNotes,
  useCreateCareThreadPost,
  useCreateCarePrivateNote,
  useCreatePrivateNote,
  useCreateOrUpdateCareGoal,
  useLogCareActivity,
  useUpsertCareRequirement,
  useSetManualAttentionFlag,
  useLogActivity,
} from "./member-care";
export {
  useCrmContacts,
  useTasksRows,
  useTaskStaff,
  useTaskLinkedEntities,
  useEventAttendees,
  useMobilizeCandidates,
  useTeams,
  useTeamMembers,
} from "./admin-workspace";
export {
  MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY,
  useMissionControlNeedsAttention,
  type MissionControlNeedsAttentionGroup,
  type MissionControlNeedsAttentionItem,
} from "./mission-control-tasks";
export {
  MISSION_CONTROL_AUTOMATIONS_QUERY_KEY,
  useMissionControlAutomations,
  type MissionControlAutomationActivationStatus,
  type MissionControlAutomationRuleDto,
  type MissionControlAutomationSummary,
  type MissionControlAutomationsResponse,
} from "./mission-control-automations";
export {
  useLocations,
  useLinkedEntities,
  useUpsertLocation,
  useDeleteLocation,
} from "./admin-locations";
export { usePublicLocations, type PublicLocation } from "./public-locations";
export { useMissionaryDonorRows } from "./missionary-donors";
export {
  useCreateDonorBillingPortalSession,
  useDonorPortalSnapshot,
  useUpdateDonorPortal,
} from "./donor-portal";
export { useMissionaryPortalSnapshot } from "./missionary-portal";

export {
  EMPTY_SUPPORT_CONTACT_REF,
  SUPPORT_AUTOMATION_ACTION_KINDS,
  SUPPORT_AUTOMATION_CONDITION_KINDS,
  SUPPORT_AUTOMATION_TRIGGERS,
  SUPPORT_CHANNELS,
  SUPPORT_CONVERSATION_STATUSES,
  SUPPORT_INBOX_LAYOUTS,
  SUPPORT_INBOX_SECTIONS,
  SUPPORT_INBOX_VIEWS,
  SUPPORT_LABEL_TONES,
  SUPPORT_LAST_MESSAGE_DIRECTIONS,
  SUPPORT_MESSAGE_DELIVERY_STATES,
  SUPPORT_MESSAGE_DIRECTIONS,
  SUPPORT_MESSAGE_TYPES,
  SUPPORT_PRIORITIES,
  SUPPORT_REPORT_SLICES,
  supportAgentsCollection,
  supportAutomationRulesCollection,
  supportBusinessHoursCollection,
  supportCannedResponsesCollection,
  supportConversationsCollection,
  supportInboxSettingsCollection,
  supportInboxesCollection,
  supportLabelsCollection,
  supportMacrosCollection,
  supportMessagesCollection,
  supportNotificationPreferencesCollection,
  supportSavedViewsCollection,
  supportSignaturesCollection,
  supportSlaPoliciesCollection,
  supportTeamsCollection,
  useSupportAgentsLive,
  useSupportAutomationRulesLive,
  useSupportBusinessHoursLive,
  useSupportCannedResponsesLive,
  useSupportConversationsLive,
  useSupportInboxSettingsLive,
  useSupportInboxesLive,
  useSupportLabelsLive,
  useSupportMacrosLive,
  useSupportMessagesLive,
  useSupportNotificationPreferencesLive,
  useSupportSavedViewsLive,
  useSupportSignaturesLive,
  useSupportSlaPoliciesLive,
  useSupportTeamsLive,
} from "./support-hub";

export type {
  SupportAssignee,
  SupportAutomationAction,
  SupportAutomationActionKind,
  SupportAutomationCondition,
  SupportAutomationConditionKind,
  SupportAutomationRule,
  SupportAutomationTrigger,
  SupportBusinessHours,
  SupportCannedResponse,
  SupportChannel,
  SupportContactRef,
  SupportConversation,
  SupportConversationStatus,
  SupportEmailHeaders,
  SupportInbox,
  SupportInboxLayout,
  SupportInboxSection,
  SupportInboxSettings,
  SupportInboxView,
  SupportLabel,
  SupportLabelTone,
  SupportLastMessageDirection,
  SupportMacro,
  SupportMacroAction,
  SupportMessage,
  SupportMessageAttachment,
  SupportMessageDeliveryState,
  SupportMessageDirection,
  SupportMessageType,
  SupportNotificationPreferences,
  SupportParticipant,
  SupportPriority,
  SupportReportSlice,
  SupportRichTextPayload,
  SupportSavedView,
  SupportSavedViewFilter,
  SupportSignature,
  SupportSlaPolicy,
  SupportTeam,
} from "./support-hub";

export {
  DEMO_AVAILABILITY_FALLBACK,
  fetchDemoAvailability,
  useDemoAvailability,
} from "./demo-account";

export type { DemoAvailability, DemoRole } from "./demo-account";
export type { ContributionLiveRow } from "./admin-contributions";
export type { DonorHistoryTransaction } from "./donor-history";
export type {
  DonorPortalDonation,
  DonorPortalPatch,
  DonorPortalRecurringGift,
  DonorPortalSnapshot,
} from "./donor-portal";
export type {
  MissionaryPortalSnapshot,
  MissionaryPortalTask,
} from "./missionary-portal";
export type {
  AdminCrmContact,
  AdminTask,
  AdminTaskStaffMember,
  AdminTaskLinkedEntity,
  AdminEventAttendee,
  AdminMobilizeCandidate,
  AdminTeam,
  AdminTeamMember,
} from "./admin-workspace";
export type {
  MemberCarePriority,
  MemberCareActivityType,
  MemberCarePersonnel,
  MemberCareActivity,
  MemberCarePrivateNote,
  MemberCareGoal,
  MemberCareRequirement,
  MemberCareDashboardResponse,
  MemberCareDetailResponse,
} from "./member-care";
export type {
  LinkedEntities,
  LinkedMissionary,
  Location,
  LocationStatus,
  LocationType,
} from "./admin-locations";
export type { CrmGridRow } from "@asym/database/types";
export type { CrmNoteRow } from "@asym/database/types";
export type { CrmRelationshipRow } from "@asym/database/types";
export type { CrmProjectionShadowRow } from "@asym/database/types";
export type {
  ActivityType,
  GiftType,
  MissionaryDonorActivity,
  MissionaryDonorAddress,
  MissionaryDonorRow,
  MissionaryRecurringDonation,
  RecurringStatus,
} from "./missionary-donors";
