import { describe, expect, it } from "vitest";

import {
  WEB_STUDIO_COLLECTION_PREFERENCE_MAP,
  WEB_STUDIO_PREF_KEYS,
} from "../../../apps/admin/src/cms-ui/web-studio/preferences/keys";

function flatten(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, inner]) => [
      key,
      ...flatten(inner),
    ]);
  }
  return [];
}

describe("Web Studio preference keys", () => {
  it("name no per-login list of recent documents", () => {
    expect(
      flatten({
        WEB_STUDIO_PREF_KEYS,
        WEB_STUDIO_COLLECTION_PREFERENCE_MAP,
      }).filter((entry) => entry.toLowerCase().includes("recent")),
    ).toEqual([]);
    for (const entry of Object.values(WEB_STUDIO_COLLECTION_PREFERENCE_MAP)) {
      expect(Object.keys(entry)).not.toContain("recentDocs");
    }
  });
});
