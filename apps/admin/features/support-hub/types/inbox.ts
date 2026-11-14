import type { SupportConversationStatus } from "@asym/database/hooks";

export type { SupportInbox, SupportInboxSettings } from "@asym/database/hooks";

/* App-only inbox stats shape — derived locally from the conversation
 * collection by `lib/selectors.ts`, never written to the wire. */
export interface SupportInboxStatusBucket {
  status: SupportConversationStatus;
  count: number;
  deltaPercent: number | null;
}

export interface SupportInboxStats {
  inboxId: string | null;
  generatedAt: string;
  total: number;
  totalDelta: number | null;
  buckets: SupportInboxStatusBucket[];
  pastDueCount: number;
  escalatedCount: number;
  waitingOnAgentCount: number;
  waitingOnDonorCount: number;
  /** Average minutes between first inbound message and first outbound reply. */
  averageFirstResponseMinutes: number;
  /** Conversations resolved since local-midnight on `generatedAt`. */
  resolvedTodayCount: number;
}
