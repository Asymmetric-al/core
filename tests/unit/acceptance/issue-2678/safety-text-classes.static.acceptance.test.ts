import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const MIGRATION = "supabase/migrations/20261126010000_wp5_2r1_worker_names.sql";

const KEPT_FORMAT: [number, number][] = [
  [0x0600, 0x0605],
  [0x06dd, 0x06dd],
  [0x070f, 0x070f],
  [0x0890, 0x0891],
  [0x08e2, 0x08e2],
  [0x110bd, 0x110bd],
  [0x110cd, 0x110cd],
];
const NOT_IGNORABLE_BUT_BLANK = [0x2800];

const DEFAULT_IGNORABLE = /^\p{Default_Ignorable_Code_Point}$/u;
const FORMAT = /^\p{Cf}$/u;
const CONTROL = /^\p{Cc}$/u;
const WHITE_SPACE = /^\p{White_Space}$/u;

function patterns(marker: string): string[] {
  const text = readFileSync(MIGRATION, "utf8");
  const quote = marker.replaceAll("$", "\\$");
  const re = new RegExp(`${quote}\\[(.*?)\\]\\+?${quote}`, "gs");
  return [...text.matchAll(re)].map((m) => m[1]!);
}

function codePoints(klass: string): Set<number> {
  const out = new Set<number>();
  const token = /\\u([0-9A-F]{4})|\\U([0-9A-F]{8})/gy;
  const next = () => {
    const m = token.exec(klass);
    if (!m) throw new Error(`unreadable class at ${token.lastIndex}`);
    return parseInt(m[1] ?? m[2]!, 16);
  };
  token.lastIndex = 0;
  while (token.lastIndex < klass.length) {
    const first = next();
    if (klass[token.lastIndex] === "-") {
      token.lastIndex += 1;
      const last = next();
      for (let c = first; c <= last; c++) out.add(c);
    } else out.add(first);
  }
  return out;
}

function hex(c: number) {
  return `U+${c
    .toString(16)
    .toUpperCase()
    .padStart(c > 0xffff ? 5 : 4, "0")}`;
}

function* allCodePoints() {
  for (let c = 0x0001; c <= 0x10ffff; c++)
    if (c < 0xd800 || c > 0xdfff) yield c;
}

const has = (re: RegExp, c: number) => re.test(String.fromCodePoint(c));
const kept = (c: number) => KEPT_FORMAT.some(([a, b]) => c >= a && c <= b);

describe(`AL-2678 r1: the safety text's classes, derived from this runtime's Unicode tables (Unicode ${process.versions.unicode}), not trusted from a list (F3; tests/docs/adr/0005)`, () => {
  const removal = patterns("$re$");
  const whitespace = patterns("$ws$");
  const removed = codePoints(removal[0] ?? "");
  const spaces = codePoints(whitespace[0] ?? "");

  it("both functions carry the same two patterns, written as ASCII escapes", () => {
    expect(removal).toHaveLength(2);
    expect(whitespace).toHaveLength(2);
    expect(removal[1]).toBe(removal[0]);
    expect(whitespace[1]).toBe(whitespace[0]);
    expect(readFileSync(MIGRATION, "utf8")).toMatch(/^[\x00-\x7f]*$/);
  });

  it("every default-ignorable code point, assigned or not, is removed", () => {
    const missing: string[] = [];
    for (const c of allCodePoints())
      if (has(DEFAULT_IGNORABLE, c) && !removed.has(c)) missing.push(hex(c));
    expect(missing).toEqual([]);
  });

  it("every format character is removed or is a visible format mark on the named kept list", () => {
    const missing: string[] = [];
    for (const c of allCodePoints())
      if (has(FORMAT, c) && !removed.has(c) && !kept(c)) missing.push(hex(c));
    expect(missing).toEqual([]);
  });

  it("every control character that is not whitespace is removed", () => {
    const missing: string[] = [];
    for (const c of allCodePoints())
      if (has(CONTROL, c) && !has(WHITE_SPACE, c) && !removed.has(c))
        missing.push(hex(c));
    expect(missing).toEqual([]);
  });

  it("the whitespace class is exactly White_Space", () => {
    const want = [...allCodePoints()].filter((c) => has(WHITE_SPACE, c));
    expect([...spaces].sort((a, b) => a - b).map(hex)).toEqual(want.map(hex));
  });

  it("nothing else is removed, no whitespace is removed, and every kept mark is a format character the pattern keeps", () => {
    const extra: string[] = [];
    for (const c of removed)
      if (
        !has(DEFAULT_IGNORABLE, c) &&
        !has(FORMAT, c) &&
        !(has(CONTROL, c) && !has(WHITE_SPACE, c)) &&
        !NOT_IGNORABLE_BUT_BLANK.includes(c)
      )
        extra.push(hex(c));
    expect(extra).toEqual([]);
    expect([...removed].filter((c) => spaces.has(c)).map(hex)).toEqual([]);
    for (const [a, b] of KEPT_FORMAT)
      for (let c = a; c <= b; c++) {
        expect(has(FORMAT, c), hex(c)).toBe(true);
        expect(removed.has(c), hex(c)).toBe(false);
      }
  });
});
