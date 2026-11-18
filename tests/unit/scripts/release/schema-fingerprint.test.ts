// The schema fingerprint's comparison, without a database. The capture is
// proved on a real Postgres in schema-fingerprint.realstack.test.ts.
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import {
  EXCLUDED_DEFAULT_ACL_ROLES,
  FINGERPRINT_SQL,
  FINGERPRINT_VERSION,
  buildFingerprint,
  diffFingerprints,
  runCli,
} from "../../../../scripts/release/schema-fingerprint.mjs";

const scratch = mkdtempSync(path.join(tmpdir(), "fingerprint-unit-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

const one = buildFingerprint([["schema public", '{"owner":"postgres"}']]);
const empty = buildFingerprint([]);

// Review H8: two empty fingerprints would compare equal, so a replay or a
// target that captured nothing would pass the gate.
describe("schema fingerprint comparison", () => {
  it("refuses a fingerprint with no objects on either side", () => {
    expect(() => diffFingerprints(empty, empty)).toThrow(
      /expected fingerprint holds no objects/,
    );
    expect(() => diffFingerprints(one, empty)).toThrow(
      /actual fingerprint holds no objects/,
    );
    expect(() => diffFingerprints(empty, one)).toThrow(/holds no objects/);
    expect(diffFingerprints(one, one)).toMatchObject({ equal: true });
  });

  it("makes the compare command fail on two empty files", () => {
    const a = path.join(scratch, "a.json");
    const b = path.join(scratch, "b.json");
    writeFileSync(a, JSON.stringify(empty));
    writeFileSync(b, JSON.stringify(empty));
    expect(() => runCli(["compare", a, b], { log: () => {} })).toThrow(
      /holds no objects/,
    );
  });
});

// Review L4: every role's default privileges are fingerprinted, but for the
// named platform roles a replay cannot reproduce. The list is pinned, each
// with its reason, and the query names each one.
describe("the default privileges the fingerprint leaves out", () => {
  it("names supabase_admin only, with its reason", () => {
    expect(Object.keys(EXCLUDED_DEFAULT_ACL_ROLES)).toEqual(["supabase_admin"]);
    for (const reason of Object.values(EXCLUDED_DEFAULT_ACL_ROLES))
      expect(reason.length).toBeGreaterThan(40);
    expect(FINGERPRINT_SQL).toContain("'supabase_admin'");
    expect(FINGERPRINT_SQL).not.toContain("defaclrole = 'postgres'::regrole");
  });

  it("is version 3, which reads every role's default privileges", () => {
    expect(FINGERPRINT_VERSION).toBe(3);
  });
});
