"use client";

import { normalizesToNothing } from "@asym/api/admin/workers/safety-text";
import { Button } from "@asym/ui/components/shadcn/button";
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
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import {
  RadioGroup,
  RadioGroupItem,
} from "@asym/ui/components/shadcn/radio-group";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { useId, useState, type ReactNode } from "react";

import {
  useModerationActions,
  type ModerationPost,
  type PublicationMode,
} from "./use-moderation-feed";

const REASON_MAX = 500;

function useSubmit() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async (action: () => Promise<string | null>) => {
    if (pending) return false;
    setPending(true);
    setError(null);
    const refusal = await action();
    setPending(false);
    setError(refusal);
    return refusal === null;
  };
  return { pending, error, setError, run };
}

function ReasonDialog({
  trigger,
  triggerLabel,
  title,
  description,
  submitLabel,
  onSubmit,
  children,
  canSubmit = true,
  onOpen,
}: {
  trigger: string;
  triggerLabel: string;
  title: string;
  description: string;
  submitLabel: string;
  onSubmit: (reason: string) => Promise<string | null>;
  children?: ReactNode;
  canSubmit?: boolean;
  onOpen?: () => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const submit = useSubmit();
  const ready = canSubmit && !normalizesToNothing(reason);
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (submit.pending) return;
        if (next) {
          setReason("");
          submit.setError(null);
          onOpen?.();
        }
        setOpen(next);
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" aria-label={triggerLabel}>
            {trigger}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!ready) return;
            void submit
              .run(() => onSubmit(reason))
              .then((done) => {
                if (done) setOpen(false);
              });
          }}
        >
          {children}
          <Field>
            <FieldLabel htmlFor={`${id}-reason`}>Reason</FieldLabel>
            <Textarea
              id={`${id}-reason`}
              value={reason}
              maxLength={REASON_MAX}
              rows={3}
              required
              disabled={submit.pending}
              onChange={(event) => setReason(event.target.value)}
            />
          </Field>
          {submit.error ? (
            <p role="alert" className="text-sm text-destructive">
              {submit.error}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submit.pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submit.pending || !ready}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function UpdateReviewActions({
  post,
  name,
}: {
  post: ModerationPost;
  name: string;
}) {
  const { review } = useModerationActions();
  const approve = useSubmit();
  if (post.status !== "published") return null;
  if (post.review_state === "submitted")
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            aria-label={`Approve ${name}`}
            disabled={approve.pending}
            onClick={() => void approve.run(() => review(post, "approve"))}
          >
            Approve
          </Button>
          <ReasonDialog
            trigger="Don’t approve"
            triggerLabel={`Don’t approve ${name}`}
            title={`Don’t approve “${name}”`}
            description="The update stays off every feed but its author’s and a reviewer’s. Its author sees your reason."
            submitLabel="Don’t approve"
            onSubmit={(reason) => review(post, "reject", reason)}
          />
        </div>
        {approve.error ? (
          <p role="alert" className="text-sm text-destructive">
            {approve.error}
          </p>
        ) : null}
      </div>
    );
  if (post.review_state === "approved")
    return (
      <ReasonDialog
        trigger="Withdraw"
        triggerLabel={`Withdraw ${name}`}
        title={`Withdraw “${name}”`}
        description="The update leaves every feed but its author’s and a reviewer’s at the next request. Its author sees your reason."
        submitLabel="Withdraw update"
        onSubmit={(reason) => review(post, "withdraw", reason)}
      />
    );
  return null;
}

export function PublicationPolicyDialog({
  ministryAssignmentId,
  author,
  mode,
}: {
  ministryAssignmentId: string;
  author: string;
  mode: PublicationMode;
}) {
  const id = useId();
  const { setPolicy } = useModerationActions();
  const [choice, setChoice] = useState<PublicationMode>(mode);
  return (
    <ReasonDialog
      trigger="Publication policy"
      triggerLabel={`Publication policy for ${author}`}
      title={`Publication policy for ${author}`}
      description="Choose whether this missionary’s updates wait for someone else to approve them."
      submitLabel="Save policy"
      onOpen={() => setChoice(mode)}
      onSubmit={(reason) =>
        setPolicy({
          ministryAssignmentId,
          path: "update",
          mode: choice,
          reason,
        })
      }
    >
      <RadioGroup
        aria-label="Updates"
        value={choice}
        onValueChange={(next) =>
          setChoice(next === "automatic" ? "automatic" : "review")
        }
      >
        <Field orientation="horizontal">
          <RadioGroupItem id={`${id}-review`} value="review" />
          <FieldContent>
            <FieldLabel htmlFor={`${id}-review`}>
              Review each update first
            </FieldLabel>
          </FieldContent>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem id={`${id}-automatic`} value="automatic" />
          <FieldContent>
            <FieldLabel htmlFor={`${id}-automatic`}>
              Publish without review
            </FieldLabel>
          </FieldContent>
        </Field>
      </RadioGroup>
    </ReasonDialog>
  );
}
