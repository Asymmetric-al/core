/**
 * #2308 spec r1 §4 C11–C12; owned by Acceptance. No realstack file (§8).
 * Samson comment 6420148722, rulings verbatim:
 * OQ1: the 5 MB cap applies to the cropped upload.
 * OQ2: bucket-level limits are not in this slice, and the `20261025125600`
 * reservation is released. The route enforces the limits, so no migration is
 * needed. Any bucket-level hardening will be filed separately.
 * OQ3: a cover upload from a non-missionary gets 403.
 * OQ4: the key is `{purpose}/{tenantId}/{userId}/{uuid}.{ext}`.
 * OQ5: replaced photos are left in place.
 * OQ6: Cloudinary is out.
 * OQ7: ADR-0171 is not applied.
 * OQ8: a successful upload returns 201 `{ url, path }`.
 * Builder owns C13 (sniffer), C14 (key/extension), C15 (bearer factory).
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const ROOT = new URL("../../../../", import.meta.url);
const read = (file: string) => {
  const path = new URL(file, ROOT);
  expect(existsSync(path), `${file} must exist (#2308)`).toBe(true);
  return readFileSync(path, "utf8");
};

describe("#2308 static contracts (A)", () => {
  it.each(["missionary", "donor"])(
    "C11: %s route is exactly the shared one-line re-export",
    (app) => {
      expect(read(`apps/${app}/app/api/upload/image/route.ts`)).toBe(
        'export { POST } from "@asym/api/upload/image";\n',
      );
    },
  );
  it("C11: API package exports the shared handler", () => {
    expect(
      JSON.parse(read("packages/api/package.json")).exports["./upload/image"],
    ).toBe("./src/upload/image.ts");
  });
  it.each(["missionary", "donor"])(
    "C11: runtime map has the %s upload row",
    (app) => {
      const rows = read("docs/guides/architecture/runtime-map.md")
        .split("\n")
        .filter((row) =>
          new RegExp(
            `^\\|\\s*${app}\\s*\\|\\s*\`/api/upload/image\`\\s*\\|`,
          ).test(row),
        );
      expect(rows).toHaveLength(1);
      if (app === "donor")
        expect(rows[0]).toContain(
          "Shared profile-photo upload, request-scoped client",
        );
    },
  );
  it("C11: handler imports nothing from the service-role admin module", () => {
    expect(read("packages/api/src/upload/image.ts")).not.toContain(
      "@asym/database/supabase/admin",
    );
  });
  it("C12: bun run verify:service-role-clients passes", () => {
    const result = spawnSync("bun", ["run", "verify:service-role-clients"], {
      cwd: ROOT,
      encoding: "utf8",
      timeout: 30_000,
    });
    expect(result.error).toBeUndefined();
    expect(result.status, `${result.stdout}${result.stderr}`).toBe(0);
  });
  // Re-frozen after develop d99a1fc4 shrank the table-preferences entry, and
  // again at #2406 Builder 9563beea (only `lines` fields moved; no new sites;
  // whole-file SHA-256 41b0324c…). #2419 (base 2a4f70a8) shrinks the
  // scripts/verify-money-units.ts entry, so its `count` and `lines` values are
  // masked; every other byte of the file, including that entry's other fields,
  // stays frozen. The masked entry may only shrink (1..3, lines per count).
  const ALLOWLIST = "docs/security/service-role-client-allowlist.json";
  const MONEY_UNITS = '"file":"scripts/verify-money-units.ts"';
  const COUNT_LINES = /"count":(\d+),\s*"lines":\[([\d,\s]*)\]/;
  const moneyUnitsLine = (text: string) => {
    const at = text
      .split("\n")
      .flatMap((line, i) => (line.includes(MONEY_UNITS) ? [i] : []));
    expect(at, "one verify-money-units entry line").toHaveLength(1);
    return at[0]!;
  };
  it("C12: frozen service-role allowlist is byte-unchanged from #2406 Builder 9563beea apart from the verify-money-units count/lines (#2419)", () => {
    const text = read(ALLOWLIST);
    const rows = text.split("\n");
    const i = moneyUnitsLine(text);
    expect(rows[i]).toMatch(COUNT_LINES);
    rows[i] = rows[i]!.replace(
      COUNT_LINES,
      '"count":"<masked>","lines":"<masked>"',
    );
    expect(createHash("sha256").update(rows.join("\n")).digest("hex")).toBe(
      "cde3461ff33b409f02a85da0794264d6a5adb2a43f83315d0588718ee9b4c2ee",
    );
  });
  it("C12: the masked verify-money-units entry only shrinks: count 1..3 with one line per site", () => {
    const text = read(ALLOWLIST);
    const [, count, lines] = text
      .split("\n")
      [moneyUnitsLine(text)]!.match(COUNT_LINES)!;
    const n = Number(count);
    const listed = lines!.split(",").filter((l) => l.trim() !== "");
    expect([n >= 1 && n <= 3, listed.length]).toEqual([true, n]);
  });
});
