import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Occupancy contracts for transform-only motion (PR #1867).
 *
 * Height/width tweens are banned. Presence still has to hand layout space
 * safely: popLayout / reserved slots / flex layout — not leftover comments
 * or default-sync AnimatePresence that keeps exiting nodes in flow.
 */

const REPO_ROOT = join(__dirname, "..", "..", "..");

function readRepo(...parts: string[]): string {
  return readFileSync(join(REPO_ROOT, ...parts), "utf8");
}

function openingTagBefore(source: string, marker: string): string {
  const markerIndex = source.indexOf(marker);
  expect(
    markerIndex,
    `missing marker ${JSON.stringify(marker)}`,
  ).toBeGreaterThan(-1);
  const tagStart = source.lastIndexOf("<", markerIndex);
  expect(
    tagStart,
    `no opening tag before ${JSON.stringify(marker)}`,
  ).toBeGreaterThan(-1);
  const tagEnd = source.indexOf(">", tagStart);
  return source.slice(tagStart, tagEnd + 1);
}

function matchPair(
  source: string,
  openIndex: number,
  open: string,
  close: string,
): number {
  let depth = 0;
  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index];
    if (char === open) depth += 1;
    else if (char === close) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  throw new Error(`unbalanced ${open}${close}`);
}

function extractFunction(source: string, name: string): string {
  const fnStart = source.indexOf(`function ${name}`);
  const constStart = source.indexOf(`const ${name} =`);
  const start = fnStart >= 0 ? fnStart : constStart;
  expect(start, `missing function ${name}`).toBeGreaterThan(-1);

  let bodyStart: number;
  if (fnStart >= 0) {
    const parenStart = source.indexOf("(", start);
    const parenEnd = matchPair(source, parenStart, "(", ")");
    bodyStart = source.indexOf("{", parenEnd);
  } else {
    const arrow = source.indexOf("=>", start);
    bodyStart = source.indexOf("{", arrow);
  }

  const bodyEnd = matchPair(source, bodyStart, "{", "}");
  return source.slice(start, bodyEnd + 1);
}

function hasSafePresenceMode(tag: string): boolean {
  return /mode=["'](?:popLayout|wait)["']/.test(tag);
}

describe("FAQ exclusive occupancy", () => {
  const source = readRepo(
    "apps",
    "donor",
    "app",
    "(public)",
    "(hero)",
    "faq",
    "faq-client.tsx",
  );
  const accordion = extractFunction(source, "AccordionItem");

  it("takes the exiting answer out of flow so only one panel occupies space", () => {
    const presence = openingTagBefore(accordion, "{isOpen &&");
    expect(presence).toContain("AnimatePresence");
    expect(presence).toMatch(/mode=["']popLayout["']/);
  });

  it("does not slide the answer on y under the overflow-hidden clip", () => {
    expect(accordion).not.toMatch(/\by:\s*-8\b/);
  });
});

describe("QuickGive width handoff", () => {
  const source = readRepo(
    "apps",
    "donor",
    "features",
    "giving",
    "components",
    "QuickGiveInput.tsx",
  );

  it("does not claim that container layout owns a width morph", () => {
    expect(source).not.toMatch(/layout owns the width morph/i);
    expect(source).not.toMatch(/already owns the width morph/i);
  });

  it("hands width through the flex-1 amount row and safe presence", () => {
    expect(source).toMatch(
      /<motion\.(?:div|span)[^>]*\blayout\b[^>]*\bflex-1\b|<motion\.(?:div|span)[^>]*\bflex-1\b[^>]*\blayout\b/,
    );
    const presence = openingTagBefore(source, "{isExpanded &&");
    expect(presence).toContain("AnimatePresence");
    expect(hasSafePresenceMode(presence)).toBe(true);
  });

  it("does not translate the Give button on x inside overflow-hidden", () => {
    const buttonBlock = source.slice(source.indexOf("{isExpanded &&"));
    expect(buttonBlock).not.toMatch(/\bx:\s*20\b/);
  });
});

describe("wallet and sibling strip exits", () => {
  it("removes the ACH nudge from flow on dismiss", () => {
    const source = readRepo(
      "apps",
      "donor",
      "app",
      "(dashboard)",
      "donor-dashboard",
      "wallet",
      "page-client.tsx",
    );
    const banner = extractFunction(source, "ACHNudgeBanner");
    const presence = openingTagBefore(banner, "{visible &&");
    expect(presence).toContain("AnimatePresence");
    expect(presence).toMatch(/mode=["']popLayout["']/);
  });

  it.each([
    {
      name: "moderation flag-reason strip",
      parts: [
        "apps",
        "admin",
        "app",
        "(app)",
        "feed",
        "content-moderation-sections.tsx",
      ] as const,
      marker: "{post.flagReason &&",
    },
    {
      name: "org-updates compose media strip",
      parts: [
        "apps",
        "admin",
        "app",
        "(app)",
        "feed",
        "org-updates",
        "page-client.tsx",
      ] as const,
      marker: "{selectedMedia.length > 0 &&",
    },
    {
      name: "worker-feed compose media strip",
      parts: [
        "apps",
        "missionary",
        "app",
        "feed",
        "worker-feed-page-client.tsx",
      ] as const,
      marker: "{selectedMedia.length > 0 &&",
    },
  ])("uses safe presence for the $name", ({ parts, marker }) => {
    const source = readRepo(...parts);
    const presence = openingTagBefore(source, marker);
    expect(presence).toContain("AnimatePresence");
    expect(hasSafePresenceMode(presence)).toBe(true);
  });
});

describe("stable tag-check slot", () => {
  const source = readRepo(
    "apps",
    "missionary",
    "app",
    "donors",
    "use-donors-page-view.tsx",
  );
  const tagEditor = extractFunction(source, "DonorsTagEditorDialog");

  it("reserves the check column so selecting a tag does not shift the label", () => {
    expect(tagEditor).toMatch(
      /className="inline-flex w-3 mr-1 justify-center"/,
    );
    expect(tagEditor).toMatch(/<Check className="size-3"/);
    expect(tagEditor).not.toMatch(/<Check className="size-3 mr-1"/);
  });
});

describe("reserved form-error line", () => {
  const source = readRepo(
    "apps",
    "missionary",
    "app",
    "profile",
    "profile-primitives.tsx",
  );
  const field = extractFunction(source, "FormField");

  it("keeps a reserved error line and adds no extra error motion", () => {
    expect(field).toMatch(/\bmin-h-4\b/);
    const errorBranch = field.slice(field.indexOf("{error"));
    expect(errorBranch).not.toMatch(/\by:\s*-4\b/);
    expect(errorBranch).not.toMatch(
      /<(?:motion\.)p\b[^>]*\b(?:initial|animate|exit)=/,
    );
  });
});
