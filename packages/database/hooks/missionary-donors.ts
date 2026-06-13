"use client";

import { useLiveQuery } from "@tanstack/react-db";
import * as React from "react";

import {
  donorActivitiesCollection,
  donorPledgesCollection,
  donorsCollection,
} from "../collections";
import { buildMissionaryDonorRows } from "./missionary-donors-model";

export type {
  ActivityType,
  GiftType,
  RecurringStatus,
  MissionaryDonorActivity,
  MissionaryRecurringDonation,
  MissionaryDonorAddress,
  MissionaryDonorRow,
} from "./missionary-donors-model";

export function useMissionaryDonorRows(
  missionaryId: string | null | undefined,
) {
  const donorsQuery = useLiveQuery(donorsCollection.value);
  const donorActivitiesQuery = useLiveQuery(donorActivitiesCollection.value);
  const donorPledgesQuery = useLiveQuery(donorPledgesCollection.value);

  const data = React.useMemo(
    () =>
      buildMissionaryDonorRows({
        missionaryId,
        donors: donorsQuery.data ?? [],
        activities: donorActivitiesQuery.data ?? [],
        pledges: donorPledgesQuery.data ?? [],
      }),
    [
      donorActivitiesQuery.data,
      donorPledgesQuery.data,
      donorsQuery.data,
      missionaryId,
    ],
  );

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
