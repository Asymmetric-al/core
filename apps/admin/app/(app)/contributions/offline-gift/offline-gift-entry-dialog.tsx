"use client";

import { readJsonBody } from "@asym/lib/http/fetch-result";
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
  FieldLegend,
  FieldTitle,
} from "@asym/ui/components/shadcn/field";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@asym/ui/components/shadcn/toggle-group";
import {
  CircleAlert,
  CircleCheck,
  HandCoins,
  LoaderCircle,
  Receipt,
} from "lucide-react";
import { useId, useEffect, useRef, useState } from "react";
import { z } from "zod";

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

const modeToggleOptions: {
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

const SUBMIT_TIMEOUT_MS = 15_000;
const GENERIC_RECORDING_ERROR =
  "We couldn't record this gift. Please review the details and try again.";

const offlineGiftEntryResultSchema = z.object({
  contributionId: z.string().min(1),
  receiptStatus: z.enum(["pending", "no_receipt_requested", "not_receiptable"]),
  donorIdentityStatus: z.enum(["known", "unknown_offline"]),
});
const offlineGiftEntryResponseSchema = z.object({
  result: offlineGiftEntryResultSchema.optional(),
  error: z.string().optional(),
});

type OfflineGiftEntryResult = z.infer<typeof offlineGiftEntryResultSchema>;

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
      <DialogContent scrollable className="sm:max-w-140">
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
  const pendingActionLabelId = useId();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [recorded, setRecorded] = useState<OfflineGiftEntryResult | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isActiveRef = useRef(true);

  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    };
  }, []);

  const abortInFlightSubmit = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  };

  const handleClose = () => {
    abortInFlightSubmit();
    onClose();
  };

  const form = useOfflineGiftForm({
    clearAbortController: (controller) => {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    },
    createAbortController: () => {
      abortInFlightSubmit();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      return controller;
    },
    onError: (message) => {
      if (isActiveRef.current) {
        setSubmitError(message);
      }
    },
    onBeforeSubmit: () => {
      if (isActiveRef.current) {
        setSubmitError(null);
      }
    },
    onRecorded: (result) => {
      if (isActiveRef.current) {
        setRecorded(result);
        onRecorded?.(result);
      }
    },
  });

  if (recorded) {
    return (
      <OfflineGiftEntrySuccess
        result={recorded}
        onClose={handleClose}
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
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <DialogHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <HandCoins className="size-4 text-muted-foreground" />
          <DialogTitle className="text-base">Enter offline gift</DialogTitle>
        </div>
        <DialogDescription className="text-xs">
          Record a cash, check, or stock gift received outside the online flow.
          No card is charged.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5">
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

      <DialogFooter>
        <Button onClick={handleClose} type="button" variant="outline">
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
              aria-labelledby={`${pendingActionLabelId}-2`}
              focusableWhenDisabled={isSubmitting}
              disabled={!canSubmit || isSubmitting}
              type="submit"
            >
              <span id={`${pendingActionLabelId}-2`} className="sr-only">
                {isSubmitting ? "Recording…" : "Record gift"}
              </span>
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
  clearAbortController: (controller: AbortController) => void;
  createAbortController: () => AbortController;
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
      const controller = handlers.createAbortController();
      let timedOut = false;
      const timeoutId = globalThis.setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, SUBMIT_TIMEOUT_MS);

      try {
        const response = await fetch("/api/admin/contributions/offline", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(toOfflineContributionRequest(value)),
          signal: controller.signal,
        });
        const { ok, body: rawPayload } = await readJsonBody(response);
        const parsedPayload =
          offlineGiftEntryResponseSchema.safeParse(rawPayload);
        const payload = parsedPayload.success ? parsedPayload.data : null;

        if (!ok) {
          handlers.onError(payload?.error ?? GENERIC_RECORDING_ERROR);
          return;
        }

        if (!payload?.result) {
          handlers.onError(GENERIC_RECORDING_ERROR);
          return;
        }

        handlers.onRecorded(payload.result);
      } catch {
        if (controller.signal.aborted) {
          if (timedOut) {
            handlers.onError("Recording timed out. Please try again.");
          }
          return;
        }
        handlers.onError(GENERIC_RECORDING_ERROR);
      } finally {
        globalThis.clearTimeout(timeoutId);
        handlers.clearAbortController(controller);
      }
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
  const hintIdPrefix = useId();
  return (
    <fieldset>
      <FieldLegend variant="label">Donor</FieldLegend>
      <ToggleGroup
        aria-label="Donor mode"
        value={[value]}
        onValueChange={(values) => {
          const next = values[0];
          if (next === "known" || next === "unknown_offline") onChange(next);
        }}
        spacing={2}
        variant="outline"
        className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {modeToggleOptions.map((option) => {
          const hintId = `${hintIdPrefix}-${option.mode}`;
          return (
            <div className="flex flex-col gap-1" key={option.mode}>
              <ToggleGroupItem
                aria-describedby={hintId}
                className="w-full"
                value={option.mode}
                type="button"
              >
                {option.label}
              </ToggleGroupItem>
              <span className="text-xs text-muted-foreground" id={hintId}>
                {option.hint}
              </span>
            </div>
          );
        })}
      </ToggleGroup>
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
      <ToggleGroup
        aria-label="Donor record"
        value={[createNewDonor ? "new" : "existing"]}
        onValueChange={(values) => {
          const next = values[0];
          if (next === "new" || next === "existing") {
            onToggleCreate(next === "new");
          }
        }}
        spacing={2}
        size="sm"
        variant="outline"
      >
        <ToggleGroupItem value="new" type="button">
          New donor
        </ToggleGroupItem>
        <ToggleGroupItem value="existing" type="button">
          Existing donor
        </ToggleGroupItem>
      </ToggleGroup>

      {createNewDonor ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <form.AppField name="firstName">
            {(field) => (
              <field.TextField label="First name *" placeholder="Ada" />
            )}
          </form.AppField>
          <form.AppField name="lastName">
            {(field) => (
              <field.TextField label="Last name *" placeholder="Lovelace" />
            )}
          </form.AppField>
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                className="sm:col-span-2"
                label="Email (optional)"
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
              label="Existing donor ID *"
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
            inputMode="decimal"
            label="Amount (USD) *"
            placeholder="0.00"
            type="number"
          />
        )}
      </form.AppField>
      <form.AppField name="receivedDate">
        {(field) => <field.TextField label="Received date *" type="date" />}
      </form.AppField>
      <form.AppField name="method">
        {(field) => (
          <field.SelectField
            className="sm:col-span-2"
            label="Method *"
            options={methodOptions.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            placeholder="Select method"
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
      <ToggleGroup
        aria-label="Designation type"
        value={[designationType]}
        onValueChange={(values) => {
          const next = values[0];
          if (next === "fund" || next === "missionary") {
            form.setFieldValue("designationType", next);
          }
        }}
        spacing={2}
        size="sm"
        variant="outline"
      >
        <ToggleGroupItem value="fund" type="button">
          Fund
        </ToggleGroupItem>
        <ToggleGroupItem value="missionary" type="button">
          Missionary
        </ToggleGroupItem>
      </ToggleGroup>

      {designationType === "fund" ? (
        <form.AppField name="fundId">
          {(field) => <field.TextField label="Fund *" placeholder="fund ID" />}
        </form.AppField>
      ) : (
        <form.AppField name="missionaryId">
          {(field) => (
            <field.TextField label="Missionary *" placeholder="missionary ID" />
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
            orientation="horizontal"
          />
        )}
      </form.AppField>
      <form.AppField name="anonymousToRecipient">
        {(field) => (
          <field.SwitchField
            label="Hide donor identity from the missionary"
            orientation="horizontal"
          />
        )}
      </form.AppField>
      <form.AppField name="anonymousToPublic">
        {(field) => (
          <field.SwitchField
            label="Hide donor identity from public reports"
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
            label="Check / reference number (optional)"
            placeholder="e.g. chk-4021"
          />
        )}
      </form.AppField>
      <form.AppField name="internalNote">
        {(field) => (
          <field.TextareaField
            label="Internal note (optional)"
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
      <FieldTitle>
        <Receipt className="size-3" /> Receipt status
      </FieldTitle>
      <FieldContent>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={display.badgeVariant}>{display.label}</Badge>
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
    <div className="py-2" role="status">
      <div className="flex flex-col items-center text-center">
        <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
          <CircleCheck className="size-6" />
        </span>
        <DialogTitle className="text-base font-semibold">
          Gift recorded
        </DialogTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Contribution{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            {result.contributionId}
          </code>{" "}
          was added.
        </p>
        <Badge className="mt-3" variant={display.badgeVariant}>
          {display.label}
        </Badge>
      </div>
      <DialogFooter className="mt-6 gap-2 sm:gap-2">
        <Button onClick={onAddAnother} type="button" variant="outline">
          Enter another
        </Button>
        <Button
          aria-label="Close gift confirmation"
          onClick={onClose}
          type="button"
        >
          Close
        </Button>
      </DialogFooter>
    </div>
  );
}
