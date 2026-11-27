"use client";

import { useAuth } from "@payloadcms/ui";

import { NativeCollectionListView } from "../../collections/shared/list-workspace/NativeCollectionListView";
import { useRouter } from "../../routing";
import { canUpdateCollection } from "../../shell/admin-collections";
import { MediaUploadButton, mediaThumbnail } from "../media-library-controls";

import type { NativeCollectionListViewProps } from "../../collections/shared/list-workspace/NativeCollectionListView";

type MediaNativeListViewProps = Omit<
  NativeCollectionListViewProps,
  "collectionSlug"
>;

export function MediaNativeListView(props: MediaNativeListViewProps) {
  const router = useRouter();
  const { permissions } = useAuth();
  const canEdit = canUpdateCollection(permissions, "media");
  return (
    <NativeCollectionListView
      {...props}
      collectionSlug="media"
      thumbnail={mediaThumbnail}
      studioActions={
        canEdit ? (
          <MediaUploadButton onUploaded={() => router.refresh()} />
        ) : null
      }
    />
  );
}
