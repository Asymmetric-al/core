export { RichTextEditor, EditorRoot, EditorContent } from "./rich-text-editor";
export type { RichTextEditorProps } from "./rich-text-editor";

export { EditorToolbar } from "./toolbar";
export type { EditorToolbarProps, ToolbarTool } from "./toolbar";

export { RichTextViewer } from "./rich-text-viewer";
export type { RichTextViewerProps } from "./rich-text-viewer";

export { PostContent } from "./post-content";
export type { PostContentProps } from "./post-content";

export {
  EditorContext,
  useEditorContext,
  useOptionalEditorContext,
} from "./editor-context";
export type { EditorContextValue } from "./editor-context";

export {
  extractPlainText,
  getUrlFromString,
  isPostContentEmpty,
  isRichText,
  isValidUrl,
  parseContent,
} from "./helpers";

export { LegacyRichTextEditor } from "./legacy-rich-text-editor";
export type { LegacyRichTextEditorProps } from "./legacy-rich-text-editor";

/* ------------------------------------------------------------------------ */
/*  Tiptap re-exports                                                        */
/*                                                                            */
/*  apps/* never imports @tiptap/* directly — the rich-text-editor barrel is */
/*  the single seam. Phase 5 plugged in `@tiptap/suggestion` and             */
/*  `@tiptap/extension-mention`; both are forwarded here so the support hub  */
/*  feature can build suggestion-based extensions (slash, @-mentions)        */
/*  without breaking the dependency boundary.                                */
/* ------------------------------------------------------------------------ */

export { Extension, Node, Mark } from "@tiptap/core";
export type { Editor, Range, Extensions } from "@tiptap/react";
export { default as Suggestion } from "@tiptap/suggestion";
export type { SuggestionOptions } from "@tiptap/suggestion";
export { default as Mention } from "@tiptap/extension-mention";
