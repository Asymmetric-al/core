"use client";

import { NativeCollectionListView } from "./NativeCollectionListView";

import type { NativeCollectionListViewProps } from "./NativeCollectionListView";

type AdministrationListViewProps = Omit<
  NativeCollectionListViewProps,
  "collectionSlug"
>;

export function UsersListView(props: AdministrationListViewProps) {
  return <NativeCollectionListView {...props} collectionSlug="cms-users" />;
}

export function OrganizationsListView(props: AdministrationListViewProps) {
  return <NativeCollectionListView {...props} collectionSlug="tenants" />;
}
