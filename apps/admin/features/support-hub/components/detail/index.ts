export { ConversationAssigneeMenu } from "./ConversationAssigneeMenu";
export { ConversationContactSidecar } from "./ConversationContactSidecar";
export { ConversationDetail } from "./ConversationDetail";
export { ConversationDetailEmpty } from "./ConversationDetailEmpty";
export { ConversationHeader } from "./ConversationHeader";
export { ConversationLabelMenu } from "./ConversationLabelMenu";
export { ConversationPriorityMenu } from "./ConversationPriorityMenu";
export { ConversationSlaChip } from "./ConversationSlaChip";
export { ConversationSnoozeMenu } from "./ConversationSnoozeMenu";
export { ConversationStatusMenu } from "./ConversationStatusMenu";
export { ConversationTimeline } from "./ConversationTimeline";

export * from "./composer";
export * from "./timeline";

/**
 * @deprecated Phase 4 replaced the placeholder. The export survives so the
 * Phase 1 file map and any external callers still resolve. Prefer
 * `ConversationDetail` going forward.
 */
export { ConversationDetail as DetailPanePlaceholder } from "./ConversationDetail";
