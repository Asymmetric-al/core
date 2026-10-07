"use client";

import { resolveMissionControlHref } from "@asym/lib/mission-control/routes";
import { WORKFLOWS } from "@asym/lib/mission-control/tiles";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import Link from "next/link";

import { ArrowRight } from "../icons";

export function WorkflowsPanel() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            Suggested workflows
          </h2>
          <p className="text-sm font-medium text-muted-foreground">
            Common tasks and multi-step processes for your role.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {WORKFLOWS.map((workflow) => (
          <Link
            key={workflow.id}
            href={resolveMissionControlHref(workflow.route)}
            className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Card className="h-full overflow-hidden border-border bg-card shadow-sm transition-colors hover:border-ring/30">
              <CardHeader className="space-y-1.5">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted">
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                </div>
                <CardTitle className="text-base font-semibold text-foreground">
                  {workflow.title}
                </CardTitle>
                <CardDescription className="mt-1 text-sm leading-6 text-muted-foreground">
                  {workflow.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
