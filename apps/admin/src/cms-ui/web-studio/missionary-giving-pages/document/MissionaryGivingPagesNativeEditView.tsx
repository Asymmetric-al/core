"use client";

import { NativeCollectionEditView } from "../../collections/shared/document-workspace/NativeCollectionEditView";

import type { DocumentViewClientProps } from "payload";

export function MissionaryGivingPagesNativeEditView(
  props: DocumentViewClientProps,
) {
  return (
    <NativeCollectionEditView
      {...props}
      studioCollection="missionary-giving-pages"
    />
  );
}
