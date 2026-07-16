import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const migrationPath = fileURLToPath(
  new URL(
    "../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql",
    import.meta.url,
  ),
);
const peopleCollectionsPath = fileURLToPath(
  new URL(
    "../../../packages/database/collections/tables/people.ts",
    import.meta.url,
  ),
);
const contentCollectionsPath = fileURLToPath(
  new URL(
    "../../../packages/database/collections/tables/content.ts",
    import.meta.url,
  ),
);

function expectCollectionRealtimeDisabled(
  collectionSource: string,
  collectionName: string,
) {
  const collectionMatch = collectionSource.match(
    new RegExp(
      `export const ${collectionName} = defineSupabaseCollection\\(\\{[\\s\\S]*?\\n\\}\\);`,
    ),
  );

  expect(collectionMatch).not.toBeNull();
  const collectionDefinition = collectionMatch![0];
  const realtimeConfigMatch = collectionDefinition.match(
    /realtime:\s*\{\s*enabled:\s*false,\s*reason:\s*([A-Za-z_$][\w$]*)\s*\}/,
  );

  expect(realtimeConfigMatch).not.toBeNull();
  const reasonName = realtimeConfigMatch![1];
  const reasonMatch = collectionSource.match(
    new RegExp(`const ${reasonName}\\s*=\\s*["']([^"']+)["'];`),
  );

  expect(reasonMatch).not.toBeNull();
  expect(reasonMatch![1].trim()).not.toBe("");
}

describe("canonical TanStack DB Supabase migration", () => {
  const migrationSql = readFileSync(migrationPath, "utf8");
  const peopleCollectionsSource = readFileSync(peopleCollectionsPath, "utf8");
  const contentCollectionsSource = readFileSync(contentCollectionsPath, "utf8");

  it("uses duplicate-safe realtime publication checks", () => {
    expect(migrationSql).toContain("pg_publication_tables");
    expect(migrationSql).toContain("supabase_realtime");
    expect(migrationSql).toContain(
      "ALTER PUBLICATION supabase_realtime ADD TABLE",
    );
  });

  it("keeps finance and server-only tables out of the realtime allowlist", () => {
    const realtimeBlockMatch = migrationSql.match(
      /FOREACH realtime_table IN ARRAY ARRAY\[[\s\S]*?\]/,
    );

    expect(realtimeBlockMatch).not.toBeNull();
    const realtimeBlock = realtimeBlockMatch![0];

    expect(realtimeBlock).not.toContain("donations");
    expect(realtimeBlock).not.toContain("donors");
    expect(realtimeBlock).not.toContain("donor_pledges");
    expect(realtimeBlock).not.toContain("donor_activities");
    expect(realtimeBlock).not.toContain("tenants");
    expect(realtimeBlock).not.toContain("pdf_templates");
    expect(realtimeBlock).not.toContain("missionaries");
    expect(realtimeBlock).not.toContain("follows");
  });

  it("explicitly disables realtime for sensitive collection definitions", () => {
    expectCollectionRealtimeDisabled(
      peopleCollectionsSource,
      "missionariesCollection",
    );
    expectCollectionRealtimeDisabled(
      contentCollectionsSource,
      "followsCollection",
    );
  });

  it("removes demo public read from sensitive browser-blocked tables", () => {
    expect(migrationSql).toContain(
      'DROP POLICY IF EXISTS "public read" ON public.%I',
    );
    expect(migrationSql).toContain("REVOKE ALL ON TABLE public.tenants");
    expect(migrationSql).toContain(
      "REVOKE ALL ON TABLE public.donor_feed_preferences",
    );
    expect(migrationSql).toContain(
      "REVOKE ALL ON TABLE public.follower_requests",
    );
  });

  it("revokes both anon and authenticated table access from server-only tables", () => {
    for (const serverOnlyTable of [
      "donor_feed_preferences",
      "follower_requests",
      "missionary_tasks",
      "pdf_templates",
    ]) {
      expect(migrationSql).toContain(
        `REVOKE ALL ON TABLE public.${serverOnlyTable} FROM anon, authenticated;`,
      );
    }
  });

  it("replaces the demo public read policy on visible tables with an explicit role-targeted policy", () => {
    const visibleBlockMatch = migrationSql.match(
      /FOREACH visible_table IN ARRAY ARRAY\[[\s\S]*?END \$\$;/,
    );

    expect(visibleBlockMatch).not.toBeNull();
    const visibleBlock = visibleBlockMatch![0];

    // Stale demo-wide anon reads must not survive next to the new policies.
    expect(visibleBlock).toContain(
      'DROP POLICY IF EXISTS "public read" ON public.%I',
    );

    // The replacement policy is explicit about which roles may read.
    expect(visibleBlock).toContain(
      'CREATE POLICY "tanstack browser read" ON public.%I FOR SELECT TO anon, authenticated USING (%s)',
    );
  });

  it("row-filters publication-state tables instead of exposing drafts to the browser", () => {
    expect(migrationSql).toContain(
      "(status = 'published' AND visibility = 'public')",
    );
    expect(migrationSql).toContain("(status = 'published')");
    expect(migrationSql).toContain("parent_post.status = 'published'");
    expect(migrationSql).toContain("parent_post.visibility = 'public'");
  });
});
