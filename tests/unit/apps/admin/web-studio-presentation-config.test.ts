import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const config = readFileSync(
  path.join(process.cwd(), "apps/admin/payload.config.ts"),
  "utf8",
);

describe("Web Studio presentation config", () => {
  it("pins the embedded admin to light mode", () => {
    expect(config).toMatch(/admin:\s*{\s*theme:\s*"light"/);
  });
  it("uses neutral empty stock labels without replacing native title cells", () => {
    expect(config).toMatch(
      /i18n:\s*{\s*translations:\s*{\s*en:\s*{\s*general:\s*{\s*noLabel:\s*"Not set"/,
    );
    expect(config).not.toContain("StudioTitleCell");
  });
});
