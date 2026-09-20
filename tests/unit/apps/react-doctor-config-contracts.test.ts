import { readFileSync } from "node:fs";

import { globSync } from "glob";
import { describe, expect, it } from "vitest";

const root = new URL("../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

function sourceFiles() {
  return globSync("{apps,packages}/**/*.{ts,tsx}", {
    cwd: root,
    nodir: true,
    windowsPathsNoEscape: true,
    ignore: [
      "**/.next/**",
      "**/coverage/**",
      "**/dist/**",
      "**/node_modules/**",
    ],
  })
    .map((path) => path.replaceAll("\\", "/"))
    .sort();
}

function sourceComponentFiles() {
  return globSync("{apps,packages}/**/*.tsx", {
    cwd: root,
    nodir: true,
    windowsPathsNoEscape: true,
    ignore: [
      "**/.next/**",
      "**/coverage/**",
      "**/dist/**",
      "**/node_modules/**",
    ],
  })
    .map((path) => path.replaceAll("\\", "/"))
    .sort();
}

describe("React Doctor config contracts", () => {
  it("does not keep react/no-danger globally ignored when first-party source has no runtime dangerous HTML assignments", () => {
    const config = JSON.parse(readRepoFile("doctor.config.json")) as {
      ignore?: { rules?: string[] };
    };

    const dangerousHtmlAssignments = sourceFiles().filter((path) => {
      const source = readRepoFile(path);
      return /dangerouslySetInnerHTML\s*=/.test(source);
    });

    expect(dangerousHtmlAssignments).toEqual([]);
    expect(config.ignore?.rules ?? []).not.toContain("react/no-danger");
  });

  it("keeps the only raw img usage limited to the documented Tiptap NodeView exception", () => {
    const rawImgFiles = sourceComponentFiles().filter((path) => {
      const source = readRepoFile(path);
      return /<img\b/.test(source);
    });

    expect(rawImgFiles).toEqual([
      "packages/ui/components/shadcn/rich-text-editor/image-view.tsx",
    ]);

    const imageViewSource = readRepoFile(rawImgFiles[0]);
    expect(imageViewSource).toContain(
      "Intentional raw img: TipTap needs a DOM ref",
    );
  });

  it("records the 2026-09-19 configured first-party audit as passing without expanding ignores", () => {
    const docs = readRepoFile("docs/guides/development/react-doctor.md");
    const config = JSON.parse(readRepoFile("doctor.config.json")) as {
      ignore?: { rules?: string[] };
    };

    expect(docs).toContain("## 2026-09-19 Cleanup Decisions");
    expect(docs).toContain(
      "React Doctor passes for the configured first-party audit",
    );
    expect(docs).toContain(
      "`doctor.config.json` ignore rules were not expanded",
    );

    for (const target of [
      "@asym/admin",
      "@asym/donor",
      "@asym/missionary-app",
      "@asym/auth",
      "@asym/database",
      "@asym/lib",
      "@asym/missionary",
      "@asym/ui",
    ]) {
      expect(docs).toContain(target);
    }

    expect(config.ignore?.rules ?? []).not.toContain(
      "react-doctor/no-high-complexity-react-function",
    );
    expect(config.ignore?.rules ?? []).not.toContain(
      "react-doctor/only-export-components",
    );
    expect(config.ignore?.rules ?? []).not.toContain(
      "react-doctor/duplicate-jsx-subtree",
    );

    expect(docs).toContain("`maplibre-gl@5.x` was locked at 5.23.0");
    expect(docs).toContain(
      "Remaining `parseJsonResponse` clones in portal hooks check `response.ok` before reading the JSON body.",
    );
    expect(docs).toContain(
      "the live email uploader in `packages/api/src/email/assets.ts` SHA-256s and sends `signature_algorithm=sha256`",
    );
    expect(docs).toContain(
      "Cloudinary signed uploads use SHA-256 instead of SHA-1.",
    );
    expect(docs).not.toContain(
      "the live email uploader still SHA-1s in `packages/api/src/email/assets.ts`",
    );
    expect(docs).not.toContain(
      "remaining `parseJsonResponse` clones in portal hooks still json-then-ok",
    );
    expect(docs).not.toContain("`maplibre-gl@5.x` (locked at 5.23.0)");
    expect(docs).not.toContain(
      "Moving to Cloudinary's SHA-256 option is possible",
    );
    expect(docs).not.toContain(
      "The 2026-09-19 pass later switched signed uploads to Cloudinary's SHA-256 option.",
    );
    expect(docs).not.toContain(
      "The 2026-09-19 pass later checked `response.ok` before reading the body at the remaining first-party sites.",
    );
    expect(docs).not.toContain(
      "Fetch `response.ok` before reading the body at the remaining first-party sites.",
    );
    expect(docs).not.toContain(
      "This helper is currently unused: no production caller imports it",
    );

    const emailAssetsSource = readRepoFile("packages/api/src/email/assets.ts");
    expect(emailAssetsSource).toContain("generateCloudinarySignature");
    expect(emailAssetsSource).not.toMatch(/createHash\(["']sha1["']\)/);

    const cloudinaryServerSource = readRepoFile(
      "packages/lib/cloudinary-server.ts",
    );
    expect(cloudinaryServerSource).toContain(
      "packages/api/src/email/assets.ts",
    );
    expect(cloudinaryServerSource).not.toContain(
      "This helper is currently unused: no production caller imports it",
    );
    expect(docs).not.toContain("the live email uploader still SHA-1s");

    const remainingPortalFiles = [
      "packages/database/collections/admin-locations.ts",
      "packages/database/hooks/admin-locations.ts",
      "packages/database/hooks/donor-portal.ts",
      "packages/database/hooks/member-care.ts",
      "packages/database/hooks/missionary-portal.ts",
    ];

    for (const path of remainingPortalFiles) {
      const source = readRepoFile(path);
      expect(source).not.toMatch(/async function parseJsonResponse/);
      expect(source).toContain('from "../http/parse-json-response"');
    }

    const tasks = readRepoFile("packages/lib/hooks/use-tasks.ts");
    expect(tasks).not.toMatch(/async function parseJsonResponse/);
    expect(tasks).not.toContain("parseJsonResponse");
    expect(tasks).toContain("fetchJsonResult");
    expect(tasks).toContain('from "../http/fetch-result"');
  });

  it("does not let packages/database import @asym/lib", () => {
    const databaseLibImports = sourceFiles().filter((path) => {
      if (!path.startsWith("packages/database/")) {
        return false;
      }
      return /(?:from|import)\s*\(?\s*["']@asym\/lib/.test(readRepoFile(path));
    });
    expect(databaseLibImports).toEqual([]);
  });

  it("records live Cloudinary email uploads as SHA-256", () => {
    const docs = readRepoFile("docs/guides/development/react-doctor.md");
    const assets = readRepoFile("packages/api/src/email/assets.ts");

    expect(assets).toContain("generateCloudinarySignature");
    expect(assets).toContain('formData.set("signature_algorithm", "sha256")');
    expect(assets).not.toContain('createHash("sha256")');
    expect(assets).not.toContain('signature_algorithm: "sha256"');
    expect(docs).toContain(
      "the live email uploader in `packages/api/src/email/assets.ts` SHA-256s and sends `signature_algorithm=sha256`",
    );
    expect(docs).not.toContain("the live email uploader still SHA-1s");
  });
});
