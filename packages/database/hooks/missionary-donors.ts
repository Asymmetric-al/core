"use client";

import { useLiveQuery } from "@tanstack/react-db";
import * as React from "react";

import {
  donorActivitiesCollection,
  donorPledgesCollection,
  donorsCollection,
} from "../collections";

export type ActivityType =
  | "gift"
  | "note"
  | "call"
  | "email"
  | "meeting"
  | "pledge_started"
  | "pledge_completed";

export type GiftType =
  | "Online"
  | "Check"
  | "Cash"
  | "Bank Transfer"
  | "Stock"
  | "In-Kind";

export type RecurringStatus = "active" | "completed" | "paused" | "cancelled";

export interface MissionaryDonorActivity {
  id: string;
  type: ActivityType;
  date: string;
  title: string;
  description?: string;
  amount?: number;
  status?: string;
  gift_type?: GiftType;
  note?: string;
}

export interface MissionaryRecurringDonation {
  id: string;
  amount: number;
  frequency: string;
  status: RecurringStatus;
  start_date: string;
  end_date?: string;
  next_payment_date?: string;
  total_paid: number;
  total_expected: number;
  payments_completed: number;
  payments_remaining: number;
  payment_method?: string;
}

export interface MissionaryDonorAddress {
  street?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface MissionaryDonorRow {
  id: string;
  name: string;
  initials: string;
  type: "Individual" | "Organization" | "Church";
  status: "Active" | "Lapsed" | "New" | "At Risk";
  total_given: number;
  last_gift_date: string | null;
  last_gift_amount: number | null;
  frequency: string;
  email: string;
  phone: string;
  mobile?: string;
  work_phone?: string;
  preferred_contact: "email" | "phone" | "text";
  avatar_url?: string;
  location: string;
  address: MissionaryDonorAddress;
  work_address?: MissionaryDonorAddress;
  website?: string;
  organization?: string;
  title?: string;
  joined_date: string;
  birthday?: string;
  anniversary?: string;
  spouse?: string;
  notes?: string;
  tags: string[];
  score: number;
  activities: MissionaryDonorActivity[];
  recurring_donations: MissionaryRecurringDonation[];
  has_active_pledge: boolean;
}

function normalizeDonorType(
  value: string | null | undefined,
): MissionaryDonorRow["type"] {
  if (value === "Organization" || value === "Church") {
    return value;
  }

  return "Individual";
}

function normalizeDonorStatus(
  value: string | null | undefined,
): MissionaryDonorRow["status"] {
  if (value === "Lapsed" || value === "New" || value === "At Risk") {
    return value;
  }

  return "Active";
}

function normalizePreferredContact(
  value: string | null | undefined,
): MissionaryDonorRow["preferred_contact"] {
  if (value === "phone" || value === "text") {
    return value;
  }

  return "email";
}

function normalizeRecurringStatus(
  value: string | null | undefined,
): RecurringStatus {
  if (value === "completed" || value === "paused" || value === "cancelled") {
    return value;
  }

  return "active";
}

function normalizeActivityType(
  value: string | null | undefined,
): MissionaryDonorActivity["type"] {
  switch (value) {
    case "gift":
    case "note":
    case "call":
    case "email":
    case "meeting":
    case "pledge_started":
    case "pledge_completed":
      return value;
    default:
      return "note";
  }
}

function normalizeGiftType(
  value: string | null | undefined,
): GiftType | undefined {
  switch (value) {
    case "Check":
    case "Cash":
    case "Bank Transfer":
    case "Stock":
    case "In-Kind":
      return value;
    case "Online":
      return "Online";
    default:
      return undefined;
  }
}

function createInitials(name: string | null | undefined) {
  return (
    (name ?? "")
      .split(" ")
      .map((part) => part[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??"
  );
}

export function useMissionaryDonorRows(
  missionaryId: string | null | undefined,
) {
  const donorsQuery = useLiveQuery(donorsCollection.value);
  const donorActivitiesQuery = useLiveQuery(donorActivitiesCollection.value);
  const donorPledgesQuery = useLiveQuery(donorPledgesCollection.value);

  const data = React.useMemo(() => {
    if (!missionaryId) {
      return [] as MissionaryDonorRow[];
    }

    const activitiesByDonor = new Map<string, MissionaryDonorActivity[]>();
    for (const activity of donorActivitiesQuery.data ?? []) {
      if (!activity.donor_id) {
        continue;
      }

      const donorActivities = activitiesByDonor.get(activity.donor_id) ?? [];
      donorActivities.push({
        id: activity.id,
        type: normalizeActivityType(activity.type),
        date: activity.date ?? activity.created_at,
        title: activity.title,
        description: activity.description ?? undefined,
        amount: activity.amount ?? undefined,
        status: activity.status ?? undefined,
        gift_type: normalizeGiftType(activity.gift_type),
        note: activity.note ?? undefined,
      });
      activitiesByDonor.set(activity.donor_id, donorActivities);
    }

    const pledgesByDonor = new Map<string, MissionaryRecurringDonation[]>();
    for (const pledge of donorPledgesQuery.data ?? []) {
      if (!pledge.donor_id || pledge.missionary_id !== missionaryId) {
        continue;
      }

      const donorPledges = pledgesByDonor.get(pledge.donor_id) ?? [];
      donorPledges.push({
        id: pledge.id,
        amount: pledge.amount,
        frequency: pledge.frequency ?? "Monthly",
        status: normalizeRecurringStatus(pledge.status),
        start_date: pledge.start_date ?? pledge.created_at,
        end_date: pledge.end_date ?? undefined,
        next_payment_date: pledge.next_payment_date ?? undefined,
        total_paid: pledge.total_paid,
        total_expected: pledge.total_expected,
        payments_completed: pledge.payments_completed ?? 0,
        payments_remaining: pledge.payments_remaining ?? 0,
        payment_method: pledge.payment_method ?? undefined,
      });
      pledgesByDonor.set(pledge.donor_id, donorPledges);
    }

    return (donorsQuery.data ?? [])
      .filter((donor) => donor.missionary_id === missionaryId)
      .map((donor) => ({
        id: donor.id,
        name: donor.name ?? donor.email ?? "Unnamed donor",
        initials: createInitials(donor.name ?? donor.email),
        type: normalizeDonorType(donor.type),
        status: normalizeDonorStatus(donor.status),
        total_given: donor.total_given ?? 0,
        last_gift_date: donor.last_gift_date,
        last_gift_amount: donor.last_gift_amount ?? null,
        frequency: donor.frequency ?? "One-Time",
        email: donor.email ?? "",
        phone: donor.phone ?? "",
        mobile: donor.mobile ?? undefined,
        work_phone: donor.work_phone ?? undefined,
        preferred_contact: normalizePreferredContact(donor.preferred_contact),
        avatar_url: donor.avatar_url ?? undefined,
        location: donor.location ?? "",
        address: (donor.address ?? {}) as MissionaryDonorAddress,
        work_address: donor.work_address
          ? (donor.work_address as MissionaryDonorAddress)
          : undefined,
        website: donor.website ?? undefined,
        organization: donor.organization ?? undefined,
        title: donor.title ?? undefined,
        joined_date: donor.joined_date ?? donor.created_at,
        birthday: donor.birthday ?? undefined,
        anniversary: donor.anniversary ?? undefined,
        spouse: donor.spouse ?? undefined,
        notes: donor.notes ?? undefined,
        tags: donor.tags ?? [],
        score: donor.score ?? 0,
        activities: activitiesByDonor.get(donor.id) ?? [],
        recurring_donations: pledgesByDonor.get(donor.id) ?? [],
        has_active_pledge: donor.has_active_pledge ?? false,
      }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [
    donorActivitiesQuery.data,
    donorPledgesQuery.data,
    donorsQuery.data,
    missionaryId,
  ]);

  return {
    data,
    isLoading:
      donorsQuery.isLoading ||
      donorActivitiesQuery.isLoading ||
      donorPledgesQuery.isLoading,
    error:
      donorsQuery.collection?.utils?.lastError ??
      donorActivitiesQuery.collection?.utils?.lastError ??
      donorPledgesQuery.collection?.utils?.lastError ??
      null,
  };
}
