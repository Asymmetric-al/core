/** #2407 PR (a) criterion 17 (B): editor image purpose set and path builder. */
import { describe, expect, it } from "vitest";

import {
  editorImagePath,
  isEditorImagePurpose,
} from "../../../../../packages/api/src/editor-images/key";

const TENANT = "11111111-1111-4111-8111-111111111111";
const USER = "22222222-2222-4222-8222-222222222222";
const UUID =
  "[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";

describe("#2407a editor image key (B)", () => {
  it.each(["feed", "care-thread", "care-note"])("accepts purpose %s", (p) => {
    expect(isEditorImagePurpose(p)).toBe(true);
  });

  it.each([
    null,
    undefined,
    "",
    "FEED",
    " feed",
    "editor",
    "avatars",
    "care",
    1,
  ])("rejects purpose %j", (p) => {
    expect(isEditorImagePurpose(p)).toBe(false);
  });

  it.each([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
    ["image/gif", "gif"],
  ] as const)(
    "builds editor/{tenant}/{user}/{uuid}.ext for %s",
    (type, ext) => {
      const path = editorImagePath({ tenantId: TENANT, userId: USER, type });
      expect(path).toMatch(
        new RegExp(`^editor/${TENANT}/${USER}/${UUID}\\.${ext}$`),
      );
    },
  );

  it("uses a fresh uuid for every key", () => {
    const input = {
      tenantId: TENANT,
      userId: USER,
      type: "image/png" as const,
    };
    expect(editorImagePath(input)).not.toBe(editorImagePath(input));
  });
});
