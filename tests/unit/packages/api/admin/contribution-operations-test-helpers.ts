import { executeContributionAction } from "../../../../../packages/api/src/admin/contribution-operations/actions";
import { parseContributionCommand } from "../../../../../packages/api/src/admin/contribution-operations/command";

import type {
  ContributionActionType,
  ExecuteContributionActionInput,
} from "../../../../../packages/api/src/admin/contribution-operations/types";

/**
 * Test adapter: existing executor specs still speak HTTP/storage bags.
 * Production callers parse at the Core seam before execute.
 */
export function executeContributionActionFromBag<TContribution = unknown>(
  input: Omit<ExecuteContributionActionInput<TContribution>, "command"> & {
    actionType: ContributionActionType;
    payload?: Record<string, unknown>;
  },
) {
  const { actionType, payload, ...rest } = input;
  return executeContributionAction({
    ...rest,
    command: parseContributionCommand(actionType, payload),
  });
}
