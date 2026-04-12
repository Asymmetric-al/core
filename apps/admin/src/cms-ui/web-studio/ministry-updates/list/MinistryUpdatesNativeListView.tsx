"use client";

import { NativeCollectionListView } from "../../collections/shared/list-workspace/NativeCollectionListView";

import type { NativeCollectionListViewProps } from "../../collections/shared/list-workspace/NativeCollectionListView";

export type MinistryUpdatesNativeListViewProps = Omit<
  NativeCollectionListViewProps,
  "collectionSlug"
>;

export function MinistryUpdatesNativeListView(
  props: MinistryUpdatesNativeListViewProps,
) {
  return (
    <NativeCollectionListView {...props} collectionSlug="ministry-updates" />
  );
}
