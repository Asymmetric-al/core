import { describe, expect, it } from "vitest";

import {
  buildGivingCheckoutHref,
  buildPublicCmsReadCachePolicy,
  buildPublicCmsReadPath,
  normalizePublicCmsPageSlug,
  resolvePublicCmsCtaHref,
  sanitizePublicCmsHref,
} from "@asym/lib/cms/public-page";

describe("public CMS page contract", () => {
  it("normalizes standard page slugs with home fallback", () => {
    expect(normalizePublicCmsPageSlug([" about us ", "", "buen día"])).toBe(
      "about us/buen día",
    );
    expect(normalizePublicCmsPageSlug(undefined)).toBe("home");
  });

  it("builds route paths for each published page-like descriptor", () => {
    expect(
      buildPublicCmsReadPath({
        kind: "page",
        slugSegments: [" about us ", "buen día"],
      }),
    ).toBe("/api/cms/public/pages/about%20us/buen%20d%C3%ADa");

    expect(
      buildPublicCmsReadPath({
        kind: "missionary-giving-page",
        missionaryId: " worker/123 ",
      }),
    ).toBe("/api/cms/public/missionary-pages/worker%2F123");

    expect(
      buildPublicCmsReadPath({
        kind: "project-page",
        slug: "water/well",
      }),
    ).toBe("/api/cms/public/project-pages/water%2Fwell");
  });

  it("centralizes tenant-aware cache policy for public reads", () => {
    expect(
      buildPublicCmsReadCachePolicy(
        { kind: "page", slugSegments: ["About", "Team"] },
        "Alpha.Example.org:443",
      ),
    ).toEqual({
      revalidate: 60,
      tags: [
        "public-cms",
        "public-cms:host:alpha.example.org",
        "public-cms:page:About%2FTeam",
      ],
    });
  });

  it("keeps CMS-authored CTA targets inside safe public URL protocols", () => {
    expect(sanitizePublicCmsHref("/give/monthly")).toBe("/give/monthly");
    expect(sanitizePublicCmsHref("https://example.org/give")).toBe(
      "https://example.org/give",
    );
    expect(sanitizePublicCmsHref("javascript:alert(1)")).toBeNull();
    expect(sanitizePublicCmsHref("//evil.example")).toBeNull();
  });

  it("builds giving checkout URLs from CMS references instead of payment facts", () => {
    expect(
      buildGivingCheckoutHref({
        amount: 50,
        frequency: "monthly",
        missionaryId: "123e4567-e89b-42d3-a456-426614174111",
      }),
    ).toBe(
      "/checkout?missionary_id=123e4567-e89b-42d3-a456-426614174111&amount=50&frequency=monthly",
    );

    expect(
      resolvePublicCmsCtaHref({
        fundId: "123e4567-e89b-42d3-a456-426614174222",
        pageType: "project",
        rawHref: "https://example.org/manual",
      }),
    ).toBe("/checkout?fund_id=123e4567-e89b-42d3-a456-426614174222");
  });
});
