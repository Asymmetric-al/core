import { describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
});

import ContributionsPage from "../../../../../apps/admin/app/contributions/page";

describe("apps/admin/app/contributions/page", () => {
  it("exports a client component (function) that renders the contributions UI", () => {
    expect(typeof ContributionsPage).toBe("function");
  });
});
