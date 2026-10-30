/**
 * #2224 acceptance: static and listing checks on tests/e2e/upload-crop.spec.ts
 * (spec r1 §4 criteria 1, 9, 12-15).
 *
 * Owned by Acceptance; implementers must not edit this file, the harness, or
 * the fixtures in this directory.
 * Spec: https://github.com/Asymmetric-al/core/issues/2224#issuecomment-6369737684
 */
import { spawnSync } from "node:child_process";
import { statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  EXPECTED_E2E_COUNT,
  ROOT,
  SPEC_REL,
  TEST_IMAGE,
  TEST_IMAGE_BYTES,
  TEST_IMAGE_SHA256,
  TITLES,
  IMAGE_UTILS,
  loadSpec,
  read,
  sha256,
  specSource,
} from "./harness";

const pkg = () => JSON.parse(read(path.join(ROOT, "package.json")));

describe("#2224 criterion 1: no `if (await openAvatarCropper` bypass remains", () => {
  it("the spec has no `if (await openAvatarCropper(` (the §4.1 rg)", () => {
    expect(specSource()).not.toMatch(/if \(await openAvatarCropper/);
  });

  it("no conditional of any shape wraps an openAvatarCropper call", () => {
    expect(specSource()).not.toMatch(
      /(if|while)\s*\(\s*!?\s*\(?\s*await\s+openAvatarCropper/,
    );
    expect(specSource()).not.toMatch(
      /\?\s*await\s+openAvatarCropper|await\s+openAvatarCropper\([^)]*\)\s*(&&|\|\||\?)/,
    );
  });
});

describe("#2224 criterion 9: the >2MB test is retitled and the fake 50MB test is gone", () => {
  it("no `50MB safeguard` (case-insensitive) remains in the spec", () => {
    expect(specSource()).not.toMatch(/50MB safeguard/i);
  });

  it(`a test is titled exactly "${TITLES.largeFile}"`, () => {
    const titles = loadSpec().tests.map((t) => t.title);
    expect(titles).toContain(TITLES.largeFile);
  });

  it("no test title still claims a >2MB upload or a 50MB rejection", () => {
    const titles = loadSpec().tests.map((t) => t.title);
    expect(titles.filter((t) => /larger than 2\s?MB|50\s?MB/i.test(t))).toEqual(
      [],
    );
  });
});

describe("#2224 criterion 12: Playwright lists upload-crop under [chromium-donor] with both API tests", () => {
  it(`--list --project=chromium-donor lists exactly ${EXPECTED_E2E_COUNT} upload-crop tests, including both API tests`, () => {
    const r = spawnSync(
      process.execPath,
      [
        path.join(ROOT, "node_modules/@playwright/test/cli.js"),
        "test",
        SPEC_REL,
        "--project=chromium-donor",
        "--list",
        "--reporter=list",
      ],
      {
        cwd: ROOT,
        encoding: "utf8",
        env: { ...process.env, CI: "" },
        timeout: 120_000,
      },
    );
    const out = `${r.stdout}\n${r.stderr}`;
    expect(r.status, out).toBe(0);
    const lines = out
      .split("\n")
      .filter(
        (l) =>
          l.includes("[chromium-donor]") && l.includes("upload-crop.spec.ts"),
      );
    expect(lines.length, out).toBe(EXPECTED_E2E_COUNT);
    expect(
      lines.some((l) => l.includes(TITLES.apiInvalidToken)),
      out,
    ).toBe(true);
    expect(
      lines.some((l) => l.includes(TITLES.apiMissingAuth)),
      out,
    ).toBe(true);
  }, 150_000);

  it(`both API tests stay in the "${TITLES.apiSuite}" suite, unrenamed`, () => {
    const reg = loadSpec();
    for (const title of [TITLES.apiInvalidToken, TITLES.apiMissingAuth]) {
      const t = reg.tests.filter((x) => x.title === title);
      expect(t, title).toHaveLength(1);
      expect(t[0]!.describes, title).toEqual([TITLES.apiSuite]);
    }
  });
});

describe("#2224 criterion 13: the beforeAll Canvas generator is removed", () => {
  it("the spec registers no beforeAll hook", () => {
    expect(loadSpec().hooks.filter((h) => h.kind === "beforeAll")).toEqual([]);
  });

  it("the spec does not import or call canvas", () => {
    const src = specSource();
    expect(src).not.toMatch(/["']canvas["']/);
    expect(src).not.toMatch(/createCanvas|toBuffer\(\s*["']image\/png/);
    expect(loadSpec().requires).not.toContain("canvas");
  });

  it("the spec does not write the png fixture", () => {
    expect(specSource()).not.toMatch(/writeFileSync\(\s*TEST_IMAGE_PATH/);
  });
});

describe("#2224 criterion 14 (repo side): the spec's test inventory matches the PR's old->new map", () => {
  it(`the spec declares exactly ${EXPECTED_E2E_COUNT} tests (14 -> 11 per §1)`, () => {
    expect(loadSpec().tests.map((t) => t.title)).toHaveLength(
      EXPECTED_E2E_COUNT,
    );
  });

  it("the three per-MIME tests are merged away", () => {
    const titles = loadSpec().tests.map((t) => t.title);
    expect(
      titles.filter((t) => /should accept (JPEG|PNG|WebP) files/i.test(t)),
    ).toEqual([]);
  });

  it("test titles are unique", () => {
    const titles = loadSpec().tests.map((t) =>
      [...t.describes, t.title].join(" > "),
    );
    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe("#2224 criterion 15: no change to package.json, playwright.config.ts, CI, retries, timeouts or the fixture", () => {
  it("package.json keeps canvas and the smoke/gate scripts", () => {
    const p = pkg();
    expect(p.devDependencies?.canvas).toBe("3.2.3");
    expect(p.scripts["test:e2e:smoke"]).toContain(
      "node scripts/run-with-ci-env.mjs -- node node_modules/@playwright/test/cli.js test tests/e2e/upload-crop.spec.ts --project=chromium-donor --workers=1",
    );
    expect(p.scripts["verify:e2e"]).toBe("bun scripts/verify-e2e.mjs");
  });

  it("playwright.config.ts keeps retries, timeouts and the chromium-donor testMatch", () => {
    const cfg = read(path.join(ROOT, "playwright.config.ts"));
    expect(cfg).toContain("retries: process.env.CI ? 2 : 0,");
    expect(cfg).toContain("timeout: 90_000");
    expect(cfg).toContain("expect: { timeout: 15_000 }");
    expect(cfg).toContain(
      'testMatch: ["**/upload-crop.spec.ts", "**/donor-giving-history.spec.ts"]',
    );
  });

  it("the CI workflow still runs the smoke gate", () => {
    const wf = read(path.join(ROOT, ".github/workflows/ci-integration.yml"));
    expect(wf).toContain("run: bun run test:e2e:smoke");
    expect(wf).toMatch(/^ {2}e2e-smoke-gate:$/m);
  });

  it("the spec adds no retries, slow marks, timeout bumps or describe.configure", () => {
    const reg = loadSpec();
    expect(reg.calls.map((c) => c.kind)).not.toContain("describe.configure");
    expect(reg.calls.map((c) => c.kind)).not.toContain("slow");
    expect(reg.calls.map((c) => c.kind)).not.toContain("setTimeout");
    const src = specSource();
    expect(src).not.toMatch(
      /\bretries\b|test\.slow|\.setTimeout\(|describe\.configure/,
    );
    const timeouts = [...src.matchAll(/timeout:\s*([\d_]+)/g)].map((m) =>
      Number(m[1]!.replace(/_/g, "")),
    );
    expect(timeouts.filter((t) => t > 5000)).toEqual([]);
  });

  it("the fixture png is unchanged", () => {
    expect(sha256(TEST_IMAGE)).toBe(TEST_IMAGE_SHA256);
    expect(statSync(TEST_IMAGE).size).toBe(TEST_IMAGE_BYTES);
  });

  it("the product contract the spec relies on is unchanged", () => {
    const utils = read(IMAGE_UTILS);
    expect(utils).toMatch(/MAX_SAFEGUARD_SIZE_MB = 50\b/);
    expect(utils).toContain("file.size > MAX_SAFEGUARD_SIZE_BYTES");
    expect(utils).toContain("!isValidMime && !isValidExtension");
    const upload = read(
      path.join(ROOT, "packages/ui/components/primitives/image-upload.tsx"),
    );
    expect(upload).toContain(
      'const acceptTypes = "image/jpeg,image/png,image/webp,image/gif";',
    );
  });
});
