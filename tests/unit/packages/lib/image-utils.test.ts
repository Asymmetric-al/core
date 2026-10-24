import { describe, expect, it } from "vitest";

import { validateImageFile } from "../../../../packages/lib/image-utils";

const MiB = 1024 * 1024;

/** A File double reporting `size` without allocating that many bytes. */
function fileOfSize(name: string, type: string, size: number) {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("validateImageFile", () => {
  it("accepts a PNG just over 2 MiB (no client-side 2 MB limit)", () => {
    expect(
      validateImageFile(fileOfSize("photo.png", "image/png", 2 * MiB + 1)),
    ).toEqual({ valid: true });
  });

  it("accepts a 10 MiB JPEG", () => {
    expect(
      validateImageFile(fileOfSize("photo.jpg", "image/jpeg", 10 * MiB)),
    ).toEqual({ valid: true });
  });

  it("accepts a file of exactly 50 MiB", () => {
    expect(
      validateImageFile(fileOfSize("photo.jpg", "image/jpeg", 50 * MiB)),
    ).toEqual({ valid: true });
  });

  it("rejects a file of 50 MiB + 1 byte as file_too_large", () => {
    expect(
      validateImageFile(fileOfSize("photo.jpg", "image/jpeg", 50 * MiB + 1)),
    ).toEqual({
      valid: false,
      error: "file_too_large",
      message: "File is extremely large (>50MB). Please use a smaller image.",
    });
  });

  it("rejects a .txt text/plain file as invalid_type", () => {
    expect(
      validateImageFile(fileOfSize("notes.txt", "text/plain", 20)),
    ).toEqual({
      valid: false,
      error: "invalid_type",
      message:
        "Unsupported file type. Please use .jpg, .jpeg, .png, .webp, .gif",
    });
  });

  it("accepts an allowed extension when the MIME type is empty (MIME or extension)", () => {
    expect(validateImageFile(fileOfSize("photo.png", "", 1024))).toEqual({
      valid: true,
    });
  });

  it("accepts an allowed MIME type when the extension is not allowed (MIME or extension)", () => {
    expect(
      validateImageFile(fileOfSize("photo.upload", "image/webp", 1024)),
    ).toEqual({ valid: true });
  });
});
