/**
 * #2224 acceptance: self-check (spec r1 §4 criterion 16). The harness must
 * flag the pre-fix spec (fixtures/baseline-upload-crop.spec.ts.txt, the
 * 4e31ff33/a200250f upload-crop.spec.ts) on the defects #2224 names, and the
 * acceptance files must be picked up by `test:unit`.
 *
 * Owned by Acceptance; implementers must not edit this file, the harness, or
 * the fixtures in this directory.
 * Spec: https://github.com/Asymmetric-al/core/issues/2224#issuecomment-6369737684
 */
import path from "node:path";

import { describe, expect, it } from "vitest";

import { BASELINE_SPEC, ROOT, loadSpec, pick, read, runFresh } from "./harness";

const source = read(BASELINE_SPEC);
const opts = { source };

describe("#2224 criterion 16: the acceptance suite runs under test:unit and fails the pre-fix spec", () => {
  it("test:unit includes tests/unit/acceptance/**", () => {
    expect(read(path.join(ROOT, "vitest.config.mts"))).toMatch(
      /tests\/unit\/\*\*\/\*\.test\.ts/,
    );
  });

  it("the pre-fix spec has the bypass, the 14 tests and the canvas beforeAll", () => {
    expect(source).toMatch(/if \(await openAvatarCropper/);
    const reg = loadSpec(opts);
    expect(reg.tests).toHaveLength(14);
    expect(reg.hooks.some((h) => h.kind === "beforeAll")).toBe(true);
  });

  it("the pre-fix open test passes with no fixture (vacuous pass)", async () => {
    expect(
      (await runFresh(pick.open, { fixtureMissing: true }, opts)).outcome,
    ).toBe("passed");
  });

  it("the pre-fix cancel test passes with no avatar to observe", async () => {
    expect((await runFresh(pick.cancel, { avatar: null }, opts)).outcome).toBe(
      "passed",
    );
  });

  it("the pre-fix drag test passes when drop does nothing", async () => {
    expect(
      (await runFresh(pick.drag, { dropOpensDialog: false }, opts)).outcome,
    ).toBe("passed");
  });

  it("the pre-fix invalid test passes on a generic error message", async () => {
    const r = await runFresh(
      pick.invalid,
      { invalidMessage: "Invalid file. Please select an image." },
      opts,
    );
    expect(r.outcome).toBe("passed");
  });

  it("the pre-fix readiness check ignores a 503", async () => {
    const r = await runFresh(
      pick.open,
      { demo: { status: 503, body: { roles: { donor: true } } } },
      opts,
    );
    expect(r.outcome).toBe("passed");
  });

  it("the pre-fix beforeEach skips under CI", async () => {
    const r = await runFresh(
      pick.open,
      { demo: { status: 500, body: {} } },
      { ...opts, env: { CI: "1" } },
    );
    expect(r.outcome).toBe("skipped");
  });
});
