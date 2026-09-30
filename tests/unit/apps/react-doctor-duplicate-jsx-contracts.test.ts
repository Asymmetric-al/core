import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("duplicate JSX extraction contracts", () => {
  it("keeps Email Studio and PDF Studio chrome on the shared studio components", () => {
    const email = readRepoFile("apps/admin/app/(app)/email/page-client.tsx");
    const emailHeader = readRepoFile(
      "apps/admin/app/(app)/email/email-studio-header.tsx",
    );
    const pdf = readRepoFile("apps/admin/app/(app)/pdf/page-client.tsx");
    const chrome = readRepoFile(
      "apps/admin/components/studio/studio-chrome.tsx",
    );

    expect(chrome).toContain("export function StudioTemplateBreadcrumb");
    expect(chrome).toContain("export function StudioPreviewDeviceToggle");
    expect(chrome).toContain("export function StudioSaveButton");
    expect(chrome).toContain("export function StudioExportedHtmlPreview");
    expect(chrome).toContain("const EXPORT_PREVIEW_LIMIT = 3000");
    expect(chrome).toContain("html.slice(0, EXPORT_PREVIEW_LIMIT)");
    expect(chrome).toContain("html.length > EXPORT_PREVIEW_LIMIT");
    expect(chrome).toContain("more characters");

    expect(email).toContain('from "./email-studio-header"');
    expect(email).toContain("<EmailStudioHeader");
    expect(email).not.toContain("function EmailStudioHeader(");
    expect(emailHeader).toContain("export function EmailStudioHeader");

    expect(pdf).toContain('from "@/components/studio/studio-chrome"');
    expect(pdf).toContain("<StudioTemplateBreadcrumb");
    expect(pdf).toContain("<StudioPreviewDeviceToggle");
    expect(pdf).toContain("<StudioSaveButton");
    expect(pdf).toContain("<StudioExportedHtmlPreview");
  });

  it("reuses the contributions boneyard fallback as the loading skeleton body", () => {
    const loading = readRepoFile(
      "apps/admin/app/(app)/contributions/loading.tsx",
    );

    expect(loading).toContain(
      'import { ContributionsBoneyardFallback } from "./boneyard-fallback"',
    );
    expect(loading).toContain("<ContributionsBoneyardFallback />");
    expect(loading).not.toContain("Array.from({ length: 4 })");
    expect(loading).not.toContain("Array.from({ length: 8 })");
  });

  it("does not keep a second identical tenant-default dialog", () => {
    const dialogs = readRepoFile(
      "apps/admin/app/(app)/crm/gift-history-dialogs.tsx",
    );

    expect(dialogs).toContain("export function SetTenantDefaultDialog");
    expect(dialogs).not.toMatch(/export function TenantDefaultDialog\b/);
    expect(dialogs.match(/data-testid="tenant-default-confirm"/g)).toEqual([
      'data-testid="tenant-default-confirm"',
    ]);
  });

  it("shares worker story copy between the server page and the client profile", () => {
    const page = readRepoFile(
      "apps/donor/app/(public)/(solid)/workers/[id]/page.tsx",
    );
    const client = readRepoFile(
      "apps/donor/app/(public)/(solid)/workers/[id]/worker-profile-client.tsx",
    );
    const story = readRepoFile(
      "apps/donor/app/(public)/(solid)/workers/[id]/worker-story.tsx",
    );

    expect(story).toContain("export function WorkerStory");
    expect(page).toContain('from "./worker-story"');
    expect(client).toContain('from "./worker-story"');
    expect(page).toContain("<WorkerStory");
    expect(client).toContain("<WorkerStory");
    expect(page).not.toContain("Direct Impact");
    expect(client).not.toContain("Direct Impact");
  });

  it("shares metric tiles and highlights across missionary and sales metrics cards", () => {
    const missionary = readRepoFile(
      "packages/ui/components/shadcn-studio/blocks/chart-missionary-metrics.tsx",
    );
    const sales = readRepoFile(
      "packages/ui/components/shadcn-studio/blocks/chart-sales-metrics.tsx",
    );
    const parts = readRepoFile(
      "packages/ui/components/shadcn-studio/blocks/metrics-card-parts.tsx",
    );

    expect(parts).toContain("export function MetricTileGrid");
    expect(parts).toContain("export function MetricHighlightPair");

    for (const source of [missionary, sales]) {
      expect(source).toContain(
        'from "@asym/ui/components/shadcn-studio/blocks/metrics-card-parts"',
      );
      expect(source).toContain("<MetricTileGrid");
      expect(source).toContain("<MetricHighlightPair");
    }
  });
});
