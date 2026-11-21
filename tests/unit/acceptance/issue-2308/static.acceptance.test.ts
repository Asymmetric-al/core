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
  // Re-frozen after develop d99a1fc4 shrank the table-preferences entry,
  // again at #2406 Builder 9563beea (only `lines` fields moved; no new sites),
  // in the admin hill-climb round 12, which shrank dashboard-stats.ts from
  // 2 sites to 1 (the CRM tags read reuses crm/index.ts's one site; no new
  // sites), and at #2419, which shrank scripts/verify-money-units.ts from 3
  // sites to 1 (the anon-key fallback was removed).
  //
  // Amended by AL-2674 (WP1 slice 1.3, plan 7.1 and 7.4): the health probe's
  // one site in packages/api/src/health/db.ts now also serves each app's
  // migration-head check, so that entry's reason names it, and the `lines`
  // fields of three entries moved with their sources (db.ts 51 to 16, the env
  // schema 302 to 301, vercel-production-readiness 35 to 66). No site, count
  // or entry was added; the ceiling is unchanged. The pin stays a whole-file
  // hash, re-taken on that reviewed content.
  //
  // Re-frozen at AL-2675 (council round 1 on WP2a, F8): Mission Control's
  // users list reads the member directory on the caller's token and no
  // longer uses the service-key client, so the packages/api/src/admin/users.ts
  // entry (operation_admin_context, 1 site) is deleted, as the shrink-only
  // rule asks. Nothing else changed; no site, count or entry was added.
  // D-18: WP2H reclassified the missionary workspace routes and removed two sites in follower-requests/request.ts.
  // The digest still checks every byte of the reviewed inventory; the ceiling did not increase.
  // D-18: five advisory line lists now point to the actual call sites.
  // D-18: the allowlist bytes stay pinned; its two removed sites also leave the ceiling, as required.
  // Only raising the ceiling needs a new ruling.
  // D-18: merging WP2's handler package into WP2b's first release moved 36 advisory line lists to their
  // call sites in the merged tree; no site, count, entry or ceiling row changed.
  // D-18: retain the platform-wrapper inventory pin and count the eight previously invisible calls separately under the WP4a ruling.
  it("C12: pins the reviewed platform calls and the newly visible helper calls", () => {
    const inventory = read("docs/security/service-role-client-allowlist.json");
    const entries: { kind: string; reason: string; count: number }[] =
      JSON.parse(inventory).entries;
    const platform = entries.filter(
      (entry) => entry.kind === "operation_admin_context",
    );
    const helpers = platform.filter(
      (entry) =>
        entry.reason ===
        "counted from 21 November 2026; reached the key before the split through an uncounted helper",
    );
    expect(helpers.length).toBeLessThanOrEqual(6);
    expect(
      helpers.reduce((sites, entry) => sites + entry.count, 0),
    ).toBeLessThanOrEqual(8);
    const originals = platform.filter((entry) => !helpers.includes(entry));
    expect(originals.length).toBeLessThanOrEqual(37);
    expect(
      originals.reduce((sites, entry) => sites + entry.count, 0),
    ).toBeLessThanOrEqual(65);
    for (const entry of originals)
      expect(entry.reason).toContain("withPlatformOperation");
    // D-18 (AL-2677): six CRM entries and nine sites left the inventory.
    // The remaining CRM site is note creation on withPlatformOperation.
    expect(createHash("sha256").update(inventory).digest("hex")).toBe(
      "a87e039409a5fd1573b354bbb8ca033010e9e28a0a46b771463572e4eaef1bae",
    );
  });
});
