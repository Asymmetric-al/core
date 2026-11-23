import { serverEnv } from "@asym/env";
import { NextResponse } from "next/server";
import { z } from "zod";

import { ensureJsonBody, toErrorResponse } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";
import { createStripeClient } from "../../stripe/client";
import {
  createConnectedAccountOnboarding,
  isStripeSecretKeyLivemode,
  resolveAdminConfiguredOrigin,
  type StripeConnectOnboardingClient,
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

type OnboardingRpcResult = {
  binding_id: string;
  tenant_id: string;
  legal_entity_id: string;
  provider_account_id: string;
  livemode: boolean;
  version: number;
  status: string;
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
  maybeSingle(): Promise<{ data: T | null; error: QueryError }>;
}

interface PaymentAccountsSessionClient {
  from(table: "legal_entities"): TableQuery<LegalEntityRow>;
  from(table: "payment_account_bindings"): TableQuery<PaymentAccountBindingRow>;
  rpc(
    fn: "begin_payment_account_onboarding",
    args: {
      p_tenant_id: string;
      p_legal_entity_id: string;
      p_provider_account_id: string;
      p_livemode: boolean;
      p_reason: string;
    },
  ): Promise<{ data: OnboardingRpcResult | null; error: QueryError }>;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const beginOnboardingBodySchema = z.object({
  legal_entity_id: z
    .string()
    .regex(UUID_PATTERN, "Valid legal_entity_id is required."),
  reason: z.string().trim().min(1, "A non-blank reason is required.").max(500),
  idempotency_key: z.string().trim().min(1).max(128).optional(),
});

function mapDatabaseErrorStatus(code: string | undefined): number {
  if (code === "42501") return 403;
  if (code === "P0002") return 404;
  if (code === "22023") return 400;
  if (code === "23505" || code === "23503") return 409;
  return 500;
}

export interface PaymentAccountsHandlerDeps {
  getSecretKey?: () => string | undefined;
  getConfiguredOrigin?: () => string;
  createStripe?: (secretKey: string) => StripeConnectOnboardingClient;
}

export function createPaymentAccountsHandlers(
  deps: PaymentAccountsHandlerDeps = {},
) {
  const getSecretKey = deps.getSecretKey ?? (() => serverEnv.STRIPE_SECRET_KEY);
  const getConfiguredOrigin =
    deps.getConfiguredOrigin ?? (() => resolveAdminConfiguredOrigin());
  const createStripe =
    deps.createStripe ?? ((key: string) => createStripeClient(key));

  const GET = withOperation(
    async ({ auth, sessionClient, requestId }) => {
      try {
        const session =
          sessionClient as unknown as PaymentAccountsSessionClient;
        const secretKey = getSecretKey()?.trim() || "";
        const configured = secretKey.length > 0;
        const livemode = configured
          ? isStripeSecretKeyLivemode(secretKey)
          : false;

        const [entitiesRes, bindingsRes] = await Promise.all([
          session
            .from("legal_entities")
            .select(
              "id, tenant_id, name, legal_name, country_code, currency, tax_id, created_at",
            )
            .order("created_at", { ascending: true }),
          session
            .from("payment_account_bindings")
            .select(
              "id, tenant_id, legal_entity_id, version, status, provider_account_ref, livemode, activated_at, restricted_at, disconnected_at, created_at, updated_at",
            )
            .eq("livemode", livemode)
            .order("version", { ascending: false }),
        ]);

        if (entitiesRes.error) {
          return NextResponse.json(
            { error: entitiesRes.error.message, requestId },
            { status: mapDatabaseErrorStatus(entitiesRes.error.code) },
          );
        }
        if (bindingsRes.error) {
          return NextResponse.json(
            { error: bindingsRes.error.message, requestId },
            { status: mapDatabaseErrorStatus(bindingsRes.error.code) },
          );
        }

        const bindingsByEntity = new Map<string, PaymentAccountBindingRow[]>();
        for (const binding of bindingsRes.data ?? []) {
          const list = bindingsByEntity.get(binding.legal_entity_id) ?? [];
          list.push(binding);
          bindingsByEntity.set(binding.legal_entity_id, list);
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
          };
        });

        return NextResponse.json({
          tenantId: auth.tenantId,
          livemode,
          configured,
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

        const secretKey = getSecretKey()?.trim() || "";
        if (!secretKey) {
          return NextResponse.json(
            {
              error: "Stripe Connect is not configured for this environment.",
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

        const livemode = isStripeSecretKeyLivemode(secretKey);
        const session =
          sessionClient as unknown as PaymentAccountsSessionClient;

        const entityRes = await session
          .from("legal_entities")
          .select(
            "id, tenant_id, name, legal_name, country_code, currency, tax_id, created_at",
          )
          .eq("id", parsed.data.legal_entity_id)
          .maybeSingle();

        if (entityRes.error) {
          return NextResponse.json(
            { error: entityRes.error.message, requestId },
            { status: mapDatabaseErrorStatus(entityRes.error.code) },
          );
        }
        if (!entityRes.data) {
          return NextResponse.json(
            {
              error: "No legal entity with that id in this organization.",
              requestId,
            },
            { status: 404 },
          );
        }

        const bindingsRes = await session
          .from("payment_account_bindings")
          .select(
            "id, tenant_id, legal_entity_id, version, status, provider_account_ref, livemode, activated_at, restricted_at, disconnected_at, created_at, updated_at",
          )
          .eq("legal_entity_id", entityRes.data.id)
          .eq("livemode", livemode)
          .order("version", { ascending: false });

        if (bindingsRes.error) {
          return NextResponse.json(
            { error: bindingsRes.error.message, requestId },
            { status: mapDatabaseErrorStatus(bindingsRes.error.code) },
          );
        }

        const existingBindings = bindingsRes.data ?? [];
        const liveBinding = existingBindings.find(
          (b) => b.status !== "disconnected",
        );

        if (liveBinding && liveBinding.status !== "pending") {
          return NextResponse.json(
            {
              error:
                "Legal entity already holds an active or restricted payment account binding in this mode.",
              requestId,
            },
            { status: 409 },
          );
        }

        const maxVersion = existingBindings.reduce(
          (acc, b) => Math.max(acc, b.version),
          0,
        );
        const nextVersion = maxVersion + 1;
        const idempotencyKey =
          parsed.data.idempotency_key ??
          `wp8a-onboard:${auth.tenantId}:${entityRes.data.id}:${livemode ? "live" : "test"}:v${nextVersion}`;

        const stripe = createStripe(secretKey);
        const onboarding = await createConnectedAccountOnboarding(stripe, {
          countryCode: entityRes.data.country_code,
          tenantId: auth.tenantId,
          legalEntityId: entityRes.data.id,
          legalName: entityRes.data.legal_name,
          origin,
          idempotencyKey,
          existingAccountId: liveBinding?.provider_account_ref ?? null,
        });

        const rpcRes = await session.rpc("begin_payment_account_onboarding", {
          p_tenant_id: auth.tenantId,
          p_legal_entity_id: entityRes.data.id,
          p_provider_account_id: onboarding.providerAccountId,
          p_livemode: livemode,
          p_reason: parsed.data.reason,
        });

        if (rpcRes.error || !rpcRes.data) {
          const status = mapDatabaseErrorStatus(rpcRes.error?.code);
          return NextResponse.json(
            {
              error:
                status >= 500
                  ? "Failed to record payment account onboarding."
                  : (rpcRes.error?.message ??
                    "Failed to record payment account onboarding."),
              requestId,
            },
            { status },
          );
        }

        return NextResponse.json(
          {
            binding: rpcRes.data,
            onboardingUrl: onboarding.onboardingUrl,
            expiresAt: onboarding.expiresAt,
            requestId,
          },
          { status: rpcRes.data.replayed ? 200 : 201 },
        );
      } catch (error) {
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
