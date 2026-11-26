import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolveConfiguredDonorOrigin } from "../../../apps/admin/src/cms-ui/web-studio/adapters/resolve-donor-origin";
import { getWebStudioCollectionConfig } from "../../../apps/admin/src/cms-ui/web-studio/collections/config";

import {
  buildWebStudioAuthenticatedPreviewPath,
  createWebStudioAuthenticatedPreviewURL,
  buildDonorPreviewPathForPageSlug,
  pagesGeneratePreviewURL,
  resolveDonorOrigin,
} from "../../../apps/admin/src/cms-ui/web-studio/adapters/preview-url";

const DONOR_ENV_KEYS = ["NEXT_PUBLIC_DONOR_URL", "DONOR_APP_URL"] as const;

function snapshotDonorEnv() {
  const snap: Partial<Record<(typeof DONOR_ENV_KEYS)[number], string>> = {};
  for (const key of DONOR_ENV_KEYS) {
    const v = process.env[key];
    if (v !== undefined) snap[key] = v;
  }
  return snap;
}

function restoreDonorEnv(
  snap: Partial<Record<(typeof DONOR_ENV_KEYS)[number], string>>,
) {
  for (const key of DONOR_ENV_KEYS) {
    if (snap[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = snap[key];
    }
  }
}

describe("buildDonorPreviewPathForPageSlug", () => {
  it("maps home slug to root", () => {
    expect(buildDonorPreviewPathForPageSlug("home")).toBe("/");
    expect(buildDonorPreviewPathForPageSlug("")).toBe("/");
  });

  it("encodes path segments", () => {
    expect(buildDonorPreviewPathForPageSlug("a/b")).toBe("/a/b");
    expect(buildDonorPreviewPathForPageSlug("hello world")).toBe(
      "/hello%20world",
    );
  });
});

describe("pagesGeneratePreviewURL", () => {
  it("returns an authenticated Web Studio preview path", () => {
    const url = pagesGeneratePreviewURL(
      { id: 123, slug: "about" },
      { locale: "en", req: {} as never, token: null },
    );
    expect(url).toBe("/web-studio/preview/pages/123");
  });

  it("falls back to the authenticated collection when the document is unsaved", () => {
    const url = pagesGeneratePreviewURL(
      { slug: "about" },
      { locale: "en", req: {} as never, token: null },
    );
    expect(url).toBe("/web-studio/collections/pages");
  });

  it("builds authenticated preview URLs for the one pages collection (D-18: WP6 part 2b folds the page-like collections into pages)", () => {
    expect(
      buildWebStudioAuthenticatedPreviewPath({
        collectionSlug: "pages",
        id: "page 1",
      }),
    ).toBe("/web-studio/preview/pages/page%201");

    expect(
      createWebStudioAuthenticatedPreviewURL("pages")(
        { id: "page_1" },
        { locale: "en", req: {} as never, token: null },
      ),
    ).toBe("/web-studio/preview/pages/page_1");
  });
});

describe("resolveDonorOrigin", () => {
  let prev: ReturnType<typeof snapshotDonorEnv>;

  beforeEach(() => {
    prev = snapshotDonorEnv();
  });

  afterEach(() => {
    restoreDonorEnv(prev);
  });

  it("prefers NEXT_PUBLIC_DONOR_URL over DONOR_APP_URL", () => {
    process.env.NEXT_PUBLIC_DONOR_URL = "https://public.example/";
    process.env.DONOR_APP_URL = "https://server-only.example/";
    expect(resolveDonorOrigin()).toBe("https://public.example");
    expect(resolveConfiguredDonorOrigin()).toBe("https://public.example");
  });

  it("falls back to DONOR_APP_URL when NEXT_PUBLIC_DONOR_URL is unset", () => {
    delete process.env.NEXT_PUBLIC_DONOR_URL;
    process.env.DONOR_APP_URL = "https://donor-only.example/app/";
    expect(resolveDonorOrigin()).toBe("https://donor-only.example/app");
    expect(resolveConfiguredDonorOrigin()).toBe(
      "https://donor-only.example/app",
    );
  });

  it("uses dev default when neither env is set", () => {
    delete process.env.NEXT_PUBLIC_DONOR_URL;
    delete process.env.DONOR_APP_URL;
    expect(resolveDonorOrigin()).toBe("http://127.0.0.1:3000");
    expect(resolveConfiguredDonorOrigin()).toBeNull();
  });
});

it.each(["missionary", "project"] as const)(
  "keeps private preview without inventing a public reader for a %s page (D-18: WP6 part 2b, giving and project pages are pages of a family)",
  (family) => {
    const config = getWebStudioCollectionConfig("pages");
    expect(config.previewMode).not.toBe("none");
    expect(
      config.previewPathForData?.({
        family,
        missionaryId: "missionary",
        slug: "project",
      }) ?? null,
    ).toBeNull();
  },
);

it("gives a standard page its public address", () => {
  const config = getWebStudioCollectionConfig("pages");
  expect(
    config.previewPathForData?.({ family: "standard", slug: "about" }),
  ).toBe("/about");
});
