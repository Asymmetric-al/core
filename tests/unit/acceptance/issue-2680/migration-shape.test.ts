import { readFileSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

const MIG = "supabase/migrations";

const normalized = (signature: string) =>
  signature.replace(/\s+/g, "").replace(/"/g, "").toLowerCase();

const statements = (text: string) =>
  text
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("--"))
    .join("\n");

function grantsAfterHandOver(text: string) {
  const body = statements(text);
  const findings: string[] = [];
  const handOver =
    /ALTER\s+FUNCTION\s+([\w."]+\s*\([^)]*\))\s+OWNER\s+TO\s+tenant_guard\s*;/gi;
  for (const match of body.matchAll(handOver)) {
    const signature = normalized(match[1]!);
    const after = body.slice(match.index! + match[0].length);
    const touch =
      /(GRANT|REVOKE)\s[^;]*?\sON\s+FUNCTION\s+([\w."]+\s*\([^)]*\))/gi;
    for (const later of after.matchAll(touch))
      if (normalized(later[2]!) === signature)
        findings.push(`${later[1]!.toUpperCase()} after ${signature}`);
  }
  if (/EXECUTE[^;]*OWNER\s+TO\s+tenant_guard/i.test(body))
    findings.push("a hand-over built at run time");
  return findings;
}

describe("AL-2680 WP7 pull request 1, fix round: the review migration's shape", () => {
  it("S9: no migration grants or revokes a function after handing it to tenant_guard, or hands one over at run time, since on the hosted database postgres is not a superuser and those statements do nothing", () => {
    const files = readdirSync(MIG).filter((f) => /^\d{14}_.+\.sql$/.test(f));
    const findings = files.flatMap((file) =>
      grantsAfterHandOver(readFileSync(`${MIG}/${file}`, "utf8")).map(
        (finding) => `${file}: ${finding}`,
      ),
    );
    expect(findings).toEqual([]);
  });

  it("S9: the check finds a grant after the hand-over and a hand-over at run time", () => {
    expect(
      grantsAfterHandOver(`ALTER FUNCTION tenant_guard.f(UUID) OWNER TO tenant_guard;
GRANT EXECUTE ON FUNCTION tenant_guard.f(uuid) TO authenticated;`),
    ).toEqual(["GRANT after tenant_guard.f(uuid)"]);
    expect(
      grantsAfterHandOver(`REVOKE ALL ON FUNCTION tenant_guard.f(UUID) FROM PUBLIC;
ALTER FUNCTION tenant_guard.f(UUID) OWNER TO tenant_guard;`),
    ).toEqual([]);
    expect(
      grantsAfterHandOver(
        "DO $$ BEGIN EXECUTE format('ALTER FUNCTION %s OWNER TO tenant_guard', 'x'); END $$;",
      ),
    ).toEqual(["a hand-over built at run time"]);
  });

  it("S3: the review migration's Down names every function it creates, and its first statements lock the tables in the live order before it alters posts", () => {
    const file = readdirSync(MIG).find((f) => f.endsWith("_wp7_1_review.sql"))!;
    const text = readFileSync(`${MIG}/${file}`, "utf8");
    const header = text.slice(0, text.indexOf("\nBEGIN;"));
    const down = header.slice(header.indexOf("-- Down"));
    const created = [
      ...statements(text).matchAll(
        /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+([\w.]+)\s*\(/gi,
      ),
    ].map((m) => m[1]!);
    expect(created.length).toBeGreaterThanOrEqual(15);
    const downText = down.replace(/--/g, " ").replace(/\s+/g, " ");
    expect(created.filter((name) => !downText.includes(name))).toEqual([]);

    const body = statements(text.slice(text.indexOf("\nBEGIN;")));
    const opening = body
      .split(";")
      .map((s) => s.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, 4);
    expect(opening).toEqual([
      "BEGIN",
      "SET LOCAL lock_timeout = '5s'",
      "LOCK TABLE public.tenants, public.missionaries, public.parties IN SHARE ROW EXCLUSIVE MODE",
      "LOCK TABLE public.posts IN ACCESS EXCLUSIVE MODE",
    ]);
  });

  it("S3: the post tables' migration takes its locks, tenants first, before its preflight", () => {
    const file = readdirSync(MIG).find((f) =>
      f.endsWith("_wp7_1_post_children.sql"),
    )!;
    const text = readFileSync(`${MIG}/${file}`, "utf8");
    const body = statements(text.slice(text.indexOf("\nBEGIN;")));
    const opening = body
      .split(";")
      .map((s) => s.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, 4);
    expect(opening).toEqual([
      "BEGIN",
      "SET LOCAL lock_timeout = '5s'",
      "LOCK TABLE public.tenants IN SHARE ROW EXCLUSIVE MODE",
      "LOCK TABLE public.posts, public.post_likes, public.post_prayers, public.post_fires, public.post_comments IN ACCESS EXCLUSIVE MODE",
    ]);
    expect(body.indexOf("LOCK TABLE public.posts")).toBeLessThan(
      body.indexOf("DO $$"),
    );
  });
});
