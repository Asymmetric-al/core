"use client";

import {
  getPDFStudioSetupStatus,
  getUnlayerAccountConfig,
  PDF_STUDIO_SETUP_INSTRUCTIONS,
  type UnlayerAccountConfig,
} from "@asym/config/pdf-studio";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Settings,
  Zap,
  Shield,
  Crown,
  Copy,
  Check,
  Info,
} from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@asym/ui/components/shadcn/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";
import { cn } from "@asym/ui/lib/utils";

const pdfStudioStatusConfig = {
  not_configured: {
    color: "bg-warning/10 text-warning border-warning/20",
    icon: AlertCircle,
    label: "Free Mode",
  },
  free_tier: {
    color: "bg-warning/10 text-warning border-warning/20",
    icon: AlertCircle,
    label: "Free Tier",
  },
  configured: {
    color: "bg-info/10 text-info border-info/20",
    icon: CheckCircle2,
    label: "Configured",
  },
  white_label: {
    color: "bg-success/10 text-success border-success/20",
    icon: Crown,
    label: "White Label",
  },
};

interface PDFStudioSetupStatusProps {
  variant?: "badge" | "banner" | "inline";
  showSetupButton?: boolean;
  className?: string;
}

export function PDFStudioSetupStatus({
  variant = "badge",
  showSetupButton = true,
  className,
}: PDFStudioSetupStatusProps) {
  const status = useMemo(() => getPDFStudioSetupStatus(), []);
  const config = useMemo(() => getUnlayerAccountConfig(), []);

  const currentStatus = pdfStudioStatusConfig[status.status];
  const Icon = currentStatus.icon;

  if (variant === "badge") {
    return (
      <Dialog>
        <DialogTrigger
          render={
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors hover:opacity-80",
                currentStatus.color,
                className,
              )}
            >
              <Icon className="size-3" />
              {currentStatus.label}
            </button>
          }
        />
        <DialogContent scrollable className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>PDF Studio Configuration</DialogTitle>
            <DialogDescription>{status.message}</DialogDescription>
          </DialogHeader>
          <PDFStudioSetupPanel config={config} status={status} />
        </DialogContent>
      </Dialog>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3",
          currentStatus.color,
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className="size-4" />
          <span className="text-sm font-medium">{status.message}</span>
        </div>
        {showSetupButton && status.status !== "white_label" && (
          <Dialog>
            <DialogTrigger
              render={
                <Button variant="outline" size="sm">
                  <Settings className="size-3.5 mr-1.5" />
                  Setup
                </Button>
              }
            />
            <DialogContent scrollable className="sm:max-w-125">
              <DialogHeader>
                <DialogTitle>PDF Studio Configuration</DialogTitle>
                <DialogDescription>
                  Configure your Unlayer account for full functionality.
                </DialogDescription>
              </DialogHeader>
              <PDFStudioSetupPanel config={config} status={status} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Icon className="size-4" />
      <span className="text-sm">{currentStatus.label}</span>
    </div>
  );
}

interface PDFStudioSetupPanelProps {
  config: UnlayerAccountConfig;
  status: ReturnType<typeof getPDFStudioSetupStatus>;
}

function PDFStudioSetupPanel({ config, status }: PDFStudioSetupPanelProps) {
  const [isSetupOpen, setIsSetupOpen] = useState(
    status.status === "not_configured",
  );
  const [isWhiteLabelOpen, setIsWhiteLabelOpen] = useState(false);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [copyingStep, setCopyingStep] = useState<number | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const copiedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copiedTimeout.current) clearTimeout(copiedTimeout.current);
    },
    [],
  );

  const handleCopy = async (text: string, step: number) => {
    if (copyingStep !== null) return;
    if (copiedTimeout.current) clearTimeout(copiedTimeout.current);
    setCopyingStep(step);
    setCopiedStep(null);
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStep(step);
      copiedTimeout.current = setTimeout(() => setCopiedStep(null), 2000);
    } catch {
      setCopyError(
        "Could not copy the setting. Select the code and copy it manually.",
      );
    } finally {
      setCopyingStep(null);
    }
  };

  return (
    <div className="space-y-4">
      {copyError && (
        <p role="alert" className="text-sm text-destructive">
          {copyError}
        </p>
      )}
      <p role="status" className="sr-only">
        {copiedStep !== null ? "Setting copied to clipboard." : ""}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Environment
          </div>
          <div className="text-sm font-medium text-foreground capitalize">
            {config.environment}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Project ID
          </div>
          <div className="text-sm font-medium text-foreground">
            {config.projectId || "Not set"}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Available Features
        </div>
        <div className="flex flex-wrap gap-1.5">
          {status.features.map((feature) => (
            <Badge key={feature} variant="success">
              <CheckCircle2 className="size-3 mr-1" />
              {feature}
            </Badge>
          ))}
        </div>
        {status.missingFeatures.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {status.missingFeatures.map((feature) => (
              <Badge key={feature} variant="secondary">
                <Zap className="size-3 mr-1 opacity-50" />
                {feature}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {status.status !== "white_label" && (
        <>
          <Collapsible open={isSetupOpen} onOpenChange={setIsSetupOpen}>
            <CollapsibleTrigger
              render={
                <button
                  type="button"
                  className="flex items-center justify-between w-full p-3 rounded-lg bg-primary/5 border border-primary/20 text-primary hover:bg-primary/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="size-4" />
                    <span className="text-sm font-medium">
                      Basic Setup Instructions
                    </span>
                  </div>
                  {isSetupOpen ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </button>
              }
            />
            <CollapsibleContent className="pt-2">
              <div className="flex flex-col gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                {PDF_STUDIO_SETUP_INSTRUCTIONS.steps.map((step) => (
                  <div key={step.step} className="flex gap-3">
                    <div className="shrink-0 size-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">
                      {step.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {step.title}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {step.description}
                      </p>
                      {step.details && (
                        <p className="text-xs text-muted-foreground/80 mt-1 italic">
                          {step.details}
                        </p>
                      )}
                      {step.code && (
                        <div className="mt-2 flex items-center gap-2">
                          <code className="min-w-0 flex-1 break-all rounded bg-invert px-2 py-1.5 font-mono text-xs text-invert-foreground">
                            {step.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Copy ${step.title} setting`}
                            disabled={copyingStep !== null}
                            aria-busy={copyingStep === step.step}
                            onClick={() => handleCopy(step.code!, step.step)}
                          >
                            {copiedStep === step.step ? (
                              <Check className="size-3.5 text-success" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </Button>
                        </div>
                      )}
                      {step.url && (
                        <a
                          href={step.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 mt-1"
                        >
                          Open Unlayer Dashboard
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {status.status === "configured" && (
            <Collapsible
              open={isWhiteLabelOpen}
              onOpenChange={setIsWhiteLabelOpen}
            >
              <CollapsibleTrigger
                render={
                  <button
                    type="button"
                    className="flex items-center justify-between w-full p-3 rounded-lg bg-chart-4/10 border border-chart-4/30 text-chart-4 hover:bg-chart-4/15 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Crown className="size-4" />
                      <span className="text-sm font-medium">
                        Upgrade to White-Label
                      </span>
                    </div>
                    {isWhiteLabelOpen ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </button>
                }
              />
              <CollapsibleContent className="pt-2">
                <div className="flex flex-col gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  {PDF_STUDIO_SETUP_INSTRUCTIONS.whiteLabelSteps.map((step) => (
                    <div key={step.step} className="flex gap-3">
                      <div className="shrink-0 size-6 rounded-full bg-chart-4/15 text-chart-4 flex items-center justify-center text-xs font-bold">
                        {step.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">
                          {step.title}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {step.description}
                        </p>
                        {step.details && (
                          <p className="text-xs text-muted-foreground/80 mt-1 italic">
                            {step.details}
                          </p>
                        )}
                        {step.code && (
                          <div className="mt-2 flex items-center gap-2">
                            <code className="min-w-0 flex-1 break-all rounded bg-invert px-2 py-1.5 font-mono text-xs text-invert-foreground">
                              {step.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Copy ${step.title} setting`}
                              disabled={copyingStep !== null}
                              aria-busy={copyingStep === step.step + 10}
                              onClick={() =>
                                handleCopy(step.code!, step.step + 10)
                              }
                            >
                              {copiedStep === step.step + 10 ? (
                                <Check className="size-3.5 text-success" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </Button>
                          </div>
                        )}
                        {step.url && (
                          <a
                            href={step.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-warning hover:underline"
                          >
                            View Pricing
                            <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </>
      )}

      {config.allowedDomains.length > 0 && (
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="size-4 text-muted-foreground" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Allowed Domains
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {config.allowedDomains.map((domain) => (
              <Badge key={domain} variant="outline">
                <span className="font-mono">{domain}</span>
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground/80 mt-2 flex items-start gap-1">
            <Info className="size-3 mt-0.5 shrink-0" />
            For production, add your domain in the Unlayer Console.
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <a
          href={status.setupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Open Unlayer Dashboard
          <ExternalLink className="size-3.5 ml-1.5" />
        </a>
      </div>
    </div>
  );
}

export function PDFStudioConfigBadge({ className }: { className?: string }) {
  const config = useMemo(() => getUnlayerAccountConfig(), []);

  if (config.isWhiteLabel) {
    return (
      <Badge variant="success" className={className}>
        <Crown className="size-3 mr-1" />
        White Label
      </Badge>
    );
  }

  if (config.isConfigured) {
    return (
      <Badge variant="info" className={className}>
        <CheckCircle2 className="size-3 mr-1" />
        Configured
      </Badge>
    );
  }

  return (
    <Badge variant="warning" className={className}>
      <AlertCircle className="size-3 mr-1" />
      Free Mode
    </Badge>
  );
}
