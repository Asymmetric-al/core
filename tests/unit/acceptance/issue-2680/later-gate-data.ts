const LANE_COMMANDS =
  /^tenant_guard\.(?:submit_ministry_update|withdraw_own_ministry_update)\(/;
const POST_TABLES = /^post(?:s|_comments|_fires|_likes|_prayers)$/;

export function reviewLater(failure: {
  code: string;
  table?: string;
  function?: string;
}) {
  if (failure.code === "COMMAND_EXCEPTION_UNREVIEWED")
    return LANE_COMMANDS.test(failure.function ?? "");
  if (
    failure.code === "TENANT_CONDITION_MISSING" ||
    failure.code === "POLICY_EXCEPTION_STALE"
  )
    return POST_TABLES.test(failure.table ?? "");
  return false;
}
