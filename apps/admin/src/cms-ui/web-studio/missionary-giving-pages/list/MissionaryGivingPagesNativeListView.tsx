"use client";

import { NativeCollectionListView } from "../../collections/shared/list-workspace/NativeCollectionListView";

import type { NativeCollectionListViewProps } from "../../collections/shared/list-workspace/NativeCollectionListView";

export type MissionaryGivingPagesNativeListViewProps = Omit<
  NativeCollectionListViewProps,
  "collectionSlug"
>;

export function MissionaryGivingPagesNativeListView(
  props: MissionaryGivingPagesNativeListViewProps,
) {
  return (
    <NativeCollectionListView
      {...props}
      collectionSlug="missionary-giving-pages"
    />
  );
}
