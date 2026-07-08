"use client";

import { useAsymForm } from "@asym/ui/components/primitives/tanstack-form";
import { Badge } from "@asym/ui/components/shadcn/badge";
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
  FieldContent,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { cn } from "@asym/ui/lib/utils";
import {
  CircleAlert,
  CircleCheck,
  HandCoins,
  LoaderCircle,
  Receipt,
} from "lucide-react";
import { useState } from "react";

import {
  INITIAL_OFFLINE_GIFT_FORM_VALUES,
  OFFLINE_METHOD_OPTIONS_KNOWN,
  OFFLINE_METHOD_OPTIONS_UNKNOWN,
  OFFLINE_RECEIPT_STATUS_DISPLAY,
  offlineGiftFormSchema,
  previewOfflineReceiptStatus,
  toOfflineContributionRequest,
  type OfflineGiftFormValues,
} from "./offline-gift-form-model";

const LABEL_CLASS =
  "text-[9px] font-bold uppercase tracking-widest text-muted-foreground";

interface OfflineGiftEntryResult {
  contributionId: string;
  receiptStatus: keyof typeof OFFLINE_RECEIPT_STATUS_DISPLAY;
  donorIdentityStatus: "known" | "unknown_offline";
}

interface OfflineGiftEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a gift is recorded so the hub can refresh its list. */
  onRecorded?: (result: OfflineGiftEntryResult) => void;
}

export function OfflineGiftEntryDialog({
  open,
  onOpenChange,
  onRecorded,
}: OfflineGiftEntryDialogProps) {
  // Re-mount the form each time the dialog opens so state never leaks between
  // entries (matches the task-form pattern).
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-[560px]">
        {open ? (
          <OfflineGiftEntryForm
            onClose={() => onOpenChange(false)}
            onRecorded={onRecorded}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function OfflineGiftEntryForm({
  onClose,
  onRecorded,
}: {
  onClose: () => void;
  onRecorded?: (result: OfflineGiftEntryResult) => void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [recorded, setRecorded] = useState<OfflineGiftEntryResult | null>(null);

  const form = useOfflineGiftForm({
    onError: setSubmitError,
    onBeforeSubmit: () => setSubmitError(null),
    onRecorded: (result) => {
      setRecorded(result);
      onRecorded?.(result);
    },
  });

  if (recorded) {
    return (
      <OfflineGiftEntrySuccess
        result={recorded}
        onClose={onClose}
        onAddAnother={() => {
          setRecorded(null);
          setSubmitError(null);
          form.reset();
        }}
      />
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <DialogHeader className="space-y-1 border-b border-border px-6 pt-6 pb-4">
        <DialogTitle className="flex items-center gap-2 text-base">
          <HandCoins className="size-4 text-muted-foreground" />
          Enter offline gift
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Record a cash, check, or stock gift received outside the online flow.
          No card is charged.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5 px-6 py-5">
        <form.Subscribe
          selector={(state) => ({
            donorMode: state.values.donorMode,
            createNewDonor: state.values.createNewDonor,
            designationType: state.values.designationType,
            receiptRequested: state.values.receiptRequested,
          })}
        >
          {({
            donorMode,
            createNewDonor,
            designationType,
            receiptRequested,
          }) => (
            <>
              <ModeToggle
                value={donorMode}
                onChange={(mode) => {
                  form.setFieldValue("donorMode", mode);
                  if (mode === "unknown_offline") {
                    form.setFieldValue("method", "cash");
                  }
                }}
              />

              {donorMode === "known" ? (
                <DonorSection
                  form={form}
                  createNewDonor={createNewDonor}
                  onToggleCreate={(next) =>
                    form.setFieldValue("createNewDonor", next)
                  }
                />
              ) : (
                <p
                  className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground"
                  role="note"
                >
                  Anonymous offline gift — no donor identity is stored, and no
                  tax receipt can be issued.
                </p>
              )}

              <GiftFactsSection form={form} donorMode={donorMode} />

              <DesignationSection
                form={form}
                designationType={designationType}
              />

              {donorMode === "known" ? <KnownGiftOptions form={form} /> : null}

              <OptionalMetaSection form={form} />

              <ReceiptStatusPreview
                status={previewOfflineReceiptStatus({
                  ...INITIAL_OFFLINE_GIFT_FORM_VALUES,
                  donorMode,
                  receiptRequested,
                })}
              />
            </>
          )}
        </form.Subscribe>

        {submitError ? (
          <div
            aria-live="assertive"
            className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        ) : null}
      </div>

      <DialogFooter className="gap-2 border-t border-border px-6 py-4 sm:gap-2">
        <Button onClick={onClose} type="button" variant="outline">
          Cancel
        </Button>
        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button disabled={!canSubmit || isSubmitting} type="submit">
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Recording…
                </>
              ) : (
                "Record gift"
              )}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
}

interface UseOfflineGiftFormHandlers {
  onBeforeSubmit: () => void;
  onError: (message: string) => void;
  onRecorded: (result: OfflineGiftEntryResult) => void;
}

/**
 * Concrete form hook (mirrors the tasks `useTaskForm` pattern) so the resolved
 * TanStack Form type flows into the field render props — sub-sections receive a
 * fully-typed `form`, not `any`.
 */
function useOfflineGiftForm(handlers: UseOfflineGiftFormHandlers) {
  return useAsymForm({
    defaultValues: INITIAL_OFFLINE_GIFT_FORM_VALUES,
    validators: { onChange: offlineGiftFormSchema },
    onSubmit: async ({ value }: { value: OfflineGiftFormValues }) => {
      handlers.onBeforeSubmit();
      const response = await fetch("/api/admin/contributions/offline", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(toOfflineContributionRequest(value)),
      });
      const payload = (await response.json().catch(() => null)) as {
        result?: OfflineGiftEntryResult;
        error?: string;
      } | null;

      if (!response.ok || !payload?.result) {
        handlers.onError(
          payload?.error ??
            "We couldn't record this gift. Please review the details and try again.",
        );
        return;
      }

      handlers.onRecorded(payload.result);
    },
  });
}

type OfflineForm = ReturnType<typeof useOfflineGiftForm>;

function ModeToggle({
  value,
  onChange,
}: {
  value: OfflineGiftFormValues["donorMode"];
  onChange: (mode: OfflineGiftFormValues["donorMode"]) => void;
}) {
  const options: {
    mode: OfflineGiftFormValues["donorMode"];
    label: string;
    hint: string;
  }[] = [
    {
      mode: "known",
      label: "Known donor",
      hint: "Staff has the donor's identity",
    },
    {
      mode: "unknown_offline",
      label: "Unknown / anonymous",
      hint: "Cash gift with no donor",
    },
  ];

  return (
    <fieldset>
      <legend className={cn(LABEL_CLASS, "mb-2")}>Donor</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup">
        {options.map((option) => {
          const active = option.mode === value;
          return (
            <button
              aria-checked={active}
              className={cn(
                "flex flex-col items-start rounded-xl border px-3 py-2.5 text-left transition-colors",
                active
                  ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                  : "border-border bg-card hover:bg-accent",
              )}
              key={option.mode}
              onClick={() => onChange(option.mode)}
              role="radio"
              type="button"
            >
              <span className="text-sm font-medium text-foreground">
                {option.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {option.hint}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function DonorSection({
  form,
  createNewDonor,
  onToggleCreate,
}: {
  form: OfflineForm;
  createNewDonor: boolean;
  onToggleCreate: (next: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <SegBtn active={createNewDonor} onClick={() => onToggleCreate(true)}>
          New donor
        </SegBtn>
        <SegBtn active={!createNewDonor} onClick={() => onToggleCreate(false)}>
          Existing donor
        </SegBtn>
      </div>

      {createNewDonor ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <form.AppField name="firstName">
            {(field) => (
              <field.TextField
                inputClassName="rounded-xl text-sm"
                label="First name *"
                labelClassName={LABEL_CLASS}
                placeholder="Ada"
              />
            )}
          </form.AppField>
          <form.AppField name="lastName">
            {(field) => (
              <field.TextField
                inputClassName="rounded-xl text-sm"
                label="Last name *"
                labelClassName={LABEL_CLASS}
                placeholder="Lovelace"
              />
            )}
          </form.AppField>
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                className="sm:col-span-2"
                inputClassName="rounded-xl text-sm"
                label="Email (optional)"
                labelClassName={LABEL_CLASS}
                placeholder="donor@example.org"
                type="email"
              />
            )}
          </form.AppField>
        </div>
      ) : (
        <form.AppField name="donorId">
          {(field) => (
            <field.TextField
              description="Paste an existing donor's ID. A searchable donor picker lands with the Gate-8 data wiring."
              inputClassName="rounded-xl text-sm"
              label="Existing donor ID *"
              labelClassName={LABEL_CLASS}
              placeholder="donor UUID"
            />
          )}
        </form.AppField>
      )}
    </div>
  );
}

function GiftFactsSection({
  form,
  donorMode,
}: {
  form: OfflineForm;
  donorMode: OfflineGiftFormValues["donorMode"];
}) {
  const methodOptions =
    donorMode === "unknown_offline"
      ? OFFLINE_METHOD_OPTIONS_UNKNOWN
      : OFFLINE_METHOD_OPTIONS_KNOWN;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <form.AppField name="amount">
        {(field) => (
          <field.TextField
            inputClassName="rounded-xl text-sm"
            inputMode="decimal"
            label="Amount (USD) *"
            labelClassName={LABEL_CLASS}
            placeholder="0.00"
            type="number"
          />
        )}
      </form.AppField>
      <form.AppField name="receivedDate">
        {(field) => (
          <field.TextField
            inputClassName="rounded-xl text-sm"
            label="Received date *"
            labelClassName={LABEL_CLASS}
            type="date"
          />
        )}
      </form.AppField>
      <form.AppField name="method">
        {(field) => (
          <field.SelectField
            className="sm:col-span-2"
            label="Method *"
            labelClassName={LABEL_CLASS}
            options={methodOptions.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            placeholder="Select method"
            triggerClassName="rounded-xl text-sm"
          />
        )}
      </form.AppField>
    </div>
  );
}

function DesignationSection({
  form,
  designationType,
}: {
  form: OfflineForm;
  designationType: OfflineGiftFormValues["designationType"];
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <SegBtn
          active={designationType === "fund"}
          onClick={() => form.setFieldValue("designationType", "fund")}
        >
          Fund
        </SegBtn>
        <SegBtn
          active={designationType === "missionary"}
          onClick={() => form.setFieldValue("designationType", "missionary")}
        >
          Missionary
        </SegBtn>
      </div>

      {designationType === "fund" ? (
        <form.AppField name="fundId">
          {(field) => (
            <field.TextField
              inputClassName="rounded-xl text-sm"
              label="Fund *"
              labelClassName={LABEL_CLASS}
              placeholder="fund ID"
            />
          )}
        </form.AppField>
      ) : (
        <form.AppField name="missionaryId">
          {(field) => (
            <field.TextField
              inputClassName="rounded-xl text-sm"
              label="Missionary *"
              labelClassName={LABEL_CLASS}
              placeholder="missionary ID"
            />
          )}
        </form.AppField>
      )}
    </div>
  );
}

function KnownGiftOptions({ form }: { form: OfflineForm }) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
      <form.AppField name="receiptRequested">
        {(field) => (
          <field.SwitchField
            label="Donor requested a tax receipt"
            labelClassName="text-sm font-medium"
            orientation="horizontal"
          />
        )}
      </form.AppField>
      <form.AppField name="anonymousToRecipient">
        {(field) => (
          <field.SwitchField
            label="Hide donor identity from the missionary"
            labelClassName="text-sm font-medium"
            orientation="horizontal"
          />
        )}
      </form.AppField>
      <form.AppField name="anonymousToPublic">
        {(field) => (
          <field.SwitchField
            label="Hide donor identity from public reports"
            labelClassName="text-sm font-medium"
            orientation="horizontal"
          />
        )}
      </form.AppField>
    </div>
  );
}

function OptionalMetaSection({ form }: { form: OfflineForm }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      <form.AppField name="referenceNumber">
        {(field) => (
          <field.TextField
            inputClassName="rounded-xl text-sm"
            label="Check / reference number (optional)"
            labelClassName={LABEL_CLASS}
            placeholder="e.g. chk-4021"
          />
        )}
      </form.AppField>
      <form.AppField name="internalNote">
        {(field) => (
          <field.TextareaField
            inputClassName="min-h-[64px] resize-none rounded-xl text-sm"
            label="Internal note (optional)"
            labelClassName={LABEL_CLASS}
            placeholder="Not shown to the donor"
          />
        )}
      </form.AppField>
    </div>
  );
}

function ReceiptStatusPreview({
  status,
}: {
  status: keyof typeof OFFLINE_RECEIPT_STATUS_DISPLAY;
}) {
  const display = OFFLINE_RECEIPT_STATUS_DISPLAY[status];
  return (
    <Field data-slot="receipt-preview">
      <FieldLabel className={LABEL_CLASS}>
        <Receipt className="mr-1 inline size-3" /> Receipt status
      </FieldLabel>
      <FieldContent>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={cn("gap-1", display.className)} variant="outline">
            {display.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {display.description}
          </span>
        </div>
      </FieldContent>
    </Field>
  );
}

function OfflineGiftEntrySuccess({
  result,
  onClose,
  onAddAnother,
}: {
  result: OfflineGiftEntryResult;
  onClose: () => void;
  onAddAnother: () => void;
}) {
  const display = OFFLINE_RECEIPT_STATUS_DISPLAY[result.receiptStatus];
  return (
    <div className="px-6 py-8" role="status">
      <div className="flex flex-col items-center text-center">
        <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
          <CircleCheck className="size-6" />
        </span>
        <h2 className="text-base font-semibold text-foreground">
          Gift recorded
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Contribution{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            {result.contributionId}
          </code>{" "}
          was added.
        </p>
        <Badge
          className={cn("mt-3 gap-1", display.className)}
          variant="outline"
        >
          {display.label}
        </Badge>
      </div>
      <DialogFooter className="mt-6 gap-2 sm:gap-2">
        <Button onClick={onAddAnother} type="button" variant="outline">
          Enter another
        </Button>
        <Button onClick={onClose} type="button">
          Done
        </Button>
      </DialogFooter>
    </div>
  );
}

function SegBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={cn(
        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-accent",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
