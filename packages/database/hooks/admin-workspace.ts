"use client";

import { useLiveQuery } from "@tanstack/react-db";

import {
  adminTasksCollection,
  crmContactsCollection,
  eventAttendeesCollection,
  mobilizeCandidatesCollection,
  taskLinkedEntitiesCollection,
  taskStaffCollection,
  teamMembersCollection,
  teamsCollection,
} from "../collections";

export type {
  AdminCareActivity,
  AdminCarePersonnel,
  AdminCrmContact,
  AdminEventAttendee,
  AdminMobilizeCandidate,
  AdminTask,
  AdminTaskLinkedEntity,
  AdminTaskStaffMember,
  AdminTeam,
  AdminTeamMember,
} from "../collections";

export function useCrmContacts() {
  return useLiveQuery(crmContactsCollection);
}

export function useTasksRows() {
  return useLiveQuery(adminTasksCollection);
}

export function useTaskStaff() {
  return useLiveQuery(taskStaffCollection);
}

export function useTaskLinkedEntities() {
  return useLiveQuery(taskLinkedEntitiesCollection);
}

export function useEventAttendees() {
  return useLiveQuery(eventAttendeesCollection);
}

export function useMobilizeCandidates() {
  return useLiveQuery(mobilizeCandidatesCollection);
}

export function useTeams() {
  return useLiveQuery(teamsCollection);
}

export function useTeamMembers() {
  return useLiveQuery(teamMembersCollection);
}
