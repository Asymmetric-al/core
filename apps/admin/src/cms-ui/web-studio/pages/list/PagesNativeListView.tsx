"use client";

import { NativeCollectionListView } from "../../collections/shared/list-workspace/NativeCollectionListView";

import type { NativeCollectionListViewProps } from "../../collections/shared/list-workspace/NativeCollectionListView";

export type PagesNativeListViewProps = Omit<
  NativeCollectionListViewProps,
  "collectionSlug"
>;

export function PagesNativeListView(props: PagesNativeListViewProps) {
  return <NativeCollectionListView {...props} collectionSlug="pages" />;
}
