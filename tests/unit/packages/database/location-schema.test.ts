import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { locationSchema } from "../../../../packages/database/collections/schemas/app";

const seedPath = fileURLToPath(
  new URL("../../../../supabase/seed.sql", import.meta.url),
);

/** Every location type value the seed can generate (locations insert). */
const SEEDED_LOCATION_TYPES = [
  "missionary",
  "project",
  "custom",
  "partner",
] as const;

function buildLocationRow(type: string) {
  return {
    id: "10000000-0000-0000-0000-000000000001",
    tenant_id: "00000000-0000-0000-0000-000000000001",
    title: "Test location",
    lat: -1.31,
    lng: 36.7,
    type,
    linked_id: null,
    summary: null,
    image_public_id: null,
    status: "published",
    sort_key: 1,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
}

describe("browser location collection schema", () => {
  it("accepts every location type the seed publishes through the RLS read path", () => {
    for (const type of SEEDED_LOCATION_TYPES) {
      const parsed = locationSchema.safeParse(buildLocationRow(type));

      expect(
        parsed.success,
        `published '${type}' location must parse through the browser collection schema`,
      ).toBe(true);
    }
  });

  it("keeps the schema type list in sync with the seed's location type array", () => {
    const seedSql = readFileSync(seedPath, "utf8");
    const seedTypeArrayMatch = seedSql.match(
      /ARRAY\['missionary','project','custom','partner'\]/,
    );

    // If the seed's location type array changes shape, revisit
    // SEEDED_LOCATION_TYPES and the locationSchema enum together.
    expect(seedTypeArrayMatch).not.toBeNull();
  });

  it("still rejects unknown location types", () => {
    const parsed = locationSchema.safeParse(buildLocationRow("headquarters"));

    expect(parsed.success).toBe(false);
  });
});
