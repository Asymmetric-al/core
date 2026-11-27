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
  "AL-2678 W5-R5, findings B2, B3 and B5, ruling on B4: a signed-in person with no membership in the tenant starts a donor account claim; the caller is the session's login, the request's x-asym-tenant must name the tenant (42501), the tenant must be active, a platform operator never matches, the confirmed non-deleted Auth email is the only match key, locks run tenant, the caller's memberships, then the Party without waiting (a Party another caller holds is recorded as claim_already_open), then the claim, nothing is linked or granted, and every outcome answers the same at once";
const redeemAccountClaimReason =
  "AL-2678 W5-R5, findings B2, B3 and B5: a signed-in person with no membership in the tenant redeems a mailed claim token; the request's x-asym-tenant must name the tenant (42501), the token's SHA-256 under the tenant, membership, Party and claim locks is the authority, it is single-use, expires, is bound to the requester and the donor's email at issue, a platform operator or a login without a confirmed address is refused, the link insert cannot raise a unique violation, and every failure answers the same";
export const reviewedPreMembership = Object.freeze({
  [acceptInvitationFunction]: Object.freeze({
    reason: acceptInvitationReason,
    digest: "8e1cd0bb1438913861f3dfda3f72866e20c6ccbe0abb1513e489e41cf9f9cbb2",
  }),
  [startAccountClaim]: Object.freeze({
    reason: startAccountClaimReason,
    digest: "bca3eaeb1cf4059144d502daf37a9050eee2918085fd8494438651d7b064544c",
  }),
  [redeemAccountClaim]: Object.freeze({
    reason: redeemAccountClaimReason,
    digest: "acc80384cc7e474a3053e7aac23f70d166c285396dd2633401efa4850dcc45c7",
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

export const WORKER_WRAPPER_ANCHOR_LOOKUPS = Object.freeze([
  "public.resolve_verified_host",
]);

export const WORKER_WRAPPER_ANCHOR_SIGNATURES = Object.freeze({
  "public.resolve_verified_host": "public.resolve_verified_host(p_host text)",
});

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
const QUOTED_NAME_SENTINEL = "§";

const QUOTED_KEYWORDS = new Set(
  `absolute alias all alter analyse analyze and any array as asc assert asymmetric backward begin between both by
   call case cast chain check close cluster collate column column_name comment commit constant constraint
   constraint_name continue copy create cross current current_catalog current_date current_role current_time
   current_timestamp current_user cursor datatype deallocate debug declare default deferrable delete desc detail
   diagnostics discard distinct do drop dump else elseif elsif end error except exception execute exit false fetch
   filter first for foreach foreign forward from full get grant group having hint if ilike import in info
   initially inner insert intersect into is join key label last lateral leading left like limit listen localtime
   localtimestamp lock locked log loop merge message message_text move natural next no not notice notify nowait
   null of offset on only open option or order over perform pg_context pg_datatype_name pg_exception_context
   pg_exception_detail pg_exception_hint pg_routine_oid placing prepare primary print_strict_params prior query
   raise recursive references refresh reindex relative reset return returned_sqlstate returning reverse revoke
   right rollback row_count rowtype savepoint schema schema_name scroll security select session_user set share
   similar skip slice some sqlstate stacked strict symmetric system_user table table_name then to trailing true
   truncate type union unique unlisten update use_column use_variable user using vacuum variable_conflict variadic
   warning when where while window with within`
    .split(/\s+/)
    .filter(Boolean),
);

function normalizedBody(body, stripComments) {
  return stripComments(String(body ?? ""), { blankStrings: true }).replace(
    /"((?:[^"]|"")+)"/g,
    (_quoted, name) =>
      /^[A-Za-z_][A-Za-z0-9_$]*$/.test(name) &&
      !QUOTED_KEYWORDS.has(name.toLowerCase())
        ? name.toLowerCase()
        : QUOTED_NAME_SENTINEL.repeat(name.length + 2),
  );
}

function isPlpgsqlBody(text, language) {
  if (language) return String(language).toLowerCase() === "plpgsql";
  return /^\s*(?:<<\s*\w+\s*>>\s*)?(?:DECLARE|BEGIN)\b/i.test(text);
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function localNames(text) {
  const names = new Set();
  for (const block of text.matchAll(/\bDECLARE\b([\s\S]*?)\bBEGIN\b/gi))
    for (const part of block[1].split(";")) {
      const declared = new RegExp(`^\\s*(${IDENT})\\b`).exec(part);
      if (declared) names.add(declared[1].toLowerCase());
    }
  for (const label of text.matchAll(new RegExp(`<<\\s*(${IDENT})\\s*>>`, "g")))
    names.add(label[1].toLowerCase());
  for (const loop of text.matchAll(
    new RegExp(`\\bFOR\\s+(${IDENT}(?:\\s*,\\s*${IDENT})*)\\s+IN\\b`, "gi"),
  ))
    for (const name of loop[1].split(",")) names.add(name.trim().toLowerCase());
  return names;
}

function closingParenthesis(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === "(") depth += 1;
    else if (text[i] === ")") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

const ANCHOR_ALIAS_KEYWORDS = new Set([
  "where",
  "join",
  "cross",
  "left",
  "right",
  "inner",
  "full",
  "natural",
  "union",
  "intersect",
  "except",
  "on",
  "using",
]);
const ANCHOR_ROW_LOCK =
  "(?:\\s+FOR\\s+(?:NO\\s+KEY\\s+UPDATE|UPDATE|SHARE|KEY\\s+SHARE)(?:\\s+(?:NOWAIT|SKIP\\s+LOCKED))?)?";
const ANCHOR_PREDICATE_FORBIDDEN =
  /\b(?:SELECT|JOIN|UNION|INTERSECT|EXCEPT|GROUP\s+BY|HAVING|ORDER\s+BY|LIMIT|OFFSET|FETCH|FOR)\b/i;
const STATEMENT_BOUNDARY_BEFORE = /(?:^|\b(?:BEGIN|THEN|ELSE|LOOP))\s*$/i;

function isPlainPredicate(text) {
  let depth = 0;
  for (const ch of text) {
    if (ch === "(") depth += 1;
    else if (ch === ")") {
      depth -= 1;
      if (depth < 0) return false;
    } else if (ch === "," && depth === 0) return false;
  }
  return depth === 0 && !ANCHOR_PREDICATE_FORBIDDEN.test(text);
}

function isLookupAnchorStatement(statement, variable, scope) {
  const into = variable
    ? `\\s+INTO\\s+(?:STRICT\\s+)?${escapeRegExp(variable)}`
    : "";
  const match = new RegExp(
    `^SELECT\\s+(${IDENT})\\s*\\.\\s*(${IDENT})${into}\\s+FROM\\s+(${IDENT})\\s*\\.\\s*(${IDENT})\\s*\\(\\s*(${IDENT})\\s*\\)(?:\\s+(?:AS\\s+)?(${IDENT}))?(?:\\s+WHERE\\s+([\\s\\S]+?))?\\s*$`,
    "i",
  ).exec(statement.trim());
  if (!match) return false;
  const [
    ,
    qualifierRef,
    columnRef,
    schemaRef,
    nameRef,
    argRef,
    aliasRef,
    predicate,
  ] = match;
  const lookup = `${schemaRef.toLowerCase()}.${nameRef.toLowerCase()}`;
  if (!WORKER_WRAPPER_ANCHOR_LOOKUPS.includes(lookup)) return false;
  const alias = aliasRef?.toLowerCase();
  if (alias && ANCHOR_ALIAS_KEYWORDS.has(alias)) return false;
  const qualifier = qualifierRef.toLowerCase();
  if (qualifier !== (alias ?? nameRef.toLowerCase())) return false;
  const argument = argRef.toLowerCase();
  if (!scope.namedParams.has(argument) || argument.includes("tenant"))
    return false;
  if (
    scope.namedParams.has(qualifier) ||
    scope.locals.has(qualifier) ||
    qualifier === scope.functionName
  )
    return false;
  const column = columnRef.toLowerCase();
  if (
    ["null", "true", "false"].includes(column) ||
    scope.namedParams.has(column) ||
    scope.locals.has(column) ||
    column === scope.functionName
  )
    return false;
  return predicate === undefined || isPlainPredicate(predicate);
}

function isAnchorStatement(statement, variable, scope) {
  if (isLookupAnchorStatement(statement, variable, scope)) return true;
  const into = variable
    ? `\\s+INTO\\s+(?:STRICT\\s+)?${escapeRegExp(variable)}`
    : "";
  const match = new RegExp(
    `^SELECT\\s+(${IDENT})\\s*\\.\\s*(${IDENT})${into}\\s+FROM\\s+${IDENT}\\s*\\.\\s*(${IDENT})(?:\\s+(?:AS\\s+)?(${IDENT}))?\\s+WHERE\\s+([\\s\\S]+?)${ANCHOR_ROW_LOCK}\\s*$`,
    "i",
  ).exec(statement.trim());
  if (!match) return false;
  const [, qualifierRef, columnRef, relation, aliasRef, predicate] = match;
  const qualifier = qualifierRef.toLowerCase();
  const column = columnRef.toLowerCase();
  const alias = aliasRef?.toLowerCase();
  if (alias && ANCHOR_ALIAS_KEYWORDS.has(alias)) return false;
  if (qualifier !== (alias ?? relation.toLowerCase())) return false;
  if (
    scope.namedParams.has(qualifier) ||
    scope.locals.has(qualifier) ||
    qualifier === scope.functionName
  )
    return false;
  if (
    ["null", "true", "false"].includes(column) ||
    scope.namedParams.has(column) ||
    scope.locals.has(column) ||
    column === scope.functionName
  )
    return false;
  return isPlainPredicate(predicate);
}

function statementAround(text, index) {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
    else if (ch === ";" && depth === 0) {
      if (i >= index) return text.slice(start, i);
      start = i + 1;
    }
  }
  return text.slice(start);
}

function isScalarAnchorRead(argument, scope) {
  let inner = argument.trim();
  while (
    inner.startsWith("(") &&
    closingParenthesis(inner, 0) === inner.length - 1
  )
    inner = inner.slice(1, -1).trim();
  return isAnchorStatement(inner, null, scope);
}

function isVariableAnchorRead(variable, text, scope) {
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
  const initialisedDeclaration = new RegExp(
    `^\\s*${v}\\s[\\s\\S]*?(?::=|=|\\bDEFAULT\\b)`,
    "i",
  );
  const declaredWithValue = [
    ...text.matchAll(/\bDECLARE\b([\s\S]*?)\bBEGIN\b/gi),
  ].some((block) =>
    block[1].split(";").some((part) => initialisedDeclaration.test(part)),
  );
  if (
    assignment.test(text) ||
    statementAssignment.test(text) ||
    declaredDefault.test(text) ||
    declaredWithValue ||
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
  const statement = statementAround(text, intoTargets[0].index);
  for (const select of statement.matchAll(/\bSELECT\b/gi)) {
    if (!STATEMENT_BOUNDARY_BEFORE.test(statement.slice(0, select.index)))
      continue;
    if (isAnchorStatement(statement.slice(select.index), variable, scope))
      return true;
  }
  return false;
}

export function workerWrapperCallsLookup(body, stripComments, lookup) {
  const name = escapeRegExp(lookup).replace("\\.", "\\s*\\.\\s*");
  return new RegExp(`\\b${name}\\s*\\(`, "i").test(
    normalizedBody(body, stripComments),
  );
}

export function workerWrapperPassesTenantArg(
  signature,
  body,
  stripComments,
  language,
) {
  if (WORKER_WRAPPER_TENANT_ARG_EXCEPTIONS.includes(signature)) return false;
  const { namedParams, wrapperShortName } = parseWrapperParameters(signature);
  for (const name of namedParams) {
    if (name.includes("tenant")) return true;
  }
  const text = normalizedBody(body, stripComments);
  if (/#\s*variable_conflict\b/i.test(text)) return true;
  for (const block of text.matchAll(/\bDECLARE\b([\s\S]*?)\bBEGIN\b/gi))
    if (/\bALIAS\b/i.test(block[1])) return true;
  if (
    new RegExp(`tenant_guard\\s*\\.\\s*${QUOTED_NAME_SENTINEL}`, "i").test(text)
  )
    return true;
  const callRe =
    /(?:^|[^A-Za-z0-9_$."])tenant_guard\s*\.\s*[A-Za-z_][A-Za-z0-9_$]*\s*\(/gi;
  const calls = [...text.matchAll(callRe)];
  if (calls.length === 0) return true;
  const plpgsql = isPlpgsqlBody(text, language);
  const scope = {
    namedParams,
    locals: plpgsql ? localNames(text) : new Set(),
    functionName: wrapperShortName,
  };
  for (const match of calls) {
    const openIndex = match.index + match[0].length - 1;
    const firstArg = firstCallArgument(text, openIndex);
    if (!firstArg) return true;
    if (isScalarAnchorRead(firstArg, scope)) continue;
    const variable = new RegExp(`^${IDENT}$`).test(firstArg)
      ? firstArg.toLowerCase()
      : null;
    if (
      !plpgsql ||
      !variable ||
      namedParams.has(variable) ||
      !isVariableAnchorRead(variable, text, scope)
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

export function workerWrapperHasWrite(
  body,
  stripComments,
  language,
  searchPath,
) {
  const text = normalizedBody(body, stripComments).replace(
    /\bFOR\s+(?:NO\s+KEY\s+UPDATE|UPDATE|KEY\s+SHARE|SHARE)\b(?:\s+OF\s+[\w\s,]+?)?(?:\s+(?:NOWAIT|SKIP\s+LOCKED))?/gi,
    " ",
  );
  if (WRAPPER_STATEMENT_RE.test(text)) return true;
  if (
    new RegExp(`${QUOTED_NAME_SENTINEL}+\\s*(?:\\.\\s*${IDENT}\\s*)?\\(`).test(
      text,
    )
  )
    return true;
  if (!isPlpgsqlBody(text, language) && /\bINTO\b/i.test(text)) return true;
  const callRe =
    /(?<![A-Za-z0-9_$.:])(?:([A-Za-z_][A-Za-z0-9_$]*)\s*\.\s*)?([A-Za-z_][A-Za-z0-9_$]*)\s*\(/g;
  for (const match of text.matchAll(callRe)) {
    const before = text.slice(0, match.index).trimEnd();
    if (before.endsWith("::")) continue;
    const schema = match[1]?.toLowerCase() ?? null;
    const name = match[2].toLowerCase();
    if (schema === "tenant_guard") continue;
    if (
      schema !== null &&
      WORKER_WRAPPER_ANCHOR_LOOKUPS.includes(`${schema}.${name}`)
    )
      continue;
    if (schema === null && WRAPPER_NON_CALL_WORDS.has(name)) continue;
    if (
      ((schema === null && searchPath === '""') || schema === "pg_catalog") &&
      WRAPPER_READ_ONLY_FUNCTIONS.has(name)
    )
      continue;
    return true;
  }
  return false;
}
