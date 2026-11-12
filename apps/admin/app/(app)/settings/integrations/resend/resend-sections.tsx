"use client";

import {
  MetricCard,
  MetricGrid,
} from "@asym/ui/components/primitives/metric-card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@asym/ui/components/shadcn/alert-dialog";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, ButtonLink } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@asym/ui/components/shadcn/input-group";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  ExternalLink,
  Globe,
  Info,
  Key,
  Loader2,
  RefreshCw,
  Send,
  XCircle,
} from "lucide-react";
import { useId, useState } from "react";

import { formatValidatedAtUtcLabel } from "./validated-at";

import type {
  ResendConnectFormApi,
  ResendTestFormApi,
} from "./use-resend-forms";
import type {
  DeliverabilityWarning,
  DomainAuthentication,
  SenderIdentity,
} from "@asym/email/types";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";
type TestEmailStatus = "idle" | "sending" | "success" | "error";

interface ConnectedConnectionSummary {
  apiKeyHint?: string;
  hasValidationMetadata: boolean;
  sendReady: boolean;
  validatedAt?: string;
  senderIdentities: SenderIdentity[];
  domainAuthentication: DomainAuthentication[];
  deliverabilityScore: number;
  warnings: DeliverabilityWarning[];
}

interface ResendConnectedViewProps {
  canSendTestEmail: boolean;
  connection: ConnectedConnectionSummary;
  onDisconnect: () => Promise<boolean>;
  onOpenTestDialog: () => void;
}

interface ResendDisconnectedViewProps {
  connectionError?: string;
  connectionWarnings: DeliverabilityWarning[];
  connectionStatus: ConnectionStatus;
  form: ResendConnectFormApi;
  showApiKey: boolean;
  onToggleApiKeyVisibility: () => void;
}

interface ResendTestDialogProps {
  form: ResendTestFormApi;
  open: boolean;
  testStatus: TestEmailStatus;
  testError: string | null;
  fromName: string;
  fromEmail: string;
  onOpenChange: (open: boolean) => void;
}

function getRenderableErrors(field: {
  form: { state: { submissionAttempts: number } };
  state: {
    meta: {
      errors: unknown[];
      isTouched: boolean;
    };
  };
}) {
  if (
    !field.state.meta.isTouched &&
    field.form.state.submissionAttempts === 0
  ) {
    return [];
  }

  return field.state.meta.errors.flatMap((error) => {
    if (!error) {
      return [];
    }

    if (typeof error === "string") {
      return [{ message: error }];
    }

    if (typeof error === "object" && "message" in error) {
      const message = error.message;
      if (typeof message === "string" && message.length > 0) {
        return [{ message }];
      }
    }

    return [{ message: String(error) }];
  });
}

const WARNING_TITLES: Record<string, string> = {
  DEFAULT_FROM_EMAIL_DOMAIN_NOT_VERIFIED: "Sender domain not verified",
  DOMAIN_NOT_VERIFIED: "Domain not verified",
  NO_DOMAINS: "No sending domain",
  RESTRICTED_API_KEY: "Limited API key permissions",
  API_KEY_METADATA_UNAVAILABLE: "API key details unavailable",
  DOMAIN_DETAILS_INCOMPLETE: "Domain details incomplete",
  DOMAIN_LIST_INCOMPLETE: "Domain list incomplete",
  dmarc_policy_none: "DMARC policy is set to none",
  dmarc_missing: "No DMARC record",
  spf_missing: "No SPF record",
  dkim_missing: "No DKIM record",
};

/**
 * The message without an opening sentence that only restates the title
 * ("Your DMARC policy is set to none." under "DMARC policy is set to
 * none"), so a recommendation says its point once.
 */
function warningBody(title: string, message: string): string {
  const match = /^(.*?[.!?])\s+(.+)$/s.exec(message.trim());
  if (!match) return message;
  const [, first, rest] = match;
  return first!.toLowerCase().includes(title.toLowerCase()) ? rest! : message;
}

function warningTitle(code: string): string {
  return WARNING_TITLES[code] ?? "Delivery setup notice";
}

export function ResendConnectedView({
  canSendTestEmail,
  connection,
  onDisconnect,
  onOpenTestDialog,
}: ResendConnectedViewProps) {
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [disconnectError, setDisconnectError] = useState<string | null>(null);
  const sendDisabledReasonId = useId();
  const blockingWarning = connection.warnings.find(
    (warning) => warning.severity === "error",
  );
  const sendDisabledReason = !connection.hasValidationMetadata
    ? "Reconnect Resend to refresh test-send readiness."
    : (blockingWarning?.message ??
      (!connection.domainAuthentication.some((domain) => domain.valid) &&
      !connection.warnings.some(
        (warning) => warning.code === "RESTRICTED_API_KEY",
      )
        ? "Verify a sending domain in Resend before sending a test."
        : "Reconnect Resend to refresh test-send readiness."));
  async function handleDisconnect() {
    setIsDisconnecting(true);
    setDisconnectError(null);
    try {
      if (!(await onDisconnect()))
        throw new Error("Unable to disconnect Resend. Try again.");
      setDisconnectOpen(false);
    } catch (error) {
      setDisconnectError(
        error instanceof Error
          ? error.message
          : "Unable to disconnect Resend. Try again.",
      );
    } finally {
      setIsDisconnecting(false);
    }
  }
  const authenticatedDomains = connection.domainAuthentication.filter(
    (domain) => domain.valid,
  ).length;
  const validatedAtLabel = formatValidatedAtUtcLabel(connection.validatedAt);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Connection active</CardTitle>
              <CardDescription>
                API key: ********{connection.apiKeyHint ?? "----"}
              </CardDescription>
              {validatedAtLabel && connection.validatedAt ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Last verified{" "}
                  <time dateTime={connection.validatedAt}>
                    {validatedAtLabel}
                  </time>
                </p>
              ) : null}
            </div>
            <AlertDialog
              open={disconnectOpen}
              onOpenChange={(open) => {
                if (isDisconnecting) return;
                setDisconnectOpen(open);
                if (open) setDisconnectError(null);
              }}
            >
              <AlertDialogTrigger
                render={
                  <Button size="sm" variant="outline">
                    Disconnect
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disconnect Resend?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Receipts and other email stop sending until you connect a
                    key again. Your Resend account and domains are not changed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {disconnectError ? (
                  <p role="alert" className="text-sm text-destructive">
                    {disconnectError}
                  </p>
                ) : null}
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDisconnecting}>
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    variant="destructive"
                    disabled={isDisconnecting}
                    aria-busy={isDisconnecting}
                    onClick={() => void handleDisconnect()}
                  >
                    {isDisconnecting ? "Disconnecting…" : "Disconnect"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {connection.hasValidationMetadata ? (
            <MetricGrid
              label="Email delivery summary"
              // Three across a phone card left ~70px per label, so
              // "Deliverability" touched its tile edge.
              className="grid-cols-1 sm:grid-cols-3 [&>*:first-child]:col-span-1"
            >
              <MetricCard
                compactOnPhone
                label="Suggested senders"
                value={connection.senderIdentities.length}
              />
              <MetricCard
                compactOnPhone
                label="Verified domains"
                value={authenticatedDomains}
              />
              <MetricCard
                compactOnPhone
                label="Deliverability score"
                value={`${connection.deliverabilityScore}%`}
              />
            </MetricGrid>
          ) : (
            <Alert>
              <Info className="size-4 text-muted-foreground" />
              <AlertTitle>Reconnect required</AlertTitle>
              <AlertDescription>
                Reconnect Resend once to refresh verified domains, sender
                suggestions, and test-send readiness for this saved connection.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              disabled={!canSendTestEmail}
              aria-describedby={
                !canSendTestEmail ? sendDisabledReasonId : undefined
              }
              onClick={onOpenTestDialog}
            >
              <Send className="mr-2 size-4" />
              Send test email
            </Button>
            <ButtonLink
              href="https://resend.com/domains"
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
            >
              <ExternalLink aria-hidden="true" className="mr-2 size-4" />
              Open Resend dashboard{" "}
              <span className="sr-only">(opens in a new tab)</span>
            </ButtonLink>
          </div>
          {!canSendTestEmail ? (
            <p
              id={sendDisabledReasonId}
              className="text-sm text-muted-foreground"
            >
              {sendDisabledReason}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {connection.warnings.length > 0 ? (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 font-semibold text-foreground">
            <AlertTriangle className="size-4 text-warning" />
            Recommendations
          </h3>
          {connection.warnings.map((warning) => (
            <Alert
              key={`${warning.code}-${warning.message}`}
              variant={
                warning.severity === "error"
                  ? "destructive"
                  : warning.severity === "warning"
                    ? "warning"
                    : "info"
              }
            >
              <AlertTitle>{warningTitle(warning.code)}</AlertTitle>
              <AlertDescription>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span>
                    {warningBody(warningTitle(warning.code), warning.message)}
                  </span>
                  {warning.helpUrl ? (
                    <ButtonLink
                      href={warning.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="sm"
                      variant="link"
                    >
                      Learn more{" "}
                      <ArrowRight aria-hidden="true" className="ml-1 size-3" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </ButtonLink>
                  ) : null}
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      ) : null}

      {connection.hasValidationMetadata &&
      connection.domainAuthentication.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <span className="flex items-center gap-2">
                <Globe className="size-4 text-info" />
                Domain authentication
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {connection.domainAuthentication.map((domain) => (
              <div
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted p-3"
                key={domain.id}
              >
                <div>
                  <div className="font-medium text-foreground">
                    {domain.domain}
                  </div>
                  {domain.subdomain ? (
                    <div className="text-sm text-muted-foreground">
                      Subdomain: {domain.subdomain}
                    </div>
                  ) : null}
                </div>
                <Badge variant={domain.valid ? "success" : "warning"}>
                  {domain.valid ? "Verified" : "Pending"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export function ResendDisconnectedView({
  connectionError,
  connectionWarnings,
  connectionStatus,
  form,
  showApiKey,
  onToggleApiKeyVisibility,
}: ResendDisconnectedViewProps) {
  const pendingActionLabelId = useId();

  const resendCredentialFieldId = "resend-api-key";
  const handleConnectSubmit = () => {
    void form.handleSubmit();
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        handleConnectSubmit();
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Key className="size-5 text-muted-foreground" />
              Connect Resend
            </span>
          </CardTitle>
          <CardDescription>
            Enter your Resend API key and sender defaults to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="info">
            <Info className="size-4" />
            <AlertTitle>Getting your API key</AlertTitle>
            <AlertDescription>
              <ol className="mt-2 list-inside list-decimal space-y-1">
                <li>
                  Open{" "}
                  <a
                    className="font-medium underline"
                    href="https://resend.com/api-keys"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Resend API Keys
                  </a>
                </li>
                <li>Create a new key with sending access.</li>
                <li>Copy the generated key (starts with re_).</li>
              </ol>
            </AlertDescription>
          </Alert>

          <form.Field name="apiKey">
            {(field) => {
              const errors = getRenderableErrors(field);

              return (
                <Field data-invalid={errors.length > 0}>
                  <FieldLabel htmlFor={resendCredentialFieldId}>
                    Resend API key <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupInput
                        id={resendCredentialFieldId}
                        aria-invalid={errors.length > 0}
                        aria-describedby={
                          errors.length > 0
                            ? `${resendCredentialFieldId}-error`
                            : undefined
                        }
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="re_xxxxxxxxxxxxxxxxxxxx"
                        type={showApiKey ? "text" : "password"}
                        value={field.state.value}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label={
                            showApiKey ? "Hide API key" : "Show API key"
                          }
                          onClick={onToggleApiKeyVisibility}
                          size="icon-xs"
                        >
                          {showApiKey ? (
                            <EyeOff className="size-4 text-muted-foreground" />
                          ) : (
                            <Eye className="size-4 text-muted-foreground" />
                          )}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldError
                      id={`${resendCredentialFieldId}-error`}
                      errors={errors}
                    />
                  </FieldContent>
                </Field>
              );
            }}
          </form.Field>

          <div className="grid gap-4 md:grid-cols-2">
            <form.AppField name="fromEmail">
              {(field) => (
                <field.TextField
                  inputClassName=""
                  label={
                    <>
                      From Email <span className="text-destructive">*</span>
                    </>
                  }
                  placeholder="hello@yourdomain.com"
                  type="email"
                />
              )}
            </form.AppField>

            <form.AppField name="fromName">
              {(field) => (
                <field.TextField
                  label={
                    <>
                      From Name <span className="text-destructive">*</span>
                    </>
                  }
                  placeholder="Your organization"
                />
              )}
            </form.AppField>
          </div>

          <form.AppField name="replyToEmail">
            {(field) => (
              <field.TextField
                label="Reply-To Email (optional)"
                placeholder="support@yourdomain.com"
                type="email"
              />
            )}
          </form.AppField>

          {connectionStatus === "error" && connectionError ? (
            <Alert variant="destructive">
              <XCircle className="size-4" />
              <AlertTitle>Connection failed</AlertTitle>
              <AlertDescription>{connectionError}</AlertDescription>
            </Alert>
          ) : null}

          {connectionWarnings.map((warning) => (
            <Alert
              key={`${warning.code}-${warning.message}`}
              variant={
                warning.severity === "error"
                  ? "destructive"
                  : warning.severity === "warning"
                    ? "warning"
                    : "info"
              }
            >
              <AlertTitle>{warningTitle(warning.code)}</AlertTitle>
              <AlertDescription>{warning.message}</AlertDescription>
            </Alert>
          ))}
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <ButtonLink
            href="https://resend.com/signup"
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
          >
            <ExternalLink aria-hidden="true" className="mr-2 size-4" />
            Create Resend account{" "}
            <span className="sr-only">(opens in a new tab)</span>
          </ButtonLink>
          <form.Subscribe
            selector={(state) => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ canSubmit, isSubmitting }) => (
              <div className="min-w-35">
                <Button
                  aria-labelledby={`${pendingActionLabelId}-8`}
                  focusableWhenDisabled={isSubmitting}
                  className="w-full"
                  disabled={!canSubmit || isSubmitting}
                  onClick={handleConnectSubmit}
                  type="button"
                >
                  <span id={`${pendingActionLabelId}-8`} className="sr-only">
                    {isSubmitting ? "Connecting…" : "Connect Resend"}
                  </span>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Connecting…
                    </>
                  ) : (
                    "Connect Resend"
                  )}
                </Button>
              </div>
            )}
          </form.Subscribe>
        </CardFooter>
      </Card>
    </form>
  );
}

export function ResendTestDialog({
  form,
  open,
  testStatus,
  testError,
  fromName,
  fromEmail,
  onOpenChange,
}: ResendTestDialogProps) {
  const pendingActionLabelId = useId();

  const handleTestSubmit = () => {
    void form.handleSubmit();
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleTestSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              <span className="flex items-center gap-2">
                <Send className="size-5 text-info" />
                Send test email
              </span>
            </DialogTitle>
            <DialogDescription>
              Send a test email to confirm your Resend configuration is working.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <form.AppField name="testEmail">
              {(field) => (
                <field.TextField
                  label="Recipient email"
                  placeholder="you@example.com"
                  type="email"
                />
              )}
            </form.AppField>

            <div className="rounded-lg border border-border bg-muted p-3 text-sm">
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <span className="text-muted-foreground">From:</span>
                <span className="font-medium">
                  {fromName} &lt;{fromEmail}&gt;
                </span>
                <span className="text-muted-foreground">Subject:</span>
                <span className="font-medium">Resend test email</span>
              </div>
            </div>

            {testStatus === "success" ? (
              <Alert variant="success">
                <CheckCircle2 className="size-4" />
                <AlertTitle>Email Sent!</AlertTitle>
                <AlertDescription>
                  Check your inbox for the test email.
                </AlertDescription>
              </Alert>
            ) : null}

            {testStatus === "error" && testError ? (
              <Alert variant="destructive">
                <XCircle className="size-4" />
                <AlertTitle>Failed to Send</AlertTitle>
                <AlertDescription>{testError}</AlertDescription>
              </Alert>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              {testStatus === "success" ? "Close" : "Cancel"}
            </Button>
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ canSubmit, isSubmitting }) => (
                <Button
                  aria-labelledby={`${pendingActionLabelId}-9`}
                  focusableWhenDisabled={isSubmitting}
                  disabled={!canSubmit || isSubmitting}
                  onClick={handleTestSubmit}
                  type="button"
                >
                  <span id={`${pendingActionLabelId}-9`} className="sr-only">
                    {isSubmitting
                      ? "Sending…"
                      : testStatus === "success"
                        ? "Send another"
                        : "Send test"}
                  </span>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Sending…
                    </>
                  ) : testStatus === "success" ? (
                    <>
                      <RefreshCw className="mr-2 size-4" />
                      Send Another
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 size-4" />
                      Send Test
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
