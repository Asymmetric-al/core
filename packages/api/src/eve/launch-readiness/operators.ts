import { NextResponse } from "next/server";
import { z } from "zod";

import { withOperation } from "../../shared/with-operation";

export interface EveLaunchOperator {
  id: string;
  displayName: string | null;
  email: string | null;
}

interface TenantOperatorsClient {
  rpc(
    fn: "tenant_operators",
    args: { p_tenant_id: string },
  ): PromiseLike<{
    data: unknown;
    error: { code?: string; message: string } | null;
  }>;
}

const operatorsSchema = z.array(
  z.object({
    id: z.string().uuid(),
    display_name: z.string().nullable(),
    email: z.string().nullable(),
  }),
);

const NOT_AN_OPERATOR =
  "Forbidden: only a platform operator who belongs to this organization can list its platform operators";

const NO_STORE = { "cache-control": "private, no-store" };

export const GET = withOperation(
  async ({ auth, sessionClient }) => {
    const client = sessionClient as unknown as TenantOperatorsClient;
    const { data, error } = await client.rpc("tenant_operators", {
      p_tenant_id: auth.tenantId,
    });
    if (error) {
      if (error.code === "42501") {
        return NextResponse.json(
          { error: NOT_AN_OPERATOR },
          { status: 403, headers: NO_STORE },
        );
      }
      throw new Error(
        `The platform operators could not be read: ${error.message}`,
      );
    }
    const parsed = operatorsSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("The platform operators came back in an unknown shape.");
    }
    const operators: EveLaunchOperator[] = parsed.data.map((row) => ({
      id: row.id,
      displayName: row.display_name,
      email: row.email,
    }));
    return NextResponse.json({ operators }, { headers: NO_STORE });
  },
  { tenantAdministrator: true, platformOperator: true },
);
