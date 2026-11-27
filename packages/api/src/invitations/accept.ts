import { markSharedOriginSessionChange } from "@asym/auth/clipboard-reset";
import {
  isNameTenantRefused,
  nameTenantIdOf,
  readNameTenantState,
} from "@asym/auth/request-headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { ApiHttpError, ensureJsonBody } from "../shared/http-errors";
import {
  createRequestSessionClient,
  requestCarriesSupabaseSession,
} from "../shared/request-session-client";

const acceptInvitationBodySchema = z.object({
  selector: z.string().trim().min(1).max(256),
  verifier: z.string().trim().min(1).max(256),
});

type AcceptInvitationRpcPayload = {
  invitation_id: string;
  tenant_id: string;
  membership_id: string;
  user_id: string;
  role: "staff" | "missionary";
  staff_role: string | null;
  is_tenant_admin: boolean;
  revived: boolean;
  accepted_at: string;
};

type AcceptRpcResult = {
  data: AcceptInvitationRpcPayload | null;
  error: { code?: string; message?: string } | null;
};

interface AcceptInvitationClient {
  auth: {
    getUser: () => Promise<{
      data: { user: { id: string } | null };
      error: unknown;
    }>;
  };
  rpc: (
    fn: "accept_membership_invitation",
    args: { p_selector: string; p_verifier: string },
  ) => Promise<AcceptRpcResult>;
}

const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

function invitationInvalid(): NextResponse {
  return NextResponse.json(
    {
      error: "Invitation is invalid or no longer available",
      code: "INVITATION_INVALID",
    },
    { status: 403, headers: NO_STORE_HEADERS },
  );
}

function redirectPathFor(
  tenantId: string,
  nameTenantId: string | null,
  off: boolean,
): string {
  if (off) return `/${tenantId}`;
  return tenantId === nameTenantId ? "/" : "/no-access";
}

export async function POST(request: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await ensureJsonBody(request);
  } catch (error) {
    if (error instanceof ApiHttpError) {
      return NextResponse.json(
        { error: error.message, code: "INVALID_REQUEST" },
        { status: error.status, headers: NO_STORE_HEADERS },
      );
    }
    return NextResponse.json(
      { error: "Invalid JSON body", code: "INVALID_REQUEST" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  const parsed = acceptInvitationBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invitation is invalid or no longer available",
        code: "INVITATION_INVALID",
      },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  if (!requestCarriesSupabaseSession(request)) {
    return NextResponse.json(
      {
        error: "Sign in to accept this invitation.",
        code: "UNAUTHENTICATED",
      },
      { status: 401, headers: NO_STORE_HEADERS },
    );
  }

  const sessionClient = (await createRequestSessionClient(
    request,
    null,
  )) as unknown as AcceptInvitationClient;

  const {
    data: { user },
    error: authError,
  } = await sessionClient.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      {
        error: "Sign in to accept this invitation.",
        code: "UNAUTHENTICATED",
      },
      { status: 401, headers: NO_STORE_HEADERS },
    );
  }

  const name = readNameTenantState(request.headers);
  if (isNameTenantRefused(name)) return invitationInvalid();

  const { data, error } = await sessionClient.rpc(
    "accept_membership_invitation",
    {
      p_selector: parsed.data.selector,
      p_verifier: parsed.data.verifier,
    },
  );

  if (error || !data) {
    const pgCode = error?.code;
    if (pgCode === "42501") return invitationInvalid();
    if (pgCode === "55000") {
      return NextResponse.json(
        {
          error:
            error?.message ||
            "This organization is not currently active and cannot accept invitations",
          code: "TENANT_INACTIVE",
        },
        { status: 409, headers: NO_STORE_HEADERS },
      );
    }
    if (pgCode === "23505") {
      return NextResponse.json(
        {
          error:
            error?.message ||
            "You already hold this active membership in this organization",
          code: "ALREADY_MEMBER",
        },
        { status: 409, headers: NO_STORE_HEADERS },
      );
    }
    return NextResponse.json(
      {
        error: "Could not accept invitation",
        code: "INVITATION_ACCEPT_FAILED",
      },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }

  return markSharedOriginSessionChange(
    NextResponse.json(
      {
        ...data,
        redirectPath: redirectPathFor(
          data.tenant_id,
          nameTenantIdOf(name),
          name.kind === "off",
        ),
      },
      { status: 200, headers: NO_STORE_HEADERS },
    ),
  );
}
