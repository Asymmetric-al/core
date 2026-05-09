"use client";

import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Button } from "@asym/ui/components/shadcn/button";
import { BookOpen, Plus } from "lucide-react";

import { SupportInbox } from "@/features/support-hub/components";

export default function SupportHubPageClient() {
  return (
    <PageShell
      title="Support Hub"
      description="Donor care inbox: triage, reply, and track every donor email."
      actions={
        <>
          <Button
            variant="outline"
            className="h-11 rounded-xl border-zinc-200 font-bold uppercase tracking-widest text-[10px]"
          >
            <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="hide-mobile">Knowledge Base</span>
            <span className="show-mobile-only">Docs</span>
          </Button>
          <Button className="h-11 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-black uppercase tracking-widest text-[10px]">
            <Plus className="mr-2 h-4 w-4" />
            New Conversation
          </Button>
        </>
      }
    >
      <SupportInbox />
    </PageShell>
  );
}
