import { describe, expect, it } from "vitest";

import {
  resolveDonorMatch,
  type DonorMatchCandidate,
  type IncomingDonorIdentity,
} from "../../src/donate/guest/donor-matching";

/**
 * TDD — donor matching / entity resolution (Conrad §2.1–§2.4, 2026-07-04).
 * Pure, no live DB. Terminology: donor matching, entity resolution, duplicate
 * detection, dedupe, merge candidate. Exact/high email match → attach; possible
 * or low → merge candidate (NEVER auto-merge); none → create new.
 */

const TENANT = "tenant-a";

function incoming(
  over: Partial<IncomingDonorIdentity> = {},
): IncomingDonorIdentity {
  return {
    normalizedEmail: "ada@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
    address: { line1: "1 Analytical Way", city: "London", postalCode: "EC1" },
    phone: null,
    ...over,
  };
}

function candidate(
  over: Partial<DonorMatchCandidate> = {},
): DonorMatchCandidate {
  return {
    donorId: "donor-1",
    tenantId: TENANT,
    normalizedEmail: "ada@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
    address: { line1: "1 Analytical Way", city: "London", postalCode: "EC1" },
    phone: null,
    ...over,
  };
}

describe("resolveDonorMatch — exact / high-confidence email match (§2.1)", () => {
  it("attaches to an existing donor on an exact normalized-email match in the same tenant", () => {
    const r = resolveDonorMatch({
      tenantId: TENANT,
      incoming: incoming(),
      candidates: [candidate()],
    });
    expect(r.decision).toBe("attach");
    expect(r.confidence).toBe("exact");
    expect(r.canonicalDonorId).toBe("donor-1");
    expect(r.signals).toContain("normalized_email_exact");
    expect(r.mergeCandidateDonorIds).toEqual([]);
  });

  it("NEVER matches a same-email donor in a DIFFERENT tenant (tenant isolation)", () => {
    const r = resolveDonorMatch({
      tenantId: TENANT,
      incoming: incoming(),
      candidates: [candidate({ donorId: "other", tenantId: "tenant-b" })],
    });
    expect(r.decision).toBe("create_new");
    expect(r.canonicalDonorId).toBeNull();
  });

  it("NEVER creates merge candidates from non-email signals in a DIFFERENT tenant", () => {
    const r = resolveDonorMatch({
      tenantId: TENANT,
      incoming: incoming({ normalizedEmail: "ada.l@work.com" }),
      candidates: [
        candidate({
          donorId: "other",
          tenantId: "tenant-b",
          normalizedEmail: "ada@example.com",
        }),
      ],
    });

    expect(r.decision).toBe("create_new");
    expect(r.canonicalDonorId).toBeNull();
    expect(r.mergeCandidateDonorIds).toEqual([]);
  });
});

describe("resolveDonorMatch — possible match → merge candidate, never auto-merge (§2.2)", () => {
  it("same name + similar address but DIFFERENT email → possible → create_merge_candidate", () => {
    const r = resolveDonorMatch({
      tenantId: TENANT,
      incoming: incoming({ normalizedEmail: "ada.l@work.com" }),
      candidates: [candidate({ normalizedEmail: "ada@example.com" })],
    });
    expect(r.decision).toBe("create_merge_candidate");
    expect(r.confidence).toBe("possible");
    expect(r.canonicalDonorId).toBeNull(); // never auto-attach on possible
    expect(r.mergeCandidateDonorIds).toContain("donor-1");
    expect(r.signals).toEqual(
      expect.arrayContaining(["name_exact", "address_similar"]),
    );
  });
});

describe("resolveDonorMatch — low confidence → merge candidate (§2.4)", () => {
  it("a single weak signal (name only, different email, no address overlap) → low → create_merge_candidate", () => {
    const r = resolveDonorMatch({
      tenantId: TENANT,
      incoming: incoming({
        normalizedEmail: "someone@else.com",
        address: null,
      }),
      candidates: [
        candidate({
          normalizedEmail: "ada@example.com",
          address: {
            line1: "999 Other Rd",
            city: "Paris",
            postalCode: "75000",
          },
        }),
      ],
    });
    expect(r.decision).toBe("create_merge_candidate");
    expect(r.confidence).toBe("low");
    expect(r.canonicalDonorId).toBeNull();
    expect(r.mergeCandidateDonorIds).toContain("donor-1");
  });

  it("no overlapping signal at all → create_new", () => {
    const r = resolveDonorMatch({
      tenantId: TENANT,
      incoming: incoming({
        normalizedEmail: "grace@navy.mil",
        firstName: "Grace",
        lastName: "Hopper",
        address: null,
      }),
      candidates: [candidate()],
    });
    expect(r.decision).toBe("create_new");
    expect(r.confidence).toBe("none");
    expect(r.mergeCandidateDonorIds).toEqual([]);
  });

  it("does not create a merge candidate from first-name-only overlap", () => {
    const r = resolveDonorMatch({
      tenantId: TENANT,
      incoming: incoming({
        normalizedEmail: "ada.l@work.com",
        lastName: "",
        address: null,
        phone: null,
      }),
      candidates: [
        candidate({
          normalizedEmail: "other@example.com",
          lastName: "",
          address: null,
          phone: null,
        }),
      ],
    });

    expect(r.decision).toBe("create_new");
    expect(r.confidence).toBe("none");
    expect(r.signals).not.toContain("name_exact");
    expect(r.mergeCandidateDonorIds).toEqual([]);
  });
});

describe("resolveDonorMatch — pre-existing duplicate on exact email", () => {
  it("exact-email attaches to one canonical donor AND flags the other same-email donor as a merge candidate", () => {
    const r = resolveDonorMatch({
      tenantId: TENANT,
      incoming: incoming(),
      candidates: [
        candidate({ donorId: "donor-1", createdAt: "2024-01-01T00:00:00Z" }),
        candidate({ donorId: "donor-2", createdAt: "2025-01-01T00:00:00Z" }),
      ],
    });
    expect(r.decision).toBe("attach");
    expect(r.canonicalDonorId).toBe("donor-1");
    expect(r.mergeCandidateDonorIds).toContain("donor-2"); // the other dup surfaced, not auto-merged
  });

  it("chooses the oldest same-email donor as canonical instead of lexicographic UUID order", () => {
    const newerLexicographicallyFirst = {
      ...candidate({ donorId: "00000000-0000-0000-0000-000000000001" }),
      createdAt: "2026-07-04T12:00:00Z",
    };
    const olderLexicographicallyLast = {
      ...candidate({ donorId: "ffffffff-ffff-ffff-ffff-ffffffffffff" }),
      createdAt: "2024-01-01T00:00:00Z",
    };

    const r = resolveDonorMatch({
      tenantId: TENANT,
      incoming: incoming(),
      candidates: [newerLexicographicallyFirst, olderLexicographicallyLast],
    });

    expect(r.decision).toBe("attach");
    expect(r.canonicalDonorId).toBe("ffffffff-ffff-ffff-ffff-ffffffffffff");
    expect(r.mergeCandidateDonorIds).toEqual([
      "00000000-0000-0000-0000-000000000001",
    ]);
  });

  it("does not attach same-email duplicates when creation timestamps are missing", () => {
    const firstCandidate = candidate({
      donorId: "zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz",
    });
    const secondCandidate = candidate({
      donorId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    });

    const r = resolveDonorMatch({
      tenantId: TENANT,
      incoming: incoming(),
      candidates: [firstCandidate, secondCandidate],
    });

    expect(r.decision).toBe("create_merge_candidate");
    expect(r.confidence).toBe("possible");
    expect(r.canonicalDonorId).toBeNull();
    expect(r.mergeCandidateDonorIds).toEqual([
      "zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz",
      "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    ]);
  });

  it("does not attach same-email duplicates when creation timestamps are invalid", () => {
    const firstCandidate = {
      ...candidate({ donorId: "zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz" }),
      createdAt: "not-a-date",
    };
    const secondCandidate = {
      ...candidate({ donorId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" }),
      createdAt: "also-not-a-date",
    };

    const r = resolveDonorMatch({
      tenantId: TENANT,
      incoming: incoming(),
      candidates: [firstCandidate, secondCandidate],
    });

    expect(r.decision).toBe("create_merge_candidate");
    expect(r.confidence).toBe("possible");
    expect(r.canonicalDonorId).toBeNull();
    expect(r.mergeCandidateDonorIds).toEqual([
      "zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz",
      "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    ]);
  });

  it("does not attach same-email duplicates when creation timestamps are tied", () => {
    const firstCandidate = {
      ...candidate({ donorId: "donor-1" }),
      createdAt: "2024-01-01T00:00:00Z",
    };
    const secondCandidate = {
      ...candidate({ donorId: "donor-2" }),
      createdAt: "2024-01-01T00:00:00Z",
    };

    const r = resolveDonorMatch({
      tenantId: TENANT,
      incoming: incoming(),
      candidates: [firstCandidate, secondCandidate],
    });

    expect(r.decision).toBe("create_merge_candidate");
    expect(r.confidence).toBe("possible");
    expect(r.canonicalDonorId).toBeNull();
    expect(r.mergeCandidateDonorIds).toEqual(["donor-1", "donor-2"]);
  });

  it("does not attach same-email duplicates when only some creation timestamps are valid", () => {
    const firstCandidate = candidate({
      donorId: "donor-1",
    });
    const secondCandidate = {
      ...candidate({ donorId: "donor-2" }),
      createdAt: "2024-01-01T00:00:00Z",
    };

    const r = resolveDonorMatch({
      tenantId: TENANT,
      incoming: incoming(),
      candidates: [firstCandidate, secondCandidate],
    });

    expect(r.decision).toBe("create_merge_candidate");
    expect(r.confidence).toBe("possible");
    expect(r.canonicalDonorId).toBeNull();
    expect(r.mergeCandidateDonorIds).toEqual(["donor-1", "donor-2"]);
  });
});
