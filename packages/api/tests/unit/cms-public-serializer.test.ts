import { describe, expect, it } from "vitest";

import {
  serializePublicNavigation,
  serializePublicPage,
  serializePublicUpdate,
} from "../../src/cms/public/serializer";

/**
 * The public serializer is an ALLOWLIST (Phase 5 A5): only named public-safe
 * fields and typed layout blocks are emitted; adding an unknown field to a
 * source document must never surface it in the serialized output.
 */

describe("serializePublicPage", () => {
  const baseDoc = {
    id: 42,
    title: "Serve With Us",
    slug: "serve-with-us",
    summary: "A page summary",
    content: { root: { type: "doc" } },
    pageType: "missionary_giving",
    missionaryId: "mis_123",
    fundId: null,
    legacyContentFallback: false,
    updatedAt: "2026-07-22T00:00:00.000Z",
  };

  it("emits only the named public-safe fields", () => {
    const doc = {
      ...baseDoc,
      // Private/unexpected fields that must be stripped:
      tenant: { id: "cms-tenant-1", apiKey: "secret" },
      _status: "published",
      internalNotes: "do not leak",
      createdAt: "2026-01-01T00:00:00.000Z",
    };

    const page = serializePublicPage(doc);

    expect(page).toEqual({
      id: "42",
      title: "Serve With Us",
      slug: "serve-with-us",
      summary: "A page summary",
      content: { root: { type: "doc" } },
      layout: null,
      pageType: "missionary_giving",
      missionaryId: "mis_123",
      fundId: null,
      legacyContentFallback: false,
      updatedAt: "2026-07-22T00:00:00.000Z",
    });
    expect(page).not.toHaveProperty("tenant");
    expect(page).not.toHaveProperty("_status");
    expect(page).not.toHaveProperty("internalNotes");
  });

  it("serializes each supported layout block to its documented public shape", () => {
    const doc = {
      ...baseDoc,
      layout: [
        {
          id: "b1",
          blockType: "hero",
          headline: "Go",
          eyebrow: "Now",
          subheading: null,
          backgroundImage: "media_1",
          primaryCtaLabel: "Give",
          primaryCtaHref: "/give",
          adminOnlyFlag: true,
        },
        {
          id: "b2",
          blockType: "call-to-action",
          headline: "Support",
          copy: "Monthly support",
          buttonLabel: "Give now",
          buttonHref: "https://example.org/give",
          openInNewTab: true,
        },
        { id: "b3", blockType: "rich-text", heading: "Story", body: { p: 1 } },
        {
          id: "b4",
          blockType: "media-feature",
          title: "Field",
          body: "Photo story",
          media: 7,
          mediaCaption: "The team",
        },
        {
          id: "b5",
          blockType: "faq",
          heading: "FAQ",
          items: [
            { id: "q1", question: "How?", answer: "Like this", secret: "x" },
            "not-an-object",
          ],
        },
        {
          id: "b6",
          blockType: "impact-stats",
          heading: "Impact",
          items: [
            { id: "s1", value: "12", label: "Countries", description: null },
          ],
        },
        {
          id: "b7",
          blockType: "testimonial",
          quote: "It mattered.",
          attribution: "A donor",
        },
      ],
    };

    const page = serializePublicPage(doc);
    const layout = page.layout ?? [];

    expect(layout).toHaveLength(7);
    expect(layout[0]).toEqual({
      id: "b1",
      blockName: null,
      blockType: "hero",
      eyebrow: "Now",
      headline: "Go",
      subheading: null,
      backgroundImage: "media_1",
      primaryCtaLabel: "Give",
      // missionary_giving page type routes the CTA to checkout:
      primaryCtaHref: "/checkout?missionary_id=mis_123",
    });
    expect(layout[0]).not.toHaveProperty("adminOnlyFlag");
    expect(layout[1]).toEqual({
      id: "b2",
      blockName: null,
      blockType: "call-to-action",
      headline: "Support",
      copy: "Monthly support",
      buttonLabel: "Give now",
      buttonHref: "/checkout?missionary_id=mis_123",
      openInNewTab: true,
    });
    expect(layout[2]).toEqual({
      id: "b3",
      blockName: null,
      blockType: "rich-text",
      heading: "Story",
      body: { p: 1 },
    });
    expect(layout[3]).toEqual({
      id: "b4",
      blockName: null,
      blockType: "media-feature",
      title: "Field",
      body: "Photo story",
      media: 7,
      mediaCaption: "The team",
    });
    expect(layout[4]).toEqual({
      id: "b5",
      blockName: null,
      blockType: "faq",
      heading: "FAQ",
      items: [{ id: "q1", question: "How?", answer: "Like this" }],
    });
    expect(layout[5]).toEqual({
      id: "b6",
      blockName: null,
      blockType: "impact-stats",
      heading: "Impact",
      items: [{ id: "s1", value: "12", label: "Countries", description: null }],
    });
    expect(layout[6]).toEqual({
      id: "b7",
      blockName: null,
      blockType: "testimonial",
      quote: "It mattered.",
      attribution: "A donor",
    });
  });

  it("reduces an unknown block type to identity fields only", () => {
    const doc = {
      ...baseDoc,
      layout: [
        {
          id: "x1",
          blockName: "Mystery",
          blockType: "internal-experiment",
          secretConfig: { flag: true },
          html: "<script>alert(1)</script>",
        },
      ],
    };

    const page = serializePublicPage(doc);

    expect(page.layout).toEqual([
      { id: "x1", blockName: "Mystery", blockType: "internal-experiment" },
    ]);
  });

  it("normalizes populated media to the public URL shape with no raw Payload fields", () => {
    const doc = {
      ...baseDoc,
      layout: [
        {
          id: "m1",
          blockType: "media-feature",
          title: null,
          body: null,
          mediaCaption: null,
          media: {
            id: 9,
            alt: "Team photo",
            url: "/media/team.jpg",
            width: 1200,
            height: 800,
            mimeType: "image/jpeg",
            sizes: {
              thumbnail: { url: "/media/team-thumb.jpg", filesize: 999 },
              card: { url: "/media/team-card.jpg" },
            },
            // Raw Payload internals that must never be emitted:
            filename: "team.jpg",
            filesize: 123456,
            focalX: 50,
            focalY: 50,
            tenant: "cms-tenant-1",
          },
        },
      ],
    };

    const page = serializePublicPage(doc);
    const block = (page.layout ?? [])[0] as { media: unknown };

    expect(block.media).toEqual({
      id: "9",
      alt: "Team photo",
      url: "/media/team.jpg",
      thumbnailURL: "/media/team-thumb.jpg",
      cardURL: "/media/team-card.jpg",
      width: 1200,
      height: 800,
      mimeType: "image/jpeg",
    });
  });

  it("passes bare media ids through unchanged (unpopulated relationships)", () => {
    const doc = {
      ...baseDoc,
      layout: [
        {
          id: "m2",
          blockType: "hero",
          headline: "Go",
          backgroundImage: 15,
          primaryCtaHref: null,
        },
      ],
    };

    const page = serializePublicPage(doc);
    const hero = (page.layout ?? [])[0] as { backgroundImage: unknown };

    expect(hero.backgroundImage).toBe(15);
  });
});

describe("serializePublicNavigation", () => {
  it("emits only label/items and sanitizes hrefs", () => {
    const navigation = serializePublicNavigation({
      id: 3,
      label: "Main",
      tenant: "cms-tenant-1",
      _status: "draft",
      items: [
        { id: "n1", label: "Home", href: "/", openInNewTab: false },
        { id: "n2", label: "Evil", href: "javascript:alert(1)" },
        { id: "n3", label: "Give", href: "https://example.org/give" },
        "not-an-object",
      ],
      updatedAt: "2026-07-22T00:00:00.000Z",
    });

    expect(navigation).toEqual({
      id: "3",
      label: "Main",
      items: [
        { id: "n1", label: "Home", href: "/", openInNewTab: false },
        { id: "n2", label: "Evil", href: null, openInNewTab: false },
        {
          id: "n3",
          label: "Give",
          href: "https://example.org/give",
          openInNewTab: false,
        },
      ],
      updatedAt: "2026-07-22T00:00:00.000Z",
    });
    expect(navigation).not.toHaveProperty("tenant");
    expect(navigation).not.toHaveProperty("_status");
  });
});

describe("serializePublicUpdate", () => {
  it("emits the named fields and reduces the missionary relationship to an id", () => {
    const update = serializePublicUpdate({
      id: "u1",
      title: "Field news",
      slug: "field-news",
      excerpt: "Short version",
      content: { root: {} },
      missionary: { id: "mis_9", email: "private@example.org" },
      publishedAt: "2026-07-20T00:00:00.000Z",
      tenant: "cms-tenant-1",
      internalReviewNotes: "not public",
    });

    expect(update).toEqual({
      id: "u1",
      title: "Field news",
      slug: "field-news",
      excerpt: "Short version",
      content: { root: {} },
      missionaryId: "mis_9",
      publishedAt: "2026-07-20T00:00:00.000Z",
    });
    expect(update).not.toHaveProperty("tenant");
    expect(update).not.toHaveProperty("internalReviewNotes");
  });

  it("passes a bare missionary id through and nulls a missing one", () => {
    const withBareId = serializePublicUpdate({
      id: "u2",
      title: "t",
      slug: "s",
      missionary: "mis_2",
    });
    const withoutMissionary = serializePublicUpdate({
      id: "u3",
      title: "t",
      slug: "s",
    });

    expect(withBareId.missionaryId).toBe("mis_2");
    expect(withoutMissionary.missionaryId).toBeNull();
  });
});
