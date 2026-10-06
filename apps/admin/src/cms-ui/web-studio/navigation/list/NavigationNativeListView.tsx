"use client";

import { NativeCollectionListView } from "../../collections/shared/list-workspace/NativeCollectionListView";

import type { NativeCollectionListViewProps } from "../../collections/shared/list-workspace/NativeCollectionListView";

type NavigationNativeListViewProps = Omit<
  NativeCollectionListViewProps,
  "collectionSlug"
>;

export function NavigationNativeListView(props: NavigationNativeListViewProps) {
  return <NativeCollectionListView {...props} collectionSlug="navigation" />;
}
