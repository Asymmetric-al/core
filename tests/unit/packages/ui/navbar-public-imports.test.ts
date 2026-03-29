import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const navbarPath = fileURLToPath(
  new URL("../../../../packages/ui/components/public/navbar.tsx", import.meta.url),
);

describe("packages/ui public Navbar", () => {
  it("imports site config from the client-safe module (avoids server env in the browser bundle)", () => {
    const source = readFileSync(navbarPath, "utf8");
    expect(source).toMatch(
      /from\s+["']@asym\/config\/site-client["']/,
    );
    expect(source).not.toMatch(/@asym\/config\/site["']/);
  });
});
