import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const PAYLOAD_STYLES_PATH = path.join(
  process.cwd(),
  "apps/admin/src/styles/payloadStyles.css",
);

describe("Payload Web Studio shell layout", () => {
  it("does not force every Payload wrapper section to consume the first viewport", () => {
    const styles = readFileSync(PAYLOAD_STYLES_PATH, "utf8");
    const wrapperRuleBody =
      styles.match(/\\.payload-admin-wrapper\\s*{(?<body>[^}]*)}/)?.groups
        ?.body ?? "";

    expect(wrapperRuleBody).not.toMatch(/min-height\\s*:\\s*100vh/);
  });
});
