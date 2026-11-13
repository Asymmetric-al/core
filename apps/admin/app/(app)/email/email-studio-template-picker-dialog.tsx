"use client";

import { Alert, AlertDescription } from "@asym/ui/components/shadcn/alert";
import { Button } from "@asym/ui/components/shadcn/button";
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
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { ChevronRight, FolderOpen } from "lucide-react";

import type { EmailTemplateListEntry } from "./email-studio-types";

export interface EmailStudioTemplatePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: EmailTemplateListEntry[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onSelect: (template: EmailTemplateListEntry) => void;
}

export function EmailStudioTemplatePickerDialog({
  open,
  onOpenChange,
  templates,
  isLoading,
  isError,
  onRetry,
  onSelect,
}: EmailStudioTemplatePickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent scrollable className="sm:max-w-140">
        <DialogHeader>
          <DialogTitle>Open template</DialogTitle>
          <DialogDescription>
            Choose a saved email template to load into the editor.
          </DialogDescription>
        </DialogHeader>
        {isError ? (
          <Alert variant="destructive">
            <AlertDescription>
              Templates couldn’t be loaded. Try again.
            </AlertDescription>
            <Button variant="outline" onClick={onRetry}>
              Try again
            </Button>
          </Alert>
        ) : isLoading ? (
          <div role="status" className="space-y-2">
            <span className="sr-only">Loading templates…</span>
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : templates.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderOpen />
              </EmptyMedia>
              <EmptyTitle>No saved templates yet</EmptyTitle>
              <EmptyDescription>
                Save an email template in this studio to open it here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ItemGroup className="max-h-90 overflow-y-auto">
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
                      ? "Editable template"
                      : "Older template (read-only)"}{" "}
                    · Version {template.version}
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
