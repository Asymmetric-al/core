import { describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
});

import ContributionsPage from "../../../../../apps/admin/app/contributions/page";
import { fetchAdminContributions } from "../../../../../apps/admin/app/contributions/use-admin-contributions";
import { mockContributions } from "../../../../../apps/admin/app/contributions/data";

describe("apps/admin/app/contributions/page", () => {
  it("exports a client component (function) that renders the contributions UI", () => {
    expect(typeof ContributionsPage).toBe("function");
  });

  it("contains the Boneyard integration and no longer uses a timeout gate", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile("apps/admin/app/contributions/page.tsx", "utf8"),
    );

    expect(source).toContain('name="admin-contributions-content"');
    expect(source).toContain("useAdminContributions");
    expect(source).not.toContain("setTimeout");
    expect(source).not.toContain("const [isLoading] = useState(false);");
  });

  it("loads mock contributions through an async query-backed fetcher", async () => {
    vi.useFakeTimers();

    try {
      let settled = false;
      const fetchPromise = fetchAdminContributions({ delayMs: 25 }).then(
        (data) => {
          settled = true;
          return data;
        },
      );

      await Promise.resolve();
      expect(settled).toBe(false);

      await vi.advanceTimersByTimeAsync(25);
      await expect(fetchPromise).resolves.toEqual(mockContributions);
    } finally {
      vi.useRealTimers();
    }
  });
});
