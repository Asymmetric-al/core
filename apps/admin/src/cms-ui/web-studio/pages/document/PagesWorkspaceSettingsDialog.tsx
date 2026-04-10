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
import { useAsymForm } from "@asym/ui/components/shadcn/form";
import { usePreferences } from "@payloadcms/ui";
import { useEffect, useState } from "react";
import { z } from "zod";

import { WEB_STUDIO_PREF_KEYS } from "../../preferences/keys";

const workspaceSchema = z.object({
  inspectorOpen: z.boolean(),
  showSlugChip: z.boolean(),
});

type WorkspaceValues = z.infer<typeof workspaceSchema>;

const defaultWorkspace: WorkspaceValues = {
  inspectorOpen: true,
  showSlugChip: true,
};

type PagesWorkspaceSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PagesWorkspaceSettingsDialog({
  open,
  onOpenChange,
}: PagesWorkspaceSettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-black uppercase tracking-tight">
            Page workspace
          </DialogTitle>
          <DialogDescription>
            View settings persist per user via Payload preferences (not local
            storage).
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <WorkspaceSettingsInner onDismiss={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function WorkspaceSettingsInner({ onDismiss }: { onDismiss: () => void }) {
  const { getPreference } = usePreferences();
  const [initialValues, setInitialValues] = useState<WorkspaceValues | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const pref = await getPreference<Partial<WorkspaceValues>>(
          WEB_STUDIO_PREF_KEYS.pagesDocWorkspace,
        );
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
  }, [getPreference]);

  if (!initialValues) {
    return (
      <p className="text-muted-foreground text-sm">Loading preferences…</p>
    );
  }

  return (
    <WorkspaceSettingsForm
      key={`${initialValues.inspectorOpen}-${initialValues.showSlugChip}`}
      initialValues={initialValues}
      onSaved={onDismiss}
      onCancel={onDismiss}
    />
  );
}

function WorkspaceSettingsForm({
  initialValues,
  onSaved,
  onCancel,
}: {
  initialValues: WorkspaceValues;
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
      await setPreference(WEB_STUDIO_PREF_KEYS.pagesDocWorkspace, parsed, true);
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
            description="Display the URL slug next to the document title region."
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
