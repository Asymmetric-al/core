"use client";

import { useLiveQuery } from "@tanstack/react-db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";

import {
  adminTasksCollection,
  careActivityCollection,
  carePersonnelCollection,
  crmContactsCollection,
  eventAttendeesCollection,
  mobilizeCandidatesCollection,
  taskLinkedEntitiesCollection,
  taskStaffCollection,
  teamMembersCollection,
  teamsCollection,
  type AdminCareActivity,
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

export function useCarePersonnel() {
  return useLiveQuery(carePersonnelCollection);
}

export function useCareActivity(personnelId?: string) {
  const query = useLiveQuery(careActivityCollection);

  const data = React.useMemo(() => {
    if (!personnelId) {
      return query.data ?? [];
    }

    return (query.data ?? []).filter(
      (entry) => entry.personnelId === personnelId,
    );
  }, [personnelId, query.data]);

  return {
    ...query,
    data,
  };
}

export function useCareProfile(id: string) {
  const query = useCarePersonnel();

  const data = React.useMemo(
    () => (query.data ?? []).find((personnel) => personnel.id === id),
    [id, query.data],
  );

  return {
    ...query,
    data,
  };
}

export function useLogActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activity: Omit<AdminCareActivity, "date" | "id">) => {
      const activityId = `care-activity-${Date.now()}`;
      const tx = careActivityCollection.insert({
        ...activity,
        date: new Date().toISOString(),
        id: activityId,
      });

      await tx.isPersisted.promise;
      return activityId;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "care", "activity"],
      });
    },
  });
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
