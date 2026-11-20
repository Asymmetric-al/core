import { createHash } from "node:crypto";
import capabilityKeys from "./command-capabilities.json" with { type: "json" };

const capabilities = new Set(capabilityKeys);
const assignmentReader =
  "tenant_guard.resolve_command_assignment(p_tenant_id uuid)";
const assignmentReaderDigest =
  "f5f2272e554bfaa1cfce3ca9dd566804fc05151bfba5df0ca832bc4a992a8101";
const digest = (body) => createHash("sha256").update(body.trim()).digest("hex");
const reviewedPreMembership = Object.freeze({});
const preMembershipEntries = Object.freeze([]);

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
