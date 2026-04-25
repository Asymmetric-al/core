import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

const routeSplits = [
  {
    wrapperPath: "apps/donor/app/(dashboard)/donor-dashboard/feed/page.tsx",
    clientPath:
      "apps/donor/app/(dashboard)/donor-dashboard/feed/feed-page-client.tsx",
    importPath: "./feed-page-client",
    componentName: "DonorFeedPage",
  },
  {
    wrapperPath: "apps/donor/app/(dashboard)/donor-dashboard/history/page.tsx",
    clientPath:
      "apps/donor/app/(dashboard)/donor-dashboard/history/history-page-client.tsx",
    importPath: "./history-page-client",
    componentName: "DonorHistoryPage",
  },
  {
    wrapperPath: "apps/missionary/app/analytics/page.tsx",
    clientPath: "apps/missionary/app/analytics/analytics-page-client.tsx",
    importPath: "./analytics-page-client",
    componentName: "AnalyticsPage",
  },
  {
    wrapperPath: "apps/admin/app/reports/page.tsx",
    clientPath: "apps/admin/app/reports/reports-page-client.tsx",
    importPath: "./reports-page-client",
    componentName: "MissionControlReports",
  },
] as const;

const loadingPaths = [
  "apps/donor/app/(dashboard)/donor-dashboard/feed/loading.tsx",
  "apps/donor/app/(dashboard)/donor-dashboard/history/loading.tsx",
  "apps/missionary/app/analytics/loading.tsx",
] as const;

describe("UI route cleanup contracts", () => {
  it("keeps route pages as tiny server wrappers around client components", () => {
    for (const route of routeSplits) {
      const wrapperSource = readRepoFile(route.wrapperPath);
      const clientSource = readRepoFile(route.clientPath);

      expect(wrapperSource).not.toMatch(/^["']use client["'];/m);
      expect(wrapperSource).toContain(
        `import ${route.componentName} from "${route.importPath}";`,
      );
      expect(wrapperSource).toContain(`return <${route.componentName} />;`);
      expect(clientSource.startsWith('"use client";')).toBe(true);
    }
  });

  it("keeps added loading fallbacks server-rendered and Skeleton-only", () => {
    for (const path of loadingPaths) {
      const source = readRepoFile(path);
      const importLines = source.match(/^import .+$/gm) ?? [];

      expect(source).not.toMatch(/^["']use client["'];/m);
      expect(importLines).toEqual([
        'import { Skeleton } from "@asym/ui/components/shadcn/skeleton";',
      ]);
      expect(source).toMatch(/export default function Loading\(\)/);
    }
  });

  it("guards touched client files against broad or slow motion regressions", () => {
    const clientSources = routeSplits.map((route) =>
      readRepoFile(route.clientPath),
    );

    for (const source of clientSources) {
      expect(source).not.toMatch(/transition-all/);
      expect(source).not.toMatch(/duration-700/);
      expect(source).not.toMatch(/duration-500/);
      expect(source).not.toMatch(/animate-bounce/);
    }
  });

  it("keeps donor feed actions named and image motion targeted", () => {
    const source = readRepoFile(
      "apps/donor/app/(dashboard)/donor-dashboard/feed/feed-page-client.tsx",
    );

    expect(source).toContain('aria-label="Open post actions"');
    expect(source).toContain('aria-label="Share post"');
    expect(source).toContain(
      "grayscale hover:grayscale-0 transition-[filter] duration-300 ease-out",
    );
  });

  it("keeps donor history page fade and chart cells on targeted motion", () => {
    const source = readRepoFile(
      "apps/donor/app/(dashboard)/donor-dashboard/history/history-page-client.tsx",
    );

    expect(source).toContain(
      'className="transition-opacity duration-200 hover:opacity-80"',
    );
    expect(source).toContain(
      'className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 pb-20"',
    );
  });

  it("keeps missionary analytics neutral chart colors on Maia CSS variables", () => {
    const source = readRepoFile(
      "apps/missionary/app/analytics/analytics-page-client.tsx",
    );

    expect(source).toContain('color: "var(--foreground)"');
    expect(source).toContain('color: "var(--muted-foreground)"');
    expect(source).toContain('color: "var(--muted)"');
    expect(source).toContain('fill: "var(--muted-foreground)"');
    expect(source).toContain('cursor={{ fill: "var(--muted)", radius: 4 }}');
    expect(source).toContain('fill="var(--foreground)"');
    expect(source).toContain('fill="var(--muted)"');
    expect(source).toContain('stroke="var(--foreground)"');
    expect(source).toContain('stroke="var(--muted)"');
    expect(source).toContain('color: "#eab308"');
    expect(source).not.toMatch(/#(18181b|71717a|a1a1aa|f4f4f5|e4e4e7)/i);
  });

  it("keeps admin reports summary dismissible by accessible name", () => {
    const source = readRepoFile(
      "apps/admin/app/reports/reports-page-client.tsx",
    );

    expect(source).toContain('aria-label="Dismiss report summary"');
    expect(source).toContain("transition-colors duration-150");
  });
});
