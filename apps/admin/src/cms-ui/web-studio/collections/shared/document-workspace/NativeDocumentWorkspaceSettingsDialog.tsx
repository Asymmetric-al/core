"use client";

import { useAsymForm } from "@asym/ui/components/primitives/tanstack-form";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import { usePreferences } from "@payloadcms/ui";
import { useId, useEffect, useState } from "react";
import { z } from "zod";

type WorkspaceValues = {
  inspectorOpen: boolean;
  showSlugChip: boolean;
};

const workspaceSchema = z.object({
  inspectorOpen: z.boolean(),
  showSlugChip: z.boolean(),
});

const defaultWorkspace: WorkspaceValues = {
  inspectorOpen: true,
  showSlugChip: true,
};

type NativeDocumentWorkspaceSettingsDialogProps = {
  open: boolean;
  preferenceKey: string;
  sectionLabel: string;
  onOpenChange: (open: boolean) => void;
};

export function NativeDocumentWorkspaceSettingsDialog({
  open,
  preferenceKey,
  sectionLabel,
  onOpenChange,
}: NativeDocumentWorkspaceSettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{sectionLabel} workspace</DialogTitle>
          <DialogDescription>
            Choose what the document workspace shows. Saved to your account.
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <WorkspaceSettingsInner
            preferenceKey={preferenceKey}
            onDismiss={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function WorkspaceSettingsInner({
  preferenceKey,
  onDismiss,
}: {
  preferenceKey: string;
  onDismiss: () => void;
}) {
  const { getPreference } = usePreferences();
  const [initialValues, setInitialValues] = useState<WorkspaceValues | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const pref =
          await getPreference<Partial<WorkspaceValues>>(preferenceKey);

        if (cancelled) {
          return;
        }

        setInitialValues({
          inspectorOpen:
            typeof pref?.inspectorOpen === "boolean"
              ? pref.inspectorOpen
              : defaultWorkspace.inspectorOpen,
          showSlugChip:
            typeof pref?.showSlugChip === "boolean"
              ? pref.showSlugChip
              : defaultWorkspace.showSlugChip,
        });
      } catch {
        if (!cancelled) {
          setInitialValues(defaultWorkspace);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getPreference, preferenceKey]);

  if (!initialValues) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Loading preferences…
      </p>
    );
  }

  return (
    <WorkspaceSettingsForm
      key={`${initialValues.inspectorOpen}-${initialValues.showSlugChip}`}
      initialValues={initialValues}
      preferenceKey={preferenceKey}
      onSaved={onDismiss}
      onCancel={onDismiss}
    />
  );
}

function WorkspaceSettingsForm({
  initialValues,
  preferenceKey,
  onSaved,
  onCancel,
}: {
  initialValues: WorkspaceValues;
  preferenceKey: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const pendingActionLabelId = useId();

  const { setPreference } = usePreferences();

  const form = useAsymForm({
    defaultValues: initialValues,
    validators: {
      onChange: workspaceSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = workspaceSchema.parse(value);

      await setPreference(preferenceKey, parsed, true);
      onSaved();
    },
  });

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.AppField name="inspectorOpen">
        {(field) => (
          <field.SwitchField
            label="Inspector"
            description="Show document state, details and links beside the form."
          />
        )}
      </form.AppField>

      <form.AppField name="showSlugChip">
        {(field) => (
          <field.SwitchField
            label="Slug"
            description="Show the page address under the title."
          />
        )}
      </form.AppField>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button
              aria-labelledby={`${pendingActionLabelId}-18`}
              focusableWhenDisabled={isSubmitting}
              type="submit"
              disabled={!canSubmit || isSubmitting}
            >
              <span id={`${pendingActionLabelId}-18`}>
                {isSubmitting ? "Saving…" : "Save preferences"}
              </span>
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
}
