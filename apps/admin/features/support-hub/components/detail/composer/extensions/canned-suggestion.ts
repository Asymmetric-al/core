import {
  Extension,
  Suggestion,
  type SuggestionOptions,
} from "@asym/ui/components/shadcn/rich-text-editor";

import { buildSuggestionRenderer } from "./use-suggestion-renderer";
import {
  applyMergeVariables,
  type MergeVariableContext,
} from "../../../../lib/merge-variables";

import type { SuggestionItem } from "./SuggestionList";
import type { SupportCannedResponse } from "../../../../types";

interface CannedSuggestionOptions {
  /** Live canned-response collection (typically returned by the live hook). */
  cannedResponses: SupportCannedResponse[];
  /** Context fed to `applyMergeVariables` at insert time. */
  mergeContext: MergeVariableContext;
}

interface CannedSuggestionItem extends SuggestionItem {
  body: string;
}

const SUGGESTION_PLUGIN_KEY = "support-canned-suggestion";

/**
 * Tiptap extension that opens a canned-response picker when the agent types
 * `/`. Inserting a canned response replaces the trigger range with the body
 * (after merge variable substitution).
 *
 * The list is filtered against title + shortcode so an agent can hit `/refund`
 * and land on the donation refund template instantly.
 */
export const CannedResponseSuggestionExtension =
  Extension.create<CannedSuggestionOptions>({
    name: "supportCannedSuggestion",
    addOptions() {
      return {
        cannedResponses: [],
        mergeContext: {},
      };
    },
    addProseMirrorPlugins() {
      const { cannedResponses, mergeContext } = this.options;

      const suggestion: SuggestionOptions<CannedSuggestionItem> = {
        editor: this.editor,
        char: "/",
        startOfLine: false,
        items: ({ query }) =>
          cannedResponses
            .filter((row) => matchesCanned(row, query))
            .slice(0, 8)
            .map((row) => ({
              id: row.id,
              label: row.title,
              description: previewBody(row.bodyText),
              hint: row.shortCode,
              body: row.bodyHtml ?? row.bodyText ?? "",
            })),
        command: ({ editor, range, props }) => {
          const html = applyMergeVariables(props.body, mergeContext);
          editor.chain().focus().deleteRange(range).insertContent(html).run();
        },
        render: buildSuggestionRenderer<CannedSuggestionItem>({
          heading: "Canned responses",
          emptyHint: "No canned response matches.",
        }),
      };

      return [Suggestion(suggestion)];
    },
  });

function matchesCanned(row: SupportCannedResponse, query: string): boolean {
  if (!query) return true;
  const haystack = `${row.title} ${row.shortCode}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function previewBody(text: string | null | undefined): string {
  if (!text) return "";
  const collapsed = text.replace(/\s+/g, " ").trim();
  return collapsed.length > 80 ? `${collapsed.slice(0, 80)}…` : collapsed;
}

void SUGGESTION_PLUGIN_KEY;
