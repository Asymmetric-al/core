"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@asym/ui/components/shadcn/radio-group";

import type { ViewNameDialogState } from "./use-gift-history-view-controller";
import type { CrmNamedView } from "@asym/database/types";

interface ViewSettingsResetDialogProps {
  description: string | undefined;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ViewSettingsResetDialog({
  description,
  onCancel,
  onConfirm,
}: ViewSettingsResetDialogProps) {
  if (!description) {
    return null;
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent
        className="sm:max-w-md"
        data-testid="view-settings-reset-preview"
      >
        <DialogTitle>Reset view settings</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="h-11" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="h-11" onClick={onConfirm}>
            Reset
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface NamedViewNameDialogProps {
  state: ViewNameDialogState | null;
  value: string;
  onCancel: () => void;
  onSubmit: () => void;
  onValueChange: (value: string) => void;
}

export function NamedViewNameDialog({
  state,
  value,
  onCancel,
  onSubmit,
  onValueChange,
}: NamedViewNameDialogProps) {
  if (!state) {
    return null;
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent
        className="sm:max-w-md"
        data-testid="named-view-name-dialog"
      >
        <DialogTitle>{viewNameDialogTitle(state)}</DialogTitle>
        <DialogDescription>
          Named views are personal — they save your columns, filters, sort, and
          pinned row action.
        </DialogDescription>
        <div className="space-y-1.5">
          <Label htmlFor="named-view-name">View name</Label>
          <Input
            id="named-view-name"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            className="h-11"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="h-11" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="h-11" disabled={!value.trim()} onClick={onSubmit}>
            Save view
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteNamedViewDialogProps {
  nextDefaultChoice: string;
  onCancel: () => void;
  onConfirm: () => void;
  onNextDefaultChoiceChange: (value: string) => void;
  view: CrmNamedView | null;
  views: CrmNamedView[];
}

export function DeleteNamedViewDialog({
  nextDefaultChoice,
  onCancel,
  onConfirm,
  onNextDefaultChoiceChange,
  view,
  views,
}: DeleteNamedViewDialogProps) {
  if (!view) {
    return null;
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent
        className="sm:max-w-md"
        data-testid="named-view-delete-dialog"
      >
        <DialogTitle>Delete “{view.name}”</DialogTitle>
        <DialogDescription>
          {view.isDefault
            ? "This is your default view. Choose another default or fall back to the tenant/system default."
            : "This personal view will be removed. Your current working settings stay as they are."}
        </DialogDescription>
        {view.isDefault ? (
          <RadioGroup
            className="space-y-2"
            value={nextDefaultChoice}
            onValueChange={onNextDefaultChoiceChange}
          >
            {views
              .filter((candidate) => candidate.id !== view.id)
              .map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <RadioGroupItem
                    value={candidate.id}
                    id={`next-default-view-${candidate.id}`}
                  />
                  <Label htmlFor={`next-default-view-${candidate.id}`}>
                    Make “{candidate.name}” the default
                  </Label>
                </div>
              ))}
            <div className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="" id="next-default-view-none" />
              <Label htmlFor="next-default-view-none">
                No default (use tenant/system default)
              </Label>
            </div>
          </RadioGroup>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="h-11" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" className="h-11" onClick={onConfirm}>
            Delete view
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TenantDefaultDialogProps {
  isSaving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
}

export function TenantDefaultDialog({
  isSaving,
  onCancel,
  onConfirm,
  open,
}: TenantDefaultDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <Dialog open onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <DialogContent
        className="sm:max-w-md"
        data-testid="tenant-default-confirm"
      >
        <DialogTitle>Set tenant default</DialogTitle>
        <DialogDescription>
          The current columns, filters, sort, and pinned row action become the
          default for everyone in this tenant. Personal view settings are not
          changed and keep overriding the tenant default.
        </DialogDescription>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="h-11" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="h-11" disabled={isSaving} onClick={onConfirm}>
            {isSaving ? "Saving..." : "Set tenant default"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function viewNameDialogTitle(state: ViewNameDialogState): string {
  switch (state.mode) {
    case "create":
      return "Save current as view";
    case "rename":
      return "Rename view";
    case "duplicate":
      return "Duplicate view";
    default: {
      const exhaustiveState: never = state;
      return exhaustiveState;
    }
  }
}
