import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

import { revalidateTag } from "next/cache";

import {
  ADMIN_CACHE_TAGS,
  MEMBER_CARE_CACHE_TAGS,
  READ_CACHE_TAGS,
  revalidateAdminContributionsCache,
  revalidateAdminCrmCache,
  revalidateMemberCareCache,
} from "../../../../../packages/api/src/shared/cache-tags";

const revalidateTagMock = vi.mocked(revalidateTag);
let consoleErrorSpy: ReturnType<typeof vi.spyOn> | null = null;

/** The tag strings passed to revalidateTag, in call order. */
function revalidatedTags(): string[] {
  return revalidateTagMock.mock.calls.map(([tag]) => tag as string);
}

/** Every revalidation must use stale-while-revalidate ("max") semantics. */
function expectAllUseMaxProfile(): void {
  for (const call of revalidateTagMock.mock.calls) {
    expect(call[1]).toBe("max");
  }
}

function silenceExpectedConsoleErrors() {
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  return consoleErrorSpy;
}

afterEach(() => {
  consoleErrorSpy?.mockRestore();
  consoleErrorSpy = null;
});

describe("shared/cache-tags constant values", () => {
  // These strings are a cross-module contract: cached reads `cacheTag` them
  // and mutations `revalidateTag` them. A silent rename here breaks
  // invalidation, so the exact values are locked.
  it("locks the admin CRM tag strings", () => {
    expect(ADMIN_CACHE_TAGS.crm.base).toBe("admin:crm");
    expect(ADMIN_CACHE_TAGS.crm.tenant("t1")).toBe("admin:crm:tenant:t1");
    expect(ADMIN_CACHE_TAGS.crm.records).toBe("admin:crm:records");
    expect(ADMIN_CACHE_TAGS.crm.notes).toBe("admin:crm:notes");
    expect(ADMIN_CACHE_TAGS.crm.relationships).toBe("admin:crm:relationships");
    expect(ADMIN_CACHE_TAGS.crm.projections).toBe("admin:crm:projections");
    expect(ADMIN_CACHE_TAGS.crm.reports).toBe("admin:crm:reports");
  });

  it("locks the admin contributions tag strings", () => {
    expect(ADMIN_CACHE_TAGS.contributions.base).toBe("admin:contributions");
    expect(ADMIN_CACHE_TAGS.contributions.tenant("t1")).toBe(
      "admin:contributions:tenant:t1",
    );
    expect(ADMIN_CACHE_TAGS.contributions.list).toBe(
      "admin:contributions:list",
    );
    expect(ADMIN_CACHE_TAGS.contributions.stagedGifts).toBe(
      "admin:contributions:staged-gifts",
    );
    expect(ADMIN_CACHE_TAGS.contributions.summary).toBe(
      "admin:contributions:summary",
    );
  });

  it("locks the member-care tag strings shared by reads and mutations", () => {
    expect(MEMBER_CARE_CACHE_TAGS.base).toBe("member-care");
    expect(MEMBER_CARE_CACHE_TAGS.tenant("t1")).toBe("member-care:t1");
    expect(MEMBER_CARE_CACHE_TAGS.directory).toBe("member-care:directory");
    expect(MEMBER_CARE_CACHE_TAGS.activity).toBe("member-care:activity");
    expect(MEMBER_CARE_CACHE_TAGS.activityForMissionary("m1")).toBe(
      "member-care:activity:m1",
    );
    expect(MEMBER_CARE_CACHE_TAGS.privateNotes).toBe(
      "member-care:private-notes",
    );
  });

  it("locks the read-only dashboard/portal tag strings", () => {
    expect(READ_CACHE_TAGS.dashboardStats).toBe("dashboard-stats");
    expect(READ_CACHE_TAGS.dashboardHomeMissionary).toBe(
      "dashboard-home-missionary",
    );
    expect(READ_CACHE_TAGS.donorHistory).toBe("donor-history");
    expect(READ_CACHE_TAGS.donorProfile).toBe("donor-profile");
    expect(READ_CACHE_TAGS.missionaryMetrics).toBe("missionary-metrics");
    expect(READ_CACHE_TAGS.tenant("t1")).toBe("tenant:t1");
    expect(READ_CACHE_TAGS.donor("d1")).toBe("donor:d1");
    expect(READ_CACHE_TAGS.profile("p1")).toBe("profile:p1");
    expect(READ_CACHE_TAGS.missionary("m1")).toBe("missionary:m1");
  });
});

describe("revalidateAdminCrmCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revalidates every CRM read tag with the max profile when a tenant is known", () => {
    revalidateAdminCrmCache("tenant-1");

    expect(revalidatedTags()).toEqual([
      "admin:crm",
      "admin:crm:tenant:tenant-1",
      "admin:crm:records",
      "admin:crm:notes",
      "admin:crm:relationships",
      "admin:crm:projections",
      "admin:crm:reports",
    ]);
    expectAllUseMaxProfile();
  });

  it("omits the tenant tag when tenant context is absent", () => {
    revalidateAdminCrmCache(null);

    expect(revalidatedTags()).toEqual([
      "admin:crm",
      "admin:crm:records",
      "admin:crm:notes",
      "admin:crm:relationships",
      "admin:crm:projections",
      "admin:crm:reports",
    ]);
  });
});

describe("revalidateAdminContributionsCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revalidates every contributions read tag with the max profile when a tenant is known", () => {
    revalidateAdminContributionsCache("tenant-9");

    expect(revalidatedTags()).toEqual([
      "admin:contributions",
      "admin:contributions:tenant:tenant-9",
      "admin:contributions:list",
      "admin:contributions:staged-gifts",
      "admin:contributions:summary",
    ]);
    expectAllUseMaxProfile();
  });

  it("omits the tenant tag when tenant context is absent", () => {
    revalidateAdminContributionsCache(null);

    expect(revalidatedTags()).toEqual([
      "admin:contributions",
      "admin:contributions:list",
      "admin:contributions:staged-gifts",
      "admin:contributions:summary",
    ]);
  });

  it("keeps revalidating later tags when one tag fails", () => {
    const consoleError = silenceExpectedConsoleErrors();
    revalidateTagMock.mockImplementationOnce(() => {
      throw new Error("first tag failed");
    });

    expect(() => revalidateAdminContributionsCache("tenant-9")).not.toThrow();

    expect(revalidatedTags()).toEqual([
      "admin:contributions",
      "admin:contributions:tenant:tenant-9",
      "admin:contributions:list",
      "admin:contributions:staged-gifts",
      "admin:contributions:summary",
    ]);
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to revalidate cache tag "admin:contributions"',
      expect.any(Error),
    );
  });
});

describe("revalidateMemberCareCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revalidates the same tag set the cached member-care reads attach", () => {
    revalidateMemberCareCache("tenant-7");

    expect(revalidatedTags()).toEqual([
      "member-care",
      "member-care:tenant-7",
      "member-care:directory",
      "member-care:activity",
      "member-care:private-notes",
    ]);
    expectAllUseMaxProfile();
  });
});
