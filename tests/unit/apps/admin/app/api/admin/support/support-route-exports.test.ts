import { describe, expect, it, vi } from "vitest";

const { packageGetMock, packagePostMock } = vi.hoisted(() => ({
  packageGetMock: vi.fn(),
  packagePostMock: vi.fn(),
}));

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
});

vi.mock("@asym/api/admin/support/tickets", () => ({
  GET: packageGetMock,
  POST: packagePostMock,
}));

const root = new URL("../../../../../../../../", import.meta.url);

describe("admin support App Router exports", () => {
  it("re-exports GET and POST for support tickets", async () => {
    const route = await import(
      new URL(
        "apps/admin/app/api/admin/support/tickets/route.ts",
        root,
      ).href
    );

    expect(route.GET).toEqual(expect.any(Function));
    expect(route.POST).toEqual(expect.any(Function));
  });
});
