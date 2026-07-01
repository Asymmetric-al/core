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
import { useEffect, useState } from "react";
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
          <DialogTitle className="font-semibold tracking-tight">
            {sectionLabel} workspace
          </DialogTitle>
          <DialogDescription>
            View settings persist per user via Payload preferences (not local
            storage).
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
      <p className="text-muted-foreground text-sm">Loading preferences…</p>
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
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.AppField name="inspectorOpen">
        {(field) => (
          <field.SwitchField
            label="Inspector column"
            description="Reserve space for the document sidebar layout (visual hint)."
          />
        )}
      </form.AppField>

      <form.AppField name="showSlugChip">
        {(field) => (
          <field.SwitchField
            label="Show slug chip"
            description="Display the slug or identifier next to the document title."
          />
        )}
      </form.AppField>

      <DialogFooter className="gap-2 sm:gap-0">
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
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Saving…" : "Save preferences"}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
}
