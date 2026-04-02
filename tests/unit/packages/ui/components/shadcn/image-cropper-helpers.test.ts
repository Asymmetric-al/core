import { describe, expect, it } from "vitest";

import { preloadImageSource } from "../../../../../../packages/ui/components/shadcn/image-cropper-helpers";

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
});
