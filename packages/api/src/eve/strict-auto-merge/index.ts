export {
  authorizeEveStrictAutoMergeTrigger,
  eveStrictAutoMergeTargetKey,
  executeEveStrictAutoMerge,
} from "./control";
export { evaluateEveStrictAutoMerge } from "./policy";
export { EVE_STRICT_AUTO_MERGE_BLOCK_REASONS } from "./types";
export type {
  EveGithubBranchProtectionEvidence,
  EveGithubObservedCheck,
  EveGithubObservedReview,
  EveGithubRequiredCheck,
  EveStrictAutoMergeBlockReason,
  EveStrictAutoMergeDecision,
  EveStrictAutoMergeDependencies,
  EveStrictAutoMergeEvidence,
  EveStrictAutoMergeInput,
  EveStrictAutoMergeResult,
} from "./types";
