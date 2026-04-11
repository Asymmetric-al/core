"use client";

import { NativeCollectionEditView } from "../../collections/shared/document-workspace/NativeCollectionEditView";

import type { DocumentViewClientProps } from "payload";

export function MinistryUpdatesNativeEditView(props: DocumentViewClientProps) {
  return (
    <NativeCollectionEditView {...props} studioCollection="ministry-updates" />
  );
}
