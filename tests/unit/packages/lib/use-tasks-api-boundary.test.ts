import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("missionary task hook API boundary", () => {
  it("uses the missionary task BFF routes instead of direct client Supabase writes", () => {
    const source = readRepoFile("packages/lib/hooks/use-tasks.ts");

    expect(source).not.toMatch(/createBrowserClient/);
    expect(source).not.toMatch(/from\("missionary_tasks"\)/);
    expect(source).toContain("/api/missionary/tasks");
    expect(source).not.toMatch(/notes:/);
    expect(source).not.toMatch(/reminder_date:/);
  });
});
