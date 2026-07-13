import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  CRM_POSTING_UNAVAILABLE_NEXT_STEP,
  CRM_POSTING_UNAVAILABLE_REASON,
  isContributionCrmPostingSupported,
  isContributionRouteCrmRetryScopeSupported,
} from "../../../../../packages/api/src/admin/contribution-operations/crm-retry-support";

const clientComponentPaths = [
  "../../../../../apps/admin/app/contributions/contribution-detail-sheet.tsx",
  "../../../../../apps/admin/app/contributions/operation-shell.tsx",
  "../../../../../apps/admin/app/crm/gift-inline-action-controls.tsx",
].map((relativePath) => fileURLToPath(new URL(relativePath, import.meta.url)));
const retrySupportPath = fileURLToPath(
  new URL(
    "../../../../../packages/api/src/admin/contribution-operations/crm-retry-support.ts",
    import.meta.url,
  ),
);
const apiPackagePath = fileURLToPath(
  new URL("../../../../../packages/api/package.json", import.meta.url),
);

describe("contribution CRM retry client imports", () => {
  it.each(clientComponentPaths)(
    "imports browser-safe retry policy in %s",
    (componentPath) => {
      const source = readFileSync(componentPath, "utf8");
      expect(source).toContain(
        'from "@asym/api/admin/contribution-operations/crm-retry-support"',
      );
    },
  );

  it("keeps the browser-safe policy module free of server-only dependencies", () => {
    const source = readFileSync(retrySupportPath, "utf8");
    expect(source).not.toMatch(/next\/server|shared\/http-errors/);

    const packageJson = JSON.parse(readFileSync(apiPackagePath, "utf8")) as {
      exports?: Record<string, string>;
    };
    expect(
      packageJson.exports?.[
        "./admin/contribution-operations/crm-retry-support"
      ],
    ).toBe("./src/admin/contribution-operations/crm-retry-support.ts");
  });

  it("keeps the CRM table-preferences client graph free of next/server", () => {
    // GiftInlineActionControls (a client component) imports
    // resolveCrmRowAction from the table-preferences barrel, which reaches
    // row-action -> inline-actions -> viewer-action-availability ->
    // permissions/approval-policy. None of those modules may pull
    // shared/http-errors (and its next/server import) into the client
    // bundle; browser-safe throwers use shared/api-http-error instead.
    const clientGraphModulePaths = [
      "../../../../../packages/api/src/admin/crm/table-preferences/index.ts",
      "../../../../../packages/api/src/admin/crm/table-preferences/row-action.ts",
      "../../../../../packages/api/src/admin/crm/table-preferences/view-settings.ts",
      "../../../../../packages/api/src/admin/contribution-operations/inline-actions.ts",
      "../../../../../packages/api/src/admin/contribution-operations/viewer-action-availability.ts",
      "../../../../../packages/api/src/admin/contribution-operations/permissions.ts",
      "../../../../../packages/api/src/admin/contribution-operations/approval-policy.ts",
      "../../../../../packages/api/src/admin/contribution-operations/policy.ts",
      "../../../../../packages/api/src/shared/api-http-error.ts",
    ].map((relativePath) =>
      fileURLToPath(new URL(relativePath, import.meta.url)),
    );

    for (const modulePath of clientGraphModulePaths) {
      const source = readFileSync(modulePath, "utf8");
      expect(source).not.toMatch(
        /from\s+"(?:next\/server|[^"]*shared\/http-errors)"/,
      );
    }
  });

  it("keeps every retired CRM posting scope fail closed with current guidance", () => {
    expect(isContributionCrmPostingSupported()).toBe(false);
    expect(isContributionRouteCrmRetryScopeSupported("parent")).toBe(false);
    expect(isContributionRouteCrmRetryScopeSupported("designation")).toBe(
      false,
    );
    expect(CRM_POSTING_UNAVAILABLE_REASON).toMatch(
      /no longer an active product workflow/i,
    );
    expect(CRM_POSTING_UNAVAILABLE_NEXT_STEP).toMatch(
      /historical evidence.*maintained in Asym/i,
    );
    expect(CRM_POSTING_UNAVAILABLE_NEXT_STEP).not.toMatch(
      /resolve.*CRM directly|retry a failed parent/i,
    );
  });
});
