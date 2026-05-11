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
export { useAdminCrmNotesGrid } from "./admin-crm-notes";
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
  useLocations,
  useLinkedEntities,
  useUpsertLocation,
  useDeleteLocation,
} from "./admin-locations";
export { useMissionaryDonorRows } from "./missionary-donors";

export {
  DEMO_AVAILABILITY_FALLBACK,
  fetchDemoAvailability,
  useDemoAvailability,
} from "./demo-account";

export type { DemoAvailability, DemoRole } from "./demo-account";
export type { ContributionLiveRow } from "./admin-contributions";
export type { DonorHistoryTransaction } from "./donor-history";
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
