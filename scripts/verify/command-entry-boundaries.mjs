import { createHash } from "node:crypto";
import capabilityKeys from "./command-capabilities.json" with { type: "json" };

const capabilities = new Set(capabilityKeys);
const assignmentReader =
  "tenant_guard.resolve_command_assignment(p_tenant_id uuid)";
const assignmentReaderDigest =
  "f5f2272e554bfaa1cfce3ca9dd566804fc05151bfba5df0ca832bc4a992a8101";
const digest = (body) => createHash("sha256").update(body.trim()).digest("hex");
export const reviewedPreMembership = Object.freeze({});
export const preMembershipEntries = Object.freeze([]);

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

export const WORKER_WRAPPER_TENANT_ARG_EXCEPTIONS = Object.freeze([
  "public.acquire_workflow_work_claim(p_tenant_id uuid, p_subject_type text, p_subject_id text, p_claimed_by text, p_ttl_seconds integer)",
  "public.release_workflow_work_claim(p_tenant_id uuid, p_claim_id uuid, p_status text)",
]);

const MULTI_WORD_SQL_TYPE =
  /^(?:double\s+precision|character\s+varying|character|timestamp(?:\s*\(\s*\d+\s*\))?\s+(?:with|without)\s+time\s+zone|time(?:\s*\(\s*\d+\s*\))?\s+(?:with|without)\s+time\s+zone|bit\s+varying)\b/i;

function splitTopLevelArgs(text) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === "'" || ch === '"') {
      const close = text.indexOf(ch, i + 1);
      i = close < 0 ? text.length : close;
      while (text[i + 1] === ch) {
        const next = text.indexOf(ch, i + 2);
        i = next < 0 ? text.length : next;
      }
      continue;
    }
    if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
    else if (ch === "," && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  const tail = text.slice(start);
  if (tail.trim()) parts.push(tail);
  return parts;
}

function unquoteIdentifier(raw) {
  const trimmed = raw.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"'))
    return trimmed.slice(1, -1).replaceAll('""', '"').toLowerCase();
  return trimmed.toLowerCase();
}

export function parseWrapperParameters(signature) {
  const open = signature.indexOf("(");
  const close = signature.lastIndexOf(")");
  const head = open < 0 ? signature : signature.slice(0, open);
  const dot = head.lastIndexOf(".");
  const wrapperShortName = unquoteIdentifier(
    dot < 0 ? head : head.slice(dot + 1),
  );
  if (open < 0 || close <= open)
    return { namedParams: new Set(), paramCount: 0, wrapperShortName };
  const inner = signature.slice(open + 1, close).trim();
  if (!inner)
    return { namedParams: new Set(), paramCount: 0, wrapperShortName };
  const namedParams = new Set();
  let paramCount = 0;
  for (const rawPart of splitTopLevelArgs(inner)) {
    const part = rawPart
      .trim()
      .replace(/^(?:INOUT|IN|OUT|VARIADIC)\s+/i, "")
      .replace(/\s+(?:DEFAULT|=)\s+[\s\S]*$/i, "")
      .trim();
    if (!part) continue;
    paramCount += 1;
    if (part.startsWith('"')) {
      const m = /^("(?:[^"]|"")+")\s+\S/.exec(part);
      if (m) namedParams.add(unquoteIdentifier(m[1]));
      continue;
    }
    if (MULTI_WORD_SQL_TYPE.test(part)) continue;
    const m = /^([A-Za-z_][A-Za-z0-9_$]*)\s+\S/.exec(part);
    if (m) namedParams.add(m[1].toLowerCase());
  }
  return { namedParams, paramCount, wrapperShortName };
}

function firstCallArgument(text, openIndex) {
  let depth = 0;
  for (let i = openIndex + 1; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === "'" || ch === '"') {
      const close = text.indexOf(ch, i + 1);
      i = close < 0 ? text.length : close;
      while (text[i + 1] === ch) {
        const next = text.indexOf(ch, i + 2);
        i = next < 0 ? text.length : next;
      }
      continue;
    }
    if (ch === "(") depth += 1;
    else if (ch === ")") {
      if (depth === 0) return text.slice(openIndex + 1, i).trim();
      depth -= 1;
    } else if (ch === "," && depth === 0) {
      return text.slice(openIndex + 1, i).trim();
    }
  }
  return null;
}

export function workerWrapperPassesTenantArg(signature, body, stripComments) {
  if (WORKER_WRAPPER_TENANT_ARG_EXCEPTIONS.includes(signature)) return false;
  const { namedParams, wrapperShortName } = parseWrapperParameters(signature);
  for (const name of namedParams) {
    if (name.includes("tenant")) return true;
  }
  const text = stripComments(String(body ?? ""), { blankStrings: true });
  const callRe =
    /(?:^|[^A-Za-z0-9_$."])"?tenant_guard"?\s*\.\s*"?[A-Za-z_][A-Za-z0-9_$]*"?\s*\(/gi;
  for (const match of text.matchAll(callRe)) {
    const openIndex = match.index + match[0].length - 1;
    const firstArg = firstCallArgument(text, openIndex);
    if (!firstArg) continue;
    if (/^\(*\s*SELECT\b/i.test(firstArg)) continue;
    if (/\$[1-9]\d*\b/.test(firstArg)) return true;
    const refRe =
      /(?:("(?:[^"]|"")+"|[A-Za-z_][A-Za-z0-9_$]*)\s*\.\s*)?("(?:[^"]|"")+"|[A-Za-z_][A-Za-z0-9_$]*)/g;
    for (const ref of firstArg.matchAll(refRe)) {
      const prev = firstArg[ref.index - 1] ?? "";
      if (prev === ":" || prev === ".") continue;
      const qualifier = ref[1] ? unquoteIdentifier(ref[1]) : null;
      const ident = unquoteIdentifier(ref[2]);
      if (qualifier && qualifier !== wrapperShortName) continue;
      if (namedParams.has(ident)) return true;
    }
  }
  return false;
}

const WRAPPER_WRITE_RE =
  /\b(?:INSERT\s+INTO|DELETE\s+(?:ONLY\s+)?FROM|MERGE\s+INTO|UPDATE\s+(?:ONLY\s+)?[A-Za-z_][\w$."]*(?:\s+(?:AS\s+)?[A-Za-z_][\w$]*)?\s+SET)\b/i;

export function workerWrapperHasWrite(body, stripComments) {
  const raw = stripComments(String(body ?? ""));
  const masked = stripComments(raw, { blankStrings: true })
    .replace(/"(?:[^"]|"")*"/g, (name) => "_".repeat(name.length))
    .replace(/\bFOR\s+(?:NO\s+KEY\s+)?UPDATE\b/gi, " ");
  if (WRAPPER_WRITE_RE.test(masked)) return true;
  return /\bEXECUTE\b/i.test(masked) && WRAPPER_WRITE_RE.test(raw);
}
