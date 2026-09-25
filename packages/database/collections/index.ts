"use client";

export {
  createSupabaseCollection,
  defineSupabaseCollection,
  resolveSupabaseCollectionRealtime,
} from "./supabase-collection";
export type {
  LazySupabaseCollection,
  SupabaseCollectionConfig,
  SupabaseCollectionKey,
  SupabaseCollectionMetadata,
  SupabaseCollectionRealtimeOption,
} from "./supabase-collection";
export {
  collectionRegistry,
  localOnlyCollectionRegistry,
  supabaseTableCollectionRegistry,
} from "./registry";
export type {
  CollectionMutationPolicy,
  CollectionRegistryEntry,
  CollectionRegistryKind,
} from "./registry";
export * from "./schemas/content";
export * from "./schemas/giving";
export * from "./schemas/people";
export * from "./schemas/app";

export {
  profilesCollection,
  missionariesCollection,
  donorsCollection,
  assetsCollection,
  donorActivitiesCollection,
  donorPledgesCollection,
  postsCollection,
  postFiresCollection,
  postCommentsCollection,
  postLikesCollection,
  postPrayersCollection,
  donationsCollection,
  fundsCollection,
  followsCollection,
  locationsCollection,
} from "./client-db";

export {
  crmContactsCollection,
  taskStaffCollection,
  taskLinkedEntitiesCollection,
  adminTasksCollection,
  carePersonnelCollection,
  careActivityCollection,
  eventAttendeesCollection,
  mobilizeCandidatesCollection,
  teamsCollection,
  teamMembersCollection,
} from "./admin-workspace";
export { adminLocationsCollection } from "./admin-locations";
export { donorHistoryTransactionsCollection } from "./donor-history";
export { supportHubReadModel } from "./support-workspace";

export {
  supportAgentsCollection,
  supportBusinessHoursCollection,
  supportCannedResponsesCollection,
  supportConversationsCollection,
  supportInboxSettingsCollection,
  supportInboxesCollection,
  supportLabelsCollection,
  supportMacrosCollection,
  supportSavedViewsCollection,
  supportSlaPoliciesCollection,
  supportTeamsCollection,
} from "./support-hub";

export type {
  SupportAssignee,
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
  SupportMacro as SupportHubMacro,
  SupportMacroAction,
  SupportMessage,
  SupportMessageAttachment,
  SupportMessageDeliveryState,
  SupportMessageDirection,
  SupportMessageType,
  SupportParticipant,
  SupportPriority,
  SupportReportSlice,
  SupportRichTextPayload,
  SupportSavedView,
  SupportSavedViewFilter,
  SupportSlaPolicy,
  SupportTeam,
} from "./support-hub";

export type {
  AdminCrmContact,
  AdminTask,
  AdminTaskStaffMember,
  AdminTaskLinkedEntity,
  AdminCarePersonnel,
  AdminCareActivity,
  AdminEventAttendee,
  AdminMobilizeCandidate,
  AdminTeam,
  AdminTeamMember,
} from "./admin-workspace";
export type {
  AdminLocation,
  AdminLinkedMissionary,
  AdminLocationLinkedEntities,
} from "./admin-locations";
export type { DonorHistoryTransaction } from "./donor-history";
export type {
  SupportContact,
  SupportHubReadModel,
  SupportKnowledgeEntry,
  SupportMacro,
  SupportQueue,
  SupportQueueId,
  SupportTicket,
  SupportTicketChannel,
  SupportTicketPriority,
  SupportTicketStatus,
} from "./support-workspace";
