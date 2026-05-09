import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

const routeSplits = [
  {
    name: "admin events",
    wrapperPath: "apps/admin/app/events/page.tsx",
    clientPath: "apps/admin/app/events/page-client.tsx",
  },
  {
    name: "admin reports",
    wrapperPath: "apps/admin/app/reports/page.tsx",
    clientPath: "apps/admin/app/reports/page-client.tsx",
  },
  {
    name: "donor feed",
    wrapperPath: "apps/donor/app/(dashboard)/donor-dashboard/feed/page.tsx",
    clientPath:
      "apps/donor/app/(dashboard)/donor-dashboard/feed/page-client.tsx",
  },
  {
    name: "donor history",
    wrapperPath: "apps/donor/app/(dashboard)/donor-dashboard/history/page.tsx",
    clientPath:
      "apps/donor/app/(dashboard)/donor-dashboard/history/page-client.tsx",
  },
  {
    name: "donor wallet",
    wrapperPath: "apps/donor/app/(dashboard)/donor-dashboard/wallet/page.tsx",
    clientPath:
      "apps/donor/app/(dashboard)/donor-dashboard/wallet/page-client.tsx",
  },
  {
    name: "missionary analytics",
    wrapperPath: "apps/missionary/app/analytics/page.tsx",
    clientPath: "apps/missionary/app/analytics/page-client.tsx",
  },
  {
    name: "missionary tasks",
    wrapperPath: "apps/missionary/app/tasks/page.tsx",
    clientPath: "apps/missionary/app/tasks/page-client.tsx",
  },
] as const;

const loadingPaths = [
  "apps/admin/app/events/loading.tsx",
  "apps/admin/app/reports/loading.tsx",
  "apps/donor/app/(dashboard)/donor-dashboard/feed/loading.tsx",
  "apps/donor/app/(dashboard)/donor-dashboard/history/loading.tsx",
  "apps/donor/app/(dashboard)/donor-dashboard/wallet/loading.tsx",
  "apps/missionary/app/analytics/loading.tsx",
  "apps/missionary/app/tasks/loading.tsx",
] as const;

describe("UI route cleanup contracts", () => {
  it("keeps moved route pages as tiny server wrappers around canonical client components", () => {
    for (const route of routeSplits) {
      const wrapperSource = readRepoFile(route.wrapperPath);
      const clientSource = readRepoFile(route.clientPath);

      expect(wrapperSource, route.name).not.toMatch(/^["']use client["'];/m);
      expect(wrapperSource, route.name).toContain(
        'import PageClient from "./page-client";',
      );
      expect(wrapperSource, route.name).toContain("return <PageClient />;");
      expect(clientSource, route.name).toMatch(/^"use client";/);
    }
  });

  it("keeps moved routes covered by server-rendered loading fallbacks", () => {
    for (const path of loadingPaths) {
      const source = readRepoFile(path);

      expect(source, path).not.toMatch(/^["']use client["'];/m);
      expect(source, path).toMatch(/export default function Loading\(\)/);
      expect(source, path).toMatch(/Skeleton/);
    }
  });

  it("guards touched client files against broad or slow motion regressions", () => {
    const clientSources = routeSplits.map(
      (route) => [route.name, readRepoFile(route.clientPath)] as const,
    );

    for (const [name, source] of clientSources) {
      expect(source, name).not.toMatch(/transition-all/);
      expect(source, name).not.toMatch(/duration-700/);
      expect(source, name).not.toMatch(/duration-500/);
      expect(source, name).not.toMatch(/animate-bounce/);
    }
  });

  it("keeps donor feed icon actions named and image filter motion targeted", () => {
    const source = readRepoFile(
      "apps/donor/app/(dashboard)/donor-dashboard/feed/page-client.tsx",
    );

    expect(source).toMatch(/aria-label="Open post actions"/);
    expect(source).toMatch(/aria-label="Share post"/);
    expect(source).toMatch(/transition-\[filter\]/);
  });

  it("keeps donor history page and chart cells on targeted motion", () => {
    const source = readRepoFile(
      "apps/donor/app/(dashboard)/donor-dashboard/history/page-client.tsx",
    );

    expect(source).toMatch(/transition-opacity/);
    expect(source).toMatch(/animate-in fade-in duration-300/);
  });

  it("keeps missionary analytics neutral chart colors on Maia CSS variables", () => {
    const source = readRepoFile(
      "apps/missionary/app/analytics/page-client.tsx",
    );

    expect(source).toMatch(/var\(--foreground\)/);
    expect(source).toMatch(/var\(--muted-foreground\)/);
    expect(source).toMatch(/var\(--muted\)/);
    expect(source).toMatch(/color: "#eab308"/);
    expect(source).not.toMatch(/#(18181b|71717a|a1a1aa|f4f4f5|e4e4e7)/i);
  });

  it("keeps admin reports summary dismissible by accessible name", () => {
    const source = readRepoFile("apps/admin/app/reports/page-client.tsx");

    expect(source).toMatch(/aria-label="Dismiss report summary"/);
  });
});
