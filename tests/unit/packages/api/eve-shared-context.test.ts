import { describe, expect, it, vi } from "vitest";

import {
  readEveSharedContext,
  resolveEveSharedContextConflict,
  writeEveSharedContext,
} from "../../../../packages/api/src/eve/shared-context/control";

import {
  EveSharedContextValidationError,
  hasBlockingEveSharedContextConflict,
  prepareEveSharedContextClaim,
} from "../../../../packages/api/src/eve/shared-context/validation";
import { createServiceEveSessionIdentity } from "../../../../packages/api/src/eve/session-ownership/identity";

import type { EveSharedContextStore } from "../../../../packages/api/src/eve/shared-context/types";

const tenantId = "00000000-0000-4000-8000-000000000001";

function validWrite(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 1,
    category: "finding",
    fieldPath: "review.authorization",
    value: { summary: "The route checks the verified current admin." },
    provenance: {
      kind: "repository",
      reference: "packages/api/src/eve/session-ownership/route-auth.ts:40",
    },
    confidenceBps: 9_500,
    risk: "medium",
    evidence: [
      {
        kind: "repository",
        reference: "packages/api/src/eve/session-ownership/route-auth.ts:40",
      },
    ],
    relationship: "independent",
    relatedClaimIds: [],
    ...overrides,
  };
}

function prepare(write: unknown, existingClaims = []) {
  return prepareEveSharedContextClaim({
    accountableRunId: "run-1",
    existingClaims,
    now: new Date("2026-07-18T00:00:00.000Z"),
    rootSessionId: "root-session",
    sessionId: "child-session",
    tenantId,
    write,
    writerSubagentId: "security-review",
  });
}

describe("Eve shared run context", () => {
  it("accepts a completely attributed, JSON-safe claim", () => {
    const { claim, conflict } = prepare(validWrite());

    expect(conflict).toBeUndefined();
    expect(claim).toMatchObject({
      tenantId,
      rootSessionId: "root-session",
      sessionId: "child-session",
      accountableRunId: "run-1",
      writerSubagentId: "security-review",
      confidenceBps: 9_500,
      risk: "medium",
      createdAt: "2026-07-18T00:00:00.000Z",
    });
  });

  it.each([
    ["missing evidence", validWrite({ evidence: [] })],
    ["missing provenance", { ...validWrite(), provenance: undefined }],
    ["invalid confidence", validWrite({ confidenceBps: 10_001 })],
    [
      "unattributed relationship",
      validWrite({ relationship: "supports", relatedClaimIds: [] }),
    ],
  ])("rejects malformed attribution: %s", (_label, write) => {
    expect(() => prepare(write)).toThrowError(EveSharedContextValidationError);
  });

  it.each([
    ["email PII", { contact: "person@example.org" }],
    ["private key", "-----BEGIN PRIVATE KEY-----"],
    ["payment number", "4111 1111 1111 1111"],
    ["secret-shaped key", { access_token: "redacted-but-still-forbidden" }],
    ["one-time code", "OTP: 123456"],
  ])(
    "rejects forbidden sensitive content before persistence: %s",
    (_label, value) => {
      expect(() => prepare(validWrite({ value }))).toThrowError(
        expect.objectContaining({ code: "forbidden_sensitive_content" }),
      );
    },
  );

  it("preserves both claims inside an explicit disagreement", () => {
    const first = prepare(validWrite()).claim;
    const second = prepare(
      validWrite({
        value: { summary: "The route does not verify the current admin." },
        risk: "high",
        relationship: "contradicts",
        relatedClaimIds: [first.id],
      }),
      [first],
    );

    expect(second.conflict).toMatchObject({
      fieldPath: first.fieldPath,
      claimIds: [first.id, second.claim.id],
      risk: "high",
    });
    expect(first.value).not.toEqual(second.claim.value);
  });

  it("rejects cross-run or cross-tenant disagreement references", () => {
    const first = prepare(validWrite()).claim;
    const foreign = { ...first, tenantId: crypto.randomUUID() };

    expect(() =>
      prepare(
        validWrite({
          relationship: "contradicts",
          relatedClaimIds: [foreign.id],
        }),
        [foreign],
      ),
    ).toThrowError(EveSharedContextValidationError);
  });

  it("blocks unresolved high-risk conflicts but not resolved or low-risk ones", () => {
    const base = {
      id: crypto.randomUUID(),
      tenantId,
      rootSessionId: "root-session",
      fieldPath: "review.authorization",
      claimIds: [crypto.randomUUID(), crypto.randomUUID()],
      createdAt: "2026-07-18T00:00:00.000Z",
    };
    expect(
      hasBlockingEveSharedContextConflict({
        fieldPaths: [base.fieldPath],
        conflicts: [{ ...base, risk: "high" }],
      }),
    ).toBe(true);
    expect(
      hasBlockingEveSharedContextConflict({
        fieldPaths: [base.fieldPath],
        conflicts: [
          {
            ...base,
            risk: "protected",
            resolution: { id: crypto.randomUUID() },
          },
        ],
      }),
    ).toBe(false);
    expect(
      hasBlockingEveSharedContextConflict({
        fieldPaths: [base.fieldPath],
        conflicts: [{ ...base, risk: "low" }],
      }),
    ).toBe(false);
  });

  it("derives read scope from verified identity rather than caller input", async () => {
    const loadSnapshot = vi.fn().mockResolvedValue({
      rootSessionId: "root-session",
      claims: [],
      conflicts: [],
    });
    const identity = createServiceEveSessionIdentity({
      initiatorId: "verified-initiator",
      initiatorType: "system",
      serviceId: "eve-service",
      tenantId,
    });

    await readEveSharedContext({
      identity,
      rootSessionId: "root-session",
      store: { loadSnapshot } as unknown as EveSharedContextStore,
    });

    expect(loadSnapshot).toHaveBeenCalledWith({
      rootSessionId: "root-session",
      tenantId,
    });
  });

  it("audits sensitive rejection without persisting or copying the value", async () => {
    const append = vi.fn().mockResolvedValue(undefined);
    const appendClaim = vi.fn();
    const authorize = vi.fn();
    const identity = createServiceEveSessionIdentity({
      initiatorId: "verified-initiator",
      initiatorType: "system",
      serviceId: "eve-service",
      tenantId,
    });
    const store = {
      appendClaim,
      loadSnapshot: vi.fn().mockResolvedValue({
        rootSessionId: "root-session",
        claims: [],
        conflicts: [],
      }),
    } as unknown as EveSharedContextStore;

    await expect(
      writeEveSharedContext({
        accountableRunId: "root-session",
        auditStore: { append },
        authorize,
        identity,
        rootSessionId: "root-session",
        sessionId: "child-session",
        store,
        write: validWrite({ value: { email: "secret@example.org" } }),
        writerSubagentId: "security-review",
      }),
    ).rejects.toMatchObject({ code: "forbidden_sensitive_content" });

    expect(authorize).not.toHaveBeenCalled();
    expect(appendClaim).not.toHaveBeenCalled();
    expect(JSON.stringify(append.mock.calls)).not.toContain(
      "secret@example.org",
    );
  });

  it("records a governed resolution without deleting competing claims", async () => {
    const first = prepare(validWrite()).claim;
    const second = prepare(
      validWrite({
        value: { summary: "Competing conclusion." },
        risk: "high",
        relationship: "contradicts",
        relatedClaimIds: [first.id],
      }),
      [first],
    );
    const conflict = second.conflict!;
    const appendResolution = vi.fn().mockResolvedValue(undefined);
    const identity = createServiceEveSessionIdentity({
      initiatorId: "verified-initiator",
      initiatorType: "system",
      serviceId: "eve-service",
      tenantId,
    });
    const store = {
      appendResolution,
      loadConflict: vi.fn().mockResolvedValue(conflict),
    } as unknown as EveSharedContextStore;
    const auditAppend = vi.fn().mockResolvedValue(undefined);

    const resolution = await resolveEveSharedContextConflict({
      accountableRunId: "root-session",
      auditStore: { append: auditAppend },
      authorize: vi.fn().mockResolvedValue({
        actionId: "engineering.shared_context.resolve",
        decision: "allow",
        reason: "operational_policy_allowed",
        trustZone: "engineering",
        writeClass: "operational",
      }),
      identity,
      resolution: {
        conflictId: conflict.id,
        evidence: [
          {
            kind: "repository",
            reference: "packages/api/src/eve/shared-context/control.ts:1",
          },
        ],
        outcome: "The first claim remains the supported conclusion.",
        policyId: "eve-shared-context-v1",
        selectedClaimIds: [first.id],
      },
      store,
    });

    expect(resolution.selectedClaimIds).toEqual([first.id]);
    expect(appendResolution).toHaveBeenCalledWith(resolution);
    expect(conflict.claimIds).toEqual([first.id, second.claim.id]);
    expect(auditAppend).toHaveBeenCalledOnce();
  });
});
