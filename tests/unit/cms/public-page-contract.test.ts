import { describe, expect, it } from "vitest";

import {
  buildPublicCmsReadCachePolicy,
  buildPublicCmsReadPath,
  normalizePublicCmsPageSlug,
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
});
