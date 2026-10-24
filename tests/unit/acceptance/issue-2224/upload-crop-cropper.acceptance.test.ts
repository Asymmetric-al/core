/**
 * #2224 acceptance: the cropper tests in tests/e2e/upload-crop.spec.ts run
 * against a modelled donor settings page (spec r1 §4 criteria 2, 3, 4).
 * Each world knob below is one of the §4 mutation checks or a §1 negative.
 *
 * Owned by Acceptance; implementers must not edit this file, the harness, or
 * the fixtures in this directory.
 * Spec: https://github.com/Asymmetric-al/core/issues/2224#issuecomment-6369737684
 */
import { describe, expect, it } from "vitest";

import {
  CROPPER_TESTS,
  functionBody,
  loadSpec,
  pick,
  runFresh,
  specSource,
} from "./harness";

describe("#2224 criterion 2: openAvatarCropper asserts the fixture and the Crop Image dialog", () => {
  it("openAvatarCropper no longer returns a boolean", () => {
    const body = functionBody(specSource(), "openAvatarCropper");
    expect(
      body,
      "openAvatarCropper is still defined in the spec (§1.1)",
    ).toBeDefined();
    expect(body).not.toMatch(/Promise<boolean>/);
    expect(body).not.toMatch(/return\s+(true|false)\b/);
  });

  it("openAvatarCropper names the Crop Image dialog", () => {
    expect(functionBody(specSource(), "openAvatarCropper")).toMatch(
      /Crop Image/,
    );
  });

  it("the open test passes when the chooser opens the Crop Image dialog", async () => {
    const r = await runFresh(pick.open);
    expect(r.outcome, r.details.join("\n")).toBe("passed");
    expect(
      r.world.inputFiles
        .flatMap((x) => x.files)
        .some((f) => f.name === "test-image.png"),
    ).toBe(true);
  });

  it.each(CROPPER_TESTS)(
    "the %s test fails (not skips, not passes) when test-image.png is missing",
    async (which) => {
      const r = await runFresh(pick[which], { fixtureMissing: true });
      expect(r.outcome, `${which}: ${r.details.join("\n")}`).toBe("failed");
    },
  );

  it("the open test fails when choosing the image opens no dialog", async () => {
    const r = await runFresh(pick.open, { chooserOpensDialog: false });
    expect(r.outcome).toBe("failed");
  });

  it("the open test fails when the dialog is not the Crop Image dialog", async () => {
    const r = await runFresh(pick.open, { dialogTitle: "Edit Image" });
    expect(r.outcome).toBe("failed");
  });

  it("the zoom/rotation test still passes against the real dialog", async () => {
    const r = await runFresh(pick.zoom);
    expect(r.outcome, r.details.join("\n")).toBe("passed");
  });
});

describe("#2224 criterion 3: the mobile test asserts boundingBox() is not null before width <= 375", () => {
  it("passes on a 375px viewport with a fitting dialog", async () => {
    const r = await runFresh(pick.mobile);
    expect(r.outcome, r.details.join("\n")).toBe("passed");
    expect(r.world.viewport.width).toBe(375);
  });

  it("fails when boundingBox() returns null", async () => {
    const r = await runFresh(pick.mobile, { dialogBox: null });
    expect(r.outcome).toBe("failed");
  });

  it("fails when the dialog is wider than 375px", async () => {
    const r = await runFresh(pick.mobile, {
      dialogBox: { x: 0, y: 0, width: 400, height: 500 },
    });
    expect(r.outcome).toBe("failed");
  });

  it("the not-null assertion comes before the width check", () => {
    const src = pick.mobile(loadSpec()).src;
    const nn = src.search(
      /\.not\s*\.\s*toBeNull\(|\.toBeTruthy\(|\.toBeDefined\(|\.not\s*\.\s*toBe\(\s*null|\.not\s*\.\s*toBeFalsy\(|if\s*\(\s*!\s*\w+\s*\)\s*throw/,
    );
    const width = src.search(/toBeLessThanOrEqual\(\s*375\s*\)/);
    expect(nn, "a not-null assertion on the box").toBeGreaterThanOrEqual(0);
    expect(width, "the width <= 375 check").toBeGreaterThanOrEqual(0);
    expect(nn).toBeLessThan(width);
  });
});

describe("#2224 criterion 4: cancel observes the real avatar and checks nothing was uploaded", () => {
  it("passes with an initials fallback avatar", async () => {
    const r = await runFresh(pick.cancel, { avatar: { fallback: "DD" } });
    expect(r.outcome, r.details.join("\n")).toBe("passed");
  });

  it("passes with an image avatar", async () => {
    const r = await runFresh(pick.cancel, {
      avatar: {
        src: "http://localhost:3001/avatars/donor.png",
        fallback: "DD",
      },
    });
    expect(r.outcome, r.details.join("\n")).toBe("passed");
  });

  it("mutation A: fails when the Cancel button is removed", async () => {
    const r = await runFresh(pick.cancel, { cancelButton: false });
    expect(r.outcome).toBe("failed");
  });

  it("fails when the observed avatar does not exist (no null observation)", async () => {
    const r = await runFresh(pick.cancel, { avatar: null });
    expect(r.outcome).toBe("failed");
  });

  it("fails when Cancel leaves the dialog open", async () => {
    const r = await runFresh(pick.cancel, { cancelCloses: false });
    expect(r.outcome).toBe("failed");
  });

  it.each([
    ["fallback", { fallback: "DD" }],
    [
      "image",
      { src: "http://localhost:3001/avatars/donor.png", fallback: "DD" },
    ],
  ])("fails when Cancel changes the %s avatar", async (_k, avatar) => {
    const r = await runFresh(pick.cancel, {
      avatar,
      cancelChangesAvatar: true,
    });
    expect(r.outcome).toBe("failed");
  });

  it("fails when Cancel sends a request to /api/upload/image", async () => {
    const r = await runFresh(pick.cancel, { cancelEmitsUploadRequest: true });
    expect(r.outcome).toBe("failed");
  });

  it('fails when Cancel shows the "Image uploaded successfully" toast', async () => {
    const r = await runFresh(pick.cancel, { cancelShowsSuccessToast: true });
    expect(r.outcome).toBe("failed");
  });

  it("the cancel test no longer swallows a missing observation", () => {
    const src = specSource();
    expect(src).toContain("Upload public avatar");
    expect(src).not.toMatch(/img\[alt="Uploaded"\]/);
    expect(pick.cancel(loadSpec()).src).not.toMatch(
      /\.catch\(\s*\(\)\s*=>\s*null\s*\)/,
    );
  });
});
