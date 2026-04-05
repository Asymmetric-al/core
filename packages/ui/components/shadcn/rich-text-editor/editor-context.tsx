"use client";

import * as React from "react";

import type { Editor } from "@tiptap/react";

export interface EditorContextValue {
  editor: Editor | null;
}

export const EditorContext = React.createContext<EditorContextValue | null>(
  null,
);

export function useOptionalEditorContext(): EditorContextValue | null {
  return React.useContext(EditorContext);
}

export function useEditorContext(): EditorContextValue {
  const context = React.useContext(EditorContext);
  if (!context) {
    throw new Error(
      "Editor components must be used within <EditorRoot> (or <RichTextEditor> alias).",
    );
  }
  return context;
}
