import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../../", import.meta.url);

function shellSource() {
  return readFileSync(new URL("apps/admin/app/mc-shell.tsx", root), "utf8");
}

describe("Mission Control shell scrolling", () => {
  it("lets the page scroll the window, so the header and sticky toolbars stay in view", () => {
    const source = shellSource();
    const shell = source.slice(source.indexOf("function ApplicationShell"));
    // An overflow-hidden or overflow-auto ancestor that never scrolls becomes
    // the sticky container: the header (sticky top-0) and the grid selection
    // bars (sticky top-14) would then scroll away with the page.
    const column = shell.match(/<div className="([^"]*)">\s*\{!fullscreen/);
    expect(column).not.toBeNull();
    expect(column![1]).not.toMatch(/overflow-(hidden|auto|scroll)/);
    expect(column![1].split(" ")).toContain("min-w-0");

    const main = shell.match(
      /<RouteMainViewTransitionBoundary className="([^"]*)"/,
    );
    expect(main).not.toBeNull();
    expect(main![1]).not.toMatch(/overflow-(hidden|auto|scroll)/);
    expect(main![1].split(" ")).toContain("min-w-0");
  });

  it("keeps the pinned header opaque, so scrolled content never shows through", () => {
    const source = shellSource();
    const header = source.match(/<header className="([^"]*)"/);
    expect(header).not.toBeNull();
    const classes = header![1].split(" ");
    expect(classes).toContain("bg-background");
    expect(header![1]).not.toMatch(/bg-background\/\d+|backdrop-blur/);
  });
});
