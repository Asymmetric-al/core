/**
 * #2224 acceptance: the accepted-types, drag/drop, invalid-type and
 * large-file-copy tests in tests/e2e/upload-crop.spec.ts, run against a
 * modelled donor settings page (spec r1 §4 criteria 5, 6, 7, 9).
 *
 * Owned by Acceptance; implementers must not edit this file, the harness, or
 * the fixtures in this directory.
 * Spec: https://github.com/Asymmetric-al/core/issues/2224#issuecomment-6369737684
 */
import { readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  ACCEPT_SET,
  FIXTURES_DIR,
  INVALID_PAYLOAD,
  TEST_IMAGE_BYTES,
  World,
  type RunResult,
  loadSpec,
  pick,
  runFresh,
  runTest,
  specSource,
} from "./harness";

const NAMES: Record<string, RegExp> = {
  "image/jpeg": /jpe?g/i,
  "image/png": /png/i,
  "image/webp": /webp/i,
  "image/gif": /gif/i,
};

/** Failure labels a reader sees first: failed step titles and soft-assertion messages. */
function failureLabels(r: RunResult) {
  return [
    ...r.steps.filter((s) => s.error).map((s) => s.title),
    ...r.softErrors.map((s) => s.message.split(/\n|: expected /)[0]!),
  ];
}

describe("#2224 criterion 5: one accepted-types test checks the exact accept set, one step per type", () => {
  it("passes on the real accept list with a single navigation", async () => {
    const r = await runFresh(pick.accept);
    expect(r.outcome, r.details.join("\n")).toBe("passed");
    expect(r.world.navigations).toHaveLength(1);
  });

  it("passes when the same four types appear in another order", async () => {
    const r = await runFresh(pick.accept, {
      accept: "image/gif,image/webp,image/png,image/jpeg",
    });
    expect(r.outcome, r.details.join("\n")).toBe("passed");
  });

  it.each(ACCEPT_SET)(
    "mutation B: fails when %s is dropped, and the failure names that type alone",
    async (type) => {
      const r = await runFresh(pick.accept, {
        accept: ACCEPT_SET.filter((t) => t !== type).join(","),
      });
      expect(r.outcome).toBe("failed");
      const others = ACCEPT_SET.filter((t) => t !== type).map((t) => NAMES[t]!);
      const specific = failureLabels(r).filter(
        (l) => NAMES[type]!.test(l) && !others.some((o) => o.test(l)),
      );
      expect(
        specific,
        `failure labels: ${JSON.stringify(failureLabels(r))}`,
      ).not.toEqual([]);
    },
  );

  it("fails when an extra type is accepted", async () => {
    const r = await runFresh(pick.accept, {
      accept: [...ACCEPT_SET, "image/svg+xml"].join(","),
    });
    expect(r.outcome).toBe("failed");
  });

  it("fails when the accept attribute is missing", async () => {
    const r = await runFresh(pick.accept, { accept: null });
    expect(r.outcome).toBe("failed");
  });

  it("exactly one test reads the accept attribute", () => {
    const reg = loadSpec();
    expect(
      reg.tests
        .filter((t) => /["'`]accept["'`]/.test(t.src))
        .map((t) => t.title),
    ).toHaveLength(1);
  });
});

describe("#2224 criterion 6: drag/drop dispatches dragover then drop with the fixture as a PNG File", () => {
  it("passes when a drop on the ImageUpload root opens the dialog", async () => {
    const r = await runFresh(pick.drag);
    expect(r.outcome, r.details.join("\n")).toBe("passed");
  });

  it("dispatches dragover before drop on the ImageUpload root, carrying the fixture bytes as image/png", async () => {
    const r = await runFresh(pick.drag);
    const onUpload = r.world.events.filter((e) => /^(root|input)-/.test(e.el));
    const types = onUpload.map((e) => e.type);
    expect(types).toContain("dragover");
    expect(types).toContain("drop");
    expect(types.indexOf("dragover")).toBeLessThan(types.lastIndexOf("drop"));
    const drop = onUpload.filter((e) => e.type === "drop").at(-1)!;
    expect(drop.files).toHaveLength(1);
    expect(drop.files[0]).toMatchObject({
      type: "image/png",
      size: TEST_IMAGE_BYTES,
    });
    expect(
      r.world.inputFiles.filter(
        (x) => x.via === "input" || x.via === "chooser",
      ),
    ).toEqual([]);
  });

  it("mutation C: fails when handleDrop is a no-op", async () => {
    const r = await runFresh(pick.drag, { dropOpensDialog: false });
    expect(r.outcome).toBe("failed");
  });

  it("fails when test-image.png is missing", async () => {
    const r = await runFresh(pick.drag, { fixtureMissing: true });
    expect(r.outcome).toBe("failed");
  });
});

describe("#2224 criterion 7: invalid type uses an in-memory payload and asserts the exact error, no dialog", () => {
  it("passes against the real validation, writing nothing under tests/e2e/fixtures", async () => {
    const before = readdirSync(FIXTURES_DIR).sort();
    const r = await runFresh(pick.invalid);
    expect(r.outcome, r.details.join("\n")).toBe("passed");
    expect(r.world.fsLog.fixtureWrites).toEqual([]);
    expect(r.world.fsLog.otherWrites).toEqual([]);
    expect(readdirSync(FIXTURES_DIR).sort()).toEqual(before);
  });

  it(`sends ${INVALID_PAYLOAD.name} as ${INVALID_PAYLOAD.mimeType}, in memory or from testInfo.outputPath`, async () => {
    const r = await runFresh(pick.invalid);
    const files = r.world.inputFiles.flatMap((x) => x.files);
    expect(files).toHaveLength(1);
    const f = files[0]!;
    if (f.path) {
      expect(f.path.startsWith(FIXTURES_DIR + path.sep), f.path).toBe(false);
      expect(f.path).toMatch(/acc-2224-out-/);
      expect(path.extname(f.path)).toBe(".txt");
    } else {
      expect(f).toMatchObject({
        name: INVALID_PAYLOAD.name,
        mimeType: INVALID_PAYLOAD.mimeType,
      });
    }
  });

  it("fails when the toast is a generic error rather than /Unsupported file type/", async () => {
    const r = await runFresh(pick.invalid, {
      invalidMessage: "Invalid file. Please select an image.",
    });
    expect(r.outcome).toBe("failed");
  });

  it("fails when no error toast appears", async () => {
    const r = await runFresh(pick.invalid, { invalidToast: false });
    expect(r.outcome).toBe("failed");
  });

  it("fails when the invalid file opens the cropper dialog", async () => {
    const r = await runFresh(pick.invalid, { invalidOpensDialog: true });
    expect(r.outcome).toBe("failed");
  });

  it("two concurrent runs sharing one filesystem both pass (--repeat-each=2 --workers=2)", async () => {
    const vfs = new Map<string, Buffer>();
    const a = loadSpec();
    const b = loadSpec();
    const [ra, rb] = await Promise.all([
      runTest(a, pick.invalid(a), new World({}, vfs)),
      runTest(b, pick.invalid(b), new World({}, vfs)),
    ]);
    expect(ra.outcome, ra.details.join("\n")).toBe("passed");
    expect(rb.outcome, rb.details.join("\n")).toBe("passed");
    expect([...vfs.keys()]).toEqual([]);
  });

  it("the spec no longer creates fixtures/test.txt", () => {
    expect(specSource()).not.toMatch(/["']test\.txt["']/);
  });
});

describe("#2224 criterion 9: the retitled large-file test checks the settings copy", () => {
  it("passes when the copy advertises large-file auto-optimization", async () => {
    const r = await runFresh(pick.large);
    expect(r.outcome, r.details.join("\n")).toBe("passed");
  });

  it("fails when the copy no longer advertises it", async () => {
    const r = await runFresh(pick.large, { largeFileCopy: false });
    expect(r.outcome).toBe("failed");
  });
});
