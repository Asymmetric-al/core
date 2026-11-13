"use client";

import { useLiveQuery } from "@tanstack/react-db";

import {
  adminTasksCollection,
  crmContactsCollection,
  eventAttendeesCollection,
  taskLinkedEntitiesCollection,
  taskStaffCollection,
} from "../collections";

export type {
  AdminCrmContact,
  AdminEventAttendee,
  AdminTask,
  AdminTaskLinkedEntity,
  AdminTaskStaffMember,
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
