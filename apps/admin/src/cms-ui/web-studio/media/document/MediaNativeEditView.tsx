"use client";

import { useDocumentInfo } from "@payloadcms/ui";

import { getWebStudioCollectionConfig } from "../../collections/config";
import { NativeCollectionEditView } from "../../collections/shared/document-workspace/NativeCollectionEditView";
import { useRouter } from "../../routing";
import { MediaDeleteButton } from "../media-library-controls";

import type { DocumentViewClientProps } from "payload";

export function MediaNativeEditView(props: DocumentViewClientProps) {
  const { id, data } = useDocumentInfo();
  const router = useRouter();
  const alt = (data as { alt?: unknown } | undefined)?.alt;
  const label = typeof alt === "string" && alt.trim() ? alt : "This image";
  return (
    <NativeCollectionEditView
      {...props}
      studioCollection="media"
      documentActions={
        typeof id === "string" ? (
          <MediaDeleteButton
            id={id}
            label={label}
            onDeleted={() =>
              router.push(getWebStudioCollectionConfig("media").listPath)
            }
          />
        ) : null
      }
    />
  );
}
