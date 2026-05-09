/**
 * Tiny merge-variable token system used by canned responses, macros, and the
 * future automations layer. Pure: same template + same context always produce
 * the same string, so the helper is safe to call inside renders, selectors,
 * and tests.
 *
 * Token format is `{{path.field}}`. Unknown tokens are kept verbatim so an
 * agent can spot a typo instead of seeing a silently empty body. Null /
 * undefined values render as the empty string.
 *
 * Substitution is run twice in the composer flow:
 *   1. At slash-insertion time so the editor JSON contains the resolved text
 *      (and survives further edits without losing the variable).
 *   2. At serialize-time as a defensive pass for callers that bypass the
 *      composer (e.g. macros that go straight through the mutation layer).
 */

import type { SupportAssignee, SupportConversation } from "../types";

export interface MergeVariableContext {
  donor?: { name?: string | null; email?: string | null } | null;
  conversation?: { subject?: string | null } | null;
  agent?: { name?: string | null; title?: string | null } | null;
}

export const SUPPORTED_MERGE_VARIABLES = [
  "{{donor.name}}",
  "{{donor.email}}",
  "{{conversation.subject}}",
  "{{agent.name}}",
  "{{agent.title}}",
] as const;

export type SupportMergeVariableToken =
  (typeof SUPPORTED_MERGE_VARIABLES)[number];

const TOKEN_PATTERN = /\{\{\s*([\w.]+)\s*\}\}/g;

/**
 * Replace every `{{path.field}}` token in `template` with the value found at
 * `context[path][field]`. Unknown paths are preserved so the agent can fix
 * the typo. Null fields render as an empty string.
 */
export function applyMergeVariables(
  template: string,
  context: MergeVariableContext,
): string {
  if (!template || template.length === 0) return template;
  return template.replace(TOKEN_PATTERN, (match, path: string) => {
    const value = resolvePath(context, path);
    if (value === undefined) return match;
    if (value === null) return "";
    return String(value);
  });
}

/**
 * Convenience builder used by the composer + macro runner. Pulls the donor
 * fields off the conversation and the agent fields off the resolved
 * assignee. Phase 6 will swap this for a real CRM hydration; the contract
 * stays the same.
 */
export function buildMergeVariableContext(
  conversation: SupportConversation | null | undefined,
  agent: SupportAssignee | null | undefined,
): MergeVariableContext {
  return {
    donor: conversation
      ? {
          name: conversation.externalContactName ?? null,
          email: conversation.externalContactEmail ?? null,
        }
      : null,
    conversation: conversation
      ? { subject: conversation.subject ?? null }
      : null,
    agent: agent
      ? {
          name: agent.name ?? null,
          title: agent.title ?? null,
        }
      : null,
  };
}

function resolvePath(
  context: MergeVariableContext,
  path: string,
): string | null | undefined {
  const segments = path.split(".");
  let current: unknown = context;
  for (const segment of segments) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  if (current === undefined) return undefined;
  if (current === null) return null;
  if (typeof current === "string" || typeof current === "number") {
    return String(current);
  }
  return undefined;
}
