import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

const routeSplits = [
  {
    name: "admin events",
    wrapperPath: "apps/admin/app/(app)/events/page.tsx",
    clientPath: "apps/admin/app/(app)/events/page-client.tsx",
  },
  {
    name: "admin reports",
    wrapperPath: "apps/admin/app/(app)/reports/page.tsx",
    clientPath: "apps/admin/app/(app)/reports/page-client.tsx",
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
    implementationPath:
      "apps/donor/app/(dashboard)/donor-dashboard/history/page-content.tsx",
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
  "apps/admin/app/(app)/events/loading.tsx",
  "apps/admin/app/(app)/reports/loading.tsx",
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
      // Admin table routes render the client island behind a Suspense
      // boundary; other wrappers return it directly. Both stay tiny.
      expect(wrapperSource, route.name).toMatch(/<PageClient \/>/);
      expect(clientSource, route.name).toMatch(/^"use client";/);
    }
  });

  it("keeps moved routes covered by server-rendered loading fallbacks", () => {
    for (const path of loadingPaths) {
      const source = readRepoFile(path);

      expect(source, path).not.toMatch(/^["']use client["'];/m);
      expect(source, path).toMatch(/export default function Loading\(\)/);
      // Either direct Skeleton usage or the shared admin table fallback,
      // which composes DataTableSkeleton internally.
      expect(source, path).toMatch(/Skeleton|TablePageFallback/);
    }
  });

  it("guards touched client files against broad or slow motion regressions", () => {
    const clientSources = routeSplits.map(
      (route) =>
        [
          route.name,
          readRepoFile(
            "implementationPath" in route
              ? route.implementationPath
              : route.clientPath,
          ),
        ] as const,
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
      "apps/donor/app/(dashboard)/donor-dashboard/history/page-content.tsx",
    );

    expect(source).toMatch(/transition-opacity/);
    expect(source).toMatch(/animate-in fade-in duration-300/);
  });

  it("keeps missionary analytics chart colors on Maia CSS variables (no one-off hex)", () => {
    const source = readRepoFile(
      "apps/missionary/app/analytics/page-client.tsx",
    );

    // Chart colors must resolve from Maia/shadcn design tokens, never a
    // one-off hex literal. Neutral segment/series colors stay on the
    // foreground/muted token ramp.
    expect(source).toMatch(/var\(--foreground\)/);
    expect(source).toMatch(/var\(--muted-foreground\)/);
    expect(source).toMatch(/var\(--muted\)/);
    // The mock "At Risk" donut segment (the former one-off #eab308 amber) was
    // removed when the analytics page was wired to real Giving Trends data.
    // Keep the source on Maia/shadcn tokens with no hex color literals.
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/i);
  });

  it("keeps admin reports summary dismissible by accessible name", () => {
    const source = readRepoFile("apps/admin/app/(app)/reports/page-client.tsx");

    expect(source).toMatch(/aria-label="Dismiss report summary"/);
  });
});

// Cache Components audit: every admin table route renders its whole-page
// client island behind a Suspense boundary with a server-rendered loading
// fallback, so first paint is a skeleton rather than a blank table. Removing
// the boundary or the fallback from any of these routes must fail here.
const ADMIN_TABLE_ROUTES = [
  "apps/admin/app/(app)/crm",
  "apps/admin/app/(app)/crm/notes",
  "apps/admin/app/(app)/crm/relationships",
  "apps/admin/app/(app)/contributions",
  "apps/admin/app/(app)/tasks",
  "apps/admin/app/(app)/events",
] as const;

describe("admin table routes stream behind a Suspense boundary", () => {
  it("wraps each table island in Suspense with a server loading fallback", () => {
    for (const route of ADMIN_TABLE_ROUTES) {
      const pageSource = readRepoFile(`${route}/page.tsx`);

      expect(pageSource, route).not.toMatch(/^["']use client["'];/m);
      expect(pageSource, route).toMatch(/import \{ Suspense \} from "react"/);
      expect(pageSource, route).toMatch(/from "\.\/page-client"/);
      expect(pageSource, route).toMatch(
        /<Suspense fallback=\{<[A-Z][A-Za-z0-9]* \/>\}>/,
      );
    }
  });

  it("gives each table route a server-rendered loading skeleton", () => {
    for (const route of ADMIN_TABLE_ROUTES) {
      const loadingSource = readRepoFile(`${route}/loading.tsx`);

      expect(loadingSource, route).not.toMatch(/^["']use client["'];/m);
      expect(loadingSource, route).toMatch(
        /export default function Loading\(\)/,
      );
      // Either the shared `TablePageFallback` (which composes
      // `DataTableSkeleton`) or a bespoke `Skeleton`-based fallback.
      expect(loadingSource, route).toMatch(/TablePageFallback|Skeleton/);
    }
  });
});

describe("support tickets keeps a server-rendered table loading contract", () => {
  it("keeps the server page and loading skeleton aligned to shared metadata", () => {
    const pageSource = readRepoFile(
      "apps/admin/app/(app)/support/tickets/page.tsx",
    );
    const loadingSource = readRepoFile(
      "apps/admin/app/(app)/support/tickets/loading.tsx",
    );

    expect(pageSource).not.toMatch(/^["']use client["'];/m);
    expect(pageSource).toMatch(/loadSupportTicketList/);
    expect(pageSource).toMatch(/SUPPORT_TICKETS_PAGE_META\.title/);
    expect(pageSource).toMatch(/SUPPORT_TICKETS_PAGE_META\.description/);
    expect(pageSource).toMatch(/SUPPORT_TICKETS_PAGE_META\.density/);
    expect(loadingSource).not.toMatch(/^["']use client["'];/m);
    expect(loadingSource).toMatch(/TablePageFallback/);
    expect(loadingSource).toMatch(/SUPPORT_TICKETS_PAGE_META/);
  });
});
