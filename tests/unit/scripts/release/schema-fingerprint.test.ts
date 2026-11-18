// The schema fingerprint's comparison, without a database. The capture is
// proved on a real Postgres in schema-fingerprint.realstack.test.ts.
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import {
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
