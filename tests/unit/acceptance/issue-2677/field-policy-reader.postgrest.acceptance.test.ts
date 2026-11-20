import { createClient } from "@supabase/supabase-js";
import { expect, it, vi } from "vitest";

import { loadFieldPolicies } from "../../../../packages/api/src/field-policies/reader";
import { resolveProjection } from "../../../../packages/api/src/projection";
import { createRequestSessionClient } from "../../../../packages/api/src/shared/request-session-client";
import { fixture } from "../../packages/api/projection/fixtures";

const url = process.env.FIELD_POLICY_IT_SUPABASE_URL;
it.skipIf(!url)(
  "a signed-in caller gets only classified fields; the same token without scope gets none",
  async () => {
    if (!url || !["localhost", "127.0.0.1"].includes(new URL(url).hostname))
      throw new Error("Requires a disposable loopback Supabase stack");
    const key = process.env.FIELD_POLICY_IT_ANON_KEY;
    if (!key) throw new Error("Missing local public API key");
    const session = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await session.auth.signInWithPassword({
      email: "demo-owner@givehope.test",
      password: "demo-password",
    });
    expect(error).toBeNull();
    const { data: assignments, error: rpcError } = await session.rpc(
      "current_user_assignments",
    );
    expect(rpcError).toBeNull();
    const staff = assignments.find(
      (entry: { role: string }) => entry.role === "staff",
    );
    expect(staff).toBeTruthy();
    const request = new Request(url, {
      headers: { Authorization: `Bearer ${data.session!.access_token}` },
    });
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", key);
    try {
      for (const scope of [
        null,
        { tenantId: staff.tenant_id, assignmentId: staff.id },
      ]) {
        const sessionClient = await createRequestSessionClient(request, scope);
        const model = fixture("missionary", "donations");
        const policies = await loadFieldPolicies({
          sessionClient,
          surface: model.surface,
          recordType: model.recordType,
        });
        expect(policies.get("amount")?.visible ?? false).toBe(Boolean(scope));
        expect(
          resolveProjection({
            ...model,
            policies,
            row: { ...model.row, unclassified: "never" },
          }),
        ).toEqual({
          kind: "allowed",
          projection: scope ? { amount: 1250 } : {},
        });
      }
    } finally {
      vi.unstubAllEnvs();
      await session.auth.signOut({ scope: "local" });
    }
  },
);
