import { describe, expect, it } from "vitest";

import { sanitizeRegistryPayload } from "../../../scripts/shadcn/add-shadcnuikit";

describe("add-shadcnuikit registry payload sanitizer", () => {
  it("preserves non-empty targets that use approved shadcn aliases", () => {
    const sanitized = sanitizeRegistryPayload({
      files: [
        { target: "@ui/button.tsx" },
        { target: "@components/hero.tsx" },
        { target: "@lib/format.ts" },
        { target: "@hooks/use-panel.ts" },
        { target: "@utils/cn.ts" },
      ],
    });

    expect(sanitized.files?.map((file) => file.target)).toEqual([
      "@ui/button.tsx",
      "@components/hero.tsx",
      "@lib/format.ts",
      "@hooks/use-panel.ts",
      "@utils/cn.ts",
    ]);
  });

  it("removes empty or unsafe targets before handing payloads to shadcn", () => {
    const sanitized = sanitizeRegistryPayload({
      files: [
        { target: "" },
        { target: "   " },
        { target: "../escape.tsx" },
        { target: "@ui/../escape.tsx" },
        { target: "/absolute.tsx" },
        { target: "C:\\absolute\\button.tsx" },
        { target: "file:///tmp/button.tsx" },
        { target: "components/button.tsx" },
      ],
    });

    expect(sanitized.files).toEqual([{}, {}, {}, {}, {}, {}, {}, {}]);
  });

  it("keeps safe registry:file and registry:page targets", () => {
    const sanitized = sanitizeRegistryPayload({
      files: [
        {
          type: "registry:file",
          target: "@lib/navigation/menu.ts",
        },
        {
          type: "registry:page",
          target: "@components/pages/dashboard.tsx",
        },
      ],
    });

    expect(sanitized.files).toEqual([
      {
        type: "registry:file",
        target: "@lib/navigation/menu.ts",
      },
      {
        type: "registry:page",
        target: "@components/pages/dashboard.tsx",
      },
    ]);
  });
});
