"use client";

import { forwardRef } from "react";

import {
  LegacyUnlayerEmailEditor,
  type LegacyUnlayerEmailEditorProps,
  type LegacyUnlayerEditorHandle,
} from "./UnlayerEmailEditor";

export type LegacyUnlayerDocumentEditorHandle = LegacyUnlayerEditorHandle;

export type LegacyUnlayerDocumentEditorProps = Omit<
  LegacyUnlayerEmailEditorProps,
  "mode"
>;

export const LegacyUnlayerDocumentEditor = forwardRef<
  LegacyUnlayerDocumentEditorHandle,
  LegacyUnlayerDocumentEditorProps
>(function LegacyUnlayerDocumentEditor(props, ref) {
  return <LegacyUnlayerEmailEditor {...props} ref={ref} mode="document" />;
});

export default LegacyUnlayerDocumentEditor;
