"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { buttonVariants } from "@asym/ui/components/shadcn/button";
import { DropdownMenuItem } from "@asym/ui/components/shadcn/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import { Bookmark, Copy, Inbox, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { useSupportAgents } from "../../../hooks/use-support-agents";
import { useDeleteSupportSavedView } from "../../../hooks/use-support-mutations";
import { useSupportSavedViews } from "../../../hooks/use-support-saved-views";
import {
  describeSavedViewFilter,
  savedViewHref,
} from "../../../lib/saved-view-links";
import { canManageSavedView } from "../../../lib/settings-access";
import { useConfirm } from "../../workspace/confirm-provider";
import { SupportEmptySection } from "../../workspace/SupportEmptySection";
import { SettingsListState } from "../SettingsListState";
import { SettingsPanel } from "../SettingsPanel";
import { SettingsActionsMenu, SettingsIconButton } from "../SettingsRowActions";

import type { SupportSavedView } from "../../../types";

export function SavedViewsList() {
  const query = useSupportSavedViews();
  const savedViews = query.data;
  const agents = useSupportAgents().data;
  const deleteView = useDeleteSupportSavedView();
  const agentName = (agentId: string) =>
    agents.find((agent) => agent.id === agentId)?.name;

  const confirm = useConfirm();
  const handleDelete = async (view: SupportSavedView) => {
    await confirm({
      title: `Delete the ${view.name} view?`,
      description: "Anyone using its link will lose it.",
      confirmLabel: "Delete view",
      action: async () => {
        try {
          await deleteView.mutateAsync({ id: view.id });
          toast.success("Saved view deleted.");
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not delete the saved view.",
          );
          throw error;
        }
      },
    });
  };

  const copyLink = async (view: SupportSavedView) => {
    try {
      const url = new URL(savedViewHref(view.filter), window.location.origin);
      await navigator.clipboard.writeText(url.toString());
      toast.success("Link copied.");
    } catch {
      toast.error(
        "Couldn’t copy the link. Open the view and copy it from the address bar.",
      );
    }
  };

  return (
    <SettingsPanel
      title="Saved views"
      description="Named inbox filters. Workspace views are for everyone; personal views belong to one agent. Create new views from the inbox toolbar."
    >
      <SettingsListState
        noun="saved views"
        isLoading={query.isLoading}
        isError={query.isError}
        itemCount={savedViews.length}
        onRetry={query.refetch}
      >
        {savedViews.length === 0 ? (
          <SupportEmptySection
            icon={<Bookmark className="size-4" />}
            title="No saved views yet"
            description="Save a filter from the inbox toolbar and it will show up here."
            action={
              <Link href="/support" className={buttonVariants({ size: "sm" })}>
                Open inbox
              </Link>
            }
          />
        ) : (
          <ItemGroup className="gap-2">
            {savedViews.map((view) => {
              const href = savedViewHref(view.filter);
              // Support admins see other agents' personal views; say whose.
              const ownerName =
                view.scope === "personal" &&
                view.ownerAgentId &&
                view.ownerAgentId !== query.access.agentId
                  ? agentName(view.ownerAgentId)
                  : undefined;
              return (
                <Item key={view.id} variant="outline" size="sm">
                  <ItemMedia variant="icon">
                    <Bookmark aria-hidden="true" />
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle>
                      <Link
                        href={href}
                        className="underline-offset-4 hover:underline"
                      >
                        {view.name}
                      </Link>
                      <Badge variant="outline">
                        {view.scope === "workspace"
                          ? "Workspace"
                          : ownerName
                            ? `Personal · ${ownerName}`
                            : "Personal"}
                      </Badge>
                    </ItemTitle>
                    <ItemDescription>
                      {describeSavedViewFilter(view.filter, { agentName })}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <SettingsActionsMenu label={`Actions for ${view.name}`}>
                      <DropdownMenuItem render={<Link href={href} />}>
                        <Inbox aria-hidden="true" />
                        Open in inbox
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => void copyLink(view)}>
                        <Copy aria-hidden="true" />
                        Copy link
                      </DropdownMenuItem>
                    </SettingsActionsMenu>
                    {canManageSavedView(query.access, view) ? (
                      <SettingsIconButton
                        label={`Delete ${view.name}`}
                        tooltip="Delete"
                        onClick={() => void handleDelete(view)}
                      >
                        <Trash2 aria-hidden="true" />
                      </SettingsIconButton>
                    ) : null}
                  </ItemActions>
                </Item>
              );
            })}
          </ItemGroup>
        )}
      </SettingsListState>
    </SettingsPanel>
  );
}
