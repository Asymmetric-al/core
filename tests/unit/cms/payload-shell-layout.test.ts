import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const PAYLOAD_STYLES_PATH = path.join(
  process.cwd(),
  "apps/admin/src/styles/payloadStyles.css",
);

describe("Payload Web Studio shell layout", () => {
  it("keeps database diagnostics server-side and offers neutral recovery actions", () => {
    const source = readFileSync(
      path.join(process.cwd(), "apps/admin/app/(payload)/layout.tsx"),
      "utf8",
    );

    expect(source).toContain("console.error(cause)");
    expect(source).toContain("<WebStudioDatabaseConfigurationError />");
    expect(source).not.toContain("{error.message}");
    expect(source).toMatch(/Ask your\s+administrator to check the setup/);
    expect(source).toContain("Try again");
    expect(source).toContain("Back to Mission Control");
    expect(source).toContain("@layer payload-default, payload;");
  });

  it("does not enable Payload's in-process cron job runner in layout.tsx (WP6 part 2a, NC-05)", () => {
    const source = readFileSync(
      path.join(process.cwd(), "apps/admin/app/(payload)/layout.tsx"),
      "utf8",
    );
    const getPayloadMatch = /getPayload\(\{[\s\S]*?\}\)/.exec(source);

    expect(getPayloadMatch).not.toBeNull();
    expect(getPayloadMatch?.[0]).not.toMatch(/\bcron\b/);
  });

  it("does not force every Payload wrapper section to consume the first viewport", () => {
    const styles = readFileSync(PAYLOAD_STYLES_PATH, "utf8");
    const wrapperRuleBody =
      styles.match(/\\.payload-admin-wrapper\\s*{(?<body>[^}]*)}/)?.groups
        ?.body ?? "";

    expect(wrapperRuleBody).not.toMatch(/min-height\\s*:\\s*100vh/);
  });
});
