"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            Loading templates…
          </div>
        ) : templates.length === 0 ? (
          <Empty className="border-0 py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderOpen />
              </EmptyMedia>
              <EmptyTitle>No saved templates yet</EmptyTitle>
              <EmptyDescription>
                Save a React Email template from the studio to open it here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ItemGroup className="max-h-[360px] overflow-y-auto">
            {templates.map((template) => (
              <Item
                key={template.id}
                render={
                  <button type="button" onClick={() => onSelect(template)} />
                }
                size="sm"
                className="w-full"
              >
                <ItemMedia variant="icon">
                  <FolderOpen />
                </ItemMedia>
                <ItemContent className="min-w-0">
                  <ItemTitle className="truncate">{template.name}</ItemTitle>
                  <ItemDescription>
                    {template.builder === "react_email"
                      ? "React Email"
                      : "Legacy (read-only)"}{" "}
                    · v{template.version}
                  </ItemDescription>
                </ItemContent>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Item>
            ))}
          </ItemGroup>
        )}
      </DialogContent>
    </Dialog>
  );
}
