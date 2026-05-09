"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@asym/ui/components/shadcn/radio-group";
import * as React from "react";
import { toast } from "sonner";

import { useSaveSupportSavedView } from "../../hooks/use-support-mutations";

import type { SupportSavedView, SupportInboxRouteState } from "../../types";

interface SaveViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Live state from the inbox toolbar — captured into the saved view. */
  routeState: SupportInboxRouteState;
  /** When set, the dialog renames + reshapes an existing saved view. */
  editingView?: SupportSavedView | null;
}

/**
 * Names the active inbox filter and persists it into the support saved-views
 * collection. Re-uses the `useSaveSupportSavedView` Phase 2 hook; the
 * collection writer already invalidates the right cache keys so the saved-
 * view bar re-renders without manual refresh.
 */
export function SaveViewDialog({
  open,
  onOpenChange,
  routeState,
  editingView,
}: SaveViewDialogProps) {
  const saveSavedView = useSaveSupportSavedView();
  const [name, setName] = React.useState(editingView?.name ?? "");
  const [scope, setScope] = React.useState<"personal" | "workspace">(
    editingView?.scope ?? "personal",
  );

  React.useEffect(() => {
    if (!open) return;
    setName(editingView?.name ?? "");
    setScope(editingView?.scope ?? "personal");
  }, [editingView?.name, editingView?.scope, open]);

  const trimmed = name.trim();

  const handleSave = async () => {
    if (trimmed.length === 0) {
      toast.info("Give the view a name first.");
      return;
    }
    try {
      await saveSavedView.mutateAsync({
        id: editingView?.id,
        name: trimmed,
        slug: editingView?.slug ?? slugify(trimmed),
        ownerAgentId: editingView?.ownerAgentId ?? null,
        scope,
        filter: {
          view: routeState.view,
          layout: routeState.layout,
          status: routeState.status,
          q: routeState.q,
          labelSlugs: routeState.labelSlugs,
          assignee: routeState.assignee,
        },
      });
      toast.success(editingView ? "View updated." : "View saved.");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save the view.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingView ? "Edit saved view" : "Save current filter"}
          </DialogTitle>
          <DialogDescription>
            Saved views capture the current view, status, label, assignee, and
            search so the team can return to the same slice with one click.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="support-save-view-name">Name</Label>
            <Input
              id="support-save-view-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Mine - Open"
              maxLength={80}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Scope</Label>
            <RadioGroup
              value={scope}
              onValueChange={(next) =>
                setScope(next as "personal" | "workspace")
              }
              className="flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="personal" id="scope-personal" />
                <Label
                  htmlFor="scope-personal"
                  className="text-[12px] font-medium"
                >
                  Just me
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="workspace" id="scope-workspace" />
                <Label
                  htmlFor="scope-workspace"
                  className="text-[12px] font-medium"
                >
                  Whole workspace
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saveSavedView.isPending || trimmed.length === 0}
          >
            {editingView ? "Save changes" : "Save view"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
