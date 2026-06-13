"use client";

export {
  profilesCollection,
  missionariesCollection,
  donorsCollection,
  donorActivitiesCollection,
  donorPledgesCollection,
  postsCollection,
  postCommentsCollection,
  donationsCollection,
  fundsCollection,
  followsCollection,
  getMissionaryScopedDonorCollections,
  donorsCollectionPagination,
  donorActivitiesCollectionPagination,
  donorPledgesCollectionPagination,
  postsCollectionPagination,
  donationsCollectionPagination,
  postCommentsCollectionPagination,
  followsCollectionPagination,
  type BoundedCollectionPagination,
  type MissionaryScopedDonorCollections,
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
  supportMessagesCollection,
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
