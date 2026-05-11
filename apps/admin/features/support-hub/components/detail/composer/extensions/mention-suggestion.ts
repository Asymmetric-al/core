import { Mention } from "@asym/ui/components/shadcn/rich-text-editor";

import { buildSuggestionRenderer } from "./use-suggestion-renderer";

import type { SuggestionItem } from "./SuggestionList";
import type { SupportAssignee } from "../../../../types";

interface MentionSuggestionOptions {
  agents: SupportAssignee[];
  /** Optional callback fired after a mention is inserted. */
  onMention?: (agent: SupportAssignee) => void;
}

/**
 * Configures `@tiptap/extension-mention` for donor-care use:
 *
 * - Trigger char `@`.
 * - Items pulled from the live agents collection.
 * - Selecting a mention inserts a styled chip referencing the agent id; the
 *   serializer (Phase 5) walks `mention` nodes and emits plain-text
 *   `@AgentName` so HTML payloads stay readable.
 */
export function buildMentionExtension({
  agents,
  onMention,
}: MentionSuggestionOptions) {
  const agentById = new Map(agents.map((agent) => [agent.id, agent] as const));

  return Mention.configure({
    HTMLAttributes: {
      class:
        "support-mention inline-flex items-center rounded-md bg-amber-100 px-1 text-amber-900",
    },
    suggestion: {
      char: "@",
      items: ({ query }) =>
        agents
          .filter((agent) => matchesAgent(agent, query))
          .slice(0, 8)
          .map<SuggestionItem>((agent) => ({
            id: agent.id,
            label: agent.name,
            description: agent.title ?? null,
          })),
      command: ({ editor, range, props }) => {
        const id = (props as { id?: string }).id ?? "";
        const label =
          (props as { label?: string }).label ?? agentById.get(id)?.name ?? id;
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
        const matched = agentById.get(id);
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
