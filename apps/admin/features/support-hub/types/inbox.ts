import type { SupportConversationStatus } from "@asym/database/hooks";

export type { SupportInbox, SupportInboxSettings } from "@asym/database/hooks";

/* App-only inbox stats shape — derived locally from the conversation
 * collection by `lib/selectors.ts`, never written to the wire. */
export interface SupportInboxStatusBucket {
  status: SupportConversationStatus;
  count: number;
  /** Mocked WoW delta for visual deltas in stat cards. */
  deltaPercent: number;
}

export interface SupportInboxStats {
  inboxId: string | null;
  generatedAt: string;
  total: number;
  totalDelta: number;
  buckets: SupportInboxStatusBucket[];
  pastDueCount: number;
  escalatedCount: number;
  waitingOnAgentCount: number;
  waitingOnDonorCount: number;
}
