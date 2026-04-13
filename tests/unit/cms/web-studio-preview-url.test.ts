import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
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
  it("returns an absolute donor URL", () => {
    const url = pagesGeneratePreviewURL(
      { slug: "about" },
      { locale: "en", req: {} as never, token: null },
    );
    expect(url).toMatch(/^https?:\/\//);
    expect(String(url)).toContain("/about");
  });

  it("uses DONOR_APP_URL when NEXT_PUBLIC_DONOR_URL is unset (aligned with resolveDonorOrigin)", () => {
    const prev = snapshotDonorEnv();
    delete process.env.NEXT_PUBLIC_DONOR_URL;
    process.env.DONOR_APP_URL = "https://donor.example.test/";

    try {
      const origin = resolveDonorOrigin();
      expect(origin).toBe("https://donor.example.test");

      const previewUrl = pagesGeneratePreviewURL(
        { slug: "about" },
        { locale: "en", req: {} as never, token: null },
      );
      expect(previewUrl).toBe(`${origin}/about`);
    } finally {
      restoreDonorEnv(prev);
    }
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
  });

  it("falls back to DONOR_APP_URL when NEXT_PUBLIC_DONOR_URL is unset", () => {
    delete process.env.NEXT_PUBLIC_DONOR_URL;
    process.env.DONOR_APP_URL = "https://donor-only.example/app/";
    expect(resolveDonorOrigin()).toBe("https://donor-only.example/app");
  });

  it("uses dev default when neither env is set", () => {
    delete process.env.NEXT_PUBLIC_DONOR_URL;
    delete process.env.DONOR_APP_URL;
    expect(resolveDonorOrigin()).toBe("http://127.0.0.1:3000");
  });
});
