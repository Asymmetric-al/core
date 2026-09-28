import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../../", import.meta.url);

describe("checkout runtime config apply-time identity", () => {
  it("ignores a superseded runtime config response at apply time", () => {
    const source = readFileSync(
      new URL(
        "apps/donor/app/(public)/(solid)/checkout/checkout-client.tsx",
        root,
      ),
      "utf8",
    );

    expect(source).toContain(
      "runtimeConfigAbortRef.current !== abortController",
    );
  });

  it("mirrors the mounted key at layout commit independently of checkout state", () => {
    const source = readFileSync(
      new URL(
        "apps/donor/app/(public)/(solid)/checkout/checkout-client.tsx",
        root,
      ),
      "utf8",
    );

    expect(source).not.toMatch(
      /const mountedPublishableKeyRef = useRef\(mountedPublishableKey\);\s*mountedPublishableKeyRef\.current = mountedPublishableKey;/,
    );
    expect(source).toMatch(
      /useLayoutEffect\(\(\) => \{\s*mountedPublishableKeyRef\.current = mountedPublishableKey;\s*\}, \[mountedPublishableKey\]\);/,
    );
  });
});
