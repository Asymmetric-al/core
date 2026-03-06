import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("admin dashboard route", () => {
  it("delegates to the shared live DashboardHome component", () => {
    const pageSource = readFileSync(
      path.join(process.cwd(), "apps/admin/app/page.tsx"),
      "utf8",
    );

    expect(pageSource).toContain(
      'import { DashboardHome } from "@asym/missionary/components/dashboard-home";',
    );
    expect(pageSource).toContain("<DashboardHome />");
  });
});
