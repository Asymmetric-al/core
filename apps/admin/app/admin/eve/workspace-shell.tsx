import { Badge } from "@asym/ui/components/shadcn/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  Activity,
  ArrowDownRight,
  GitPullRequest,
  MessageSquareText,
  PanelsTopLeft,
} from "lucide-react";

import type { ReactNode } from "react";

const WORKSPACE_SECTIONS = [
  {
    id: "eve-active-runs",
    label: "Active runs",
    description: "Current and recent governed work",
  },
  {
    id: "eve-approvals",
    label: "Approvals",
    description: "Target-bound human decisions",
  },
  {
    id: "eve-recent-actions",
    label: "Recent actions",
    description: "Policy decisions and outcomes",
  },
  {
    id: "eve-budgets",
    label: "Budgets",
    description: "Persisted usage and hard limits",
  },
  {
    id: "eve-failures",
    label: "Failures",
    description: "Failed runs and audited errors",
  },
  {
    id: "eve-github-activity",
    label: "GitHub activity",
    description: "Connection status, never mock events",
  },
  {
    id: "eve-eval-health",
    label: "Eval health",
    description: "Real model-policy evaluation state",
  },
  {
    id: "eve-memory-title",
    label: "Memory",
    description: "Private advisory memory controls",
  },
  {
    id: "eve-model-policy",
    label: "Model policy",
    description: "Versioned, permissioned control plane",
  },
  {
    id: "eve-subagents",
    label: "Subagents",
    description: "Active policy overrides and status",
  },
  {
    id: "eve-notifications",
    label: "Notifications",
    description: "Delivery connection readiness",
  },
  {
    id: "eve-engineering-monitors",
    label: "Engineering monitors",
    description: "Exact signal allowlist, findings, and run health",
  },
  {
    id: "eve-audit",
    label: "Audit",
    description: "Redacted decision summaries",
  },
  {
    id: "eve-retention",
    label: "Retention",
    description: "Replay lifecycle and holds",
  },
  {
    id: "eve-emergency-controls",
    label: "Emergency controls",
    description: "Audited kill-switch suite",
  },
] as const;

export function EveWorkspaceIndex() {
  return (
    <Card>
      <CardHeader>
        <CardTitle
          aria-level={2}
          role="heading"
          className="flex items-center gap-2"
        >
          <PanelsTopLeft aria-hidden="true" className="size-5" />
          Operations workspace
        </CardTitle>
        <CardDescription>
          Governance and control come first. Inspect real operational state
          before using the separately mounted chat runtime.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <nav aria-label="Eve operations panels">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {WORKSPACE_SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  className="group flex h-full items-start justify-between gap-3 rounded-lg border border-border bg-background p-3 text-left outline-none transition-[border-color,background-color] hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  href={`#${section.id}`}
                >
                  <span>
                    <span className="block text-sm font-medium text-foreground">
                      {section.label}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {section.description}
                    </span>
                  </span>
                  <ArrowDownRight
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </CardContent>
    </Card>
  );
}

function ConnectionState({
  availability = "Unavailable",
  description,
  icon,
  id,
  issue,
  title,
}: {
  availability?: "Mounted" | "Unavailable";
  description: string;
  icon: ReactNode;
  id: string;
  issue: string;
  title: string;
}) {
  return (
    <article id={id} className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
        </div>
        <Badge variant="outline">{availability}</Badge>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      <p className="mt-3 text-xs text-muted-foreground">Owned by {issue}</p>
    </article>
  );
}

export function EveCapabilityConnectionsPanel() {
  return (
    <section aria-labelledby="eve-connections-title">
      <Card>
        <CardHeader>
          <CardTitle
            id="eve-connections-title"
            aria-level={2}
            role="heading"
            className="flex items-center gap-2"
          >
            <Activity aria-hidden="true" className="size-5" />
            Capability connections
          </CardTitle>
          <CardDescription>
            Future integrations are labeled unavailable. This workspace never
            invents activity, health, or delivery results.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          <ConnectionState
            id="eve-github-activity"
            issue="#430"
            title="GitHub activity"
            description="The governed GitHub read and review path is not connected, so no commits, checks, reviews, or issues are presented as live activity."
            icon={<GitPullRequest aria-hidden="true" className="size-4" />}
          />
          <ConnectionState
            availability="Mounted"
            id="eve-chat"
            issue="#428"
            title="Chat runtime"
            description="The authenticated Eve runtime is mounted as a global, operations-secondary panel with an explicit allowlist for page context."
            icon={<MessageSquareText aria-hidden="true" className="size-4" />}
          />
        </CardContent>
      </Card>
    </section>
  );
}
