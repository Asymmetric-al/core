/**
 * #2224 acceptance: the new image-utils unit file pins the real validation
 * (spec r1 §1.6, §4 criterion 8). The file is run under Vitest once as is and
 * once per mutant of packages/lib/image-utils.ts (served by
 * fixtures/image-utils-mutant.config.mts); every mutant must turn it red.
 *
 * Owned by Acceptance; implementers must not edit this file, the harness, or
 * the fixtures in this directory.
 * Spec: https://github.com/Asymmetric-al/core/issues/2224#issuecomment-6369737684
 */
import { beforeAll, describe, expect, it } from "vitest";

import {
  IMAGE_UTILS,
  IMAGE_UTILS_MUTANTS,
  UNIT_FILE_CANDIDATES,
  type UnitRun,
  read,
  runUnitFile,
  unitFile,
} from "./harness";

const file = unitFile();
const runs = new Map<string, UnitRun>();

beforeAll(async () => {
  if (!file) return;
  const original = read(IMAGE_UTILS);
  const jobs: [string, string | undefined][] = [
    ["original", undefined],
    ...IMAGE_UTILS_MUTANTS.map((m): [string, string] => {
      if (!original.includes(m.from))
        throw new Error(
          `mutant ${m.id}: "${m.from}" not found in image-utils.ts`,
        );
      return [m.id, original.replace(m.from, m.to)];
    }),
  ];
  const queue = [...jobs];
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      for (let job = queue.shift(); job; job = queue.shift())
        runs.set(job[0], await runUnitFile(file, job[1]));
    }),
  );
}, 600_000);

describe("#2224 criterion 8: a unit file pins the image-utils size and type rules", () => {
  it(`exists at ${UNIT_FILE_CANDIDATES[0]} (or the #2214 rename)`, () => {
    expect(file, UNIT_FILE_CANDIDATES.join(" or ")).toBeDefined();
  });

  it("passes against the real image-utils with at least the six §1.6 cases", () => {
    expect(file).toBeDefined();
    const r = runs.get("original")!;
    expect(r.status, r.output).toBe(0);
    expect(r.numFailed, r.output).toBe(0);
    expect(r.numTotal, r.output).toBeGreaterThanOrEqual(6);
  });

  it("fakes sizes with Object.defineProperty instead of allocating them", () => {
    expect(file).toBeDefined();
    const src = read(file!);
    expect(src).toMatch(/Object\.defineProperty\([^;]*["'`]size["'`]/s);
    expect(src).not.toMatch(
      /(alloc\w*|ArrayBuffer|Uint8Array)\(\s*(50\s*\*|MAX_SAFEGUARD|52_?428_?80)/,
    );
    expect(src).toMatch(/validateImageFile/);
  });

  it.each(IMAGE_UTILS_MUTANTS.map((m) => [m.id, m.why] as const))(
    "fails when %s (%s)",
    (id) => {
      expect(file).toBeDefined();
      const r = runs.get(id)!;
      expect(r.numTotal, r.output).toBeGreaterThanOrEqual(6);
      expect(r.numFailed, r.output).toBeGreaterThan(0);
      expect(r.status, r.output).not.toBe(0);
    },
  );
});
