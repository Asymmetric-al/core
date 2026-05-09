import { describe, expect, it } from "vitest";

import {
  createDefaultExtensions,
  viewerExtensions,
} from "../../../../../../../packages/ui/components/shadcn/rich-text-editor/extensions";

function getExtension(extensions: { name: string }[], name: string) {
  return extensions.find((extension) => extension.name === name);
}

describe("rich-text-editor/extensions", () => {
  it("builds default editor extensions with starterKit, image, and placeholder", () => {
    const extensions = createDefaultExtensions({ placeholder: "Custom body" });

    expect(getExtension(extensions, "starterKit")).toBeTruthy();
    expect(getExtension(extensions, "image")).toBeTruthy();
    expect(getExtension(extensions, "placeholder")).toBeTruthy();
  });

  it("configures editor links as non-clickable and viewer links as clickable", () => {
    const editorStarterKit = getExtension(
      createDefaultExtensions(),
      "starterKit",
    ) as { options?: Record<string, unknown> };
    const viewerStarterKit = getExtension(viewerExtensions, "starterKit") as {
      options?: Record<string, unknown>;
    };

    const editorLinkOptions = editorStarterKit.options?.link as Record<
      string,
      unknown
    >;
    const viewerLinkOptions = viewerStarterKit.options?.link as Record<
      string,
      unknown
    >;

    expect(editorLinkOptions?.openOnClick).toBe(false);
    expect(viewerLinkOptions?.openOnClick).toBe(true);
  });

  it("keeps image allowBase64 disabled and heading limited to h1/h2", () => {
    const starterKit = getExtension(
      createDefaultExtensions(),
      "starterKit",
    ) as {
      options?: Record<string, unknown>;
    };
    const image = getExtension(createDefaultExtensions(), "image") as {
      options?: Record<string, unknown>;
    };

    const heading = starterKit.options?.heading as Record<string, unknown>;

    expect(heading?.levels).toEqual([1, 2]);
    expect(image.options?.allowBase64).toBe(false);
  });

  it("applies secure link HTML attributes and URL guards", () => {
    const starterKit = getExtension(
      createDefaultExtensions(),
      "starterKit",
    ) as {
      options?: Record<string, unknown>;
    };

    const link = starterKit.options?.link as Record<string, unknown>;
    const htmlAttributes = link?.HTMLAttributes as Record<string, unknown>;
    const isAllowedUri = link?.isAllowedUri as (url: string) => boolean;

    expect(htmlAttributes.target).toBe("_blank");
    expect(htmlAttributes.rel).toBe("noopener noreferrer");
    expect(typeof isAllowedUri).toBe("function");
    expect(isAllowedUri("https://example.com")).toBe(true);
    expect(isAllowedUri("javascript:alert(1)")).toBe(false);
  });
});
