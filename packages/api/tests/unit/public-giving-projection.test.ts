import { describe, expect, it } from "vitest";

import {
  FORBIDDEN_PUBLIC_COLUMNS,
  PUBLIC_POST_SELECT,
  PUBLIC_WORKER_SELECT,
  assertNoForbiddenPublicColumns,
  computePercentRaised,
  toPublicWorker,
  toPublicWorkerUpdate,
  type PublicWorker,
  type PublicWorkerUpdate,
} from "../../src/public-giving";

/**
 * MVP Item 3a — giving-flow READ wiring.
 *
 * These tests pin the PUBLIC redaction/projection layer that every anonymous
 * donor-facing surface (/workers directory + /workers/[id] profile) must use.
 * Data-boundary LAW: no donor/missionary PII may reach an anonymous viewer.
 */

/** A raw missionary row deliberately polluted with PII, to prove it is dropped. */
const rawMissionaryWithPII = {
  id: "miss-001",
  tenant_id: "tenant-1",
  profile_id: "profile-1",
  tagline: "Bringing clean water to the highlands.",
  bio: "Long-form biography paragraph.",
  mission_field: "Water & Sanitation",
  location: "Nairobi, Kenya",
  current_funding: 480_000, // cents => $4,800
  funding_goal: 1_200_000, // cents => $12,000
  // PII that must NEVER surface publicly:
  phone: "+254700000000",
  birth_date: "1985-03-02",
  health_status: "at_risk",
  health_signals: { emotional: 2, spiritual: 3, physical: 4, financial: 1 },
  last_check_in: "2026-06-01",
  manual_attention: true,
  profile: {
    display_name: "The Rivers Family",
    first_name: "Aroon",
    last_name: "Ratana",
    avatar_url: "https://cdn.example.com/a.jpg",
    email: "aroon@example.com",
    phone: "+254700000001",
    role: "missionary",
    user_id: "user-9",
  },
} as unknown as Parameters<typeof toPublicWorker>[0];

describe("toPublicWorker", () => {
  it("maps a raw missionary row to the public worker view", () => {
    const worker = toPublicWorker(rawMissionaryWithPII);

    expect(worker.id).toBe("miss-001");
    expect(worker.title).toBe("The Rivers Family");
    expect(worker.location).toBe("Nairobi, Kenya");
    expect(worker.category).toBe("Water"); // first token of "Water & Sanitation"
    expect(worker.description).toBe("Bringing clean water to the highlands.");
    expect(worker.image).toBe("https://cdn.example.com/a.jpg");
    // DB stores cents; the public view exposes DOLLARS to match formatCurrency.
    expect(worker.raised).toBe(4800);
    expect(worker.goal).toBe(12000);
  });

  it("never leaks donor/missionary PII into the public shape", () => {
    const worker = toPublicWorker(rawMissionaryWithPII);

    const allowedKeys = [
      "id",
      "title",
      "location",
      "category",
      "description",
      "image",
      "raised",
      "goal",
    ].sort();
    expect(Object.keys(worker).sort()).toEqual(allowedKeys);

    const serialized = JSON.stringify(worker);
    for (const leaked of [
      "aroon@example.com",
      "+254700000000",
      "+254700000001",
      "1985-03-02",
      "at_risk",
      "Ratana",
      "tenant-1",
      "profile-1",
      "user-9",
    ]) {
      expect(serialized).not.toContain(leaked);
    }
  });

  it("falls back to a non-identifying title when no public name exists", () => {
    const worker = toPublicWorker({
      id: "miss-002",
      tagline: null,
      bio: null,
      mission_field: null,
      location: null,
      current_funding: 0,
      funding_goal: null,
      profile: null,
    } as unknown as Parameters<typeof toPublicWorker>[0]);

    expect(worker.title).toBe("Field Worker");
    expect(worker.location).toBe("Global");
    expect(worker.category).toBe("Ministry");
    expect(worker.description).toBe("");
    expect(worker.image).toBe("");
    expect(worker.raised).toBe(0);
    expect(worker.goal).toBeNull();
  });

  it("prefers first_name when display_name is blank and clamps negatives", () => {
    const worker = toPublicWorker({
      id: "miss-003",
      tagline: "  ",
      bio: "Serving the coast.",
      mission_field: "Discipleship",
      location: "Lima, Peru",
      current_funding: -50, // corrupt data must not surface a negative
      funding_goal: 900_000,
      profile: { display_name: "  ", first_name: "Maria", avatar_url: null },
    } as unknown as Parameters<typeof toPublicWorker>[0]);

    expect(worker.title).toBe("Maria");
    expect(worker.description).toBe("Serving the coast.");
    expect(worker.raised).toBe(0);
    expect(worker.goal).toBe(9000);
  });
});

describe("computePercentRaised", () => {
  it("returns null when there is no positive goal", () => {
    expect(computePercentRaised(4800, null)).toBeNull();
    expect(computePercentRaised(4800, 0)).toBeNull();
    expect(computePercentRaised(4800, -1)).toBeNull();
  });

  it("computes a rounded, clamped percentage", () => {
    expect(computePercentRaised(4800, 12000)).toBe(40);
    expect(computePercentRaised(0, 12000)).toBe(0);
    expect(computePercentRaised(20000, 12000)).toBe(100); // clamped
    expect(computePercentRaised(1, 3)).toBe(33); // rounded
  });
});

describe("toPublicWorkerUpdate", () => {
  it("maps a raw post row to the public update view", () => {
    const update: PublicWorkerUpdate = toPublicWorkerUpdate({
      id: "post-1",
      content: "<p>Foundation complete!</p>",
      created_at: "2026-06-30T12:00:00Z",
      like_count: 24,
      comment_count: 5,
      media: [
        { type: "image", url: "https://cdn.example.com/img.jpg" },
        { type: "image", url: "https://cdn.example.com/img2.jpg" },
      ],
    } as unknown as Parameters<typeof toPublicWorkerUpdate>[0]);

    expect(update.id).toBe("post-1");
    expect(update.content).toBe("<p>Foundation complete!</p>");
    expect(update.createdAt).toBe("2026-06-30T12:00:00Z");
    expect(update.image).toBe("https://cdn.example.com/img.jpg");
    expect(update.likeCount).toBe(24);
    expect(update.commentCount).toBe(5);
  });

  it("has no image and zero counts when data is missing", () => {
    const update = toPublicWorkerUpdate({
      id: "post-2",
      content: "Prayer request.",
      created_at: "2026-06-20T12:00:00Z",
      media: null,
    } as unknown as Parameters<typeof toPublicWorkerUpdate>[0]);

    expect(update.image).toBeNull();
    expect(update.likeCount).toBe(0);
    expect(update.commentCount).toBe(0);
    expect(Object.keys(update).sort()).toEqual(
      [
        "id",
        "content",
        "createdAt",
        "image",
        "likeCount",
        "commentCount",
      ].sort(),
    );
  });
});

describe("public column allowlists", () => {
  it("select strings exclude every forbidden PII column", () => {
    for (const col of FORBIDDEN_PUBLIC_COLUMNS) {
      expect(PUBLIC_WORKER_SELECT).not.toContain(col);
      expect(PUBLIC_POST_SELECT).not.toContain(col);
    }
  });

  it("assertNoForbiddenPublicColumns throws on a PII column, passes on the allowlist", () => {
    expect(() =>
      assertNoForbiddenPublicColumns(PUBLIC_WORKER_SELECT),
    ).not.toThrow();
    expect(() =>
      assertNoForbiddenPublicColumns(PUBLIC_POST_SELECT),
    ).not.toThrow();
    expect(() => assertNoForbiddenPublicColumns("id, email, location")).toThrow(
      /email/,
    );
  });
});

// Type-level guard: PublicWorker must not carry PII fields (compile-time).
const _typeGuard: PublicWorker = {
  id: "x",
  title: "x",
  location: "x",
  category: "x",
  description: "x",
  image: "x",
  raised: 0,
  goal: null,
};
void _typeGuard;
