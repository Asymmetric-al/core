import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

describe("Web Studio single chrome", () => {
  it("orders Payload's layers between Tailwind base and utilities before Tailwind loads", () => {
    const layout = read("apps/admin/app/layout.tsx");
    const orderImport = layout.indexOf('import "./css-layer-order.css";');
    const globalsImport = layout.indexOf('import "./globals.css";');
    expect(orderImport).toBeGreaterThan(-1);
    expect(globalsImport).toBeGreaterThan(orderImport);

    const order = read("apps/admin/app/css-layer-order.css");
    const statement = order.match(/@layer\s+([^;]+);/)?.[1] ?? "";
    expect(statement.split(",").map((name) => name.trim())).toEqual([
      "properties",
      "theme",
      "base",
      "payload-default",
      "payload",
      "components",
      "utilities",
    ]);
    // Nothing but the order statement (and comments) may live here.
    expect(
      order
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/@layer\s+[^;]+;/, "")
        .trim(),
    ).toBe("");
  });

  it("keeps Payload's stock table wrapper a flex column now that utilities win", () => {
    const styles = read("apps/admin/src/styles/payloadStyles.css");
    expect(styles).toMatch(/div\.table\s*{[^}]*display:\s*flex/);
  });

  it("registers Studio chrome for Payload's template instead of the extra cards", () => {
    const config = read("apps/admin/payload.config.ts");
    expect(config).not.toContain("beforeNav");
    expect(config).not.toContain("/src/cms-ui/root/Header.tsx#Header");
    expect(config).not.toContain("/src/cms-ui/root/Nav.tsx#Nav");
    expect(config).toContain(
      "/src/cms-ui/web-studio/shell/studio-template-chrome.tsx#StudioTemplateHeader",
    );
    expect(config).toContain(
      "/src/cms-ui/web-studio/shell/studio-template-chrome.tsx#StudioTemplateNav",
    );
    expect(config).toContain(
      "/src/cms-ui/web-studio/dashboard/WebStudioDashboardView.tsx#WebStudioDashboardView",
    );
  });

  it("hides Payload's own header bars while keeping its document actions", () => {
    const styles = read("apps/admin/src/styles/payloadStyles.css");
    expect(styles).toMatch(
      /\.template-default\s+\.app-header\s*{[^}]*display:\s*none/,
    );
    expect(styles).toMatch(
      /:has\(\[data-web-studio-native-document\]\)\s+\.doc-header\s*{[^}]*display:\s*none/,
    );
    expect(styles).not.toMatch(/\.doc-controls\s*{[^}]*display:\s*none/);
  });

  it("marks the native shell so template chrome can step aside", () => {
    const layout = read(
      "apps/admin/src/cms-ui/web-studio/shell/studio-layout.tsx",
    );
    expect(layout).toContain('data-testid="web-studio-native-shell"');
    expect(layout).toContain("data-web-studio-shell");
  });
});
