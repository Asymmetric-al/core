"use client";

import { BadgeCheck, Mail, RotateCcw } from "lucide-react";

import { Badge } from "@asym/ui/components/shadcn/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";

import type { EmailBuilderKind } from "@asym/email/email-builder-types";

export interface EmailStudioProviderStatusProps {
  builder: EmailBuilderKind;
  legacyUnlayerEnabled?: boolean;
  variant?: "badge" | "inline";
}

export function EmailStudioProviderStatus({
  builder,
  legacyUnlayerEnabled = true,
  variant = "inline",
}: EmailStudioProviderStatusProps) {
  const isLegacy = builder === "unlayer";
  const label = isLegacy ? "Legacy editor" : "React Email";
  const Icon = isLegacy ? RotateCcw : BadgeCheck;

  const badge = (
    <Badge
      variant={isLegacy ? "secondary" : "default"}
      className="h-7 gap-1.5 rounded-md px-2"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );

  if (variant === "badge") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {isLegacy
              ? legacyUnlayerEnabled
                ? "Existing Unlayer templates open through the legacy adapter."
                : "Legacy Unlayer editing is disabled."
              : "New templates use React Email Editor and the existing Resend delivery layer."}
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
      <Mail className="h-4 w-4 text-primary" />
      <span className="font-medium">{label}</span>
      <span className="text-muted-foreground">
        {isLegacy
          ? "Legacy template path"
          : "Editor runtime separate from Resend sending"}
      </span>
    </div>
  );
}

export default EmailStudioProviderStatus;
