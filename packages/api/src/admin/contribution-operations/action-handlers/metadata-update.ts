import { ApiHttpError } from "../../../shared/http-errors";
import type {
  ContributionActionResult,
  ExecuteContributionActionInput,
} from "../types";

export async function executeMetadataUpdate<TContribution>(
  _input: ExecuteContributionActionInput<TContribution>,
): Promise<ContributionActionResult<TContribution>> {
  throw new ApiHttpError(
    501,
    "metadata_update is not implemented by the contribution action executor yet.",
  );
}
