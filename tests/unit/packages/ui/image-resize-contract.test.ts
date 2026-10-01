import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const source = readFileSync(
  fileURLToPath(
    new URL(
      "../../../../packages/ui/components/shadcn/rich-text-editor/image-view.tsx",
      import.meta.url,
    ),
  ),
  "utf8",
);

describe("image resize source contract", () => {
  it("wires both live handles to the shared separator", () => {
    expect(source).toMatch(/<ImageResizeHandle[\s\S]*side="left"/);
    expect(source).toMatch(/<ImageResizeHandle[\s\S]*side="right"/);
    expect(source).toMatch(/aria-valuemin/);
    expect(source).toMatch(/aria-valuemax/);
    expect(source).toMatch(/aria-valuenow/);
  });

  it("types window drag listeners as DOM events, not React synthetic events", () => {
    expect(source).toMatch(
      /function handleMouseMove\(e: globalThis\.MouseEvent\)/,
    );
    expect(source).toMatch(
      /function handleTouchMove\(e: globalThis\.TouchEvent\)/,
    );
  });
});
