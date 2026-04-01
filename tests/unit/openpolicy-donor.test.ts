import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import openPolicyConfig from "../../apps/donor/openpolicy";
import {
  generateOpenPolicyArtifacts,
  validateOpenPolicyConfig,
} from "../../apps/donor/scripts/openpolicy";

describe("donor OpenPolicy scaffold", () => {
  it("passes structural validation without fatal errors", () => {
    const result = validateOpenPolicyConfig(openPolicyConfig);

    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
    expect(openPolicyConfig.company.contact).toBe("info@asymmetric.al");
    expect(openPolicyConfig.privacy?.effectiveDate).toBe("April 2, 2026");
    expect(openPolicyConfig.terms?.governingLaw.jurisdiction).toBe(
      "California, United States",
    );
  });

  it("generates markdown artifacts for all configured policy types", async () => {
    const outDir = await mkdtemp(join(tmpdir(), "openpolicy-donor-"));
    const generated = await generateOpenPolicyArtifacts({
      config: openPolicyConfig,
      formats: ["markdown"],
      outDir,
    });

    expect(
      generated.map((artifact) => artifact.path.split(/[\\/]/).pop()).sort(),
    ).toEqual(["cookie-policy.md", "privacy-policy.md", "terms-of-service.md"]);

    const privacyMarkdown = await readFile(
      generated.find((artifact) => artifact.policyType === "privacy")!.path,
      "utf8",
    );
    const termsMarkdown = await readFile(
      generated.find((artifact) => artifact.policyType === "terms")!.path,
      "utf8",
    );
    const cookieMarkdown = await readFile(
      generated.find((artifact) => artifact.policyType === "cookie")!.path,
      "utf8",
    );

    expect(privacyMarkdown).toContain("Privacy Policy");
    expect(privacyMarkdown).toContain("April 2, 2026");
    expect(privacyMarkdown).toContain("info@asymmetric.al");
    expect(privacyMarkdown).toContain("Global Fellowship Inc.");
    expect(privacyMarkdown).not.toContain("Pending legal review");
    expect(privacyMarkdown).not.toContain("TODO:");
    expect(privacyMarkdown).toContain("Retained for 7 years.");
    expect(privacyMarkdown).toContain("Rolling overwrite within 35 days.");

    expect(termsMarkdown).toContain("April 2, 2026");
    expect(termsMarkdown).not.toContain("California..");

    expect(cookieMarkdown).toContain("April 2, 2026");
    expect(cookieMarkdown).toContain("**Email:** info@asymmetric.al");
    expect(cookieMarkdown).not.toContain("**Email: **");
  });
});
