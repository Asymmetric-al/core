import "virtual:base-ui-styles";

import React, { useEffect, useState } from "react";

import { DonorSubNav } from "../../../apps/donor/features/donor/components/DonorSubNav";
import { MissionaryLayoutShell } from "../../../apps/missionary/app/_providers/missionary-layout-shell";
import { createRoot } from "../../../node_modules/react-dom/client";
import { Button } from "../../../packages/ui/components/shadcn/button";
import { Input } from "../../../packages/ui/components/shadcn/input";
import { NavigationCommandPalette } from "../../../packages/ui/components/primitives/navigation-command-palette";
import { ThemeProvider } from "../../../packages/ui/lib/theme-provider";

function WorkspaceContracts() {
  const [destination, setDestination] = useState("");
  const [signOutCalls, setSignOutCalls] = useState(0);
  const missionary =
    new URLSearchParams(location.search).get("workspace") === "missionary";
  const shared =
    new URLSearchParams(location.search).get("workspace") === "shared";

  useEffect(() => {
    const navigate = (event: Event) => {
      if (event instanceof CustomEvent && typeof event.detail === "string")
        setDestination(event.detail);
    };
    const signOut = () => setSignOutCalls((count) => count + 1);
    document.addEventListener("fixture-workspace-navigation", navigate);
    document.addEventListener("fixture-workspace-signout-start", signOut);
    return () => {
      document.removeEventListener("fixture-workspace-navigation", navigate);
      document.removeEventListener("fixture-workspace-signout-start", signOut);
    };
  }, []);

  const content = (
    <div className="grid gap-4 p-4">
      <h1>{missionary ? "Missionary" : "Donor"} workspace contracts</h1>
      <label htmlFor="workspace-note">Workspace note</label>
      <Input id="workspace-note" />
      <Button
        onClick={() =>
          document.dispatchEvent(
            new Event("fixture-workspace-signout-complete"),
          )
        }
      >
        Complete sign out
      </Button>
      <output aria-label="Navigation destination">{destination}</output>
      <output aria-label="Sign out requests">{signOutCalls}</output>
    </div>
  );

  if (shared)
    return (
      <main className="min-h-svh bg-background text-foreground p-4">
        <NavigationCommandPalette
          title="Shared navigation"
          triggerLabel="Search shared pages"
          items={[{ label: "Settings", href: "/workspace/settings" }]}
          onNavigate={setDestination}
        />
        {content}
      </main>
    );

  return missionary ? (
    <MissionaryLayoutShell>{content}</MissionaryLayoutShell>
  ) : (
    <div className="bg-background text-foreground">
      <div className="h-16" aria-hidden />
      <DonorSubNav />
      <main>{content}</main>
    </div>
  );
}

const workspace = <WorkspaceContracts />;
createRoot(document.getElementById("root")!).render(
  new URLSearchParams(location.search).get("workspace") === "shared" ? (
    workspace
  ) : (
    <ThemeProvider
      attribute="class"
      forcedTheme="light"
      defaultTheme="light"
      enableSystem={false}
    >
      {workspace}
    </ThemeProvider>
  ),
);
