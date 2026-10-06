"use client";

import { BadgeCheck, Mail } from "lucide-react";

import { Badge } from "@asym/ui/components/shadcn/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";

const emailProviderBadge = (
  <Badge variant="default" className="h-7 gap-1.5 rounded-md">
    <BadgeCheck />
    React Email
  </Badge>
);

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
  if (variant === "badge") {
    return (
      <Tooltip>
        <TooltipTrigger
          render={emailProviderBadge}
          tabIndex={0}
          aria-label="React Email"
          aria-description="Email Studio uses React Email Editor; sending uses the Resend delivery layer."
        />
        <TooltipContent side="bottom">
          <p>
            Email Studio uses React Email Editor; sending still uses the Resend
            delivery layer.
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
      <Mail />
      <span className="font-medium">React Email</span>
      <span className="text-muted-foreground">
        Editor runtime separate from Resend sending
      </span>
    </div>
  );
}

export default EmailStudioProviderStatus;
