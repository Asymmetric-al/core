import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it.each(["email", "pdf"])(
  "connects %s fullscreen to the shell using its own root",
  (studio) => {
    const source = readFileSync(
      `apps/admin/app/(app)/${studio}/page-client.tsx`,
      "utf8",
    );
    expect(source).toContain(
      'from "@/components/studio/shell-navigation-guard"',
    );
    expect(source).toContain("const rootRef = useRef<HTMLDivElement>(null)");
    expect(source).toMatch(
      /useStudioFullscreen\((?:ui\.)?isFullscreen, rootRef\)/,
    );
    expect(source).toMatch(/<div\s+ref=\{rootRef\}/);
  },
);

it("loads Sign Studio as a page rather than a nonexistent table", () => {
  const source = readFileSync("apps/admin/app/(app)/sign/loading.tsx", "utf8");
  expect(source).toContain('PageShellSkeleton label="Loading Sign Studio…"');
  expect(source).not.toContain("TableSkeleton");
});
