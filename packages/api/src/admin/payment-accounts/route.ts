import { serverEnv } from "@asym/env";
import { NextResponse } from "next/server";
import { z } from "zod";

import { ensureJsonBody, toErrorResponse } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";
import { createStripeClient } from "../../stripe/client";
import {
  ConnectedAccountMismatchError,
  ONBOARDING_INTENT_PROVIDER_WINDOW_DAYS,
  StripeLiveModeRefusedError,
  assertStripeTestModeKey,
  ensureConnectedAccountForIntent,
  issueConnectedAccountLink,
  resolveAdminConfiguredOrigin,
  verifyConnectedAccountForIntent,
  type StripeConnectClient,
} from "../../stripe/connect";

type LegalEntityRow = {
  id: string;
  tenant_id: string;
  name: string;
  legal_name: string;
  country_code: string;
  currency: string;
  tax_id: string | null;
  created_at: string;
};

type PaymentAccountBindingRow = {
  id: string;
  tenant_id: string;
  legal_entity_id: string;
  version: number;
  status: "pending" | "active" | "restricted" | "disconnected";
  provider_account_ref: string;
  livemode: boolean;
  activated_at: string | null;
  restricted_at: string | null;
  disconnected_at: string | null;
  created_at: string;
  updated_at: string;
};

type OnboardingIntentRow = {
  id: string;
  legal_entity_id: string;
  livemode: boolean;
  version: number;
  status: "open" | "confirmed";
  created_at: string;
};

type OnboardingIntentResult = {
  intent_id: string;
  tenant_id: string;
  legal_entity_id: string;
  livemode: boolean;
  version: number;
  status: "open" | "confirmed";
  provider_account_id: string | null;
  binding_id: string | null;
  binding_status: PaymentAccountBindingRow["status"] | null;
  created_at: string | null;
  replayed: boolean;
};

type QueryError = { code?: string; message: string } | null;

interface TableQuery<T> extends PromiseLike<{
  data: T[] | null;
  error: QueryError;
}> {
  select(columns: string): TableQuery<T>;
  eq(column: string, value: string | boolean): TableQuery<T>;
  order(column: string, options?: { ascending?: boolean }): TableQuery<T>;
}

interface PaymentAccountsSessionClient {
  from(table: "payment_account_bindings"): TableQuery<PaymentAccountBindingRow>;
  from(table: "payment_onboarding_intents"): TableQuery<OnboardingIntentRow>;
  rpc(
    fn: "list_payment_legal_entities",
    args: { p_tenant_id: string },
  ): Promise<{ data: LegalEntityRow[] | null; error: QueryError }>;
  rpc(
    fn: "begin_payment_account_onboarding",
    args: {
      p_tenant_id: string;
      p_legal_entity_id: string;
      p_livemode: boolean;
      p_reason: string;
    },
  ): Promise<{ data: OnboardingIntentResult | null; error: QueryError }>;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const beginOnboardingBodySchema = z.object({
  legal_entity_id: z
    .string()
    .regex(UUID_PATTERN, "Valid legal_entity_id is required."),
  reason: z.string().trim().min(1, "A non-blank reason is required.").max(500),
});

const PROGRAM_LIVEMODE = false;

const BINDING_COLUMNS =
  "id, tenant_id, legal_entity_id, version, status, provider_account_ref, livemode, activated_at, restricted_at, disconnected_at, created_at, updated_at";

function mapDatabaseErrorStatus(code: string | undefined): number {
  if (code === "42501") return 403;
  if (code === "P0002") return 404;
  if (code === "22023") return 400;
  if (code === "23505" || code === "23503") return 409;
  return 500;
}

function intentOutsideProviderWindow(createdAt: string | null): boolean {
  if (!createdAt) return false;
  const ageMs = Date.now() - new Date(createdAt).getTime();
  return ageMs > ONBOARDING_INTENT_PROVIDER_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

type KeyState =
  | { kind: "missing" }
  | { kind: "live_refused" }
  | { kind: "invalid"; message: string }
  | { kind: "test"; key: string };

function readKeyState(raw: string | undefined): KeyState {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return { kind: "missing" };
  try {
    return { kind: "test", key: assertStripeTestModeKey(trimmed) };
  } catch (error) {
    if (error instanceof StripeLiveModeRefusedError) {
      return { kind: "live_refused" };
    }
    return {
      kind: "invalid",
      message: error instanceof Error ? error.message : "Invalid Stripe key.",
    };
  }
}

export interface PaymentAccountsHandlerDeps {
  getSecretKey?: () => string | undefined;
  getConfiguredOrigin?: () => string;
  createStripe?: (secretKey: string) => StripeConnectClient;
}

export function createPaymentAccountsHandlers(
  deps: PaymentAccountsHandlerDeps = {},
) {
  const getSecretKey = deps.getSecretKey ?? (() => serverEnv.STRIPE_SECRET_KEY);
  const getConfiguredOrigin =
    deps.getConfiguredOrigin ?? (() => resolveAdminConfiguredOrigin());
  const createStripe =
    deps.createStripe ??
    ((key: string) =>
      createStripeClient(key) as unknown as StripeConnectClient);

  const GET = withOperation(
    async ({ auth, sessionClient, requestId }) => {
      try {
        const session =
          sessionClient as unknown as PaymentAccountsSessionClient;
        const keyState = readKeyState(getSecretKey());

        const [entitiesRes, bindingsRes, intentsRes] = await Promise.all([
          session.rpc("list_payment_legal_entities", {
            p_tenant_id: auth.tenantId,
          }),
          session
            .from("payment_account_bindings")
            .select(BINDING_COLUMNS)
            .eq("livemode", PROGRAM_LIVEMODE)
            .order("version", { ascending: false }),
          session
            .from("payment_onboarding_intents")
            .select(
              "id, legal_entity_id, livemode, version, status, created_at",
            )
            .eq("livemode", PROGRAM_LIVEMODE)
            .eq("status", "open"),
        ]);

        for (const res of [entitiesRes, bindingsRes, intentsRes]) {
          if (res.error) {
            return NextResponse.json(
              { error: res.error.message, requestId },
              { status: mapDatabaseErrorStatus(res.error.code) },
            );
          }
        }

        const bindingsByEntity = new Map<string, PaymentAccountBindingRow[]>();
        for (const binding of bindingsRes.data ?? []) {
          const list = bindingsByEntity.get(binding.legal_entity_id) ?? [];
          list.push(binding);
          bindingsByEntity.set(binding.legal_entity_id, list);
        }
        const openIntentByEntity = new Map<string, OnboardingIntentRow>();
        for (const intent of intentsRes.data ?? []) {
          openIntentByEntity.set(intent.legal_entity_id, intent);
        }

        const legalEntities = (entitiesRes.data ?? []).map((entity) => {
          const bindings = bindingsByEntity.get(entity.id) ?? [];
          const currentBinding =
            bindings.find((b) => b.status !== "disconnected") ??
            bindings[0] ??
            null;
          return {
            ...entity,
            currentBinding,
            bindings,
            openIntent: openIntentByEntity.get(entity.id) ?? null,
          };
        });

        return NextResponse.json({
          tenantId: auth.tenantId,
          livemode: PROGRAM_LIVEMODE,
          configured: keyState.kind === "test",
          liveModeRefused: keyState.kind === "live_refused",
          legalEntities,
          requestId,
        });
      } catch (error) {
        return toErrorResponse(
          error,
          "Failed to load payment accounts.",
          requestId,
        );
      }
    },
    { capability: "payments.manage_account" },
  );

  const POST = withOperation(
    async ({ auth, request, sessionClient, requestId }) => {
      try {
        const rawBody = await ensureJsonBody(request);
        const parsed = beginOnboardingBodySchema.safeParse(rawBody);
        if (!parsed.success) {
          return NextResponse.json(
            {
              error: parsed.error.issues[0]?.message ?? "Invalid request body.",
              requestId,
            },
            { status: 400 },
          );
        }

        const keyState = readKeyState(getSecretKey());
        if (keyState.kind !== "test") {
          return NextResponse.json(
            {
              error:
                keyState.kind === "live_refused"
                  ? "Live Stripe keys are refused: Stripe Connect onboarding runs in test mode only."
                  : keyState.kind === "missing"
                    ? "Stripe Connect is not configured for this environment."
                    : keyState.message,
              requestId,
            },
            { status: 503 },
          );
        }

        let origin: string;
        try {
          origin = getConfiguredOrigin();
        } catch (originError) {
          return NextResponse.json(
            {
              error:
                originError instanceof Error
                  ? originError.message
                  : "Admin origin is not configured.",
              requestId,
            },
            { status: 503 },
          );
        }

        const session =
          sessionClient as unknown as PaymentAccountsSessionClient;

        const intentRes = await session.rpc(
          "begin_payment_account_onboarding",
          {
            p_tenant_id: auth.tenantId,
            p_legal_entity_id: parsed.data.legal_entity_id,
            p_livemode: PROGRAM_LIVEMODE,
            p_reason: parsed.data.reason,
          },
        );

        if (intentRes.error || !intentRes.data) {
          const status = mapDatabaseErrorStatus(intentRes.error?.code);
          return NextResponse.json(
            {
              error:
                status >= 500
                  ? "Failed to record the payment account onboarding intent."
                  : (intentRes.error?.message ??
                    "Failed to record the payment account onboarding intent."),
              requestId,
            },
            { status },
          );
        }

        const intent = intentRes.data;

        if (
          intent.status === "confirmed" &&
          intent.binding_status === "active"
        ) {
          return NextResponse.json(
            {
              error:
                "This legal entity already holds an active payment account binding in this mode.",
              intent,
              requestId,
            },
            { status: 409 },
          );
        }

        if (
          intent.status === "open" &&
          intentOutsideProviderWindow(intent.created_at)
        ) {
          return NextResponse.json(
            {
              error:
                "This onboarding intent is older than the provider's idempotency window and was never confirmed. Ask support to reconcile it before starting again.",
              intent,
              requestId,
            },
            { status: 409 },
          );
        }

        const entitiesRes = await session.rpc("list_payment_legal_entities", {
          p_tenant_id: auth.tenantId,
        });
        const entity = (entitiesRes.data ?? []).find(
          (row) => row.id === intent.legal_entity_id,
        );
        if (entitiesRes.error || !entity) {
          return NextResponse.json(
            {
              error: "No legal entity with that id in this organization.",
              requestId,
            },
            { status: entitiesRes.error ? 500 : 404 },
          );
        }

        const stripe = createStripe(keyState.key);
        const intentRef = {
          intentId: intent.intent_id,
          livemode: intent.livemode,
        };

        const account =
          intent.status === "confirmed" && intent.provider_account_id
            ? await verifyConnectedAccountForIntent(
                stripe,
                intent.provider_account_id,
                intentRef,
              )
            : await ensureConnectedAccountForIntent(stripe, {
                ...intentRef,
                countryCode: entity.country_code,
                currency: entity.currency,
                legalName: entity.legal_name,
              });

        const link = await issueConnectedAccountLink(stripe, {
          accountId: account.id,
          origin,
          useCase:
            intent.binding_status === "restricted"
              ? "account_update"
              : "account_onboarding",
        });

        return NextResponse.json(
          {
            intent,
            providerAccountId: account.id,
            onboardingUrl: link.url,
            expiresAt: link.expiresAt,
            requestId,
          },
          { status: intent.replayed ? 200 : 201 },
        );
      } catch (error) {
        if (error instanceof ConnectedAccountMismatchError) {
          return NextResponse.json(
            { error: error.message, requestId },
            { status: 409 },
          );
        }
        return toErrorResponse(
          error,
          "Failed to begin payment account onboarding.",
          requestId,
        );
      }
    },
    { capability: "payments.manage_account" },
  );

  return { GET, POST };
}

const defaultHandlers = createPaymentAccountsHandlers();

export const GET = defaultHandlers.GET;
export const POST = defaultHandlers.POST;
