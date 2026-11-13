// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import PreviewPage, * as previewPage from "../../../../apps/admin/app/(payload)/web-studio/preview/[collection]/[id]/page";

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
}));
vi.mock("../../../../apps/admin/src/cms/get-payload", () => ({
  getPayloadClient: async () => ({
    auth: fixture.auth,
    findByID: fixture.findByID,
  }),
}));
vi.mock("@asym/lib/cms/public-page-renderer", () => ({
  renderPublicCmsPageContent: () => null,
}));

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

  it("redirects signed-out visitors before reading content", async () => {
    fixture.auth.mockResolvedValue({ user: null });
    await expect(renderPreview()).rejects.toThrow("redirect:/login?next=");
    expect(fixture.findByID).not.toHaveBeenCalled();
  });
});
