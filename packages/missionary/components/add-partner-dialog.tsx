"use client";

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

import { addPartner, AddPartnerRefused } from "./add-partner-api";
import {
  createInitialPartnerFormValues,
  partnerSchema,
} from "./add-partner-form-model";
import { useParkedSubmit } from "../hooks/use-parked-submit";

export interface AddPartnerDialogProps {
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

function AddPartnerButton({
  canSubmit,
  isSubmitting,
  formRef,
}: {
  canSubmit: boolean;
  isSubmitting: boolean;
  formRef: React.RefObject<HTMLFormElement | null>;
}) {
  const saveRef = useParkedSubmit({
    formRef,
    disabled: !canSubmit || isSubmitting,
    pending: isSubmitting,
  });
  return (
    <Button
      ref={saveRef}
      aria-busy={isSubmitting}
      disabled={!canSubmit || isSubmitting}
      type="submit"
    >
      {isSubmitting ? (
        <>
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          <span className="sr-only">Adding partner</span>
        </>
      ) : (
        "Add Partner"
      )}
    </Button>
  );
}

export function AddPartnerDialog({
  onSuccess,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AddPartnerDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const formRef = React.useRef<HTMLFormElement>(null);

  const form = useAsymForm({
    defaultValues: createInitialPartnerFormValues(),
    validators: {
      onChange: partnerSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await addPartner(value);

        toast.success("Partner added successfully");
        form.reset(createInitialPartnerFormValues());
        setOpen?.(false);
        onSuccess?.();
      } catch (error: unknown) {
        console.error("Error adding partner:", error);
        // Plain words, never the server's own message (WP2b, AL-2675).
        if (error instanceof AddPartnerRefused && error.status < 502) {
          toast.error("The partner wasn't added.", {
            description:
              "Something went wrong on our side, so nothing was saved. Your details are still in the form.",
          });
        } else {
          toast.error("We couldn't confirm the partner was added.", {
            description:
              "Check your connection, then press Add Partner again with the same details. The partner won't be added twice.",
          });
        }
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
          <DialogTitle>Add partner</DialogTitle>
          <DialogDescription>
            Enter the details for your new ministry partner
          </DialogDescription>
        </DialogHeader>

        <form
          ref={formRef}
          tabIndex={-1}
          className="flex flex-col gap-6 outline-none"
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
                  label="Name"
                  placeholder="Person, family or church"
                />
              )}
            </form.AppField>

            <form.AppField name="email">
              {(field) => (
                <field.TextField
                  label="Email"
                  placeholder="email@example.com"
                  type="email"
                />
              )}
            </form.AppField>

            <form.AppField name="phone">
              {(field) => (
                <field.TextField label="Phone" placeholder="(555) 000-0000" />
              )}
            </form.AppField>

            <form.AppField name="type">
              {(field) => (
                <field.SelectField
                  label="Partner type"
                  options={PARTNER_TYPE_OPTIONS}
                  placeholder="Select type"
                />
              )}
            </form.AppField>

            <form.AppField name="frequency">
              {(field) => (
                <field.SelectField
                  label="Giving frequency"
                  options={PARTNER_FREQUENCY_OPTIONS}
                  placeholder="Select frequency"
                />
              )}
            </form.AppField>

            <form.AppField name="location">
              {(field) => (
                <field.TextField
                  className="sm:col-span-2"
                  label="Location"
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
                <AddPartnerButton
                  canSubmit={canSubmit}
                  isSubmitting={isSubmitting}
                  formRef={formRef}
                />
              )}
            </form.Subscribe>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
