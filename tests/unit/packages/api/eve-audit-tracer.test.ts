import { describe, expect, it, vi } from "vitest";

import {
  createAdminEveAuditIdentity,
  createGithubBotEveAuditIdentity,
  createServiceEveAuditIdentity,
} from "../../../../packages/api/src/eve/audit/identity";
import {
  buildEveAuditEvent,
  traceEveAuditEvent,
} from "../../../../packages/api/src/eve/audit/record";
import { redactEveAuditValue } from "../../../../packages/api/src/eve/audit/redaction";

import type { AuthenticatedContext } from "@asym/auth/context";

const ADMIN_AUTH = {
  userId: "verified-user-1",
  email: "admin@example.com",
  tenantId: "00000000-0000-4000-8000-000000000001",
  role: "admin",
  profileRole: "admin",
  memberships: [],
  profileId: "00000000-0000-4000-8000-000000000002",
  isAuthenticated: true,
} satisfies AuthenticatedContext;

describe("Eve audit tracer", () => {
  it("derives accountable admin identity from verified auth context", () => {
    const identity = createAdminEveAuditIdentity(ADMIN_AUTH);

    expect(identity).toMatchObject({
      actorId: "verified-user-1",
      actorProfileId: "00000000-0000-4000-8000-000000000002",
      actorRole: "admin",
      identityMode: "admin",
      initiatorId: "verified-user-1",
      initiatorType: "authenticated_admin",
      tenantId: "00000000-0000-4000-8000-000000000001",
    });
  });

  it("represents accountable service and GitHub bot initiators", () => {
    expect(
      createServiceEveAuditIdentity({
        serviceId: "eve-scheduler",
        initiatorId: "schedule:nightly-review",
        initiatorType: "schedule",
      }),
    ).toMatchObject({
      actorId: "eve-scheduler",
      identityMode: "service",
      initiatorId: "schedule:nightly-review",
    });

    expect(
      createGithubBotEveAuditIdentity({
        botId: "eve-github-app",
        initiatorId: "github-user:42",
        initiatorType: "github_sender",
      }),
    ).toMatchObject({
      actorId: "eve-github-app",
      identityMode: "github_bot",
      initiatorId: "github-user:42",
    });
  });

  it("redacts secrets, payment data, PII, one-time codes, and raw reasoning before persistence", () => {
    const record = buildEveAuditEvent(
      {
        identity: createAdminEveAuditIdentity(ADMIN_AUTH),
        policy: {
          id: "eve-governance-kernel",
          status: "ready",
          governanceStateVersion: 3,
        },
        action: "safe.inspect",
        target: "eve:global",
        result: "succeeded",
        evidence: {
          actorId: "forged-actor",
          cardNumber: "4242 4242 4242 4242",
          customerEmail: "donor@example.com",
          safeFinding: "The release gate was inspected.",
        },
        change: { stateChanged: false },
        decision: {
          rationale: "Inspection was requested. OTP: 123456",
          risk: "No mutation was performed.",
        },
        debug: {
          actor: "forged-actor",
          authorization: "Bearer raw-secret-token",
          hiddenReasoning: "private chain of thought",
          nested: {
            apiKey: "sk_live_unsafe",
            phone: "+1 555 010 0000",
          },
        },
      },
      new Date("2026-07-17T00:00:00.000Z"),
    );

    const serialized = JSON.stringify(record);
    expect(record.actorId).toBe("verified-user-1");
    expect(record.modelRole).toBe("not_used");
    expect(record.evidenceSummary).toContain("[redacted]");
    expect(record.decisionSummary).toContain("[redacted-one-time-code]");
    expect(serialized).not.toContain("forged-actor");
    expect(serialized).not.toContain("4242 4242");
    expect(serialized).not.toContain("donor@example.com");
    expect(serialized).not.toContain("raw-secret-token");
    expect(serialized).not.toContain("private chain of thought");
    expect(serialized).not.toContain("sk_live_unsafe");
    expect(serialized).not.toContain("+1 555 010 0000");
    expect(record.redactionVersion).toBe("eve-audit-v1");
  });

  it("bounds deeply nested and oversized replay metadata", () => {
    const redacted = redactEveAuditValue({
      huge: "x".repeat(3_000),
      nested: { a: { b: { c: { d: { e: { f: { g: "unsafe" } } } } } } },
    });
    const serialized = JSON.stringify(redacted);

    expect(serialized).toContain("[truncated]");
    expect(serialized).toContain("[depth-limited]");
    expect(serialized.length).toBeLessThan(2_500);
  });

  it("persists one safe Eve-like action through the tracer", async () => {
    const append = vi.fn().mockResolvedValue(undefined);

    const record = await traceEveAuditEvent({
      store: { append },
      event: {
        identity: createAdminEveAuditIdentity(ADMIN_AUTH),
        policy: { id: "governance", status: "not_configured" },
        action: "governance.inspect",
        result: "succeeded",
        evidence: { releaseEnabled: false },
        change: { stateChanged: false },
        decision: {
          rationale: "An authorized admin inspected disabled state.",
        },
      },
    });

    expect(append).toHaveBeenCalledOnce();
    expect(append).toHaveBeenCalledWith(record);
    expect(record).toMatchObject({
      actorId: "verified-user-1",
      action: "governance.inspect",
      result: "succeeded",
      evidenceSummary: '{"releaseEnabled":false}',
      changeSummary: '{"stateChanged":false}',
    });
  });
});
