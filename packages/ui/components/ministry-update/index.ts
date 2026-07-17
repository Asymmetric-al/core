/**
 * Ministry Update engagement module.
 *
 * The single shared implementation of reactions (love/prayer/fire) and the
 * comment thread on a Ministry Update, so counts, viewer state, and
 * persistence behave identically on every surface.
 *
 * Public surface only — the optimistic state engine
 * (`engagement-engine.ts`) and the comments dialog are module internals.
 */

export {
  toEngagementSnapshot,
  type EngagementSnapshot,
  type MinistryUpdateSnapshotInput,
  type ReactionKind,
  type ReactionState,
} from "./normalize";

export {
  EngagementError,
  createMemoryEngagementTransport,
  httpEngagementTransport,
  type EngagementErrorCode,
  type EngagementTransport,
  type MemoryEngagementSeed,
  type MemoryEngagementSeedEntry,
  type MemoryEngagementTransport,
  type MemoryTransportCall,
  type UpdateComment,
  type UpdateCommentAuthor,
} from "./engagement-transport";

export {
  useEngagement,
  type EngagementErrorContext,
  type UseEngagementOptions,
  type UseEngagementResult,
} from "./use-engagement";

export { ReactionBar, type ReactionBarProps } from "./reaction-bar";
