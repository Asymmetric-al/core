import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@asym/ui/fonts", () => ({ fontVariables: "admin-font-variables" }));
import GlobalNotFound from "../../../../apps/admin/app/global-not-found";

const root = new URL("../../../../", import.meta.url);
describe("admin root and global recovery", () => {
  it("loads the app fonts and shared Empty pattern without relying on a layout", () => {
    const html = renderToStaticMarkup(<GlobalNotFound />);
    expect(html).toContain("admin-font-variables");
    expect(html).toContain('data-slot="empty"');
    expect(html).toMatch(/<h1[^>]*>Page not found<\/h1>/);
    expect(html).toContain('href="/"');
  });
  it("has one root theme owner and a light-only theme color without duplicate meta", () => {
    const layout = readFileSync(
      new URL("apps/admin/app/layout.tsx", root),
      "utf8",
    );
    const shell = readFileSync(
      new URL("apps/admin/app/mc-shell.tsx", root),
      "utf8",
    );
    expect(layout).toContain('themeColor: "#ffffff"');
    expect(layout).not.toContain('<meta name="theme-color"');
    expect(shell).not.toContain("ThemeProvider");
    expect(layout.match(/<ThemeProvider\b/g)).toHaveLength(1);
    expect(layout).toContain("<TooltipProvider delay={0}>");
  });
});
