"use client";

import { loadDocument } from "@asym/database/document-reload";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Field, FieldLabel } from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { fetchWithSupabaseAuth } from "@/lib/authenticated-fetch";

type BindingStatus = "pending" | "active" | "restricted" | "disconnected";

interface PaymentAccountBindingSummary {
  id: string;
  version: number;
  status: BindingStatus;
  provider_account_ref: string;
  livemode: boolean;
  activated_at: string | null;
  restricted_at: string | null;
  disconnected_at: string | null;
  created_at: string;
  updated_at: string;
}

interface LegalEntityPaymentAccount {
  id: string;
  name: string;
  legal_name: string;
  country_code: string;
  currency: string;
  tax_id: string | null;
  currentBinding: PaymentAccountBindingSummary | null;
  bindings: PaymentAccountBindingSummary[];
}

interface PaymentAccountsResponse {
  livemode: boolean;
  configured: boolean;
  legalEntities: LegalEntityPaymentAccount[];
  error?: string;
}

const STATUS_LABELS: Record<BindingStatus, string> = {
  pending: "Onboarding pending",
  active: "Active",
  restricted: "Restricted",
  disconnected: "Disconnected",
};

function subscribeLocationSearch(callback: () => void): () => void {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getOnboardingNoticeSnapshot(): "return" | "refresh" | null {
  const state = new URLSearchParams(window.location.search).get("onboarding");
  return state === "return" || state === "refresh" ? state : null;
}

function getServerOnboardingNoticeSnapshot(): "return" | "refresh" | null {
  return null;
}

type FetchPaymentAccountsResult =
  { ok: true; data: PaymentAccountsResponse } | { ok: false; error: string };

async function fetchPaymentAccounts(): Promise<FetchPaymentAccountsResult> {
  try {
    const response = await fetchWithSupabaseAuth(
      "/api/admin/payment-accounts",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    const data = (await response.json()) as PaymentAccountsResponse;
    if (!response.ok) {
      return {
        ok: false,
        error: data.error ?? "Unable to load payment accounts.",
      };
    }
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      error: "Network error while loading payment accounts.",
    };
  }
}

function statusBadgeVariant(
  status: BindingStatus | null,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "active") return "default";
  if (status === "restricted" || status === "disconnected") {
    return "destructive";
  }
  if (status === "pending") return "secondary";
  return "outline";
}

export default function PaymentAccountsPage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [configured, setConfigured] = useState(false);
  const [livemode, setLivemode] = useState(false);
  const [entities, setEntities] = useState<LegalEntityPaymentAccount[]>([]);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const onboardingNotice = useSyncExternalStore(
    subscribeLocationSearch,
    getOnboardingNoticeSnapshot,
    getServerOnboardingNoticeSnapshot,
  );

  const applyAccountsResult = (result: FetchPaymentAccountsResult) => {
    if (!result.ok) {
      setLoadError(result.error);
      setLoading(false);
      return;
    }
    setConfigured(Boolean(result.data.configured));
    setLivemode(Boolean(result.data.livemode));
    setEntities(result.data.legalEntities ?? []);
    setLoadError(null);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    void fetchPaymentAccounts().then((result) => {
      if (!active) return;
      applyAccountsResult(result);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setLoadError(null);
    const result = await fetchPaymentAccounts();
    applyAccountsResult(result);
  };

  const handleStartOnboarding = async (entity: LegalEntityPaymentAccount) => {
    const reason = (reasons[entity.id] ?? "").trim();
    if (!reason) {
      toast.error("Reason required", {
        description:
          "Enter a brief audit reason before starting Stripe onboarding.",
      });
      return;
    }

    setSubmittingId(entity.id);
    try {
      const response = await fetchWithSupabaseAuth(
        "/api/admin/payment-accounts",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            legal_entity_id: entity.id,
            reason,
          }),
        },
      );
      const data = (await response.json()) as {
        onboardingUrl?: string;
        error?: string;
      };
      if (!response.ok || !data.onboardingUrl) {
        toast.error("Unable to start Stripe onboarding", {
          description: data.error ?? "Request failed.",
        });
        return;
      }
      loadDocument(data.onboardingUrl);
    } catch {
      toast.error("Unable to start Stripe onboarding", {
        description: "Network error. Please try again.",
      });
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <PageShell
      title="Payment accounts"
      description="Connect a Stripe account for each legal entity and review its binding version and status."
      density="compact"
    >
      <div className="flex flex-col gap-6">
        {onboardingNotice === "return" ? (
          <Alert>
            <CheckCircle2 aria-hidden="true" className="size-4" />
            <AlertTitle>Returned from Stripe onboarding</AlertTitle>
            <AlertDescription>
              Stripe notifies Mission Control once account verification updates
              the binding status.
            </AlertDescription>
          </Alert>
        ) : null}

        {onboardingNotice === "refresh" ? (
          <Alert>
            <RefreshCw aria-hidden="true" className="size-4" />
            <AlertTitle>Onboarding link expired</AlertTitle>
            <AlertDescription>
              Start or continue onboarding below to generate a fresh hosted
              Stripe link.
            </AlertDescription>
          </Alert>
        ) : null}

        {loading ? (
          <div className="flex flex-col gap-4" role="status">
            <span className="sr-only">Loading payment accounts…</span>
            <Skeleton className="h-44 rounded-xl" />
          </div>
        ) : loadError ? (
          <Alert variant="destructive">
            <AlertTriangle aria-hidden="true" className="size-4" />
            <AlertTitle>Unable to load payment accounts</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        ) : (
          <>
            {!configured ? (
              <Alert>
                <AlertTriangle aria-hidden="true" className="size-4" />
                <AlertTitle>Stripe Connect not configured</AlertTitle>
                <AlertDescription>
                  Set STRIPE_SECRET_KEY in this environment to start onboarding
                  a connected Stripe account.
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard aria-hidden="true" className="size-4" />
                <span>Stripe mode:</span>
                <Badge variant="outline">
                  {livemode ? "Live mode" : "Test mode"}
                </Badge>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleRefresh()}
              >
                <RefreshCw aria-hidden="true" className="size-3.5" />
                Refresh
              </Button>
            </div>

            {entities.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No legal entities found</CardTitle>
                  <CardDescription>
                    Add a legal entity before connecting a Stripe payment
                    account.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                {entities.map((entity) => {
                  const current = entity.currentBinding;
                  const canStartOnboarding =
                    configured &&
                    (!current ||
                      current.status === "pending" ||
                      current.status === "disconnected");
                  const actionLabel =
                    current?.status === "pending"
                      ? "Continue Stripe onboarding"
                      : current?.status === "disconnected"
                        ? `Onboard version ${current.version + 1}`
                        : "Start Stripe onboarding";
                  const inputId = `onboard-reason-${entity.id}`;

                  return (
                    <Card key={entity.id}>
                      <CardHeader>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <CardTitle>{entity.legal_name}</CardTitle>
                            <CardDescription>
                              {entity.country_code} ·{" "}
                              {entity.currency.toUpperCase()}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={statusBadgeVariant(
                              current?.status ?? null,
                            )}
                          >
                            {current
                              ? `${STATUS_LABELS[current.status]} (v${current.version})`
                              : "Not connected"}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="flex flex-col gap-4">
                        {current ? (
                          <dl className="grid gap-2 text-sm sm:grid-cols-3">
                            <div>
                              <dt className="text-muted-foreground">
                                Connected account
                              </dt>
                              <dd className="font-mono text-xs">
                                {current.provider_account_ref}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">
                                Binding version
                              </dt>
                              <dd>v{current.version}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">Status</dt>
                              <dd>{STATUS_LABELS[current.status]}</dd>
                            </div>
                          </dl>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No Stripe connected account is bound to this legal
                            entity yet.
                          </p>
                        )}

                        {canStartOnboarding ? (
                          <Field>
                            <FieldLabel htmlFor={inputId}>
                              Audit reason
                            </FieldLabel>
                            <Input
                              id={inputId}
                              value={reasons[entity.id] ?? ""}
                              onChange={(event) =>
                                setReasons((prev) => ({
                                  ...prev,
                                  [entity.id]: event.target.value,
                                }))
                              }
                              placeholder="e.g. Initial Stripe Connect onboarding for US entity"
                              disabled={submittingId === entity.id}
                            />
                          </Field>
                        ) : null}
                      </CardContent>

                      {canStartOnboarding ? (
                        <CardFooter>
                          <Button
                            type="button"
                            disabled={submittingId === entity.id}
                            onClick={() => void handleStartOnboarding(entity)}
                          >
                            {submittingId === entity.id ? (
                              <Loader2
                                aria-hidden="true"
                                className="size-4 animate-spin"
                              />
                            ) : (
                              <ExternalLink
                                aria-hidden="true"
                                className="size-4"
                              />
                            )}
                            {actionLabel}
                          </Button>
                        </CardFooter>
                      ) : null}
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}
