"use client";

import { useEditorState } from "@tiptap/react";

import { cn } from "@asym/ui/lib/utils";

import { useOptionalEditorContext } from "./editor-context";

/**
 * Words in plain text: runs of letters, combining marks (Thai vowels, accents)
 * and digits, with apostrophes kept inside ("can’t" is one word).
 */
export function countWords(text: string): number {
  return (
    text.match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}]*(?:['’][\p{L}\p{M}\p{N}]+)*/gu)
      ?.length ?? 0
  );
}

/**
 * "42 words" for the surrounding editor. Renders nothing outside an editor,
 * so callers can place it in shared action rows.
 */
export function EditorWordCount({ className }: { className?: string }) {
  const ctx = useOptionalEditorContext();
  const editor = ctx?.editor ?? null;
  const words =
    useEditorState({
      editor,
      selector: ({ editor: current }) =>
        current ? countWords(current.getText()) : 0,
    }) ?? 0;

  if (!editor) return null;
  return (
    <span
      className={cn("text-sm tabular-nums text-muted-foreground", className)}
    >
      {words === 1 ? "1 word" : `${words} words`}
    </span>
  );
}
