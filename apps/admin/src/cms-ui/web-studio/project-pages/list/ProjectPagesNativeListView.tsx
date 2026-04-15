"use client";

import { NativeCollectionListView } from "../../collections/shared/list-workspace/NativeCollectionListView";

import type { NativeCollectionListViewProps } from "../../collections/shared/list-workspace/NativeCollectionListView";

export type ProjectPagesNativeListViewProps = Omit<
  NativeCollectionListViewProps,
  "collectionSlug"
>;

export function ProjectPagesNativeListView(
  props: ProjectPagesNativeListViewProps,
) {
  return <NativeCollectionListView {...props} collectionSlug="project-pages" />;
}
