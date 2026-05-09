"use client";

import {
  EditorContent,
  EditorRoot,
  EditorToolbar,
  type Extensions,
  type ToolbarTool,
} from "@asym/ui/components/shadcn/rich-text-editor";
import { cn } from "@asym/ui/lib/utils";
import * as React from "react";

import type { ReactNode } from "react";

interface SupportTipTapEditorProps {
  /** Tiptap document JSON serialized as a string (or empty for blank state). */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /**
   * Visual mode tints the editor card so agents can never confuse a public
   * reply with an internal note.
   */
  tone?: "reply" | "note";
  /** Optional row rendered between the toolbar and the editor body. */
  beforeBody?: ReactNode;
  /** Optional row rendered below the editor body (action row, attachments). */
  footer?: ReactNode;
  /** Optional row rendered before the toolbar tool group (Phase 5 macro slot). */
  beforeToolbar?: ReactNode;
  /** Optional row rendered after the toolbar tool group (Phase 5 macro slot). */
  afterToolbar?: ReactNode;
  /**
   * Phase 5 hook for mode-aware Tiptap extensions (canned suggestion in reply
   * mode, mention suggestion in note mode). Forwarded straight to
   * `EditorRoot.extraExtensions`.
   */
  extraExtensions?: Extensions;
}

/**
 * Donor-care wrapper around the shared `@asym/ui` Tiptap surface. Composes
 * `EditorRoot` (which builds the editor + provides the editor context),
 * `EditorContent`, and `EditorToolbar` with the Maia tool set we want for
 * donor email reply work — restrained but rich enough.
 *
 * Why a wrapper rather than calling `useEditor` directly:
 * - Reuses `EditorRoot`'s SSR-safe options, link bubble menu, and value <->
 *   JSON sync that the rest of the repo already trusts.
 * - Keeps Phase 4 entirely inside the support-hub feature folder; no new
 *   tiptap dependency is added to `apps/admin`.
 *
 * Phase 5 extension contract (named in `phase-04-detail-and-composer.md`):
 *
 * - `beforeToolbar` and `afterToolbar` accept React nodes that mount inside
 *   the toolbar bar (used for the macros launcher and the canned-response
 *   palette).
 * - `beforeBody` accepts React nodes rendered above the editor surface (used
 *   for `@`-mention-style suggestion popovers).
 * - The editor instance is reachable from every descendant via
 *   `useEditorContext()` from `@asym/ui/components/shadcn/rich-text-editor`,
 *   so Phase 5's keyboard shortcut surface can mount its hotkey hook
 *   alongside the composer without prop drilling.
 *
 * Adding new Tiptap extensions (e.g. slash command, mention) is the only
 * change that requires a follow-up: `EditorRoot` currently builds a fixed
 * extension set via `createDefaultExtensions(...)`. Phase 5 will add an
 * `extraExtensions?: Extension[]` prop to `EditorRoot` and forward it from
 * here as `props.extraExtensions`. The contract on this side stays stable.
 */
export const SUPPORT_REPLY_TOOLS: ToolbarTool[] = [
  "bold",
  "italic",
  "underline",
  "bulletList",
  "orderedList",
  "blockquote",
  "link",
];

export const SUPPORT_NOTE_TOOLS: ToolbarTool[] = [
  "bold",
  "italic",
  "underline",
  "bulletList",
  "link",
];

export function SupportTipTapEditor({
  value,
  onChange,
  placeholder,
  disabled,
  tone = "reply",
  beforeBody,
  footer,
  beforeToolbar,
  afterToolbar,
  extraExtensions,
}: SupportTipTapEditorProps) {
  const tools = tone === "reply" ? SUPPORT_REPLY_TOOLS : SUPPORT_NOTE_TOOLS;

  return (
    <EditorRoot
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      proseInvert={false}
      extraExtensions={extraExtensions}
      className={cn(
        "border border-zinc-200 bg-white shadow-sm",
        tone === "note" && "border-amber-200 bg-amber-50/40",
      )}
      editorClassName={cn(
        "min-h-[140px] text-[13px] leading-relaxed text-zinc-900",
        tone === "note" && "text-amber-900",
      )}
    >
      {beforeToolbar ? (
        <div className="border-b border-zinc-100 bg-zinc-50/40 px-3 py-1.5">
          {beforeToolbar}
        </div>
      ) : null}
      <EditorToolbar tools={tools} />
      {afterToolbar ? (
        <div className="border-b border-zinc-100 bg-zinc-50/40 px-3 py-1.5">
          {afterToolbar}
        </div>
      ) : null}
      {beforeBody}
      <EditorContent className="px-1 py-1" />
      {footer}
    </EditorRoot>
  );
}
