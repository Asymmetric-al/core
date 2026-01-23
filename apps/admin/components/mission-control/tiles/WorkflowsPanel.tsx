"use client";

import Link from "next/link";
import { WORKFLOWS } from "@asym/lib/mission-control/tiles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { ArrowRight } from "../icons";

export function WorkflowsPanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-zinc-900">
            Suggested Workflows
          </h2>
          <p className="text-sm font-medium text-zinc-500">
            Common tasks and multi-step processes for your role.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WORKFLOWS.map((workflow) => (
          <Link
            key={workflow.id}
            href={`/mc${workflow.route}`}
            className="group block"
          >
            <Card className="h-full overflow-hidden rounded-3xl border border-zinc-200/60 bg-white shadow-sm transition-all duration-300 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/40 hover:-translate-y-1">
              <CardHeader className="space-y-1.5 p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 w-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-zinc-900 group-hover:border-zinc-900 transition-all">
                    <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
                <CardTitle className="text-base font-bold text-zinc-900 group-hover:text-zinc-900 transition-colors">
                  {workflow.title}
                </CardTitle>
                <CardDescription className="text-sm font-medium text-zinc-500 leading-relaxed mt-1.5">
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
