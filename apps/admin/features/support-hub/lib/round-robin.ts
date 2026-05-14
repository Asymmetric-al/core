import type { SupportAssignee, SupportConversation } from "../types";

interface RoundRobinInput {
  /** Live conversation collection used to compute current load per agent. */
  conversations: SupportConversation[];
  /** Agents eligible to receive new work. */
  agents: SupportAssignee[];
  /** Optional inbox filter — only counts load against conversations in this inbox. */
  inboxId?: string | null;
  /** Agents to skip (e.g. furlough, off-duty, current assignee). */
  excludeAgentIds?: string[];
  /** Statuses that count toward an agent's load. Defaults to active states. */
  loadStatuses?: ReadonlyArray<SupportConversation["status"]>;
}

const DEFAULT_LOAD_STATUSES: ReadonlyArray<SupportConversation["status"]> = [
  "open",
  "pending",
];

/**
 * Pure round-robin selector. Picks the agent with the lowest active
 * conversation count (ties broken by agent id alphabetically). Returns
 * `null` when no agent qualifies.
 *
 * The function recomputes the rotation from live data on every call, so the
 * future server-side scheduler can reuse the same logic without a persisted
 * cursor (see `phase-05-productivity.md` follow-up list).
 */
export function selectNextRoundRobinAgent({
  conversations,
  agents,
  inboxId = null,
  excludeAgentIds = [],
  loadStatuses = DEFAULT_LOAD_STATUSES,
}: RoundRobinInput): SupportAssignee | null {
  const excludeSet = new Set(excludeAgentIds);
  const eligibleAgents = agents.filter((agent) => !excludeSet.has(agent.id));
  if (eligibleAgents.length === 0) return null;

  const loadCounts = computeLoadCounts(
    conversations,
    inboxId,
    loadStatuses,
    eligibleAgents,
  );

  const sorted = Array.from(eligibleAgents).sort((left, right) => {
    const leftLoad = loadCounts.get(left.id) ?? 0;
    const rightLoad = loadCounts.get(right.id) ?? 0;
    if (leftLoad !== rightLoad) return leftLoad - rightLoad;
    return left.id.localeCompare(right.id);
  });

  return sorted[0] ?? null;
}

function computeLoadCounts(
  conversations: SupportConversation[],
  inboxId: string | null,
  loadStatuses: ReadonlyArray<SupportConversation["status"]>,
  eligibleAgents: SupportAssignee[],
): Map<string, number> {
  const statusSet = new Set(loadStatuses);
  const counts = new Map<string, number>();
  for (const agent of eligibleAgents) counts.set(agent.id, 0);

  for (const conversation of conversations) {
    if (inboxId !== null && conversation.inboxId !== inboxId) continue;
    if (!statusSet.has(conversation.status)) continue;
    const assigneeId = conversation.assignee?.id;
    if (!assigneeId) continue;
    if (!counts.has(assigneeId)) continue;
    counts.set(assigneeId, (counts.get(assigneeId) ?? 0) + 1);
  }

  return counts;
}
