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
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { Save } from "lucide-react";

import type { EmailMetadata } from "./email-studio-types";
import type { Dispatch, SetStateAction } from "react";

export interface EmailStudioSaveDialogProps {
  isSaving: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metadata: EmailMetadata;
  setMetadata: Dispatch<SetStateAction<EmailMetadata>>;
  onConfirmSave: () => void;
}

export function EmailStudioSaveDialog({
  isSaving,
  open,
  onOpenChange,
  metadata,
  setMetadata,
  onConfirmSave,
}: EmailStudioSaveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Save Email Template</DialogTitle>
          <DialogDescription>
            Enter the details for your email template. Subject and preheader
            will be used as defaults when sending.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="template-name">
              Template Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="template-name"
              placeholder="e.g., Monthly Newsletter"
              value={metadata.name}
              onChange={(event) =>
                setMetadata((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="template-subject">Email Subject</Label>
            <Input
              id="template-subject"
              placeholder="e.g., Exciting Updates from Our Ministry"
              value={metadata.subject}
              onChange={(event) =>
                setMetadata((current) => ({
                  ...current,
                  subject: event.target.value,
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              The subject line that recipients will see
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="template-preheader">Preheader Text</Label>
            <Textarea
              id="template-preheader"
              placeholder="Preview text that appears after the subject in inbox..."
              value={metadata.preheader}
              onChange={(event) =>
                setMetadata((current) => ({
                  ...current,
                  preheader: event.target.value,
                }))
              }
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Shown in inbox previews. Keep it under 90 characters.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onConfirmSave}
            disabled={!metadata.name.trim() || isSaving}
          >
            <Save className="h-4 w-4" />
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
