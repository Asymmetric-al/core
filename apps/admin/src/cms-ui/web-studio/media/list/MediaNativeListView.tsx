"use client";

import { NativeCollectionListView } from "../../collections/shared/list-workspace/NativeCollectionListView";

import type { NativeCollectionListViewProps } from "../../collections/shared/list-workspace/NativeCollectionListView";

export type MediaNativeListViewProps = Omit<
  NativeCollectionListViewProps,
  "collectionSlug"
>;

export function MediaNativeListView(props: MediaNativeListViewProps) {
  return <NativeCollectionListView {...props} collectionSlug="media" />;
}
