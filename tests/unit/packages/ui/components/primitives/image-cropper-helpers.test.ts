import { describe, expect, it } from "vitest";

import {
  preloadImageSource,
  shouldDisplayCropperPreloadFailure,
} from "../../../../../../packages/ui/components/primitives/image-cropper-helpers";

describe("image-cropper helpers", () => {
  it("resolves when the image factory reports a successful load", async () => {
    await expect(
      preloadImageSource("data:image/png;base64,ok", () => {
        return {
          set src(_value: string) {
            queueMicrotask(() => {
              this.onload?.();
            });
          },
          onload: null,
          onerror: null,
        };
      }),
    ).resolves.toBeUndefined();
  });

  it("rejects when the image factory reports a failed load", async () => {
    await expect(
      preloadImageSource("data:image/png;base64,bad", () => {
        return {
          set src(_value: string) {
            queueMicrotask(() => {
              this.onerror?.(new Error("bad image"));
            });
          },
          onload: null,
          onerror: null,
        };
      }),
    ).rejects.toThrow("bad image");
  });

  it("ignores preload failures once the cropper has already loaded the image", () => {
    expect(
      shouldDisplayCropperPreloadFailure({
        cropperHasLoaded: true,
        loadAttempt: 2,
        activeLoadAttempt: 2,
      }),
    ).toBe(false);
  });

  it("ignores stale preload failures from an older image load attempt", () => {
    expect(
      shouldDisplayCropperPreloadFailure({
        cropperHasLoaded: false,
        loadAttempt: 1,
        activeLoadAttempt: 2,
      }),
    ).toBe(false);
  });

  it("surfaces preload failures only for the active image when the cropper never loads", () => {
    expect(
      shouldDisplayCropperPreloadFailure({
        cropperHasLoaded: false,
        loadAttempt: 3,
        activeLoadAttempt: 3,
      }),
    ).toBe(true);
  });
});
