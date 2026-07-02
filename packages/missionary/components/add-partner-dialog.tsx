"use client";

import { createBrowserClient } from "@asym/database/supabase";
import { useAsymForm } from "@asym/ui/components/primitives/tanstack-form";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";
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
      <DialogContent className="overflow-hidden rounded-[2rem] border-zinc-100 p-0 sm:max-w-[500px]">
        <div className="bg-zinc-900 px-8 py-10 text-white">
          <DialogTitle className="text-3xl font-black tracking-tighter">
            Add New Partner
          </DialogTitle>
          <DialogDescription className="mt-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Enter the details for your new ministry partner
          </DialogDescription>
        </div>

        <div className="p-8">
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    className="col-span-2"
                    inputClassName="h-12 rounded-xl border-transparent bg-zinc-50 font-bold transition-colors focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                    label="Full Name / Org Name"
                    labelClassName="text-[10px] font-black uppercase tracking-widest text-zinc-400"
                    placeholder="Enter name"
                  />
                )}
              </form.AppField>

              <form.AppField name="email">
                {(field) => (
                  <field.TextField
                    inputClassName="h-12 rounded-xl border-transparent bg-zinc-50 font-bold transition-colors focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                    label="Email Address"
                    labelClassName="text-[10px] font-black uppercase tracking-widest text-zinc-400"
                    placeholder="email@example.com"
                    type="email"
                  />
                )}
              </form.AppField>

              <form.AppField name="phone">
                {(field) => (
                  <field.TextField
                    inputClassName="h-12 rounded-xl border-transparent bg-zinc-50 font-bold transition-colors focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                    label="Phone Number"
                    labelClassName="text-[10px] font-black uppercase tracking-widest text-zinc-400"
                    placeholder="(555) 000-0000"
                  />
                )}
              </form.AppField>

              <form.AppField name="type">
                {(field) => (
                  <field.SelectField
                    label="Partner Type"
                    labelClassName="text-[10px] font-black uppercase tracking-widest text-zinc-400"
                    options={PARTNER_TYPE_OPTIONS}
                    placeholder="Select type"
                    triggerClassName="h-12 rounded-xl border-transparent bg-zinc-50 font-bold transition-colors focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                  />
                )}
              </form.AppField>

              <form.AppField name="frequency">
                {(field) => (
                  <field.SelectField
                    label="Giving Frequency"
                    labelClassName="text-[10px] font-black uppercase tracking-widest text-zinc-400"
                    options={PARTNER_FREQUENCY_OPTIONS}
                    placeholder="Select frequency"
                    triggerClassName="h-12 rounded-xl border-transparent bg-zinc-50 font-bold transition-colors focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                  />
                )}
              </form.AppField>

              <form.AppField name="location">
                {(field) => (
                  <field.TextField
                    className="col-span-2"
                    inputClassName="h-12 rounded-xl border-transparent bg-zinc-50 font-bold transition-colors focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
                    label="Location (City, State)"
                    labelClassName="text-[10px] font-black uppercase tracking-widest text-zinc-400"
                    placeholder="Denver, CO"
                  />
                )}
              </form.AppField>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                className="h-12 flex-1 rounded-xl border-zinc-200 text-[10px] font-black uppercase tracking-widest"
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
                    className="h-12 flex-1 rounded-xl bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-zinc-800"
                    disabled={!canSubmit || isSubmitting}
                    type="submit"
                  >
                    {isSubmitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Add Partner"
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
