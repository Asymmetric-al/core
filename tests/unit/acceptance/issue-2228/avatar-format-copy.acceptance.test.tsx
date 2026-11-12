// @vitest-environment jsdom
/**
 * #2228 acceptance: the donor avatar help text names every format the real
 * upload control accepts (spec r1 §4 criteria 1-3).
 *
 * Owned by Acceptance; implementers must not edit this file.
 * Spec: https://github.com/Asymmetric-al/core/issues/2228#issuecomment-6389455234
 * Approval (all defaults, literal copy per OQ1):
 * https://github.com/Asymmetric-al/core/issues/2228#issuecomment-6389467471
 *
 * The page is rendered for real with only its data and environment hooks
 * mocked. `ImageUpload` is deliberately NOT mocked, so the `accept` attribute
 * read here is the one the shared control actually renders.
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import DonorSettingsPage from "../../../../apps/donor/app/(dashboard)/donor-dashboard/settings/page-client";

vi.mock("@asym/database/hooks", () => ({
  useDonorPortalSnapshot: () => ({
    isLoading: false,
    error: null,
    data: {
      profile: {
        displayName: "Fixture Donor",
        email: "fixture@example.test",
        phone: null,
        avatarUrl: null,
      },
    },
  }),
  useUpdateDonorPortal: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));
vi.mock("@asym/lib/view-transitions", () => ({
  useWithinViewTransitionRouteLayer: () => false,
}));
vi.mock("@asym/lib/hooks/use-mobile", () => ({
  useMediaQuery: () => false,
  useIsDesktop: () => false,
}));

afterEach(() => {
  cleanup();
});

/** Spec r1 §4 criterion 1: the exact approved copy. */
const NEW_COPY = "JPG, PNG, WebP or GIF. Large files auto-optimized.";
/** The pre-fix copy (base 14f8f215, page-client.tsx:204). */
const OLD_COPY = "JPG, GIF or PNG. Large files auto-optimized.";

/** Spec r1 §4 criterion 2: the MIME -> user-facing label map. */
const MIME_LABEL: Readonly<Record<string, string>> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WebP",
  "image/gif": "GIF",
};

/** Maps an `accept` value to labels; an unmapped type is an error. */
function acceptLabels(accept: string): string[] {
  return accept.split(",").map((raw) => {
    const type = raw.trim();
    const label = MIME_LABEL[type];
    if (label === undefined) {
      throw new Error(`unmapped accept type: ${JSON.stringify(type)}`);
    }
    return label;
  });
}

/** Format tokens from the text before the first ".", split on ", " and " or ". */
function copyTokens(copy: string): string[] {
  const head = copy.split(".")[0] ?? "";
  return head
    .split(/, | or /)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

/** Set comparison of copy tokens against the accept labels. */
function formatMismatch(copy: string, accept: string) {
  const labels = new Set(acceptLabels(accept));
  const tokens = new Set(copyTokens(copy));
  return {
    missingFromCopy: [...labels].filter((l) => !tokens.has(l)).sort(),
    extraInCopy: [...tokens].filter((t) => !labels.has(t)).sort(),
  };
}

function renderedAccept(): string {
  render(<DonorSettingsPage />);
  const input = document.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error("no input[type=file] rendered by the page");
  return input.getAttribute("accept") ?? "";
}

function renderedCopy(): string {
  render(<DonorSettingsPage />);
  return screen.getByText(/Large files auto-optimized/).textContent ?? "";
}

describe("#2228 criterion 1: the avatar help text lists every accepted format", () => {
  it(`the settings page shows exactly "${NEW_COPY}"`, () => {
    render(<DonorSettingsPage />);
    expect(screen.getByText(NEW_COPY)).toBeTruthy();
  });

  it("the settings page shows no text matching /JPG, GIF or PNG/", () => {
    render(<DonorSettingsPage />);
    expect(screen.queryByText(/JPG, GIF or PNG/)).toBeNull();
  });
});

describe("#2228 criterion 2: the copy matches the rendered upload control", () => {
  it("every type in the rendered accept attribute maps to a known label", () => {
    const accept = renderedAccept();
    expect(() => acceptLabels(accept), accept).not.toThrow();
  });

  it("the rendered copy names exactly the formats the rendered accept lists", () => {
    const copy = renderedCopy();
    cleanup();
    const accept = renderedAccept();
    expect(formatMismatch(copy, accept), `${copy} vs ${accept}`).toEqual({
      missingFromCopy: [],
      extraInCopy: [],
    });
  });
});

describe("#2228 criterion 3: the comparison catches the old copy", () => {
  it("the old copy is reported as missing WebP against the rendered accept", () => {
    const accept = renderedAccept();
    expect(formatMismatch(OLD_COPY, accept)).toEqual({
      missingFromCopy: ["WebP"],
      extraInCopy: [],
    });
  });

  it("an accept type with no label fails the comparison", () => {
    const accept = "image/jpeg,image/png,image/webp,image/gif,image/avif";
    expect(() => formatMismatch(NEW_COPY, accept)).toThrow(
      /unmapped accept type: "image\/avif"/,
    );
  });
});
