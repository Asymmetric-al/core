"use client";

import { NativeCollectionListView } from "../../collections/shared/list-workspace/NativeCollectionListView";

import type { NativeCollectionListViewProps } from "../../collections/shared/list-workspace/NativeCollectionListView";

export type PageTemplatesNativeListViewProps = Omit<
  NativeCollectionListViewProps,
  "collectionSlug"
>;

export function PageTemplatesNativeListView(
  props: PageTemplatesNativeListViewProps,
) {
  return (
    <NativeCollectionListView {...props} collectionSlug="page-templates" />
  );
}
