"use client";

import { NativeCollectionListView } from "../../collections/shared/list-workspace/NativeCollectionListView";
import { useRouter } from "../../routing";
import { MediaUploadButton, mediaThumbnail } from "../media-library-controls";

import type { NativeCollectionListViewProps } from "../../collections/shared/list-workspace/NativeCollectionListView";

type MediaNativeListViewProps = Omit<
  NativeCollectionListViewProps,
  "collectionSlug"
>;

export function MediaNativeListView(props: MediaNativeListViewProps) {
  const router = useRouter();
  return (
    <NativeCollectionListView
      {...props}
      collectionSlug="media"
      thumbnail={mediaThumbnail}
      studioActions={<MediaUploadButton onUploaded={() => router.refresh()} />}
    />
  );
}
