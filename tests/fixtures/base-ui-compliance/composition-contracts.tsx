import React, { useState } from "react";

import { savedLabel } from "./label-mutation-stub";
import { AuthButton } from "../../../packages/ui/components/auth/auth-primitives";
import { Badge } from "../../../packages/ui/components/shadcn/badge";
import {
  buttonVariants,
  Button,
} from "../../../packages/ui/components/shadcn/button";
import {
  SidebarProvider,
  SidebarMenuButton,
  SidebarTrigger,
} from "../../../packages/ui/components/shadcn/sidebar";
import { TooltipProvider } from "../../../packages/ui/components/shadcn/tooltip";
// Load real application compositions only inside this isolated browser fixture.
const { LayoutToggle } =
  await import("../../../apps/admin/features/support-hub/components/toolbar/LayoutToggle");
const { LabelForm } =
  await import("../../../apps/admin/features/support-hub/components/labels/LabelForm");
const { OfflineGiftEntryDialog } =
  await import("../../../apps/admin/app/(app)/contributions/offline-gift/offline-gift-entry-dialog");

export function CompositionContracts() {
  const [loading, setLoading] = useState(false);
  const [activations, setActivations] = useState(0);
  const [layout, setLayout] = useState<"board" | "table">("board");
  const [saved, setSaved] = useState("");
  const [open, setOpen] = useState(false);
  const [changes, setChanges] = useState(0);
  return (
    <section
      id="composition-contracts"
      className="mt-8 flex max-w-xl flex-col gap-4"
    >
      <h2>Composition and choice contracts</h2>
      <AuthButton
        loading={loading}
        disabled={false}
        onClick={() => {
          setLoading(true);
          setActivations((n) => n + 1);
        }}
      >
        {loading ? "Signing in" : "Sign in fixture"}
      </AuthButton>
      <output aria-label="Auth activations">{activations}</output>
      <TooltipProvider>
        <SidebarProvider
          defaultOpen={false}
          className="min-h-0"
          onOpenChange={() => setChanges((n) => n + 1)}
        >
          <SidebarMenuButton
            size="lg"
            tooltip="Projects help"
            render={(props, state) => (
              <button {...props} data-render-size={state.size} />
            )}
          >
            Composed Projects
          </SidebarMenuButton>
          <SidebarTrigger onClick={(event) => event.preventBaseUIHandler()} />
        </SidebarProvider>
      </TooltipProvider>
      <output aria-label="Sidebar changes">{changes}</output>
      <Badge render={<a href="#composition-destination" />}>
        Badge destination
      </Badge>
      <a href="#composition-destination" className={buttonVariants()}>
        Styled destination
      </a>
      <div id="composition-destination">Destination</div>
      <LayoutToggle value={layout} onValueChange={setLayout} />
      <output aria-label="Chosen layout">{layout}</output>
      <LabelForm
        onSaved={() => setSaved(JSON.stringify(savedLabel))}
        onCancel={() => undefined}
      />
      <output className="break-all" aria-label="Saved label">
        {saved}
      </output>
      <Button onClick={() => setOpen(true)}>Open offline donor modes</Button>
      <OfflineGiftEntryDialog open={open} onOpenChange={setOpen} />
    </section>
  );
}
