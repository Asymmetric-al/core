"use client";

import { NativeCollectionListView } from "../../collections/shared/list-workspace/NativeCollectionListView";

import type { NativeCollectionListViewProps } from "../../collections/shared/list-workspace/NativeCollectionListView";

export type MissionaryProfilesNativeListViewProps = Omit<
  NativeCollectionListViewProps,
  "collectionSlug"
>;

export function MissionaryProfilesNativeListView(
  props: MissionaryProfilesNativeListViewProps,
) {
  return (
    <NativeCollectionListView {...props} collectionSlug="missionary-profiles" />
  );
}
