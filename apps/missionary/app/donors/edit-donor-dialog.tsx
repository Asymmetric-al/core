"use client";

import { createBrowserClient } from "@asym/database/supabase";
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
import { Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import {
  createInitialEditDonorFormValues,
  editDonorSchema,
  toDonorUpdatePayload,
  type EditDonorFormSource,
} from "./edit-donor-form-model";

const DONOR_TYPE_OPTIONS = [
  { label: "Individual", value: "Individual" },
  { label: "Church", value: "Church" },
  { label: "Organization", value: "Organization" },
] as const;

const DONOR_STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "New", value: "New" },
  { label: "Lapsed", value: "Lapsed" },
  { label: "At Risk", value: "At Risk" },
] as const;

const PREFERRED_CONTACT_OPTIONS = [
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
  { label: "Text", value: "text" },
] as const;

type EditableDonor = EditDonorFormSource & {
  id: string;
};

export interface EditDonorDialogProps {
  donor: EditableDonor | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  open: boolean;
}

const LABEL_CLASS_NAME =
  "text-[10px] font-semibold uppercase tracking-widest text-zinc-400";

const FIELD_CLASS_NAME =
  "h-11 rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5";

export function EditDonorDialog({
  donor,
  onOpenChange,
  onSuccess,
  open,
}: EditDonorDialogProps) {
  const supabase = React.useMemo(() => createBrowserClient(), []);
  const initialValues = React.useMemo(
    () => createInitialEditDonorFormValues(donor),
    [donor],
  );

  const form = useAsymForm({
    defaultValues: initialValues,
    validators: {
      onChange: editDonorSchema,
    },
    onSubmit: async ({ value }) => {
      if (!donor?.id) {
        toast.error("Select a partner first");
        return;
      }

      try {
        const { error } = await supabase
          .from("donors")
          .update(toDonorUpdatePayload(value))
          .eq("id", donor.id);

        if (error) {
          throw error;
        }

        toast.success("Partner updated successfully");
        onOpenChange(false);
        onSuccess?.();
      } catch (error: unknown) {
        console.error("Error updating partner:", error);
        const message =
          error instanceof Error ? error.message : "Failed to update partner";
        toast.error(message);
      }
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset(initialValues);
    }
  }, [form, initialValues, open]);

  const handleClose = React.useCallback(() => {
    form.reset(initialValues);
    onOpenChange(false);
  }, [form, initialValues, onOpenChange]);

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose();
          return;
        }

        onOpenChange(nextOpen);
      }}
      open={open}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Edit Partner
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500">
            Update {donor?.name}&apos;s information.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-6 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="space-y-4">
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              Basic Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    className="col-span-2"
                    inputClassName={FIELD_CLASS_NAME}
                    label="Full Name"
                    labelClassName={LABEL_CLASS_NAME}
                  />
                )}
              </form.AppField>

              <form.AppField name="type">
                {(field) => (
                  <field.SelectField
                    label="Type"
                    labelClassName={LABEL_CLASS_NAME}
                    options={DONOR_TYPE_OPTIONS}
                    triggerClassName={FIELD_CLASS_NAME}
                  />
                )}
              </form.AppField>

              <form.AppField name="status">
                {(field) => (
                  <field.SelectField
                    label="Status"
                    labelClassName={LABEL_CLASS_NAME}
                    options={DONOR_STATUS_OPTIONS}
                    triggerClassName={FIELD_CLASS_NAME}
                  />
                )}
              </form.AppField>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              Contact Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <form.AppField name="email">
                {(field) => (
                  <field.TextField
                    inputClassName={FIELD_CLASS_NAME}
                    label="Email"
                    labelClassName={LABEL_CLASS_NAME}
                    type="email"
                  />
                )}
              </form.AppField>

              <form.AppField name="phone">
                {(field) => (
                  <field.TextField
                    inputClassName={FIELD_CLASS_NAME}
                    label="Primary Phone"
                    labelClassName={LABEL_CLASS_NAME}
                  />
                )}
              </form.AppField>

              <form.AppField name="mobile">
                {(field) => (
                  <field.TextField
                    inputClassName={FIELD_CLASS_NAME}
                    label="Mobile / Text"
                    labelClassName={LABEL_CLASS_NAME}
                  />
                )}
              </form.AppField>

              <form.AppField name="work_phone">
                {(field) => (
                  <field.TextField
                    inputClassName={FIELD_CLASS_NAME}
                    label="Work Phone"
                    labelClassName={LABEL_CLASS_NAME}
                  />
                )}
              </form.AppField>

              <form.AppField name="preferred_contact">
                {(field) => (
                  <field.SelectField
                    label="Preferred Contact"
                    labelClassName={LABEL_CLASS_NAME}
                    options={PREFERRED_CONTACT_OPTIONS}
                    triggerClassName={FIELD_CLASS_NAME}
                  />
                )}
              </form.AppField>

              <form.AppField name="website">
                {(field) => (
                  <field.TextField
                    inputClassName={FIELD_CLASS_NAME}
                    label="Website"
                    labelClassName={LABEL_CLASS_NAME}
                  />
                )}
              </form.AppField>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              Address
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <form.AppField name="street">
                {(field) => (
                  <field.TextField
                    className="col-span-2"
                    inputClassName={FIELD_CLASS_NAME}
                    label="Street Address"
                    labelClassName={LABEL_CLASS_NAME}
                  />
                )}
              </form.AppField>

              <form.AppField name="street2">
                {(field) => (
                  <field.TextField
                    className="col-span-2"
                    inputClassName={FIELD_CLASS_NAME}
                    label="Apt, Suite, etc."
                    labelClassName={LABEL_CLASS_NAME}
                  />
                )}
              </form.AppField>

              <form.AppField name="city">
                {(field) => (
                  <field.TextField
                    inputClassName={FIELD_CLASS_NAME}
                    label="City"
                    labelClassName={LABEL_CLASS_NAME}
                  />
                )}
              </form.AppField>

              <div className="grid grid-cols-2 gap-4">
                <form.AppField name="state">
                  {(field) => (
                    <field.TextField
                      inputClassName={FIELD_CLASS_NAME}
                      label="State"
                      labelClassName={LABEL_CLASS_NAME}
                    />
                  )}
                </form.AppField>

                <form.AppField name="zip">
                  {(field) => (
                    <field.TextField
                      inputClassName={FIELD_CLASS_NAME}
                      label="ZIP"
                      labelClassName={LABEL_CLASS_NAME}
                    />
                  )}
                </form.AppField>
              </div>

              <form.AppField name="location">
                {(field) => (
                  <field.TextField
                    className="col-span-2"
                    inputClassName={FIELD_CLASS_NAME}
                    label="Display Location (e.g. Denver, CO)"
                    labelClassName={LABEL_CLASS_NAME}
                    placeholder="City, State"
                  />
                )}
              </form.AppField>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              Personal Details
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <form.AppField name="organization">
                {(field) => (
                  <field.TextField
                    inputClassName={FIELD_CLASS_NAME}
                    label="Organization"
                    labelClassName={LABEL_CLASS_NAME}
                  />
                )}
              </form.AppField>

              <form.AppField name="title">
                {(field) => (
                  <field.TextField
                    inputClassName={FIELD_CLASS_NAME}
                    label="Title / Role"
                    labelClassName={LABEL_CLASS_NAME}
                  />
                )}
              </form.AppField>

              <form.AppField name="spouse">
                {(field) => (
                  <field.TextField
                    inputClassName={FIELD_CLASS_NAME}
                    label="Spouse"
                    labelClassName={LABEL_CLASS_NAME}
                  />
                )}
              </form.AppField>

              <form.AppField name="birthday">
                {(field) => (
                  <field.TextField
                    inputClassName={FIELD_CLASS_NAME}
                    label="Birthday"
                    labelClassName={LABEL_CLASS_NAME}
                    type="date"
                  />
                )}
              </form.AppField>

              <form.AppField name="anniversary">
                {(field) => (
                  <field.TextField
                    inputClassName={FIELD_CLASS_NAME}
                    label="Anniversary"
                    labelClassName={LABEL_CLASS_NAME}
                    type="date"
                  />
                )}
              </form.AppField>
            </div>
          </div>

          <form.AppField name="notes">
            {(field) => (
              <field.TextareaField
                inputClassName="min-h-[100px] resize-none rounded-xl border-transparent bg-zinc-50 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                label="Internal Notes"
                labelClassName={LABEL_CLASS_NAME}
              />
            )}
          </form.AppField>

          <DialogFooter className="gap-2 pt-4 sm:gap-0">
            <Button
              className="h-10 rounded-xl border-zinc-200 px-6"
              onClick={handleClose}
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
                  className="h-10 rounded-xl px-6"
                  disabled={!canSubmit || isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
