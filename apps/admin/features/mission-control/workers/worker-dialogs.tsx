"use client";

import { normalizesToNothing } from "@asym/api/admin/workers/safety-text";
import { Button } from "@asym/ui/components/shadcn/button";
import { Checkbox } from "@asym/ui/components/shadcn/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  RadioGroup,
  RadioGroupItem,
} from "@asym/ui/components/shadcn/radio-group";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { useId, useRef, useState, type ReactNode } from "react";

import {
  DO_NOT_PUBLISH_NOTE,
  REASON_GUIDANCE,
  RestrictionEffects,
} from "./worker-display";
import {
  LEVEL_LABELS,
  SECURITY_LEVELS,
  WorkerRequestError,
  revealWorkerIdentity,
  useCreateWorker,
  useInviteWorker,
  useWorkerLegalEntities,
  useWorkerCommand,
  type CreateWorkerBody,
  type RevealedIdentity,
  type SecurityLevel,
  type Worker,
  type WorkerCommand,
  type WorkerInvitation,
  type WorkerLegalEntity,
} from "./workers-api";
import {
  formatInvitationAddress,
  invitationAddressLabel,
} from "../invitations/invitation-address";

const REASON_MAX = 500;
const FAILURE_TEXT = "Something went wrong. Nothing was changed.";
const REASON_MISSING = "Give a reason.";
const ALIAS_MISSING = "A restricted or high-risk worker needs a public alias.";
const NOTHING_CHOSEN = "Choose what to change.";
const DISPLAY_NAME_MISSING = "Give a display name.";
const LEGAL_NAME_MISSING = "Give the worker's legal name.";
const NAME_MAX = 200;
const EMAIL_INVALID = "Give a valid e-mail address.";
const ENTITY_MISSING = "Choose the legal entity this worker serves under.";
const ENTITY_REFUSALS = new Set([
  "LEGAL_ENTITY_REQUIRED",
  "LEGAL_ENTITY_NOT_FOUND",
]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldName =
  | "reason"
  | "alias"
  | "level"
  | "displayName"
  | "legalName"
  | "email"
  | "legalEntity";
type Problem = { field: FieldName; message: string; focus: string };

function useFieldErrors() {
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const check = (problems: Problem[]) => {
    setErrors(
      Object.fromEntries(
        problems.map((problem) => [problem.field, problem.message]),
      ),
    );
    const first = problems[0];
    if (first) document.getElementById(first.focus)?.focus();
    return problems.length === 0;
  };
  const clear = (field: FieldName) =>
    setErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  return { errors, check, clear, reset: () => setErrors({}) };
}

const reasonProblem = (reason: string, id: string): Problem[] =>
  normalizesToNothing(reason)
    ? [{ field: "reason", message: REASON_MISSING, focus: id }]
    : [];

function messageOf(error: unknown) {
  return error instanceof WorkerRequestError ? error.message : FAILURE_TEXT;
}

function useLatchedSubmit() {
  const inFlightRef = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async (action: () => Promise<void>) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setPending(true);
    setError(null);
    try {
      await action();
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      inFlightRef.current = false;
      setPending(false);
    }
  };
  return { inFlightRef, pending, error, setError, run };
}

function ReasonField({
  id,
  value,
  onChange,
  disabled,
  error,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  error?: string;
}) {
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>Reason</FieldLabel>
      <Textarea
        id={id}
        value={value}
        maxLength={REASON_MAX}
        rows={3}
        required
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${id}-guidance ${id}-error` : `${id}-guidance`
        }
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldDescription id={`${id}-guidance`}>
        {REASON_GUIDANCE}
      </FieldDescription>
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </Field>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  disabled,
  maxLength,
  description,
  error,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  maxLength: number;
  description?: string;
  error?: string;
  type?: "text" | "email";
}) {
  const describedBy = [
    description ? `${id}-help` : null,
    error ? `${id}-error` : null,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type={type}
        value={value}
        maxLength={maxLength}
        autoComplete="off"
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {description ? (
        <FieldDescription id={`${id}-help`}>{description}</FieldDescription>
      ) : null}
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </Field>
  );
}

function ActionDialog({
  trigger,
  triggerLabel,
  triggerVariant = "outline",
  title,
  description,
  submitLabel,
  pending,
  error,
  open,
  onOpenChange,
  onSubmit,
  footer,
  children,
}: {
  trigger: string;
  triggerLabel: string;
  triggerVariant?: "outline" | "default";
  title: string;
  description?: ReactNode;
  submitLabel: string;
  pending: boolean;
  error: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && pending) return;
        onOpenChange(next);
      }}
    >
      <DialogTrigger
        render={
          <Button variant={triggerVariant} size="sm" aria-label={triggerLabel}>
            {trigger}
          </Button>
        }
      />
      <DialogContent scrollable className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (!pending) onSubmit();
          }}
        >
          {children}
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            {footer ?? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {submitLabel}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function useCommandDialog(worker: Worker) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const latch = useLatchedSubmit();
  const fields = useFieldErrors();
  const command = useWorkerCommand(worker.assignmentId);
  const send = (next: WorkerCommand) =>
    latch.run(async () => {
      await command.mutateAsync(next);
      setOpen(false);
      setReason("");
    });
  const openChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      latch.setError(null);
      setReason("");
    }
    fields.reset();
  };
  const changeReason = (next: string) => {
    setReason(next);
    fields.clear("reason");
  };
  return {
    open,
    openChange,
    reason,
    setReason: changeReason,
    latch,
    send,
    fields,
  };
}

function LevelChoice({
  id,
  levels,
  value,
  onChange,
  disabled,
  legend,
  error,
}: {
  id: string;
  levels: readonly SecurityLevel[];
  value: SecurityLevel | null;
  onChange: (level: SecurityLevel) => void;
  disabled: boolean;
  legend: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p id={`${id}-legend`} className="text-sm font-medium">
        {legend}
      </p>
      <RadioGroup
        aria-labelledby={`${id}-legend`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        disabled={disabled}
        value={value ?? ""}
        onValueChange={(next) => {
          const level = SECURITY_LEVELS.find((candidate) => candidate === next);
          if (level) onChange(level);
        }}
      >
        {levels.map((level) => (
          <Field key={level} orientation="horizontal">
            <RadioGroupItem id={`${id}-${level}`} value={level} />
            <FieldContent>
              <FieldLabel htmlFor={`${id}-${level}`}>
                {LEVEL_LABELS[level]}
              </FieldLabel>
            </FieldContent>
          </Field>
        ))}
      </RadioGroup>
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </div>
  );
}

export function ConfirmLevelDialog({ worker }: { worker: Worker }) {
  const id = useId();
  const dialog = useCommandDialog(worker);
  return (
    <ActionDialog
      trigger="Confirm level"
      triggerLabel={`Confirm level for ${worker.displayName}`}
      title={`Confirm ${worker.displayName}'s security level`}
      description={`The level stays ${LEVEL_LABELS[worker.securityLevel]}. Confirming marks it reviewed.`}
      submitLabel={dialog.latch.pending ? "Confirming…" : "Confirm level"}
      pending={dialog.latch.pending}
      error={dialog.latch.error}
      open={dialog.open}
      onOpenChange={dialog.openChange}
      onSubmit={() => {
        if (!dialog.fields.check(reasonProblem(dialog.reason, `${id}-reason`)))
          return;
        void dialog.send({
          kind: "confirm",
          body: { level: worker.securityLevel, reason: dialog.reason },
        });
      }}
    >
      <ReasonField
        id={`${id}-reason`}
        value={dialog.reason}
        onChange={dialog.setReason}
        disabled={dialog.latch.pending}
        error={dialog.fields.errors.reason}
      />
    </ActionDialog>
  );
}

export function RestrictDialog({ worker }: { worker: Worker }) {
  const id = useId();
  const dialog = useCommandDialog(worker);
  const levels = SECURITY_LEVELS.slice(
    SECURITY_LEVELS.indexOf(worker.securityLevel),
  );
  const [choice, setChoice] = useState<{
    level: SecurityLevel;
    basis: SecurityLevel;
  }>({ level: worker.securityLevel, basis: worker.securityLevel });
  const level =
    choice.basis === worker.securityLevel && levels.includes(choice.level)
      ? choice.level
      : worker.securityLevel;
  const choose = (next: SecurityLevel) =>
    setChoice({ level: next, basis: worker.securityLevel });
  const [alias, setAlias] = useState("");
  const [doNotPublish, setDoNotPublish] = useState(false);
  const needsAlias =
    (level === "restricted" || level === "high_risk") &&
    !worker.publicAlias &&
    normalizesToNothing(alias);
  const openChange = (next: boolean) => {
    if (next) {
      choose(worker.securityLevel);
      setAlias("");
      setDoNotPublish(false);
    }
    dialog.openChange(next);
  };
  return (
    <ActionDialog
      trigger="Restrict"
      triggerLabel={`Restrict ${worker.displayName}`}
      title={`Restrict ${worker.displayName}`}
      submitLabel={dialog.latch.pending ? "Saving…" : "Restrict"}
      pending={dialog.latch.pending}
      error={dialog.latch.error}
      open={dialog.open}
      onOpenChange={openChange}
      onSubmit={() => {
        const problems: Problem[] = [
          ...(needsAlias
            ? [
                {
                  field: "alias" as const,
                  message: ALIAS_MISSING,
                  focus: `${id}-alias`,
                },
              ]
            : []),
          ...reasonProblem(dialog.reason, `${id}-reason`),
        ];
        if (!dialog.fields.check(problems)) return;
        void dialog.send({
          kind: "restrict",
          body: {
            ...(level !== worker.securityLevel ? { level } : {}),
            ...(normalizesToNothing(alias) ? {} : { alias }),
            ...(doNotPublish ? { doNotPublish: true as const } : {}),
            reason: dialog.reason,
          },
        });
      }}
    >
      <LevelChoice
        id={`${id}-level`}
        legend="Level"
        levels={levels}
        value={level}
        onChange={choose}
        disabled={dialog.latch.pending}
      />
      <Field data-invalid={dialog.fields.errors.alias ? true : undefined}>
        <FieldLabel htmlFor={`${id}-alias`}>Public alias</FieldLabel>
        <Input
          id={`${id}-alias`}
          value={alias}
          maxLength={200}
          autoComplete="off"
          disabled={dialog.latch.pending}
          aria-invalid={dialog.fields.errors.alias ? true : undefined}
          aria-describedby={
            dialog.fields.errors.alias
              ? `${id}-alias-help ${id}-alias-error`
              : `${id}-alias-help`
          }
          onChange={(event) => {
            setAlias(event.target.value);
            dialog.fields.clear("alias");
          }}
        />
        <FieldDescription id={`${id}-alias-help`}>
          {worker.publicAlias
            ? `Leave empty to keep ${worker.publicAlias}.`
            : "Required for a restricted or high-risk worker."}
        </FieldDescription>
        {dialog.fields.errors.alias ? (
          <FieldError id={`${id}-alias-error`}>
            {dialog.fields.errors.alias}
          </FieldError>
        ) : null}
      </Field>
      {worker.doNotPublish ? null : (
        <Field orientation="horizontal">
          <Checkbox
            id={`${id}-dnp`}
            checked={doNotPublish}
            disabled={dialog.latch.pending}
            aria-describedby={`${id}-dnp-note`}
            onCheckedChange={(checked) => setDoNotPublish(checked === true)}
          />
          <FieldContent>
            <FieldLabel htmlFor={`${id}-dnp`}>Do not publish</FieldLabel>
            <FieldDescription id={`${id}-dnp-note`}>
              {DO_NOT_PUBLISH_NOTE}
            </FieldDescription>
          </FieldContent>
        </Field>
      )}
      <RestrictionEffects />
      <ReasonField
        id={`${id}-reason`}
        value={dialog.reason}
        onChange={dialog.setReason}
        disabled={dialog.latch.pending}
        error={dialog.fields.errors.reason}
      />
    </ActionDialog>
  );
}

export function LiftDialog({ worker }: { worker: Worker }) {
  const id = useId();
  const dialog = useCommandDialog(worker);
  const levels = SECURITY_LEVELS.slice(
    0,
    SECURITY_LEVELS.indexOf(worker.securityLevel),
  );
  const [choice, setChoice] = useState<{
    level: SecurityLevel | null;
    basis: SecurityLevel;
  }>({ level: null, basis: worker.securityLevel });
  const level =
    choice.basis === worker.securityLevel &&
    choice.level !== null &&
    levels.includes(choice.level)
      ? choice.level
      : null;
  const [clear, setClear] = useState(false);
  const openChange = (next: boolean) => {
    if (next) {
      setChoice({ level: null, basis: worker.securityLevel });
      setClear(false);
    }
    dialog.openChange(next);
  };
  return (
    <ActionDialog
      trigger="Lift restriction"
      triggerLabel={`Lift restriction for ${worker.displayName}`}
      title={`Lift ${worker.displayName}'s restriction`}
      submitLabel={dialog.latch.pending ? "Saving…" : "Lift restriction"}
      pending={dialog.latch.pending}
      error={dialog.latch.error}
      open={dialog.open}
      onOpenChange={openChange}
      onSubmit={() => {
        const firstLevel = levels[0];
        const problems: Problem[] = [
          ...(level === null && !clear
            ? [
                {
                  field: "level" as const,
                  message: NOTHING_CHOSEN,
                  focus: firstLevel
                    ? `${id}-level-${firstLevel}`
                    : `${id}-clear`,
                },
              ]
            : []),
          ...reasonProblem(dialog.reason, `${id}-reason`),
        ];
        if (!dialog.fields.check(problems)) return;
        void dialog.send({
          kind: "lift",
          body: {
            ...(level ? { level } : {}),
            ...(clear ? { clearDoNotPublish: true as const } : {}),
            reason: dialog.reason,
          },
        });
      }}
    >
      {levels.length > 0 ? (
        <LevelChoice
          id={`${id}-level`}
          legend="Lower the level to"
          levels={levels}
          value={level}
          onChange={(next) => {
            setChoice({ level: next, basis: worker.securityLevel });
            dialog.fields.clear("level");
          }}
          disabled={dialog.latch.pending}
          error={dialog.fields.errors.level}
        />
      ) : null}
      {worker.doNotPublish ? (
        <Field orientation="horizontal">
          <Checkbox
            id={`${id}-clear`}
            checked={clear}
            disabled={dialog.latch.pending}
            aria-invalid={
              levels.length === 0 && dialog.fields.errors.level
                ? true
                : undefined
            }
            onCheckedChange={(checked) => {
              setClear(checked === true);
              dialog.fields.clear("level");
            }}
          />
          <FieldContent>
            <FieldLabel htmlFor={`${id}-clear`}>
              Clear do not publish
            </FieldLabel>
            {levels.length === 0 && dialog.fields.errors.level ? (
              <FieldError>{dialog.fields.errors.level}</FieldError>
            ) : null}
          </FieldContent>
        </Field>
      ) : null}
      <ReasonField
        id={`${id}-reason`}
        value={dialog.reason}
        onChange={dialog.setReason}
        disabled={dialog.latch.pending}
        error={dialog.fields.errors.reason}
      />
    </ActionDialog>
  );
}

export function RevealDialog({ worker }: { worker: Worker }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [identity, setIdentity] = useState<RevealedIdentity | null>(null);
  const latch = useLatchedSubmit();
  const fields = useFieldErrors();
  const close = () => {
    setIdentity(null);
    setReason("");
    latch.setError(null);
    fields.reset();
    setOpen(false);
  };
  return (
    <ActionDialog
      trigger="Show legal name"
      triggerLabel={`Show legal name for ${worker.displayName}`}
      title={`Show ${worker.displayName}'s legal name`}
      submitLabel={latch.pending ? "Showing…" : "Show legal name"}
      pending={latch.pending}
      error={latch.error}
      open={open}
      onOpenChange={(next) => (next ? setOpen(true) : close())}
      footer={
        identity ? (
          <Button type="button" onClick={close}>
            Hide
          </Button>
        ) : undefined
      }
      onSubmit={() => {
        if (identity !== null) return;
        if (!fields.check(reasonProblem(reason, `${id}-reason`))) return;
        void latch.run(async () => {
          const revealed = await revealWorkerIdentity(
            worker.assignmentId,
            reason,
          );
          setIdentity(revealed);
        });
      }}
    >
      {identity ? (
        <div
          data-sentry-block
          className="flex flex-col gap-3 rounded-md border p-3"
        >
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex flex-col">
              <dt className="text-muted-foreground">Legal name</dt>
              <dd>{identity.legalName}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-muted-foreground">Country</dt>
              <dd>{identity.realCountry ?? "None"}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-muted-foreground">Location</dt>
              <dd>{identity.preciseLocation ?? "None"}</dd>
            </div>
          </dl>
          <p className="text-xs text-muted-foreground">
            This view is recorded in the audit log.
          </p>
        </div>
      ) : (
        <ReasonField
          id={`${id}-reason`}
          value={reason}
          onChange={(next) => {
            setReason(next);
            fields.clear("reason");
          }}
          disabled={latch.pending}
          error={fields.errors.reason}
        />
      )}
    </ActionDialog>
  );
}

function EntityChoice({
  id,
  entities,
  value,
  onChange,
  disabled,
  error,
}: {
  id: string;
  entities: readonly WorkerLegalEntity[];
  value: string | null;
  onChange: (entity: string) => void;
  disabled: boolean;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p id={`${id}-legend`} className="text-sm font-medium">
        Legal entity
      </p>
      <RadioGroup
        aria-labelledby={`${id}-legend`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        disabled={disabled}
        value={value ?? ""}
        onValueChange={(next) => {
          const entity = entities.find((candidate) => candidate.id === next);
          if (entity) onChange(entity.id);
        }}
      >
        {entities.map((entity) => (
          <Field key={entity.id} orientation="horizontal">
            <RadioGroupItem id={`${id}-${entity.id}`} value={entity.id} />
            <FieldContent>
              <FieldLabel htmlFor={`${id}-${entity.id}`}>
                {entity.name}
              </FieldLabel>
            </FieldContent>
          </Field>
        ))}
      </RadioGroup>
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </div>
  );
}

const NEW_WORKER = {
  displayName: "",
  legalName: "",
  realCountry: "",
  preciseLocation: "",
  alias: "",
};

const filled = (value: string) => !normalizesToNothing(value);

export function CreateWorkerDialog() {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(NEW_WORKER);
  const [level, setLevel] = useState<SecurityLevel | null>(null);
  const [entity, setEntity] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const latch = useLatchedSubmit();
  const fields = useFieldErrors();
  const create = useCreateWorker();
  const entitiesQuery = useWorkerLegalEntities(open);
  const entities = entitiesQuery.data ?? [];
  const choosesEntity = entities.length > 1;
  const firstEntity = entities[0];
  const entityFocus = firstEntity
    ? `${id}-entity-${firstEntity.id}`
    : `${id}-reason`;
  const reset = () => {
    setForm(NEW_WORKER);
    setLevel(null);
    setEntity(null);
    setReason("");
    latch.setError(null);
    fields.reset();
  };
  const edit =
    (key: keyof typeof NEW_WORKER, field?: FieldName) => (value: string) => {
      setForm((current) => ({ ...current, [key]: value }));
      if (field) fields.clear(field);
    };
  const needsAlias =
    (level === "restricted" || level === "high_risk") && !filled(form.alias);
  return (
    <ActionDialog
      trigger="Add worker"
      triggerLabel="Add worker"
      triggerVariant="default"
      title="Add a worker"
      description="The worker has no login. Leave the level unchosen to add them as Standard, waiting for review."
      submitLabel={latch.pending ? "Adding…" : "Add worker"}
      pending={latch.pending}
      error={latch.error}
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        setOpen(next);
      }}
      onSubmit={() => {
        const problems: Problem[] = [
          ...(filled(form.displayName)
            ? []
            : [
                {
                  field: "displayName" as const,
                  message: DISPLAY_NAME_MISSING,
                  focus: `${id}-display`,
                },
              ]),
          ...(filled(form.legalName)
            ? []
            : [
                {
                  field: "legalName" as const,
                  message: LEGAL_NAME_MISSING,
                  focus: `${id}-legal`,
                },
              ]),
          ...(needsAlias
            ? [
                {
                  field: "alias" as const,
                  message: ALIAS_MISSING,
                  focus: `${id}-alias`,
                },
              ]
            : []),
          ...(choosesEntity && entity === null
            ? [
                {
                  field: "legalEntity" as const,
                  message: ENTITY_MISSING,
                  focus: entityFocus,
                },
              ]
            : []),
          ...reasonProblem(reason, `${id}-reason`),
        ];
        if (!fields.check(problems)) return;
        const body: CreateWorkerBody = {
          displayName: form.displayName,
          legalName: form.legalName,
          ...(filled(form.realCountry)
            ? { realCountry: form.realCountry }
            : {}),
          ...(filled(form.preciseLocation)
            ? { preciseLocation: form.preciseLocation }
            : {}),
          ...(level ? { level } : {}),
          ...(filled(form.alias) ? { alias: form.alias } : {}),
          ...(choosesEntity && entity !== null
            ? { legalEntityId: entity }
            : {}),
          reason,
        };
        void latch.run(async () => {
          try {
            await create.mutateAsync(body);
          } catch (caught) {
            if (
              choosesEntity &&
              caught instanceof WorkerRequestError &&
              caught.code !== null &&
              ENTITY_REFUSALS.has(caught.code)
            ) {
              fields.check([
                {
                  field: "legalEntity",
                  message: caught.message,
                  focus: entityFocus,
                },
              ]);
              return;
            }
            throw caught;
          }
          reset();
          setOpen(false);
        });
      }}
    >
      <TextField
        id={`${id}-display`}
        label="Display name"
        value={form.displayName}
        onChange={edit("displayName", "displayName")}
        disabled={latch.pending}
        maxLength={NAME_MAX}
        description="The name staff see in Mission Control."
        error={fields.errors.displayName}
      />
      <div data-sentry-block className="flex flex-col gap-4">
        <TextField
          id={`${id}-legal`}
          label="Legal name"
          value={form.legalName}
          onChange={edit("legalName", "legalName")}
          disabled={latch.pending}
          maxLength={NAME_MAX}
          description="Shown again only through Show legal name, which is recorded."
          error={fields.errors.legalName}
        />
        <TextField
          id={`${id}-country`}
          label="Country (optional)"
          value={form.realCountry}
          onChange={edit("realCountry")}
          disabled={latch.pending}
          maxLength={NAME_MAX}
        />
        <TextField
          id={`${id}-location`}
          label="Precise location (optional)"
          value={form.preciseLocation}
          onChange={edit("preciseLocation")}
          disabled={latch.pending}
          maxLength={REASON_MAX}
        />
      </div>
      {choosesEntity ? (
        <EntityChoice
          id={`${id}-entity`}
          entities={entities}
          value={entity}
          onChange={(next) => {
            setEntity(next);
            fields.clear("legalEntity");
          }}
          disabled={latch.pending}
          error={fields.errors.legalEntity}
        />
      ) : null}
      <LevelChoice
        id={`${id}-level`}
        legend="Security level (optional)"
        levels={SECURITY_LEVELS}
        value={level}
        onChange={(next) => {
          setLevel(next);
          fields.clear("alias");
        }}
        disabled={latch.pending}
      />
      <TextField
        id={`${id}-alias`}
        label="Public alias"
        value={form.alias}
        onChange={edit("alias", "alias")}
        disabled={latch.pending}
        maxLength={NAME_MAX}
        description="Required for a restricted or high-risk worker."
        error={fields.errors.alias}
      />
      <ReasonField
        id={`${id}-reason`}
        value={reason}
        onChange={(next) => {
          setReason(next);
          fields.clear("reason");
        }}
        disabled={latch.pending}
        error={fields.errors.reason}
      />
    </ActionDialog>
  );
}

export function InviteDialog({ worker }: { worker: Worker }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [created, setCreated] = useState<WorkerInvitation | null>(null);
  const [copied, setCopied] = useState(false);
  const latch = useLatchedSubmit();
  const fields = useFieldErrors();
  const invite = useInviteWorker(worker.assignmentId);
  const close = () => {
    setEmail("");
    setReason("");
    setCreated(null);
    setCopied(false);
    latch.setError(null);
    fields.reset();
    setOpen(false);
  };
  const address = created
    ? formatInvitationAddress(
        { role: "missionary", invitePath: created.invitePath },
        typeof window !== "undefined" ? window.location.origin : "",
      )
    : "";
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <ActionDialog
      trigger="Invite to sign in"
      triggerLabel={`Invite to sign in: ${worker.displayName}`}
      title={
        created
          ? "Invitation link created"
          : `Invite ${worker.displayName} to sign in`
      }
      description={
        created
          ? "Share this one-time link with the invited person. It is shown once."
          : "They accept with the account of this address and open their own record, with no claim step."
      }
      submitLabel={latch.pending ? "Creating…" : "Create invitation"}
      pending={latch.pending}
      error={latch.error}
      open={open}
      onOpenChange={(next) => (next ? setOpen(true) : close())}
      footer={
        created ? (
          <>
            <Button type="button" variant="outline" onClick={() => void copy()}>
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button type="button" onClick={close}>
              Done
            </Button>
          </>
        ) : undefined
      }
      onSubmit={() => {
        if (created) return;
        const problems: Problem[] = [
          ...(EMAIL_PATTERN.test(email.trim())
            ? []
            : [
                {
                  field: "email" as const,
                  message: EMAIL_INVALID,
                  focus: `${id}-email`,
                },
              ]),
          ...reasonProblem(reason, `${id}-reason`),
        ];
        if (!fields.check(problems)) return;
        void latch.run(async () => {
          setCreated(await invite.mutateAsync({ email: email.trim(), reason }));
        });
      }}
    >
      {created ? (
        <div data-sentry-block="">
          <Field>
            <FieldLabel htmlFor={`${id}-link`}>
              {invitationAddressLabel("missionary")}
            </FieldLabel>
            <Input
              id={`${id}-link`}
              value={address}
              readOnly
              autoComplete="off"
              data-sentry-mask="true"
              onFocus={(event) => event.currentTarget.select()}
            />
          </Field>
        </div>
      ) : (
        <>
          <TextField
            id={`${id}-email`}
            label="E-mail address"
            type="email"
            value={email}
            onChange={(next) => {
              setEmail(next);
              fields.clear("email");
            }}
            disabled={latch.pending}
            maxLength={320}
            error={fields.errors.email}
          />
          <ReasonField
            id={`${id}-reason`}
            value={reason}
            onChange={(next) => {
              setReason(next);
              fields.clear("reason");
            }}
            disabled={latch.pending}
            error={fields.errors.reason}
          />
        </>
      )}
    </ActionDialog>
  );
}
