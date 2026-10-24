/**
 * #2250 withTenant unit acceptance (spec r1 = issue comment 6384739115 +
 * conditions 6384790093): criteria 6, 10, 16(ii). The client spy is reachable
 * via mocked getAdminClient() and as a trailing argument; modules load per test.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import type * as Claims from "../../../../packages/api/src/workflows/claims";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: { rpc }, error: null }),
  createAdminClient: () => ({ rpc }),
}));
const client = { rpc };

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const CLAIM = "55555555-5555-4555-8555-555555555555";
const ACQ = "acquire_workflow_work_claim";
const REL = "release_workflow_work_claim";
const GUARD: string = "../../../../packages/api/src/identity/tenant-guard";
const CLAIMS: string = "../../../../packages/api/src/workflows/claims";
type Guarded = { rpc(name: string, args?: object): Promise<unknown> };
type GuardModule = {
  withTenant(
    ...a: [unknown, (g: Guarded) => unknown, unknown]
  ): Promise<unknown>;
  TenantGuardError: new (...args: never[]) => Error;
};
const guard = () => import(/* @vite-ignore */ GUARD) as Promise<GuardModule>;
const run = async (id: unknown, fn: (g: Guarded) => unknown) =>
  (await guard()).withTenant(id, fn, client);
/** The client answers every RPC with this jsonb (or the PostgREST error). */
const answer = (data: unknown, error: unknown = null) =>
  rpc.mockResolvedValue({ data, error });

beforeEach(() =>
  answer({ acquired: true, released: true, claim_id: CLAIM, tenant_id: A }),
);

describe("#2250 withTenant fail-closed (criteria 6, 16(ii))", () => {
  it.each([undefined, null, "", "not-a-uuid", `{${A}}`, A.replaceAll("-", "")])(
    "rejects tenant id %j with TenantGuardError before any I/O or fn call",
    async (id) => {
      const { TenantGuardError } = await guard();
      const fn = vi.fn();
      await expect(run(id, fn)).rejects.toBeInstanceOf(TenantGuardError);
      expect([fn.mock.calls.length, rpc.mock.calls.length]).toEqual([0, 0]);
    },
  );

  it.each([
    [ACQ, "mismatched", { acquired: true, tenant_id: B }],
    [ACQ, "missing", { acquired: true }],
    [REL, "mismatched", { released: true, tenant_id: B }],
    [REL, "missing", { released: true }],
  ])(
    "16(ii): %s with a %s tenant_id echo throws TenantGuardError",
    async (name, _kind, data) => {
      const { TenantGuardError } = await guard();
      answer(data);
      await expect(run(A, (g) => g.rpc(name, {}))).rejects.toBeInstanceOf(
        TenantGuardError,
      );
    },
  );

  it("injects p_tenant_id; a caller-supplied other tenant never reaches the client", async () => {
    await run(A, (g) => g.rpc(ACQ, { p_subject_type: "s" }));
    expect(rpc).toHaveBeenCalledWith(
      ACQ,
      expect.objectContaining({ p_tenant_id: A, p_subject_type: "s" }),
    );
    await run(A, (g) =>
      g.rpc(REL, { p_tenant_id: B, p_claim_id: CLAIM }),
    ).catch(() => undefined);
    expect(rpc.mock.calls.map((c) => c[1].p_tenant_id)).not.toContain(B);
  });

  it("a name outside the frozen allow-list throws with 0 client calls", async () => {
    const { TenantGuardError } = await guard();
    await expect(
      run(A, (g) => g.rpc("begin_donation_saga", {})),
    ).rejects.toBeInstanceOf(TenantGuardError);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("an error from fn propagates unchanged and nothing is retried", async () => {
    const boom = new Error("boom");
    const fn = vi.fn().mockRejectedValue(boom);
    await expect(run(A, fn)).rejects.toBe(boom);
    expect(fn).toHaveBeenCalledTimes(1);
    answer(null, { message: "pg down" });
    await expect(run(A, (g) => g.rpc(ACQ, {}))).rejects.toThrow();
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});

describe("#2250 claims routed through withTenant (criterion 10)", () => {
  const claims = () =>
    import(/* @vite-ignore */ CLAIMS) as Promise<typeof Claims>;
  const input = (tenantId: string) => ({
    tenantId,
    subject: { type: "t", id: "1" },
    claimedBy: "acc",
  });

  it("acquireWorkClaim with an invalid tenant id throws before the client is called", async () => {
    await expect(
      (await claims()).acquireWorkClaim(client as never, input("nope")),
    ).rejects.toThrow();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("acquireWorkClaim fails closed on a mismatched echo", async () => {
    answer({ acquired: true, claim_id: CLAIM, tenant_id: B });
    await expect(
      (await claims()).acquireWorkClaim(client as never, input(A)),
    ).rejects.toThrow();
  });

  it("releaseWorkClaim sends the acquiring tenant, reads released from jsonb, and checks the echo", async () => {
    const { releaseWorkClaim } = await claims();
    const release = () =>
      releaseWorkClaim(
        client as never,
        { tenantId: A, claimId: CLAIM } as never,
      );
    await expect(release()).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith(REL, {
      p_tenant_id: A,
      p_claim_id: CLAIM,
      p_status: "released",
    });
    answer({ released: true, tenant_id: B });
    await expect(release()).rejects.toThrow();
  });
});
