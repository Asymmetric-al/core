import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const MEDIA_STORE = "packages/api/src/storage/media-store.ts";

describe("#2773 (WP6 rest, pull request 2): the media store's allowlist entry points at the admin client's acquisition", () => {
  it("names, in lines, each line of media-store.ts that acquires the admin client, and nothing else", () => {
    const allowlist = JSON.parse(
      readFileSync(
        path.join(root, "docs/security/service-role-client-allowlist.json"),
        "utf8",
      ),
    ) as { entries: Array<{ file: string; count: number; lines: number[] }> };
    const entry = allowlist.entries.find((item) => item.file === MEDIA_STORE);
    expect(entry).toBeDefined();
    const source = readFileSync(path.join(root, MEDIA_STORE), "utf8").split(
      "\n",
    );
    const acquisitions = source.flatMap((line, index) =>
      /\bgetAdminClient\(\)/.test(line) ? [index + 1] : [],
    );
    expect(acquisitions).toHaveLength(entry!.count);
    expect(entry!.lines).toEqual(acquisitions);
  });
});
