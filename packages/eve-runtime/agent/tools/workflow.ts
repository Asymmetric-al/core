import { experimental_workflow } from "eve/tools";

/**
 * Eve's framework-level cap. Lower workflow-specific caps are enforced by the
 * app-owned plan validator and dispatch hook before each child starts.
 */
export default experimental_workflow({ maxSubagents: 7 });
