import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const ls = (dirs: string[], cwd = process.cwd()) =>
  spawnSync("git", ["ls-files", "-z", "-co", "--exclude-standard", ...dirs], {
    cwd,
    encoding: "utf8",
    maxBuffer: 1 << 28,
  })
    .stdout.split("\0")
    .filter(
      (f) =>
        /\.(m|c)?[jt]sx?$/.test(f) &&
        !/(\.test\.|\.spec\.|\/tests?\/|__tests__|\/e2e\/)/.test(f),
    );

const RPC_CALL = /\.rpc\(\s*["'`]change_membership_role["'`]\s*,/g;

function skipSpacesAndComments(source: string, index: number): number {
  let i = index;
  while (i < source.length) {
    const c = source[i]!;
    if (/\s/.test(c)) {
      i += 1;
      continue;
    }
    if (c === "/" && source[i + 1] === "/") {
      const nl = source.indexOf("\n", i + 2);
      if (nl === -1) return source.length;
      i = nl + 1;
      continue;
    }
    if (c === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      if (end === -1) return source.length;
      i = end + 2;
      continue;
    }
    break;
  }
  return i;
}

function endOfString(source: string, start: number): number {
  for (let i = start + 1; i < source.length; i += 1) {
    if (source[i] === "\\") i += 1;
    else if (source[i] === source[start]) return i;
  }
  return source.length;
}

function findObjectEnd(source: string, openBrace: number): number {
  let depth = 0;
  for (let i = openBrace; i < source.length; i += 1) {
    const c = source[i]!;
    if (c === "/" && (source[i + 1] === "/" || source[i + 1] === "*")) {
      i = skipSpacesAndComments(source, i) - 1;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      i = endOfString(source, i);
      continue;
    }
    if (c === "{") depth += 1;
    else if (c === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function objectNamesKey(
  source: string,
  openBrace: number,
  key: string,
): boolean {
  const closeBrace = findObjectEnd(source, openBrace);
  if (closeBrace === -1) return false;
  let depth = 0;
  let atKey = true;
  for (let i = openBrace + 1; i < closeBrace; i += 1) {
    i = skipSpacesAndComments(source, i);
    if (i >= closeBrace) return false;
    const c = source[i]!;
    if (depth === 0 && atKey) {
      let matchedEnd = -1;
      if (c === '"' || c === "'") {
        const end = endOfString(source, i);
        if (source.slice(i + 1, end) === key) matchedEnd = end + 1;
      } else if (
        source.startsWith(key, i) &&
        !/[\w$]/.test(source[i + key.length] ?? "")
      ) {
        matchedEnd = i + key.length;
      }
      if (matchedEnd !== -1) {
        const after = skipSpacesAndComments(source, matchedEnd);
        const delim = source[after];
        if (delim === ":" || delim === "," || delim === "}") return true;
      }
      atKey = false;
    }
    if (c === '"' || c === "'" || c === "`") i = endOfString(source, i);
    else if ("{[(".includes(c)) depth += 1;
    else if ("}])".includes(c)) depth -= 1;
    else if (c === "," && depth === 0) atKey = true;
  }
  return false;
}

function countCallersMissingExpectedUpdatedAt(source: string): number {
  let missing = 0;
  for (const match of source.matchAll(RPC_CALL)) {
    const argStart = skipSpacesAndComments(
      source,
      match.index + match[0].length,
    );
    if (source[argStart] !== "{") {
      missing += 1;
      continue;
    }
    if (!objectNamesKey(source, argStart, "p_expected_updated_at")) {
      missing += 1;
    }
  }
  return missing;
}

describe("AL-2676 WP3c F5: every change_membership_role caller passes p_expected_updated_at", () => {
  const files = ls(["apps", "packages"]);

  it("finds zero non-test callers in apps/ and packages/ omitting p_expected_updated_at", () => {
    expect(files.length).toBeGreaterThan(200);
    const offending: Record<string, number> = {};
    for (const f of files) {
      const n = countCallersMissingExpectedUpdatedAt(readFileSync(f, "utf8"));
      if (n > 0) offending[f] = n;
    }
    expect(offending).toEqual({});
  });

  it("catches planted callers that omit p_expected_updated_at and passes callers that include it", () => {
    for (const bad of [
      `await client.rpc("change_membership_role", { p_tenant_id: t, p_membership_id: m, p_role: "staff", p_staff_role: "finance", p_is_tenant_admin: false, p_reason: r });`,
      `await client.rpc('change_membership_role', payload);`,
      `await client.rpc("change_membership_role", { nested: { p_expected_updated_at: ts }, p_reason: r });`,
    ]) {
      expect(countCallersMissingExpectedUpdatedAt(bad), bad).toBe(1);
    }
    for (const good of [
      `await client.rpc("change_membership_role", { p_tenant_id: t, p_membership_id: m, p_role: "staff", p_staff_role: "finance", p_is_tenant_admin: false, p_reason: r, p_expected_updated_at: ts });`,
      `await client.rpc("change_membership_role", { p_tenant_id: t, p_expected_updated_at });`,
      `await client.rpc("change_membership_role", { "p_expected_updated_at": ts });`,
    ]) {
      expect(countCallersMissingExpectedUpdatedAt(good), good).toBe(0);
    }
  });
});
