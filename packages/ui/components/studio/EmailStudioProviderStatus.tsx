"use client";

import { BadgeCheck, Mail } from "lucide-react";

import { Badge } from "@asym/ui/components/shadcn/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";

export interface EmailStudioProviderStatusProps {
  variant?: "badge" | "inline";
}

/**
 * Email Studio runs exclusively on React Email Editor, so this status always
 * reflects the React Email provider. (Unlayer remains only for PDF Studio.)
 */
export function EmailStudioProviderStatus({
  variant = "inline",
}: EmailStudioProviderStatusProps) {
  const badge = (
    <Badge variant="default" className="h-7 gap-1.5 rounded-md px-2">
      <BadgeCheck className="h-3.5 w-3.5" />
      React Email
    </Badge>
  );

  if (variant === "badge") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            New templates use React Email Editor and the existing Resend
            delivery layer.
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
      <Mail className="h-4 w-4 text-primary" />
      <span className="font-medium">React Email</span>
      <span className="text-muted-foreground">
        Editor runtime separate from Resend sending
      </span>
    </div>
  );
}

export default EmailStudioProviderStatus;
