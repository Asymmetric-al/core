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
