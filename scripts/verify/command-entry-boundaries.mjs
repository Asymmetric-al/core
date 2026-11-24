import { createHash } from "node:crypto";
import capabilityKeys from "./command-capabilities.json" with { type: "json" };

const capabilities = new Set(capabilityKeys);
const assignmentReader =
  "tenant_guard.resolve_command_assignment(p_tenant_id uuid)";
const assignmentReaderDigest =
  "f5f2272e554bfaa1cfce3ca9dd566804fc05151bfba5df0ca832bc4a992a8101";
const digest = (body) => createHash("sha256").update(body.trim()).digest("hex");
const acceptInvitationFunction =
  "tenant_guard.accept_membership_invitation(p_selector text, p_verifier text)";
const acceptInvitationReason =
  "AL-2676 WP3c R1/R14/R15: invitation acceptance admits a non-operator caller who holds no membership yet after refusing platform operators and issuer self-acceptance and verifying selector, constant-time verifier digest, live status, expiry, and confirmed non-deleted email via private.resolve_invitation_for_caller before tenant_guard.enter or any lock";
const startAccountClaim = "tenant_guard.start_account_claim(p_tenant_id uuid)";
const redeemAccountClaim =
  "tenant_guard.redeem_account_claim(p_tenant_id uuid, p_token text)";
const startAccountClaimReason =
  "AL-2678 W5-R5: a signed-in person with no membership in the tenant starts a donor account claim; the caller is the session's login, the tenant must be active, the confirmed Auth email is the only match key, nothing is linked or granted, and every outcome answers the same";
const redeemAccountClaimReason =
  "AL-2678 W5-R5: a signed-in person with no membership in the tenant redeems a mailed claim token; the token's SHA-256 under a row lock is the authority, it is single-use, expires, is bound to the requester and the donor's email at issue, and every failure answers the same";
export const reviewedPreMembership = Object.freeze({
  [acceptInvitationFunction]: Object.freeze({
    reason: acceptInvitationReason,
    digest: "8e1cd0bb1438913861f3dfda3f72866e20c6ccbe0abb1513e489e41cf9f9cbb2",
  }),
  [startAccountClaim]: Object.freeze({
    reason: startAccountClaimReason,
    digest: "d2e0f5f1194acbb7bf917f72246ce5e26f040f4169cfd8ace79843fdd97a8df1",
  }),
  [redeemAccountClaim]: Object.freeze({
    reason: redeemAccountClaimReason,
    digest: "6f7c70f9ba356226cb8ecc5ae28be341db9e323575930fa50aa7ef186420e0aa",
  }),
});
export const preMembershipEntries = Object.freeze([
  Object.freeze({
    function: acceptInvitationFunction,
    reason: acceptInvitationReason,
  }),
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

const IDENT = "[A-Za-z_][A-Za-z0-9_$]*";
const QUALIFIED_RELATION = `${IDENT}\\s*\\.\\s*${IDENT}\\b(?!\\s*[.(])`;

function normalizedBody(body, stripComments) {
  return stripComments(String(body ?? ""), { blankStrings: true }).replace(
    /"((?:[^"]|"")+)"/g,
    (_quoted, name) =>
      /^[A-Za-z_][A-Za-z0-9_$]*$/.test(name)
        ? name.toLowerCase()
        : "_".repeat(name.length + 2),
  );
}

function isPlpgsqlBody(text, language) {
  if (language) return String(language).toLowerCase() === "plpgsql";
  return /^\s*(?:<<\s*\w+\s*>>\s*)?(?:DECLARE|BEGIN)\b/i.test(text);
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isAnchorColumn(columnRef, namedParams) {
  const match = new RegExp(`^(?:${IDENT}\\s*\\.\\s*)?(${IDENT})$`).exec(
    columnRef.trim(),
  );
  if (!match) return false;
  const column = match[1].toLowerCase();
  if (["null", "true", "false"].includes(column)) return false;
  return !namedParams.has(column);
}

function isScalarAnchorRead(argument, namedParams) {
  let inner = argument.trim();
  while (inner.startsWith("(") && inner.endsWith(")"))
    inner = inner.slice(1, -1).trim();
  const match = new RegExp(
    `^SELECT\\s+(${IDENT}(?:\\s*\\.\\s*${IDENT})?)\\s+FROM\\s+${QUALIFIED_RELATION}`,
    "i",
  ).exec(inner);
  return Boolean(match) && isAnchorColumn(match[1], namedParams);
}

function isVariableAnchorRead(variable, text, namedParams) {
  const v = escapeRegExp(variable);
  const assignment = new RegExp(`\\b${v}\\s*:=`, "i");
  const statementAssignment = new RegExp(
    `(?:^|;|\\bBEGIN|\\bTHEN|\\bELSE|\\bLOOP)\\s*${v}\\s*=(?!=)`,
    "i",
  );
  const declaredDefault = new RegExp(
    `\\b${v}\\s+[A-Za-z_][^;]*?(?::=|\\bDEFAULT\\b)`,
    "i",
  );
  const otherWrites = new RegExp(
    `(?:\\bDIAGNOSTICS\\b[^;]*\\b${v}\\b|\\bFOR\\s+${v}\\s+IN\\b)`,
    "i",
  );
  if (
    assignment.test(text) ||
    statementAssignment.test(text) ||
    declaredDefault.test(text) ||
    otherWrites.test(text)
  )
    return false;
  const intoTargets = [
    ...text.matchAll(
      new RegExp(
        `\\bINTO\\s+(?:STRICT\\s+)?(?:${IDENT}\\s*,\\s*)*${v}\\b(?!\\s*[.(])`,
        "gi",
      ),
    ),
  ];
  if (intoTargets.length !== 1) return false;
  const permitted = [
    ...text.matchAll(
      new RegExp(
        `\\bSELECT\\s+(${IDENT}(?:\\s*\\.\\s*${IDENT})?)\\s+INTO\\s+(?:STRICT\\s+)?${v}\\s+FROM\\s+${QUALIFIED_RELATION}`,
        "gi",
      ),
    ),
  ];
  return permitted.length === 1 && isAnchorColumn(permitted[0][1], namedParams);
}

export function workerWrapperPassesTenantArg(
  signature,
  body,
  stripComments,
  language,
) {
  if (WORKER_WRAPPER_TENANT_ARG_EXCEPTIONS.includes(signature)) return false;
  const { namedParams } = parseWrapperParameters(signature);
  for (const name of namedParams) {
    if (name.includes("tenant")) return true;
  }
  const text = normalizedBody(body, stripComments);
  const callRe =
    /(?:^|[^A-Za-z0-9_$."])tenant_guard\s*\.\s*[A-Za-z_][A-Za-z0-9_$]*\s*\(/gi;
  const calls = [...text.matchAll(callRe)];
  if (calls.length === 0) return true;
  const plpgsql = isPlpgsqlBody(text, language);
  for (const match of calls) {
    const openIndex = match.index + match[0].length - 1;
    const firstArg = firstCallArgument(text, openIndex);
    if (!firstArg) return true;
    if (isScalarAnchorRead(firstArg, namedParams)) continue;
    const variable = new RegExp(`^${IDENT}$`).test(firstArg)
      ? firstArg.toLowerCase()
      : null;
    if (
      !plpgsql ||
      !variable ||
      namedParams.has(variable) ||
      !isVariableAnchorRead(variable, text, namedParams)
    )
      return true;
  }
  return false;
}

const WRAPPER_STATEMENT_RE =
  /\b(?:INSERT|UPDATE|DELETE|MERGE|TRUNCATE|COPY|EXECUTE|CALL|CREATE|DROP|ALTER|GRANT|REVOKE|LOCK|NOTIFY|LISTEN|UNLISTEN|VACUUM|ANALY[SZ]E|REFRESH|CLUSTER|REINDEX|COMMENT|IMPORT|DISCARD|RESET|SET|PREPARE|DEALLOCATE|SECURITY\s+LABEL|DO|COMMIT|ROLLBACK|SAVEPOINT)\b/i;

const WRAPPER_NON_CALL_WORDS = new Set(
  `if elsif in any all some exists and or not values select from where on using as return when then
   else case end array row cast over filter within into join lateral by having limit offset union except
   intersect distinct is null between like ilike similar coalesce nullif greatest least exception raise
   varchar char character numeric decimal timestamp time interval bit varbit float double precision
   with recursive group order`
    .split(/\s+/)
    .filter(Boolean),
);

const WRAPPER_READ_ONLY_FUNCTIONS = new Set([
  "jsonb_build_object",
  "json_build_object",
  "jsonb_build_array",
  "to_jsonb",
  "jsonb_typeof",
  "btrim",
  "lower",
  "upper",
  "length",
  "char_length",
  "concat",
  "concat_ws",
  "format",
  "now",
  "clock_timestamp",
  "make_interval",
  "count",
  "max",
  "min",
  "cardinality",
  "array_length",
]);

export function workerWrapperHasWrite(body, stripComments, language) {
  const text = normalizedBody(body, stripComments).replace(
    /\bFOR\s+(?:NO\s+KEY\s+UPDATE|UPDATE|KEY\s+SHARE|SHARE)\b(?:\s+OF\s+[\w\s,]+?)?(?:\s+(?:NOWAIT|SKIP\s+LOCKED))?/gi,
    " ",
  );
  if (WRAPPER_STATEMENT_RE.test(text)) return true;
  if (!isPlpgsqlBody(text, language) && /\bINTO\b/i.test(text)) return true;
  const callRe =
    /(?<![A-Za-z0-9_$.:])(?:([A-Za-z_][A-Za-z0-9_$]*)\s*\.\s*)?([A-Za-z_][A-Za-z0-9_$]*)\s*\(/g;
  for (const match of text.matchAll(callRe)) {
    const before = text.slice(0, match.index).trimEnd();
    if (before.endsWith("::")) continue;
    const schema = match[1]?.toLowerCase() ?? null;
    const name = match[2].toLowerCase();
    if (schema === "tenant_guard") continue;
    if (schema === null && WRAPPER_NON_CALL_WORDS.has(name)) continue;
    if (
      (schema === null || schema === "pg_catalog") &&
      WRAPPER_READ_ONLY_FUNCTIONS.has(name)
    )
      continue;
    return true;
  }
  return false;
}
