import { describe, expect, it } from "vitest";

import {
  parseDryRun,
  parseFileDiff,
  sourceHash,
} from "../../../scripts/verify/shadcn-diff.mjs";

const canonicalPath = "components/shadcn/button.tsx";
const windowsPaths = [
  String.raw`components\shadcn\button.tsx`,
  String.raw`components/shadcn\button.tsx`,
  String.raw`components\shadcn/button.tsx`,
];

function preview(file: string, status = "overwrite") {
  return [
    "┌ shadcn add button (dry run)",
    "├ Files (1)",
    `│ ~ ${file}  ${status}`,
    "├ Dependencies (1)",
    "│ + cn",
    "└ Run without --dry-run to apply.",
  ].join("\n");
}

function diff(
  file: string,
  status = "overwrite",
  before = "export const value = 'Core';",
  after = "export const value = 'upstream';",
) {
  return [
    "┌ shadcn add button (dry run)",
    `├ ${file} (${status})`,
    "│ ┌──────────────",
    `│ │ --- a/${file}`,
    `│ │ +++ b/${file}`,
    "│ │ @@ -1,1 +1,1 @@",
    `│ │ -${before}`,
    `│ │ +${after}`,
    "│ └──────────────",
    "└ Run without --dry-run to apply.",
  ].join("\n");
}

describe("shadcn CLI path presentation", () => {
  describe.each(["overwrite", "create", "unchanged"])("%s", (status) => {
    it.each(windowsPaths)(
      "canonicalizes inventory path %s without changing the review hash",
      (file) => {
        expect(parseDryRun(preview(file, status), "button")).toEqual({
          name: "button",
          previewSha256: sourceHash(preview(canonicalPath, status)),
          files: [{ path: canonicalPath, status }],
        });
      },
    );

    it.each(windowsPaths)(
      "canonicalizes diff metadata %s without changing the review hash",
      (file) => {
        expect(parseFileDiff(diff(file, status), "button", canonicalPath)).toBe(
          sourceHash(diff(canonicalPath, status)),
        );
      },
    );
  });

  it("preserves source backslashes including source that resembles diff file labels", () => {
    const before = String.raw`-- a/components\shadcn\source.tsx`;
    const after = String.raw`++ b/components\shadcn\source.tsx`;
    const output = diff(windowsPaths[0]!, "overwrite", before, after);
    const expected = diff(canonicalPath, "overwrite", before, after);
    expect(parseFileDiff(output, "button", canonicalPath)).toBe(
      sourceHash(expected),
    );
    expect(parseFileDiff(output, "button", canonicalPath)).not.toBe(
      sourceHash(expected.replaceAll("\\", "/")),
    );
  });

  it("preserves backslashes and trailing spaces in dependency and source content", () => {
    const dependency = String.raw`│ + package\dependency`;
    const output = preview(windowsPaths[0]!).replace("│ + cn", dependency);
    expect(parseDryRun(output, "button").previewSha256).toBe(
      sourceHash(preview(canonicalPath).replace("│ + cn", dependency)),
    );
    expect(parseDryRun(output, "button").previewSha256).not.toBe(
      parseDryRun(output.replaceAll("\\", "/"), "button").previewSha256,
    );
    const before = String.raw`export const file = "components\shadcn\source.tsx";`;
    const source = diff(windowsPaths[0]!, "overwrite", before, `${before} `);
    expect(parseFileDiff(source, "button", canonicalPath)).toBe(
      sourceHash(diff(canonicalPath, "overwrite", before, `${before} `)),
    );
    expect(parseFileDiff(source, "button", canonicalPath)).not.toBe(
      parseFileDiff(
        source.replaceAll("\\", "/").trimEnd(),
        "button",
        canonicalPath,
      ),
    );
  });

  it.each([
    "../outside.tsx",
    "components/../outside.tsx",
    String.raw`components\..\outside.tsx`,
    String.raw`components/..\outside.tsx`,
    String.raw`components\../outside.tsx`,
    "/outside.tsx",
    String.raw`\outside.tsx`,
    String.raw`\\server\share\outside.tsx`,
    String.raw`C:\outside.tsx`,
    "C:/outside.tsx",
    String.raw`C:outside.tsx`,
    "components/%2e%2e/outside.tsx",
    "components/shadcn/bad\0.tsx",
    "components/shadcn/bad name.tsx",
  ])("rejects unsafe path metadata %j in both previews and diffs", (file) => {
    expect(() => parseDryRun(preview(file), "button")).toThrow(
      "Invalid relative path in shadcn coverage",
    );
    expect(() => parseFileDiff(diff(file), "button", canonicalPath)).toThrow(
      "Invalid relative path in shadcn coverage",
    );
  });

  it("rejects duplicate coverage after canonicalizing path separators", () => {
    const output = preview(canonicalPath)
      .replace("Files (1)", "Files (2)")
      .replace(
        "├ Dependencies",
        `│ ~ ${windowsPaths[0]}  overwrite\n├ Dependencies`,
      );
    expect(() => parseDryRun(output, "button")).toThrow(
      "Duplicate button files coverage",
    );
  });

  it("keeps mismatched paths and truncated hunks fail-closed", () => {
    expect(() =>
      parseFileDiff(
        diff(windowsPaths[0]!),
        "button",
        "components/shadcn/dialog.tsx",
      ),
    ).toThrow(/mismatched/);
    expect(() =>
      parseFileDiff(
        diff(windowsPaths[0]!).replace("@@ -1,1 +1,1 @@", "@@ -1,2 +1,2 @@"),
        "button",
        canonicalPath,
      ),
    ).toThrow(/Truncated/);
  });
});
