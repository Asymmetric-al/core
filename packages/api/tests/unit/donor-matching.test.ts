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
});

describe("resolveDonorMatch — pre-existing duplicate on exact email", () => {
  it("exact-email attaches to one canonical donor AND flags the other same-email donor as a merge candidate", () => {
    const r = resolveDonorMatch({
      tenantId: TENANT,
      incoming: incoming(),
      candidates: [
        candidate({ donorId: "donor-1" }),
        candidate({ donorId: "donor-2" }),
      ],
    });
    expect(r.decision).toBe("attach");
    expect(r.canonicalDonorId).toBe("donor-1"); // deterministic pick
    expect(r.mergeCandidateDonorIds).toContain("donor-2"); // the other dup surfaced, not auto-merged
  });
});
