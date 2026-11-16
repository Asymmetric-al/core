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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { Save } from "lucide-react";
import { useState } from "react";

import type { EmailMetadata } from "./email-studio-types";

export interface EmailStudioSaveDialogProps {
  isSaving: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metadata: EmailMetadata;
  onConfirmSave: (next: EmailMetadata) => void;
}

export function EmailStudioSaveDialog({
  isSaving,
  open,
  onOpenChange,
  metadata,
  onConfirmSave,
}: EmailStudioSaveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <EmailStudioSaveDialogFields
          isSaving={isSaving}
          metadata={metadata}
          onOpenChange={onOpenChange}
          onConfirmSave={onConfirmSave}
        />
      ) : null}
    </Dialog>
  );
}

function EmailStudioSaveDialogFields({
  isSaving,
  metadata,
  onOpenChange,
  onConfirmSave,
}: Omit<EmailStudioSaveDialogProps, "open">) {
  const [draft, setDraft] = useState<EmailMetadata>(metadata);

  return (
    <DialogContent
      scrollable
      className="sm:max-w-120"
      showCloseButton={!isSaving}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!isSaving && draft.name.trim()) onConfirmSave(draft);
        }}
      >
        <DialogHeader>
          <DialogTitle>Save email template</DialogTitle>
          <DialogDescription>
            Enter the details for your email template. Subject and preheader
            will be used as defaults when sending.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="py-4">
          <Field>
            <FieldLabel htmlFor="template-name">
              Template name <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="template-name"
              required
              placeholder="e.g., Monthly newsletter"
              value={draft.name}
              disabled={isSaving}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="template-subject">Email subject</FieldLabel>
            <Input
              id="template-subject"
              placeholder="e.g., News from our ministry"
              value={draft.subject}
              disabled={isSaving}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  subject: event.target.value,
                }))
              }
            />
            <FieldDescription>
              The subject line that recipients will see
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="template-preheader">
              Inbox preview text
            </FieldLabel>
            <Textarea
              id="template-preheader"
              placeholder="A short preview after the subject…"
              value={draft.preheader}
              disabled={isSaving}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  preheader: event.target.value,
                }))
              }
              rows={2}
            />
            <FieldDescription>
              Shown in inbox previews. Keep it under 90 characters.
            </FieldDescription>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            focusableWhenDisabled={isSaving}
            type="submit"
            disabled={!draft.name.trim() || isSaving}
          >
            {isSaving ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Save aria-hidden="true" data-icon="inline-start" />
            )}
            Save template
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
