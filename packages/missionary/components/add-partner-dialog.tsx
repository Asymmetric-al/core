"use client";

import { createBrowserClient } from "@asym/database/supabase";
import { useAsymForm } from "@asym/ui/components/primitives/tanstack-form";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";
import { FieldGroup } from "@asym/ui/components/shadcn/field";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import {
  createInitialPartnerFormValues,
  partnerSchema,
  toPartnerInsertPayload,
} from "./add-partner-form-model";

export interface AddPartnerDialogProps {
  missionaryId: string;
  onSuccess?: () => void;
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const PARTNER_TYPE_OPTIONS = [
  { label: "Individual", value: "Individual" },
  { label: "Organization", value: "Organization" },
  { label: "Church", value: "Church" },
] as const;

const PARTNER_FREQUENCY_OPTIONS = [
  { label: "Monthly", value: "Monthly" },
  { label: "One-Time", value: "One-Time" },
  { label: "Annually", value: "Annually" },
  { label: "Irregular", value: "Irregular" },
] as const;

export function AddPartnerDialog({
  missionaryId,
  onSuccess,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AddPartnerDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const supabase = React.useMemo(() => createBrowserClient(), []);

  const form = useAsymForm({
    defaultValues: createInitialPartnerFormValues(),
    validators: {
      onChange: partnerSchema,
    },
    onSubmit: async ({ value }) => {
      if (!missionaryId) {
        toast.error("Missionary ID is missing");
        return;
      }

      try {
        const { error } = await supabase
          .from("donors")
          .insert(toPartnerInsertPayload({ missionaryId, values: value }));

        if (error) {
          throw error;
        }

        toast.success("Partner added successfully");
        form.reset(createInitialPartnerFormValues());
        setOpen?.(false);
        onSuccess?.();
      } catch (error: unknown) {
        console.error("Error adding partner:", error);
        const message =
          error instanceof Error ? error.message : "Failed to add partner";
        toast.error(message);
      }
    },
  });

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        form.reset(createInitialPartnerFormValues());
      }

      setOpen?.(nextOpen);
    },
    [form, setOpen],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger render={trigger} /> : null}
      <DialogContent className="sm:max-w-125" scrollable>
        <DialogHeader>
          <DialogTitle>Add New Partner</DialogTitle>
          <DialogDescription>
            Enter the details for your new ministry partner
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.AppField name="name">
              {(field) => (
                <field.TextField
                  className="sm:col-span-2"
                  label="Full Name / Org Name"
                  placeholder="Enter name"
                />
              )}
            </form.AppField>

            <form.AppField name="email">
              {(field) => (
                <field.TextField
                  label="Email Address"
                  placeholder="email@example.com"
                  type="email"
                />
              )}
            </form.AppField>

            <form.AppField name="phone">
              {(field) => (
                <field.TextField
                  label="Phone Number"
                  placeholder="(555) 000-0000"
                />
              )}
            </form.AppField>

            <form.AppField name="type">
              {(field) => (
                <field.SelectField
                  label="Partner Type"
                  options={PARTNER_TYPE_OPTIONS}
                  placeholder="Select type"
                />
              )}
            </form.AppField>

            <form.AppField name="frequency">
              {(field) => (
                <field.SelectField
                  label="Giving Frequency"
                  options={PARTNER_FREQUENCY_OPTIONS}
                  placeholder="Select frequency"
                />
              )}
            </form.AppField>

            <form.AppField name="location">
              {(field) => (
                <field.TextField
                  className="sm:col-span-2"
                  label="Location (City, State)"
                  placeholder="Denver, CO"
                />
              )}
            </form.AppField>
          </FieldGroup>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              onClick={() => handleOpenChange(false)}
              type="button"
              variant="outline"
            >
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
                  aria-busy={isSubmitting}
                  disabled={!canSubmit || isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        aria-hidden="true"
                        className="size-4 animate-spin"
                      />
                      <span className="sr-only">Adding partner</span>
                    </>
                  ) : (
                    "Add Partner"
                  )}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
