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

  it("records live Cloudinary email uploads as SHA-256", () => {
    const docs = readRepoFile("docs/guides/development/react-doctor.md");
    const assets = readRepoFile("packages/api/src/email/assets.ts");

    expect(assets).toContain('createHash("sha256")');
    expect(assets).toContain('formData.set("signature_algorithm", "sha256")');
    expect(assets).not.toContain('signature_algorithm: "sha256"');
    expect(docs).toContain(
      "the live email uploader in `packages/api/src/email/assets.ts` SHA-256s and sends `signature_algorithm=sha256`",
    );
    expect(docs).not.toContain("the live email uploader still SHA-1s");
  });
});
