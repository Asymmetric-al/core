import { createHash } from "node:crypto";
import capabilityKeys from "./command-capabilities.json" with { type: "json" };

const capabilities = new Set(capabilityKeys);
const assignmentReader =
  "tenant_guard.resolve_command_assignment(p_tenant_id uuid)";
const assignmentReaderDigest =
  "f5f2272e554bfaa1cfce3ca9dd566804fc05151bfba5df0ca832bc4a992a8101";
const digest = (body) => createHash("sha256").update(body.trim()).digest("hex");
const startAccountClaim = "tenant_guard.start_account_claim(p_tenant_id uuid)";
const redeemAccountClaim =
  "tenant_guard.redeem_account_claim(p_tenant_id uuid, p_token text)";
const startAccountClaimReason =
  "AL-2678 W5-R5: a signed-in person with no membership in the tenant starts a donor account claim; the caller is the session's login, the tenant must be active, the confirmed Auth email is the only match key, nothing is linked or granted, and every outcome answers the same";
const redeemAccountClaimReason =
  "AL-2678 W5-R5: a signed-in person with no membership in the tenant redeems a mailed claim token; the token's SHA-256 under a row lock is the authority, it is single-use, expires, is bound to the requester and the donor's email at issue, and every failure answers the same";
export const reviewedPreMembership = Object.freeze({
  [startAccountClaim]: Object.freeze({
    reason: startAccountClaimReason,
    digest: "0eb7f34bea12adec6e5528d2d3175861f93d05a1e59af6d26598d7215aa0c540",
  }),
  [redeemAccountClaim]: Object.freeze({
    reason: redeemAccountClaimReason,
    digest: "8e62b609fc3e4088c4283f7fcda6df9c78f1fa9b34536b36e7129439630cf849",
  }),
});
export const preMembershipEntries = Object.freeze([
  Object.freeze({
    function: startAccountClaim,
    reason: startAccountClaimReason,
  }),
  Object.freeze({
    function: redeemAccountClaim,
    reason: redeemAccountClaimReason,
  }),
]);

export const isAssignmentReader = (command) =>
  command.function === assignmentReader &&
  digest(command.body) === assignmentReaderDigest;

export function preMembershipExceptions(
  commands,
  entries = preMembershipEntries,
  reviewed = reviewedPreMembership,
) {
  const allowed = new Set();
  const failures = [];
  for (const entry of entries) {
    const target = commands.find(
      (command) =>
        command.function === entry.function &&
        command.authenticated &&
        !command.service_role &&
        command.schema === "tenant_guard",
    );
    const pinned =
      Object.hasOwn(reviewed, entry.function) && reviewed[entry.function];
    if (
      !target ||
      !pinned ||
      !entry.reason?.trim() ||
      pinned.reason !== entry.reason ||
      pinned.digest !== digest(target.body) ||
      allowed.has(entry.function)
    ) {
      failures.push({
        code: "COMMAND_EXCEPTION_UNREVIEWED",
        function: entry.function,
        detail: "Missing, stale, duplicate or changed pre-membership exception",
      });
    } else allowed.add(entry.function);
  }
  return { allowed, failures };
}

export function protectedEntry(command, frame, outerBlockHasHandler) {
  if (
    command.language !== "plpgsql" ||
    !frame ||
    /:=|=|\bDEFAULT\b/i.test(frame.declarations)
  )
    return false;
  if (command.service_role)
    return (
      /^\s*PERFORM\s+tenant_guard\.enter\s*\(\s*(?:[a-z_][\w$]*|\$[1-9]\d*)\s*\)\s*;/i.test(
        frame.raw,
      ) && !outerBlockHasHandler(frame.main)
    );
  const capability =
    /^\s*(?:PERFORM\s+|[a-z_][\w$]*\s*:=\s*)tenant_guard\.begin_human_command\s*\(\s*(?:[a-z_][\w$]*|\$[1-9]\d*)\s*,\s*'([a-z][a-z0-9_.]+)'\s*\)\s*;/i.exec(
      frame.raw,
    )?.[1];
  return capabilities.has(capability);
}
