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
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { cn } from "@asym/ui/lib/utils";
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

import type {
  DeliverabilityWarning,
  DomainAuthentication,
  SenderIdentity,
} from "@asym/email/types";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";
type TestEmailStatus = "idle" | "sending" | "success" | "error";
type EditableField =
  | "apiKey"
  | "fromEmail"
  | "fromName"
  | "replyToEmail"
  | "testEmail";

interface ResendPageHeaderProps {
  isConnected: boolean;
}

interface ConnectedConnectionSummary {
  apiKeyHint?: string;
  senderIdentities: SenderIdentity[];
  domainAuthentication: DomainAuthentication[];
  deliverabilityScore: number;
  warnings: DeliverabilityWarning[];
}

interface ResendConnectedViewProps {
  connection: ConnectedConnectionSummary;
  onDisconnect: () => void;
  onOpenTestDialog: () => void;
}

interface ResendDisconnectedViewProps {
  apiKey: string;
  showApiKey: boolean;
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
  connectionStatus: ConnectionStatus;
  connectionError?: string;
  onFieldChange: (field: EditableField, value: string) => void;
  onToggleApiKeyVisibility: () => void;
  onConnect: () => void;
}

interface ResendTestDialogProps {
  open: boolean;
  testEmail: string;
  testStatus: TestEmailStatus;
  testError: string | null;
  fromName: string;
  fromEmail: string;
  onOpenChange: (open: boolean) => void;
  onTestEmailChange: (value: string) => void;
  onSendTest: () => void;
}

function warningClassName(severity: DeliverabilityWarning["severity"]): string {
  if (severity === "error") return "";
  if (severity === "warning")
    return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-blue-200 bg-blue-50 text-blue-900";
}

export function ResendPageHeader({ isConnected }: ResendPageHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 text-white shadow-lg shadow-blue-500/25">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Resend Integration
          </h1>
        </div>
        <p className="max-w-xl text-slate-600">
          Connect your Resend account to send transactional and campaign emails
          through your own verified domain.
        </p>
      </div>
      {isConnected && (
        <Badge
          variant="outline"
          className="gap-1.5 border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Connected
        </Badge>
      )}
    </div>
  );
}

export function ResendConnectedView({
  connection,
  onDisconnect,
  onOpenTestDialog,
}: ResendConnectedViewProps) {
  const authenticatedDomains = connection.domainAuthentication.filter(
    (domain) => domain.valid,
  ).length;

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Connection Active</CardTitle>
              <CardDescription>
                API Key: ••••••••{connection.apiKeyHint ?? "----"}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onDisconnect}>
              Disconnect
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">
                {connection.senderIdentities.length}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Suggested senders
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">
                {authenticatedDomains}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Verified domains
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">
                {connection.deliverabilityScore}%
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Deliverability score
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={onOpenTestDialog}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="mr-2 h-4 w-4" />
              Send Test Email
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                window.open("https://resend.com/domains", "_blank")
              }
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Resend Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {connection.warnings.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Recommendations
          </h3>
          {connection.warnings.map((warning) => (
            <Alert
              key={`${warning.code}-${warning.message}`}
              variant={warning.severity === "error" ? "destructive" : "default"}
              className={warningClassName(warning.severity)}
            >
              <AlertTitle>{warning.code}</AlertTitle>
              <AlertDescription className="flex items-center justify-between gap-3">
                <span>{warning.message}</span>
                {warning.helpUrl && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-inherit"
                    onClick={() => window.open(warning.helpUrl, "_blank")}
                  >
                    Learn more <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {connection.domainAuthentication.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4 text-blue-600" />
              Domain Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {connection.domainAuthentication.map((domain) => (
              <div
                key={domain.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div>
                  <div className="font-medium text-slate-900">
                    {domain.domain}
                  </div>
                  {domain.subdomain && (
                    <div className="text-sm text-slate-500">
                      Subdomain: {domain.subdomain}
                    </div>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    domain.valid
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700",
                  )}
                >
                  {domain.valid ? "Verified" : "Pending"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function ResendDisconnectedView({
  apiKey,
  showApiKey,
  fromEmail,
  fromName,
  replyToEmail,
  connectionStatus,
  connectionError,
  onFieldChange,
  onToggleApiKeyVisibility,
  onConnect,
}: ResendDisconnectedViewProps) {
  const isConnecting = connectionStatus === "connecting";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-slate-600" />
          Connect Resend
        </CardTitle>
        <CardDescription>
          Enter your Resend API key and sender defaults to get started.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">
            Getting your API key
          </AlertTitle>
          <AlertDescription className="text-blue-800">
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>
                Open{" "}
                <a
                  href="https://resend.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline"
                >
                  Resend API Keys
                </a>
              </li>
              <li>Create a new key with sending access.</li>
              <li>Copy the generated key (starts with re_).</li>
            </ol>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="apiKey">
            Resend API Key <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(event) => onFieldChange("apiKey", event.target.value)}
              placeholder="re_xxxxxxxxxxxxxxxxxxxx"
              className="pr-10 font-mono text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={onToggleApiKeyVisibility}
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4 text-slate-400" />
              ) : (
                <Eye className="h-4 w-4 text-slate-400" />
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fromEmail">
              From Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fromEmail"
              type="email"
              value={fromEmail}
              onChange={(event) =>
                onFieldChange("fromEmail", event.target.value)
              }
              placeholder="hello@yourdomain.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromName">
              From Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fromName"
              value={fromName}
              onChange={(event) =>
                onFieldChange("fromName", event.target.value)
              }
              placeholder="Give Hope"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="replyTo">Reply-To Email (optional)</Label>
          <Input
            id="replyTo"
            type="email"
            value={replyToEmail}
            onChange={(event) =>
              onFieldChange("replyToEmail", event.target.value)
            }
            placeholder="support@yourdomain.com"
          />
        </div>

        {connectionStatus === "error" && connectionError && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Connection Failed</AlertTitle>
            <AlertDescription>{connectionError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t bg-slate-50/50 pt-6">
        <Button
          variant="outline"
          onClick={() => window.open("https://resend.com/signup", "_blank")}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Create Resend Account
        </Button>
        <Button
          onClick={onConnect}
          disabled={!apiKey || !fromEmail || !fromName || isConnecting}
          className="min-w-[140px] bg-blue-600 hover:bg-blue-700"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            "Connect Resend"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function ResendTestDialog({
  open,
  testEmail,
  testStatus,
  testError,
  fromName,
  fromEmail,
  onOpenChange,
  onTestEmailChange,
  onSendTest,
}: ResendTestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            Send Test Email
          </DialogTitle>
          <DialogDescription>
            Send a test email to confirm your Resend configuration is working.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="testEmail">Recipient Email</Label>
            <Input
              id="testEmail"
              type="email"
              value={testEmail}
              onChange={(event) => onTestEmailChange(event.target.value)}
              placeholder="you@example.com"
              disabled={testStatus === "sending"}
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <span className="text-slate-500">From:</span>
              <span className="font-medium">
                {fromName} &lt;{fromEmail}&gt;
              </span>
              <span className="text-slate-500">Subject:</span>
              <span className="font-medium">Resend Test Email</span>
            </div>
          </div>

          {testStatus === "success" && (
            <Alert className="border-emerald-200 bg-emerald-50">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertTitle className="text-emerald-800">Email Sent!</AlertTitle>
              <AlertDescription className="text-emerald-700">
                Check your inbox at {testEmail}
              </AlertDescription>
            </Alert>
          )}

          {testStatus === "error" && testError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Failed to Send</AlertTitle>
              <AlertDescription>{testError}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {testStatus === "success" ? "Close" : "Cancel"}
          </Button>
          <Button
            onClick={onSendTest}
            disabled={!testEmail || testStatus === "sending"}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {testStatus === "sending" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : testStatus === "success" ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Send Another
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Test
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
