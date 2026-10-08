"use client";

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
import { Input } from "@asym/ui/components/shadcn/input";
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
  Mail,
  RefreshCw,
  Send,
  XCircle,
} from "lucide-react";
import { useId } from "react";

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

interface ResendPageHeaderProps {
  isConnected: boolean;
}

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
  onDisconnect: () => void;
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

export function ResendPageHeader({ isConnected }: ResendPageHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-xl bg-info/10 p-2.5 text-info">
            <Mail className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Resend Integration
          </h1>
        </div>
        <p className="max-w-xl text-muted-foreground">
          Connect your Resend account to send transactional and campaign emails
          through your own verified domain.
        </p>
      </div>
      {isConnected ? (
        <Badge variant="success">
          <CheckCircle2 className="size-3.5" />
          Connected
        </Badge>
      ) : null}
    </div>
  );
}

export function ResendConnectedView({
  canSendTestEmail,
  connection,
  onDisconnect,
  onOpenTestDialog,
}: ResendConnectedViewProps) {
  const authenticatedDomains = connection.domainAuthentication.filter(
    (domain) => domain.valid,
  ).length;
  const validatedAtLabel = formatValidatedAtUtcLabel(connection.validatedAt);

  return (
    <div className="space-y-6">
      <Card className="border-success/25">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Connection Active</CardTitle>
              <CardDescription>
                API Key: ********{connection.apiKeyHint ?? "----"}
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
            <Button onClick={onDisconnect} size="sm" variant="outline">
              Disconnect
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {connection.hasValidationMetadata ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <div className="text-2xl font-semibold text-foreground">
                  {connection.senderIdentities.length}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Suggested senders
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <div className="text-2xl font-semibold text-foreground">
                  {authenticatedDomains}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Verified domains
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <div className="text-2xl font-semibold text-foreground">
                  {connection.deliverabilityScore}%
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Deliverability score
                </div>
              </div>
            </div>
          ) : (
            <Alert className="border-border bg-card">
              <Info className="size-4 text-muted-foreground" />
              <AlertTitle>Reconnect Required</AlertTitle>
              <AlertDescription>
                Reconnect Resend once to refresh verified domains, sender
                suggestions, and test-send readiness for this saved connection.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={!canSendTestEmail} onClick={onOpenTestDialog}>
              <Send className="mr-2 size-4" />
              {canSendTestEmail
                ? "Send Test Email"
                : "Resolve Delivery Setup First"}
            </Button>
            <Button
              onClick={() =>
                window.open(
                  "https://resend.com/domains",
                  "_blank",
                  "noopener,noreferrer",
                )
              }
              variant="outline"
            >
              <ExternalLink className="mr-2 size-4" />
              Open Resend Dashboard
            </Button>
          </div>
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
              <AlertTitle>{warning.code}</AlertTitle>
              <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                <span>{warning.message}</span>
                {warning.helpUrl ? (
                  <Button
                    className="h-auto p-0 text-inherit"
                    onClick={() =>
                      window.open(
                        warning.helpUrl,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                    size="sm"
                    variant="link"
                  >
                    Learn more <ArrowRight className="ml-1 size-3" />
                  </Button>
                ) : null}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      ) : null}

      {connection.hasValidationMetadata &&
      connection.domainAuthentication.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="size-4 text-info" />
              Domain Authentication
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
          <CardTitle className="flex items-center gap-2">
            <Key className="size-5 text-muted-foreground" />
            Connect Resend
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
                    Resend API Key <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <div className="relative">
                      <Input
                        className="pr-10 font-mono text-sm"
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
                      <Button
                        aria-label={
                          showApiKey ? "Hide API key" : "Show API key"
                        }
                        className="absolute right-0 top-0 h-full hover:bg-transparent"
                        onClick={onToggleApiKeyVisibility}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        {showApiKey ? (
                          <EyeOff className="size-4 text-muted-foreground" />
                        ) : (
                          <Eye className="size-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
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
                  placeholder="Give Hope"
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
              <AlertTitle>Connection Failed</AlertTitle>
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
              <AlertTitle>{warning.code}</AlertTitle>
              <AlertDescription>{warning.message}</AlertDescription>
            </Alert>
          ))}
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/50 pt-6">
          <Button
            onClick={() =>
              window.open(
                "https://resend.com/signup",
                "_blank",
                "noopener,noreferrer",
              )
            }
            type="button"
            variant="outline"
          >
            <ExternalLink className="mr-2 size-4" />
            Create Resend Account
          </Button>
          <form.Subscribe
            selector={(state) => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ canSubmit, isSubmitting }) => (
              <Button
                aria-labelledby={`${pendingActionLabelId}-8`}
                focusableWhenDisabled={isSubmitting}
                className="min-w-35"
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
            <DialogTitle className="flex items-center gap-2">
              <Send className="size-5 text-info" />
              Send Test Email
            </DialogTitle>
            <DialogDescription>
              Send a test email to confirm your Resend configuration is working.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <form.AppField name="testEmail">
              {(field) => (
                <field.TextField
                  label="Recipient Email"
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
                <span className="font-medium">Resend Test Email</span>
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
                        ? "Send Another"
                        : "Send Test"}
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
