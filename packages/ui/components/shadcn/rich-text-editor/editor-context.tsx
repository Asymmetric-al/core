"use client";

import * as React from "react";

import type { Editor } from "@tiptap/react";

export interface EditorContextValue {
  editor: Editor | null;
  /** The editor is turned off: controls stay visible but cannot act. */
  disabled?: boolean;
  /** The content is shown for reading only: no formatting controls. */
  readOnly?: boolean;
}

export const EditorContext = React.createContext<EditorContextValue | null>(
  null,
);

export function useOptionalEditorContext(): EditorContextValue | null {
  return React.use(EditorContext);
}

export function useEditorContext(): EditorContextValue {
  const context = React.use(EditorContext);
  if (!context) {
    throw new Error(
      "Editor components must be used within <EditorRoot> (or <RichTextEditor> alias).",
    );
  }
  return context;
}
