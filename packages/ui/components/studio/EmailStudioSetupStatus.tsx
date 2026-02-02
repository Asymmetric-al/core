"use client";

import { useState, useMemo } from "react";
import {
  getUnlayerSetupStatus,
  getUnlayerAccountConfig,
  UNLAYER_SETUP_INSTRUCTIONS,
  type UnlayerAccountConfig,
} from "@asym/config/email-studio";
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
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@asym/ui/components/shadcn/collapsible";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { cn } from "@asym/ui/lib/utils";

interface EmailStudioSetupStatusProps {
  variant?: "badge" | "banner" | "inline";
  showSetupButton?: boolean;
  className?: string;
}

export function EmailStudioSetupStatus({
  variant = "badge",
  showSetupButton = true,
  className,
}: EmailStudioSetupStatusProps) {
  const status = useMemo(() => getUnlayerSetupStatus(), []);
  const config = useMemo(() => getUnlayerAccountConfig(), []);

  const statusConfig = {
    not_configured: {
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: AlertCircle,
      label: "Free Mode",
    },
    free_tier: {
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: AlertCircle,
      label: "Free Tier",
    },
    configured: {
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: CheckCircle2,
      label: "Configured",
    },
    white_label: {
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Crown,
      label: "White Label",
    },
  };

  const currentStatus = statusConfig[status.status];
  const Icon = currentStatus.icon;

  if (variant === "badge") {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors hover:opacity-80",
              currentStatus.color,
              className,
            )}
          >
            <Icon className="h-3 w-3" />
            {currentStatus.label}
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Email Studio Configuration</DialogTitle>
            <DialogDescription>{status.message}</DialogDescription>
          </DialogHeader>
          <EmailStudioSetupPanel config={config} status={status} />
        </DialogContent>
      </Dialog>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-4 px-4 py-2 rounded-lg border",
          currentStatus.color,
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">{status.message}</span>
        </div>
        {showSetupButton && status.status !== "white_label" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7">
                <Settings className="h-3.5 w-3.5 mr-1.5" />
                Setup
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Email Studio Configuration</DialogTitle>
                <DialogDescription>
                  Configure your Unlayer account for full functionality.
                </DialogDescription>
              </DialogHeader>
              <EmailStudioSetupPanel config={config} status={status} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Icon className="h-4 w-4" />
      <span className="text-sm">{currentStatus.label}</span>
    </div>
  );
}

interface EmailStudioSetupPanelProps {
  config: UnlayerAccountConfig;
  status: ReturnType<typeof getUnlayerSetupStatus>;
}

function EmailStudioSetupPanel({ config, status }: EmailStudioSetupPanelProps) {
  const [isSetupOpen, setIsSetupOpen] = useState(
    status.status === "not_configured",
  );
  const [isWhiteLabelOpen, setIsWhiteLabelOpen] = useState(false);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const handleCopy = (text: string, step: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Environment
          </div>
          <div className="text-sm font-medium text-slate-900 capitalize">
            {config.environment}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Project ID
          </div>
          <div className="text-sm font-medium text-slate-900">
            {config.projectId || "Not set"}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Available Features
        </div>
        <div className="flex flex-wrap gap-1.5">
          {status.features.map((feature) => (
            <Badge
              key={feature}
              variant="outline"
              className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {feature}
            </Badge>
          ))}
        </div>
        {status.missingFeatures.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {status.missingFeatures.map((feature) => (
              <Badge
                key={feature}
                variant="outline"
                className="bg-slate-50 text-slate-500 border-slate-200 text-[10px]"
              >
                <Zap className="h-3 w-3 mr-1 opacity-50" />
                {feature}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {status.status !== "white_label" && (
        <>
          <Collapsible open={isSetupOpen} onOpenChange={setIsSetupOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center justify-between w-full p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Basic Setup Instructions
                  </span>
                </div>
                {isSetupOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="space-y-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                {UNLAYER_SETUP_INSTRUCTIONS.steps.map((step) => (
                  <div key={step.step} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                      {step.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900">
                        {step.title}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {step.description}
                      </p>
                      {step.details && (
                        <p className="text-xs text-slate-400 mt-1 italic">
                          {step.details}
                        </p>
                      )}
                      {step.code && (
                        <div className="mt-2 flex items-center gap-2">
                          <code className="flex-1 text-xs bg-slate-800 text-slate-100 px-2 py-1.5 rounded font-mono">
                            {step.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleCopy(step.code!, step.step)}
                          >
                            {copiedStep === step.step ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      )}
                      {step.url && (
                        <a
                          href={step.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-1"
                        >
                          Open Unlayer Dashboard
                          <ExternalLink className="h-3 w-3" />
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
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Upgrade to White-Label
                    </span>
                  </div>
                  {isWhiteLabelOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="space-y-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  {UNLAYER_SETUP_INSTRUCTIONS.whiteLabelSteps.map((step) => (
                    <div key={step.step} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                        {step.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900">
                          {step.title}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {step.description}
                        </p>
                        {step.details && (
                          <p className="text-xs text-slate-400 mt-1 italic">
                            {step.details}
                          </p>
                        )}
                        {step.code && (
                          <div className="mt-2 flex items-center gap-2">
                            <code className="flex-1 text-xs bg-slate-800 text-slate-100 px-2 py-1.5 rounded font-mono">
                              {step.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() =>
                                handleCopy(step.code!, step.step + 10)
                              }
                            >
                              {copiedStep === step.step + 10 ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        )}
                        {step.url && (
                          <a
                            href={step.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 mt-1"
                          >
                            View Pricing
                            <ExternalLink className="h-3 w-3" />
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
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-slate-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Allowed Domains
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {config.allowedDomains.map((domain) => (
              <Badge
                key={domain}
                variant="outline"
                className="text-[10px] font-mono"
              >
                {domain}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-start gap-1">
            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
            For production, add your domain in the Unlayer Console.
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="outline" size="sm" asChild>
          <a href={status.setupUrl} target="_blank" rel="noopener noreferrer">
            Open Unlayer Dashboard
            <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
          </a>
        </Button>
      </div>
    </div>
  );
}

export function EmailStudioConfigBadge({ className }: { className?: string }) {
  const config = useMemo(() => getUnlayerAccountConfig(), []);

  if (config.isWhiteLabel) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "bg-emerald-50 text-emerald-700 border-emerald-200",
          className,
        )}
      >
        <Crown className="h-3 w-3 mr-1" />
        White Label
      </Badge>
    );
  }

  if (config.isConfigured) {
    return (
      <Badge
        variant="outline"
        className={cn("bg-blue-50 text-blue-700 border-blue-200", className)}
      >
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Configured
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn("bg-amber-50 text-amber-700 border-amber-200", className)}
    >
      <AlertCircle className="h-3 w-3 mr-1" />
      Free Mode
    </Badge>
  );
}
