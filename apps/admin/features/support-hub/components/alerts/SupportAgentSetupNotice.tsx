"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import { X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useSupportAgents } from "../../hooks/use-support-agents";
import { useSupportSavedViews } from "../../hooks/use-support-saved-views";
import { SUPPORT_AGENT_SETUP_MESSAGE } from "../../lib/agent-setup";
import { useCurrentSupportAgentId } from "../../lib/current-agent";

export function SupportAgentSetupNotice() {
  const currentAgentId = useCurrentSupportAgentId();
  const agents = useSupportAgents();
  // Reuse the inbox's server-provided settings permissions, rather than
  // inferring administrative access from whether an agent record exists.
  const { access, isReady } = useSupportSavedViews();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || currentAgentId || !agents.isReady || !isReady) return null;

  return (
    <Alert role="status">
      <div className="col-start-2 flex items-center justify-between gap-2">
        <AlertTitle>Support agent setup</AlertTitle>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Dismiss support agent setup"
          onClick={() => setDismissed(true)}
        >
          <X aria-hidden="true" />
        </Button>
      </div>
      <AlertDescription>
        <p>
          {access.canManageAll
            ? "You’re not set up as a support agent yet. Review the collaborator list in agent settings. Adding agents isn’t available in Support Hub yet."
            : SUPPORT_AGENT_SETUP_MESSAGE}
        </p>
        {access.canManageAll ? (
          <Link
            href="/support/settings/collaborators"
            className={buttonVariants({ variant: "link" })}
          >
            Review agent settings
          </Link>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
