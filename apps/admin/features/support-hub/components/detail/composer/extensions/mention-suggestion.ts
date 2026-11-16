import { Mention } from "@asym/ui/components/shadcn/rich-text-editor";

import { buildSuggestionRenderer } from "./use-suggestion-renderer";

import type { SuggestionItem } from "./SuggestionList";
import type { SupportAssignee } from "../../../../types";

interface MentionSuggestionOptions {
  agents?: SupportAssignee[];
  getAgents?: () => SupportAssignee[];
  isEnabled?: () => boolean;
  /** Optional callback fired after a mention is inserted. */
  onMention?: (agent: SupportAssignee) => void;
}

export function buildMentionExtension({
  agents = [],
  getAgents = () => agents,
  isEnabled = () => true,
  onMention,
}: MentionSuggestionOptions) {
  return Mention.configure({
    HTMLAttributes: {
      class: "support-mention rounded-md bg-accent px-1 text-accent-foreground",
    },
    suggestion: {
      char: "@",
      allow: ({ editor }) => editor.isEditable && isEnabled(),
      items: ({ query }) =>
        getAgents()
          .filter((agent) => matchesAgent(agent, query))
          .slice(0, 8)
          .map<SuggestionItem>((agent) => ({
            id: agent.id,
            label: agent.name,
            description: agent.title ?? null,
          })),
      command: ({ editor, range, props }) => {
        const id = props.id;
        const matched = getAgents().find((agent) => agent.id === id);
        const label = props.label ?? matched?.name ?? id;
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent([
            {
              type: "mention",
              attrs: { id, label },
            },
            { type: "text", text: " " },
          ])
          .run();
        if (matched) onMention?.(matched);
      },
      render: buildSuggestionRenderer<SuggestionItem>({
        heading: "Mention agent",
        emptyHint: "No agent matches.",
      }),
    },
  });
}

function matchesAgent(agent: SupportAssignee, query: string): boolean {
  if (!query) return true;
  const haystack = `${agent.name} ${agent.email ?? ""}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}
