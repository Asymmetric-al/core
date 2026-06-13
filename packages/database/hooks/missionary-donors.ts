"use client";

import { useLiveQuery } from "@tanstack/react-db";
import * as React from "react";

import { getMissionaryScopedDonorCollections } from "../collections";
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
  // Per-missionary collections push the missionary_id filter into the query so
  // each missionary fetches only their slice (instead of the whole tenant) and
  // their own donors can't fall outside a tenant-wide window.
  const collections = getMissionaryScopedDonorCollections(missionaryId);
  // The collection set swaps (disabled → enabled) once auth resolves the id, so
  // subscribe through the function+deps form keyed on missionaryId: useLiveQuery
  // re-subscribes to the new collections instead of staying bound to the initial
  // empty set. (The bare-collection form takes no deps and would not re-run.)
  const donorsQuery = useLiveQuery(
    () => collections.donorsCollection,
    [missionaryId],
  );
  const donorActivitiesQuery = useLiveQuery(
    () => collections.donorActivitiesCollection,
    [missionaryId],
  );
  const donorPledgesQuery = useLiveQuery(
    () => collections.donorPledgesCollection,
    [missionaryId],
  );

  // Row shaping (and the donor_id-based pledge/activity scoping) lives in the
  // pure model so it can be unit-tested without the collection runtime.
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

  // Each scoped collection fetches a bounded window; surface continuation so
  // the donors UI can page in the rest when a support network outgrows it. The
  // window flag only settles after a fetch resolves, so read it reactively —
  // otherwise a `loadMore` that finds no new rows leaves a stale affordance.
  const { pagination } = collections;
  const hasMore = React.useSyncExternalStore(
    pagination.subscribe,
    pagination.getSnapshot,
    pagination.getSnapshot,
  );

  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const loadMore = React.useCallback(async () => {
    setIsLoadingMore(true);
    try {
      await pagination.loadMore();
    } finally {
      setIsLoadingMore(false);
    }
  }, [pagination]);

  return {
    data,
    hasMore: Boolean(missionaryId) && hasMore,
    isLoadingMore,
    loadMore,
    isLoading:
      Boolean(missionaryId) &&
      (donorsQuery.isLoading ||
        donorActivitiesQuery.isLoading ||
        donorPledgesQuery.isLoading),
    error:
      donorsQuery.collection?.utils?.lastError ??
      donorActivitiesQuery.collection?.utils?.lastError ??
      donorPledgesQuery.collection?.utils?.lastError ??
      null,
  };
}
