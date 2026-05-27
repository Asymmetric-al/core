import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  ".github/workflows/qa-smoke-preview-deploy.yml",
  "utf8",
);

describe("qa smoke preview deployment workflow", () => {
  it("uses a pull_request label gate and never pull_request_target", () => {
    expect(workflow).toContain("pull_request:");
    expect(workflow).toContain("types: [labeled, ready_for_review]");
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("pr_number:");
    expect(workflow).not.toContain("pull_request_target");
  });

  it("skips non-develop, draft, fork, missing-label, and non-smoke-label PRs", () => {
    expect(workflow).toContain('"${base_ref}" != "develop"');
    expect(workflow).toContain('"${draft}" == "true"');
    expect(workflow).toContain('"${head_repo}" != "${GITHUB_REPOSITORY}"');
    expect(workflow).toContain('"${has_label}" != "true"');
    expect(workflow).toContain('"${EVENT_LABEL_NAME}" != "qa:smoke"');
  });

  it("checks out the PR head SHA and deploys preview targets only", () => {
    expect(workflow).toContain("ref: ${{ steps.gate.outputs.head_sha }}");
    expect(workflow).toContain("vercel@latest deploy --yes --target=preview");
    expect(workflow).not.toContain("--prod");
    expect(workflow).not.toContain("--target=production");
  });

  it("uses the repository's configured Vercel project secret names", () => {
    expect(workflow).toContain("secrets.VERCEL_PROJECT_ID_ADMIN");
    expect(workflow).toContain("secrets.VERCEL_PROJECT_ID_DONOR");
    expect(workflow).toContain("secrets.VERCEL_PROJECT_ID_MISSIONARY");
    expect(workflow).not.toContain("secrets.VERCEL_ADMIN_PROJECT_ID");
    expect(workflow).not.toContain("secrets.VERCEL_DONOR_PROJECT_ID");
    expect(workflow).not.toContain("secrets.VERCEL_MISSIONARY_PROJECT_ID");
  });

  it("comments preview URLs and optional Claude handoff without requiring the webhook", () => {
    expect(workflow).toContain("# QA Smoke Preview Deployments");
    expect(workflow).toContain("<!-- qa-smoke-preview-ready");
    expect(workflow).toContain("CLAUDE_QA_ROUTINE_WEBHOOK_URL");
    expect(workflow).toContain("Claude QA routine webhook is not configured");
    expect(workflow).toContain("qa_smoke_preview_ready");
  });
});
