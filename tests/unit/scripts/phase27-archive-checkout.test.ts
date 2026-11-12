import { execFileSync } from "node:child_process";

import { expect, it } from "vitest";

it.each(["capture.py", "capture.log", "capture.md", "capture.json"])(
  "preserves exact Phase 27 archive bytes at checkout for %s",
  (name) => {
    const attributes = execFileSync(
      "git",
      [
        "check-attr",
        "text",
        "eol",
        "--",
        `docs/features/donor-development/grill/${name}`,
      ],
      { encoding: "utf8", windowsHide: true },
    );
    expect(attributes).toContain(": text: unset");
    expect(attributes).toContain(": eol: unset");
  },
);
