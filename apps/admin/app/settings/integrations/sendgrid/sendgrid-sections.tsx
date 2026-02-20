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
import { Progress } from "@asym/ui/components/shadcn/progress";
import { Separator } from "@asym/ui/components/shadcn/separator";
import { cn } from "@asym/ui/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Info,
  Key,
  Loader2,
  Mail,
  RefreshCw,
  Send,
  Shield,
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

interface SendGridPageHeaderProps {
  isConnected: boolean;
}

interface ConnectedConnectionSummary {
  apiKeyHint?: string;
  senderIdentities: SenderIdentity[];
  domainAuthentication: DomainAuthentication[];
  deliverabilityScore: number;
  warnings: DeliverabilityWarning[];
}

interface SendGridConnectedViewProps {
  connection: ConnectedConnectionSummary;
  onDisconnect: () => void;
  onOpenTestDialog: () => void;
}

interface SendGridDisconnectedViewProps {
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

interface SendGridTestDialogProps {
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

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 50) return "Good";
  return "Needs Improvement";
}

export function SendGridPageHeader({ isConnected }: SendGridPageHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            SendGrid Integration
          </h1>
        </div>
        <p className="text-slate-600 max-w-xl">
          Connect your SendGrid account to send transactional emails,
          newsletters, and marketing campaigns through your own email
          infrastructure.
        </p>
      </div>
      {isConnected && (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 px-3 py-1.5"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Connected
        </Badge>
      )}
    </div>
  );
}

export function SendGridConnectedView({
  connection,
  onDisconnect,
  onOpenTestDialog,
}: SendGridConnectedViewProps) {
  return (
    <div className="space-y-6">
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Connection Active</CardTitle>
                <CardDescription>
                  API Key: ••••••••{connection.apiKeyHint}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onDisconnect}
              className="text-slate-600"
            >
              Disconnect
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-center">
              <div className="text-2xl font-bold text-slate-900">
                {connection.senderIdentities.length}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Verified Senders
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-center">
              <div className="text-2xl font-bold text-slate-900">
                {
                  connection.domainAuthentication.filter(
                    (domain) => domain.valid,
                  ).length
                }
              </div>
              <div className="text-xs text-slate-500 mt-1">Auth Domains</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-center col-span-2">
              <div
                className={cn(
                  "text-2xl font-bold",
                  getScoreColor(connection.deliverabilityScore),
                )}
              >
                {connection.deliverabilityScore}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Deliverability Score -{" "}
                {getScoreLabel(connection.deliverabilityScore)}
              </div>
              <Progress
                value={connection.deliverabilityScore}
                className="mt-2 h-1.5"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={onOpenTestDialog}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Test Email
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open("https://app.sendgrid.com", "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              SendGrid Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {connection.warnings.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Recommendations
          </h3>
          {connection.warnings.map((warning) => (
            <Alert
              key={`${warning.severity}-${warning.message}`}
              variant={warning.severity === "error" ? "destructive" : "default"}
              className={cn(
                warning.severity === "warning" &&
                  "border-amber-200 bg-amber-50 text-amber-900",
                warning.severity === "info" &&
                  "border-blue-200 bg-blue-50 text-blue-900",
              )}
            >
              {warning.severity === "error" && <XCircle className="h-4 w-4" />}
              {warning.severity === "warning" && (
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              )}
              {warning.severity === "info" && (
                <Info className="h-4 w-4 text-blue-600" />
              )}
              <AlertDescription className="flex items-center justify-between">
                <span>{warning.message}</span>
                {warning.helpUrl && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-inherit"
                    onClick={() => window.open(warning.helpUrl, "_blank")}
                  >
                    Learn more <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {connection.senderIdentities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              Verified Sender Identities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {connection.senderIdentities.map((sender) => (
                <div
                  key={sender.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200"
                >
                  <div>
                    <div className="font-medium text-slate-900">
                      {sender.from_name}
                    </div>
                    <div className="text-sm text-slate-500">
                      {sender.from_email}
                    </div>
                  </div>
                  {sender.verified ? (
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 border-amber-200"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {connection.domainAuthentication.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600" />
              Domain Authentication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {connection.domainAuthentication.map((domain) => (
                <div
                  key={domain.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200"
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
                  {domain.valid ? (
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Authenticated
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 border-amber-200"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Incomplete
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function SendGridDisconnectedView({
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
}: SendGridDisconnectedViewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-slate-600" />
            Connect SendGrid
          </CardTitle>
          <CardDescription>
            Enter your SendGrid API key and sender information to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-900">
              Getting your API Key
            </AlertTitle>
            <AlertDescription className="text-blue-800">
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>
                  Go to{" "}
                  <a
                    href="https://app.sendgrid.com/settings/api_keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    SendGrid API Keys Settings
                  </a>
                </li>
                <li>Click &ldquo;Create API Key&rdquo;</li>
                <li>
                  Select &ldquo;Restricted Access&rdquo; and enable{" "}
                  <strong>Mail Send</strong> permission
                </li>
                <li>Copy the generated key (starts with SG.)</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-sm font-medium">
                SendGrid API Key <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(event) =>
                    onFieldChange("apiKey", event.target.value)
                  }
                  placeholder="SG.xxxxxxxxxxxxxxxxxxxx"
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
              <p className="text-xs text-slate-500">
                Your API key is encrypted and never stored in plain text.
              </p>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fromEmail" className="text-sm font-medium">
                  From Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={fromEmail}
                  onChange={(event) =>
                    onFieldChange("fromEmail", event.target.value)
                  }
                  placeholder="hello@yourorg.com"
                />
                <p className="text-xs text-slate-500">
                  Must be a verified sender in SendGrid
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromName" className="text-sm font-medium">
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
              <Label htmlFor="replyTo" className="text-sm font-medium">
                Reply-To Email{" "}
                <span className="text-slate-400">(optional)</span>
              </Label>
              <Input
                id="replyTo"
                type="email"
                value={replyToEmail}
                onChange={(event) =>
                  onFieldChange("replyToEmail", event.target.value)
                }
                placeholder="support@yourorg.com"
              />
            </div>
          </div>

          {connectionStatus === "error" && connectionError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Connection Failed</AlertTitle>
              <AlertDescription>{connectionError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-slate-50/50 pt-6">
          <Button
            variant="outline"
            onClick={() =>
              window.open("https://signup.sendgrid.com/", "_blank")
            }
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Create SendGrid Account
          </Button>
          <Button
            onClick={onConnect}
            disabled={
              !apiKey ||
              !fromEmail ||
              !fromName ||
              connectionStatus === "connecting"
            }
            className="bg-blue-600 hover:bg-blue-700 min-w-[140px]"
          >
            {connectionStatus === "connecting" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                Connect SendGrid
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Before You Connect</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                <Key className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium text-sm text-slate-900">
                  Create API Key
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  With at least &ldquo;Mail Send&rdquo; permission
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium text-sm text-slate-900">
                  Verify Sender
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify your from email address
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600 shrink-0">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium text-sm text-slate-900">
                  Authenticate Domain
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  For best deliverability (recommended)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SendGridTestDialog({
  open,
  testEmail,
  testStatus,
  testError,
  fromName,
  fromEmail,
  onOpenChange,
  onTestEmailChange,
  onSendTest,
}: SendGridTestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            Send Test Email
          </DialogTitle>
          <DialogDescription>
            Send a test email to verify your SendGrid configuration is working
            correctly.
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
              placeholder="your-email@example.com"
              disabled={testStatus === "sending"}
            />
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm">
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <span className="text-slate-500">From:</span>
              <span className="font-medium">
                {fromName} &lt;{fromEmail}&gt;
              </span>
              <span className="text-slate-500">Subject:</span>
              <span className="font-medium">SendGrid Test Email</span>
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

        <DialogFooter className="gap-2 sm:gap-0">
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
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : testStatus === "success" ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Send Another
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Test
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
