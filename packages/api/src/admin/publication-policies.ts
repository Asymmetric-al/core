import { NextResponse } from "next/server";
import { z } from "zod";

import { normalizesToNothing } from "./workers/safety-text";
import { commandClient } from "../posts/command-client";
import { readJsonBodyOrNull } from "../shared/http-errors";
import { withOperation } from "../shared/with-operation";

interface PolicyRead {
  select(columns: string): PolicyRead;
  eq(column: string, value: string): PolicyRead;
  order(
    column: string,
    options: { ascending: boolean },
  ): PromiseLike<{
    data: unknown[] | null;
    error: { message?: string } | null;
  }>;
}

const policyBodySchema = z.object({
  ministryAssignmentId: z.uuid(),
  path: z.enum(["update", "profile"]),
  mode: z.enum(["review", "automatic"]),
  reason: z.string().max(500),
});

export const GET = withOperation(
  async ({ auth, sessionClient }) => {
    const table = (
      sessionClient as unknown as { from(table: string): PolicyRead }
    ).from("publication_policies");
    const { data, error } = await table
      .select("ministry_assignment_id, path, mode, reason, set_at")
      .eq("tenant_id", auth.tenantId)
      .order("set_at", { ascending: false });
    if (error)
      return NextResponse.json(
        { error: "Couldn’t load the publication policies." },
        { status: 500 },
      );
    return NextResponse.json(
      { policies: data ?? [] },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  },
  { capability: "updates.review" },
);

export const PUT = withOperation(
  async ({ auth, request, sessionClient }) => {
    const body = policyBodySchema.safeParse(await readJsonBodyOrNull(request));
    if (!body.success)
      return NextResponse.json({ error: "Invalid policy" }, { status: 400 });
    const { ministryAssignmentId, path, mode, reason } = body.data;
    if (normalizesToNothing(reason))
      return NextResponse.json({ error: "Give a reason." }, { status: 400 });
    const { error } = await commandClient(sessionClient).rpc(
      "set_publication_policy",
      {
        p_tenant_id: auth.tenantId,
        p_ministry_assignment_id: ministryAssignmentId,
        p_path: path,
        p_mode: mode,
        p_reason: reason,
      },
    );
    if (error?.code === "42501")
      return NextResponse.json(
        { error: "You can’t change this missionary’s publication policy." },
        { status: 403 },
      );
    if (error?.code === "22023")
      return NextResponse.json(
        { error: error.message ?? "Invalid policy" },
        { status: 400 },
      );
    if (error)
      return NextResponse.json(
        { error: "Something went wrong. Nothing was changed." },
        { status: 500 },
      );
    return NextResponse.json({ success: true });
  },
  { capability: "safety.restrict_publication" },
);
