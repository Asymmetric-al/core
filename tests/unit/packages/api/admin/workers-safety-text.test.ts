import { readFileSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { normalizesToNothing } from "../../../../../packages/api/src/admin/workers/safety-text";

const MIGRATIONS = "supabase/migrations";

function latestDefinition(): string {
  const files = readdirSync(MIGRATIONS)
    .filter((f) => /^\d{14}_.+\.sql$/.test(f))
    .sort();
  const owner = files
    .filter((f) =>
      /CREATE (?:OR REPLACE )?FUNCTION private\.normalize_safety_text/.test(
        readFileSync(`${MIGRATIONS}/${f}`, "utf8"),
      ),
    )
    .at(-1);
  if (!owner) throw new Error("no migration defines normalize_safety_text");
  const text = readFileSync(`${MIGRATIONS}/${owner}`, "utf8");
  const start = text.search(
    /CREATE (?:OR REPLACE )?FUNCTION private\.normalize_safety_text/,
  );
  return text.slice(start, text.indexOf("$fn$;", start));
}

function klass(definition: string, marker: string, repeated: boolean) {
  const quote = marker.replaceAll("$", "\\$");
  const match = new RegExp(
    `${quote}\\[(.*?)\\]${repeated ? "\\+" : ""}${quote}`,
    "s",
  ).exec(definition);
  if (!match) throw new Error(`no ${marker} class in the definition`);
  const out = new Set<number>();
  const token = /\\u([0-9A-F]{4})|\\U([0-9A-F]{8})/gy;
  const body = match[1]!;
  const next = () => {
    const m = token.exec(body);
    if (!m) throw new Error(`unreadable class at ${token.lastIndex}`);
    return parseInt(m[1] ?? m[2]!, 16);
  };
  while (token.lastIndex < body.length) {
    const first = next();
    if (body[token.lastIndex] === "-") {
      token.lastIndex += 1;
      const last = next();
      for (let c = first; c <= last; c++) out.add(c);
    } else out.add(first);
  }
  return out;
}

describe("AL-2678 r2b1 review fix: an alias the database's safety normalization reduces to nothing is no alias, judged by the database's own classes", () => {
  const definition = latestDefinition();
  const removed = klass(definition, "$re$", false);
  const spaces = klass(definition, "$ws$", true);

  it("reads both classes from the migration that last defines private.normalize_safety_text", () => {
    expect(removed.size).toBeGreaterThan(4000);
    expect(spaces.has(0x00a0)).toBe(true);
  });

  it("agrees with the database on every code point alone: nothing is left exactly when it is removed or whitespace", () => {
    const wrong: string[] = [];
    for (let c = 0x0001; c <= 0x10ffff; c++) {
      if (c >= 0xd800 && c <= 0xdfff) continue;
      const blank = removed.has(c) || spaces.has(c);
      if (normalizesToNothing(String.fromCodePoint(c)) !== blank)
        wrong.push(c.toString(16));
    }
    expect(wrong).toEqual([]);
  });

  it("is blank for runs of removed characters and whitespace, and not for any visible letter among them", () => {
    expect(normalizesToNothing("")).toBe(true);
    expect(normalizesToNothing(" \t\u200b\u00a0\ufeff\u2060\u{e0041} ")).toBe(
      true,
    );
    expect(normalizesToNothing("\u200bA\u200b")).toBe(false);
    expect(normalizesToNothing("e\u0301")).toBe(false);
  });
});
