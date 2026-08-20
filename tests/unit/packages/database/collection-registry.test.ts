import { describe, expect, it } from "vitest";

import {
  collectionRegistry,
  supabaseTableCollectionRegistry,
} from "../../../../packages/database/collections";

describe("collection registry", () => {
  it("lists every existing real Supabase table collection", () => {
    expect(
      supabaseTableCollectionRegistry.map((entry) => entry.name).toSorted(),
    ).toEqual([
      "assetsCollection",
      "donationsCollection",
      "donorActivitiesCollection",
      "donorPledgesCollection",
      "donorsCollection",
      "followsCollection",
      "fundsCollection",
      "locationsCollection",
      "missionariesCollection",
      "postCommentsCollection",
      "postFiresCollection",
      "postLikesCollection",
      "postPrayersCollection",
      "postsCollection",
      "profilesCollection",
    ]);
  });

  it("keeps registry names unique", () => {
    const names = collectionRegistry.map((entry) => entry.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it("does not realtime-sync finance and PII tables while RLS is under review", () => {
    const reviewTables = new Set([
      "donors",
      "donor_activities",
      "donor_pledges",
      "donations",
      "profiles",
    ]);

    const unsafeRealtimeTables = supabaseTableCollectionRegistry.filter(
      (entry) =>
        entry.tableName !== undefined &&
        reviewTables.has(entry.tableName) &&
        entry.realtime !== "disabled",
    );

    expect(unsafeRealtimeTables).toEqual([]);
  });

  it("marks Support Hub collections as route-backed server-command reads", () => {
    const supportHub = collectionRegistry.find(
      (entry) => entry.name === "supportHubCollections",
    );

    expect(supportHub).toMatchObject({
      kind: "route-backed",
      mutationPolicy: "server-command",
      realtime: "not-applicable",
      rls: "not-applicable",
    });
    expect(supportHub?.notes).not.toContain("local-only");
    expect(supportHub?.notes).toContain("no tenant-wide messages collection");
    expect(supportHub?.notes).toContain("route + adapter");
  });

  it("marks unsafe requested tables as server-only until RLS and redaction are resolved", () => {
    const serverOnlyTables = collectionRegistry
      .filter((entry) => entry.kind === "server-only")
      .map((entry) => entry.tableName)
      .toSorted();

    expect(serverOnlyTables).toEqual([
      "donor_feed_preferences",
      "follower_requests",
      "missionary_tasks",
      "pdf_templates",
      "tenants",
    ]);
  });
});
