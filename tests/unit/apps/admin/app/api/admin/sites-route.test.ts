import { describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  factory: vi.fn(),
}));

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
});

vi.mock("@asym/api/admin/sites/settings", () => ({
  GET: h.get,
  createSitePost: (step: unknown) => {
    h.factory(step);
    return h.post;
  },
}));

const root = new URL("../../../../../../../", import.meta.url);

describe("AL-2679 WP6 rest: Mission Control's Sites route", () => {
  it("creates through the package's handler with the admin app's CMS step, and reads through the package's GET", async () => {
    const route = await import(
      new URL("apps/admin/app/api/admin/sites/route.ts", root).href
    );
    const { presentCreatedSite } = await import(
      new URL("apps/admin/src/cms/site-created.ts", root).href
    );
    expect(route.GET).toBe(h.get);
    expect(route.POST).toBe(h.post);
    expect(h.factory).toHaveBeenCalledTimes(1);
    expect(h.factory).toHaveBeenCalledWith(presentCreatedSite);
    expect(presentCreatedSite).toEqual(expect.any(Function));
  });
});
