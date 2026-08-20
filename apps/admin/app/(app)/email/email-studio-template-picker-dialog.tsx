"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import { ChevronRight, FolderOpen } from "lucide-react";

import type { EmailTemplateListEntry } from "./email-studio-types";

export interface EmailStudioTemplatePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: EmailTemplateListEntry[];
  isLoading: boolean;
  onSelect: (template: EmailTemplateListEntry) => void;
}

export function EmailStudioTemplatePickerDialog({
  open,
  onOpenChange,
  templates,
  isLoading,
  onSelect,
}: EmailStudioTemplatePickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Open template</DialogTitle>
          <DialogDescription>
            Choose a saved email template to load into the editor.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading templates…</p>
        ) : templates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No saved templates yet.
          </p>
        ) : (
          <div className="max-h-[360px] overflow-y-auto">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-muted"
                onClick={() => onSelect(template)}
              >
                <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {template.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {template.builder === "react_email"
                      ? "React Email"
                      : "Legacy (read-only)"}{" "}
                    · v{template.version}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
