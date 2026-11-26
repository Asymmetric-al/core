import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiHttpError } from "../shared/api-http-error";
import { ensureJsonBody } from "../shared/http-errors";
import { withOperation } from "../shared/with-operation";

const SUBMISSION_KEY =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const partnerSchema = z
  .object({
    name: z.string().max(1_000),
    email: z.string().max(1_000),
    phone: z.string().max(1_000).nullable().optional(),
    type: z.enum(["Individual", "Organization", "Church"]),
    frequency: z.enum(["Monthly", "One-Time", "Annually", "Irregular"]),
    location: z.string().max(1_000),
  })
  .strict();

const REFUSALS: Record<string, [status: number, message: string]> = {
  "42501": [403, "Forbidden: this assignment cannot add partners here."],
  "23505": [409, "This submission was already used for another partner."],
  "22023": [400, "Check the partner's details and try again."],
};

export type AddPartnerResult = {
  donorId: string;
  partyId: string;
  commandLogId: string;
  duplicate: boolean;
};

function readSubmissionKey(request: Request): string {
  const sent = request.headers.get("idempotency-key")?.trim();
  if (!sent || !SUBMISSION_KEY.test(sent)) {
    throw new ApiHttpError(400, "Idempotency-Key must be a UUID.");
  }
  return sent.toLowerCase();
}

function readResult(data: unknown): AddPartnerResult {
  const result = (data ?? {}) as Partial<AddPartnerResult>;
  if (
    typeof result.donorId !== "string" ||
    typeof result.partyId !== "string" ||
    typeof result.commandLogId !== "string" ||
    typeof result.duplicate !== "boolean"
  ) {
    throw new Error("add_partner answered without the stored pair.");
  }
  return {
    donorId: result.donorId,
    partyId: result.partyId,
    commandLogId: result.commandLogId,
    duplicate: result.duplicate,
  };
}

export const POST = withOperation(
  async ({ auth, request, requestId, sessionClient }) => {
    const idempotencyKey = readSubmissionKey(request);
    const partner = partnerSchema.parse(await ensureJsonBody(request));

    const { data, error } = await sessionClient.rpc("add_partner", {
      p_tenant_id: auth.tenantId,
      p_idempotency_key: idempotencyKey,
      p_name: partner.name,
      p_email: partner.email,
      p_phone: partner.phone?.trim() ? partner.phone : null,
      p_type: partner.type,
      p_frequency: partner.frequency,
      p_location: partner.location,
      p_request_id: requestId,
    });

    if (error) {
      const refusal = error.code ? REFUSALS[error.code] : undefined;
      if (refusal) throw new ApiHttpError(refusal[0], refusal[1]);
      throw new Error(error.message || "add_partner failed.");
    }

    const result = readResult(data);
    return NextResponse.json(
      { ...result, requestId },
      { status: result.duplicate ? 200 : 201 },
    );
  },
  { capability: "partners.add", roleClasses: ["missionary"] },
);
