// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import PreviewPage, * as previewPage from "../../../../apps/admin/app/(payload)/web-studio/preview/[collection]/[id]/page";
import { createPageLayoutField } from "../../../../apps/admin/src/cms/collections/page-builders";
import {
  PUBLIC_BLOCK_TYPES,
  renderPublicBlocks,
} from "../../../../packages/ui/components/public/blocks";

import type * as BlocksModule from "../../../../packages/ui/components/public/blocks";

// The real registry, observed: the page must hand it the stored layout and
// render nothing of its own for a block (council round 2, B7).
vi.mock(
  "../../../../packages/ui/components/public/blocks",
  async (importOriginal) => {
    const actual = await importOriginal<typeof BlocksModule>();
    return { ...actual, renderPublicBlocks: vi.fn(actual.renderPublicBlocks) };
  },
);

const fixture = vi.hoisted(() => ({
  auth: vi.fn(),
  findByID: vi.fn(),
  user: { id: "editor-1", role: "admin" },
}));

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/server", () => ({ connection: async () => undefined }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("not-found");
  },
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));
vi.mock("../../../../apps/admin/node_modules/payload/dist/index.js", () => ({
  createPayloadRequest: async (input: unknown) => input,
  executeAuthStrategies: (args: unknown) => fixture.auth(args),
}));
vi.mock("../../../../apps/admin/src/cms/get-payload", () => ({
  getPayloadClient: async () => ({
    auth: fixture.auth,
    findByID: fixture.findByID,
  }),
}));
// The page asks Web Studio's gate on every render (AL-2675, council C1;
// web-studio-page-scope.test.tsx); here it admits the editor.
vi.mock("../../../../apps/admin/src/cms/web-studio-access", () => ({
  requireWebStudioAccess: async () => ({
    scope: {
      userId: "00000000-0000-4000-8000-0000000000c1",
      tenantId: "00000000-0000-0000-0000-000000000001",
      assignmentId: "00000000-0000-4000-8000-0000000000a1",
      addressPrefix: "",
    },
    organization: { name: "Alpha Mission", canSwitch: false },
  }),
}));

function richText(text: string) {
  return {
    root: {
      type: "root",
      children: [{ type: "paragraph", children: [{ type: "text", text }] }],
    },
  };
}

function media(alt: string) {
  return {
    id: `media-${alt}`,
    alt,
    url: `https://media.example/${encodeURIComponent(alt)}.jpg`,
    width: 1200,
    height: 600,
  };
}

/**
 * One filled block for each layout block type, and text that proves the
 * preview rendered it. A block type the editor offers with no entry here
 * fails the coverage test below by name.
 */
const FILLED_BLOCKS: Record<string, { block: object; expectText: string[] }> = {
  hero: {
    block: {
      blockType: "hero",
      headline: "Hero headline",
      subheading: "Hero subheading",
      backgroundImage: media("Hero image"),
    },
    expectText: ["Hero headline", "Hero subheading"],
  },
  "rich-text": {
    block: {
      blockType: "rich-text",
      heading: "Rich text heading",
      body: richText("Rich text body"),
    },
    expectText: ["Rich text heading", "Rich text body"],
  },
  "media-feature": {
    block: {
      blockType: "media-feature",
      title: "Feature title",
      body: "Feature body",
      media: media("Feature image"),
      mediaCaption: "Feature caption",
    },
    expectText: ["Feature title", "Feature body"],
  },
  "call-to-action": {
    block: {
      blockType: "call-to-action",
      headline: "Call headline",
      copy: "Call copy",
      buttonLabel: "Call button",
      buttonHref: "/call",
    },
    expectText: ["Call headline", "Call copy", "Call button"],
  },
  faq: {
    block: {
      blockType: "faq",
      heading: "FAQ heading",
      items: [{ question: "FAQ question", answer: "FAQ answer" }],
    },
    expectText: ["FAQ heading", "FAQ question", "FAQ answer"],
  },
  "impact-stats": {
    block: {
      blockType: "impact-stats",
      heading: "Stats heading",
      items: [{ value: "12", label: "Stat label" }],
    },
    expectText: ["Stats heading", "12", "Stat label"],
  },
  testimonial: {
    block: {
      blockType: "testimonial",
      quote: "Testimonial quote",
      attribution: "Testimonial attribution",
    },
    expectText: ["“Testimonial quote”", "Testimonial attribution"],
  },
};

beforeEach(() => {
  fixture.auth.mockResolvedValue({ user: fixture.user });
  fixture.findByID.mockResolvedValue({
    id: "page-1",
    title: "About our work",
    _status: "draft",
    layout: [
      {
        blockType: "hero",
        headline: "Our work",
        primaryCtaLabel: "Give now",
        primaryCtaHref: "/give",
      },
      {
        blockType: "call-to-action",
        headline: "Learn more",
        buttonLabel: "Read more",
        buttonHref: "https://example.org/about",
      },
    ],
  });
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

async function renderPreview() {
  return render(
    await PreviewPage({
      params: Promise.resolve({ collection: "pages", id: "page-1" }),
    }),
  );
}

describe("Web Studio private preview page", () => {
  it("sets a draft preview title and explains saved private content", async () => {
    await renderPreview();
    expect(previewPage).toHaveProperty("metadata.title", "Draft preview");
    expect(screen.getByText("Private preview")).toBeTruthy();
    expect(screen.getByText("Draft", { exact: true })).toBeTruthy();
    expect(screen.getByRole("note").textContent).toContain(
      "latest saved version",
    );
    expect(screen.getByRole("note").textContent).toContain("Unsaved changes");
    expect(fixture.findByID).toHaveBeenCalledWith(
      expect.objectContaining({
        draft: true,
        overrideAccess: false,
        user: fixture.user,
      }),
    );
  });

  it("keeps preview CTAs inert, keyboard focusable, and visibly describes destinations", async () => {
    await renderPreview();
    const give = screen.getByRole("button", { name: "Give now" });
    const more = screen.getByRole("button", { name: "Read more" });
    expect(give.getAttribute("aria-disabled")).toBe("true");
    expect(more.getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByText("Links to /give")).toBeTruthy();
    expect(screen.getByText("Links to https://example.org/about")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Give now" })).toBeNull();
    expect(give.tabIndex).toBe(0);
    expect(more.tabIndex).toBe(0);
    give.focus();
    expect(document.activeElement).toBe(give);
    fireEvent.keyDown(give, { key: "Enter" });
    fireEvent.click(give);
    expect(document.activeElement).toBe(give);
    more.focus();
    expect(document.activeElement).toBe(more);
  });

  it.each(["published", undefined])(
    "reports only known editorial status: %s",
    async (status) => {
      fixture.findByID.mockResolvedValue({
        id: "page-1",
        title: "About",
        _status: status,
      });
      await renderPreview();
      expect(screen.queryByText("Published", { exact: true }) !== null).toBe(
        status === "published",
      );
      expect(screen.queryByText("Draft", { exact: true })).toBeNull();
    },
  );

  it("renders every layout block type the editor offers, from the shared registry (D-18: WP6 part 2b media records carry no file, so no image or image caption shows)", async () => {
    const editorBlockTypes = (
      createPageLayoutField() as { blocks: Array<{ slug: string }> }
    ).blocks.map((block) => block.slug);
    const missingFixtures = editorBlockTypes.filter(
      (type) => !FILLED_BLOCKS[type],
    );
    expect(missingFixtures).toEqual([]);
    // Every editor block type has a registry entry, and the registry declares
    // nothing the editor cannot author.
    expect([...PUBLIC_BLOCK_TYPES].sort()).toEqual(
      [...editorBlockTypes].sort(),
    );

    fixture.findByID.mockResolvedValue({
      id: "page-1",
      title: "Every block",
      _status: "draft",
      layout: editorBlockTypes.map((type) => FILLED_BLOCKS[type]!.block),
    });
    await renderPreview();

    for (const type of editorBlockTypes) {
      for (const text of FILLED_BLOCKS[type]!.expectText) {
        expect(screen.getByText(text), `${type}: ${text}`).toBeTruthy();
      }
    }
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.queryByText("Feature caption")).toBeNull();
    expect(screen.queryByText(/no previewable rich-text or layout/)).toBeNull();
  });

  it("declares no block type of its own: the registry is the only list", async () => {
    const layout = [
      ...Object.values(FILLED_BLOCKS).map(({ block }) => block),
      { blockType: "carousel", headline: "Unknown type" },
    ];
    fixture.findByID.mockResolvedValue({
      id: "page-1",
      title: "Every block",
      _status: "draft",
      layout,
    });
    const registry = vi.mocked(renderPublicBlocks);

    // The page hands the registry every stored block, in order, unknown
    // types included: it filters and dispatches nothing itself.
    await renderPreview();
    expect(registry).toHaveBeenCalledTimes(1);
    const handed = registry.mock.calls[0]?.[0] as Array<{ blockType: string }>;
    expect(handed.map((block) => block.blockType)).toEqual(
      layout.map((block) => (block as { blockType: string }).blockType),
    );
    cleanup();

    // With a registry that renders nothing, the page shows no block at all:
    // no block type has a second renderer in the page.
    registry.mockReturnValueOnce([]);
    await renderPreview();
    for (const { expectText } of Object.values(FILLED_BLOCKS)) {
      for (const text of expectText) {
        expect(screen.queryByText(text), text).toBeNull();
      }
    }
    expect(
      screen.getByText(
        "This draft has no previewable rich-text or layout content yet.",
      ),
    ).toBeTruthy();
  });

  it("says so when a draft has no previewable content", async () => {
    fixture.findByID.mockResolvedValue({
      id: "page-1",
      title: "Empty",
      _status: "draft",
      layout: [{ blockType: "carousel", headline: "Unknown" }],
    });
    await renderPreview();
    expect(screen.queryByText("Unknown")).toBeNull();
    expect(
      screen.getByText(
        "This draft has no previewable rich-text or layout content yet.",
      ),
    ).toBeTruthy();
  });

  it("redirects signed-out visitors before reading content", async () => {
    fixture.auth.mockResolvedValue({ user: null });
    await expect(renderPreview()).rejects.toThrow("redirect:/login?next=");
    expect(fixture.findByID).not.toHaveBeenCalled();
  });
});
