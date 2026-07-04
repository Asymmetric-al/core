import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  createOfflineEntryDependencies,
  OFFLINE_ENTRY_UNBOUND_MESSAGE,
} from "@asym/api/admin/contributions/offline-dependencies";
import { handleOfflineContribution } from "@asym/api/admin/contributions/offline-route";

import type { AuthenticatedContext } from "@asym/auth/context";

/**
 * TDD — offline gift entry POST handler (Contributions Hub, spec §6/§9.3).
 * Exercises the gate + §9.3 validation + orchestration + the Gate-8 persistence
 * boundary WITHOUT a live DB (deps are injected).
 */

function auth(
  overrides: Partial<AuthenticatedContext> = {},
): AuthenticatedContext {
  return {
    tenantId: "tenant-1",
    profileId: "profile-9",
    role: "admin",
    profileRole: null,
    memberships: [],
    ...overrides,
  } as unknown as AuthenticatedContext;
}

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/admin/contributions/offline", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as never;
}

const knownGift = {
  donorMode: "known",
  donorId: "11111111-1111-4111-8111-111111111111",
  amount: 100,
  currency: "usd",
  receivedDate: "2026-07-01",
  method: "check",
  designation: { fundId: "fund-1" },
  anonymousToRecipient: false,
  receiptRequested: true,
};

const ctxBase = () => ({
  supabaseAdmin: {} as never,
  requestId: "req-1",
});

function okDepsFactory() {
  return () => ({
    resolveKnownDonor: vi.fn().mockResolvedValue({ donorId: "donor-1" }),
    insertContribution: vi
      .fn()
      .mockResolvedValue({ contributionId: "contrib-1" }),
    appendAudit: vi.fn().mockResolvedValue({ auditEventId: "audit-1" }),
  });
}

describe("handleOfflineContribution — gate", () => {
  it("403s when the actor lacks finance:manage_contributions", async () => {
    const res = await handleOfflineContribution({
      ...ctxBase(),
      request: jsonRequest(knownGift),
      auth: auth({ role: "staff", profileRole: null, memberships: [] }),
    });
    expect(res.status).toBe(403);
  });
});

describe("handleOfflineContribution — validation", () => {
  it("rejects a body that violates the §9.3 contract (unknown gift with a check)", async () => {
    const res = await handleOfflineContribution({
      ...ctxBase(),
      request: jsonRequest({
        donorMode: "unknown_offline",
        amount: 20,
        currency: "usd",
        receivedDate: "2026-07-01",
        method: "check",
        designation: { fundId: "fund-1" },
      }),
      auth: auth(),
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});

describe("handleOfflineContribution — orchestration (mock deps)", () => {
  it("records a known gift and returns 201 with the created ids", async () => {
    const res = await handleOfflineContribution(
      { ...ctxBase(), request: jsonRequest(knownGift), auth: auth() },
      okDepsFactory() as never,
    );
    expect(res.status).toBe(201);
    const body = (await res.json()) as { result: { contributionId: string } };
    expect(body.result.contributionId).toBe("contrib-1");
  });
});

describe("handleOfflineContribution — Gate-8 persistence boundary", () => {
  it("surfaces a precise 501 while the real DB deps are unbound", async () => {
    const res = await handleOfflineContribution(
      { ...ctxBase(), request: jsonRequest(knownGift), auth: auth() },
      createOfflineEntryDependencies,
    );
    expect(res.status).toBe(501);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe(OFFLINE_ENTRY_UNBOUND_MESSAGE);
  });
});

describe("offline app route wiring", () => {
  it("exposes the offline POST as a thin re-export from the API package", () => {
    const source = readFileSync(
      path.resolve(
        __dirname,
        "../../../../../apps/admin/app/api/admin/contributions/offline/route.ts",
      ),
      "utf8",
    ).trim();
    expect(source).toBe(
      'export { POST } from "@asym/api/admin/contributions/offline-route";',
    );
  });
});
