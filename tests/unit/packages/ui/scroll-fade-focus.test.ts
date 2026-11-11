import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, it } from "vitest";

// A CSS mask clips everything the masked element paints outside its box,
// including the ScrollArea viewport's focus ring and outline. The edge fade
// must therefore switch off while the (focusable) viewport has keyboard focus.
it("keeps the ScrollArea viewport focus ring visible under the edge fade", () => {
  const css = readFileSync(
    path.resolve(__dirname, "../../../../packages/ui/styles/globals.css"),
    "utf8",
  );
  const utility = css.slice(
    css.indexOf("@utility scroll-fade-x"),
    css.indexOf("/* Preserve the task board"),
  );
  expect(utility).toContain("mask-image: linear-gradient(");
  expect(utility).toMatch(/&:focus-visible\s*\{\s*mask-image:\s*none;\s*\}/);
});
