// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  PageShellSkeleton,
  ShellSkeleton,
} from "../../../../apps/admin/features/mission-control/components/patterns/skeletons";

afterEach(cleanup);
describe("shell loading frames", () => {
  it("announces once and exposes no private navigation while access is checked", () => {
    render(<ShellSkeleton />);
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status").textContent).toBe(
      "Loading Mission Control…",
    );
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.queryByRole("button")).toBeNull();
  });
  it("renders a page loading frame, not a records table", () => {
    render(<PageShellSkeleton label="Loading Administration…" />);
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status").textContent).toBe(
      "Loading Administration…",
    );
    expect(screen.queryByRole("table")).toBeNull();
  });
  it("keeps protected content behind the streaming authorization gate", () => {
    const source = readFileSync(
      join(process.cwd(), "apps/admin/app/(app)/layout.tsx"),
      "utf8",
    );
    expect(source).toContain("fallback={<ShellSkeleton />}");
    expect(source).toContain("<ProtectedShell>{children}</ProtectedShell>");
  });
});
