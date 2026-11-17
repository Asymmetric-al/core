/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  PUBLIC_BLOCK_TYPES,
  isPublicBlockType,
  publicBlockRegistry,
  renderPublicBlocks,
  type PublicBlockSurface,
} from "../../../../packages/ui/components/public/blocks";

afterEach(cleanup);

/** A surface that makes every adapter call visible in the DOM. */
const surface: PublicBlockSurface = {
  renderAction: ({ label, href, emphasis, openInNewTab }) => (
    <a
      href={href}
      data-emphasis={emphasis}
      data-new-tab={openInNewTab ? "yes" : "no"}
    >
      {label}
    </a>
  ),
  renderMedia: ({ media, slot }) =>
    media && typeof media === "object" ? (
      <img
        alt={String((media as { alt?: unknown }).alt ?? "")}
        data-slot={slot}
      />
    ) : null,
};

function richText(text: string) {
  return {
    root: {
      type: "root",
      children: [{ type: "paragraph", children: [{ type: "text", text }] }],
    },
  };
}

/** One filled block of every registered type, keyed by type. */
const EXAMPLE_BLOCKS = {
  hero: {
    blockType: "hero",
    eyebrow: "Since 1990",
    headline: "Hero headline",
    subheading: "Hero subheading",
    backgroundImage: { alt: "Hero image" },
    primaryCtaLabel: "Give now",
    primaryCtaHref: "/give",
  },
  "rich-text": {
    blockType: "rich-text",
    heading: "Rich text heading",
    body: richText("Rich text body"),
  },
  "media-feature": {
    blockType: "media-feature",
    title: "Feature title",
    body: "Feature body",
    media: { alt: "Feature image" },
    mediaCaption: "Feature caption",
  },
  "call-to-action": {
    blockType: "call-to-action",
    headline: "Call headline",
    copy: "Call copy",
    buttonLabel: "Read more",
    buttonHref: "https://example.org/more",
    openInNewTab: true,
  },
  faq: {
    blockType: "faq",
    heading: "Questions",
    items: [{ question: "Where do gifts go?", answer: "To the field." }],
  },
  "impact-stats": {
    blockType: "impact-stats",
    heading: "Our impact",
    items: [{ value: "40", label: "Countries", description: "Served" }],
  },
  testimonial: {
    blockType: "testimonial",
    quote: "They changed our town.",
    attribution: "A. Partner",
    role: "Pastor",
  },
} as const;

/** Text that proves each block rendered its own content. */
const EXPECTED_TEXT: Record<keyof typeof EXAMPLE_BLOCKS, string[]> = {
  hero: ["Since 1990", "Hero headline", "Hero subheading", "Give now"],
  "rich-text": ["Rich text heading", "Rich text body"],
  "media-feature": ["Feature title", "Feature body", "Feature caption"],
  "call-to-action": ["Call headline", "Call copy", "Read more"],
  faq: ["Questions", "Where do gifts go?", "To the field."],
  "impact-stats": ["Our impact", "40", "Countries", "Served"],
  testimonial: ["“They changed our town.”", "A. Partner", "Pastor"],
};

describe("public block registry", () => {
  it("declares each block type once, as a registry key", () => {
    expect([...PUBLIC_BLOCK_TYPES].sort()).toEqual(
      Object.keys(EXAMPLE_BLOCKS).sort(),
    );
    expect(PUBLIC_BLOCK_TYPES).toEqual(Object.keys(publicBlockRegistry));
    expect(new Set(PUBLIC_BLOCK_TYPES).size).toBe(PUBLIC_BLOCK_TYPES.length);
  });

  it.each(Object.keys(EXAMPLE_BLOCKS) as Array<keyof typeof EXAMPLE_BLOCKS>)(
    "renders a %s block through the registry",
    (type) => {
      render(
        <div>
          {renderPublicBlocks([EXAMPLE_BLOCKS[type]], {
            keyPrefix: "page",
            surface,
          })}
        </div>,
      );

      for (const text of EXPECTED_TEXT[type]) {
        expect(screen.getByText(text)).toBeTruthy();
      }
    },
  );

  it("hands media and calls to action to the surface", () => {
    render(
      <div>
        {renderPublicBlocks(
          [
            EXAMPLE_BLOCKS.hero,
            EXAMPLE_BLOCKS["media-feature"],
            EXAMPLE_BLOCKS["call-to-action"],
          ],
          { keyPrefix: "page", surface },
        )}
      </div>,
    );

    expect(screen.getByRole("img", { name: "Hero image" }).dataset.slot).toBe(
      "banner",
    );
    expect(
      screen.getByRole("img", { name: "Feature image" }).dataset.slot,
    ).toBe("feature");

    const give = screen.getByRole("link", { name: "Give now" });
    expect(give.getAttribute("href")).toBe("/give");
    expect(give.dataset.emphasis).toBe("primary");
    expect(give.dataset.newTab).toBe("no");

    const more = screen.getByRole("link", { name: "Read more" });
    expect(more.getAttribute("href")).toBe("https://example.org/more");
    expect(more.dataset.emphasis).toBe("secondary");
    expect(more.dataset.newTab).toBe("yes");
  });

  it("drops unknown types and malformed entries without failing", () => {
    const rendered = renderPublicBlocks(
      [
        null,
        "hero",
        { blockType: "carousel", headline: "Not a block" },
        { blockType: "__proto__" },
        { blockType: "toString" },
        { headline: "No type" },
        EXAMPLE_BLOCKS.testimonial,
      ],
      { keyPrefix: "page", surface },
    );

    expect(rendered).toHaveLength(1);
    render(<div>{rendered}</div>);
    expect(screen.queryByText("Not a block")).toBeNull();
    expect(screen.getByText("A. Partner")).toBeTruthy();
  });

  it("renders nothing for a layout that is not a list", () => {
    expect(renderPublicBlocks(undefined, { keyPrefix: "p", surface })).toEqual(
      [],
    );
    expect(
      renderPublicBlocks({ blockType: "hero" }, { keyPrefix: "p", surface }),
    ).toEqual([]);
  });

  it("keeps an incomplete draft block visible instead of dropping it", () => {
    render(
      <div>
        {renderPublicBlocks(
          [
            {
              blockType: "hero",
              eyebrow: "Draft eyebrow",
              headline: 42,
              primaryCtaLabel: "Give",
            },
            {
              blockType: "faq",
              items: [null, { question: "Only a question", answer: "  " }],
            },
          ],
          { keyPrefix: "draft", surface },
        )}
      </div>,
    );

    expect(screen.getByText("Draft eyebrow")).toBeTruthy();
    expect(screen.getByText("Only a question")).toBeTruthy();
    // No empty heading is announced for a missing headline.
    expect(screen.queryAllByRole("heading", { level: 2 })).toHaveLength(0);
    // A call to action with no destination is not offered.
    expect(screen.queryByRole("link", { name: "Give" })).toBeNull();
  });

  it("recognises only registered types", () => {
    expect(isPublicBlockType("hero")).toBe(true);
    expect(isPublicBlockType("carousel")).toBe(false);
    expect(isPublicBlockType("constructor")).toBe(false);
    expect(isPublicBlockType(undefined)).toBe(false);
  });
});
