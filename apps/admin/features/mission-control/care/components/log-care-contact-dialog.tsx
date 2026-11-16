"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@asym/ui/components/shadcn/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@asym/ui/components/shadcn/select";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { HeartHandshake } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { useLogCareActivity } from "../hooks/use-care";
import {
  CONTACT_ACTIVITY_TYPES,
  logCareActivityFormSchema,
  type LogCareActivityForm,
} from "../member-care.schemas";
import { ACTIVITY_TYPE_LABELS } from "./care-display";

import type { CarePersonnel } from "../types";

export function LogCareContactDialog({
  personnel,
}: {
  personnel: CarePersonnel;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<LogCareActivityForm["type"]>("Check-in");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fieldId = useId();
  const log = useLogCareActivity();
  const parsed = logCareActivityFormSchema.safeParse({ type, content });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        <HeartHandshake aria-hidden="true" />
        Log contact
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log contact</DialogTitle>
          <DialogDescription>
            Record contact with{" "}
            {personnel.nameMissing ? "this member" : personnel.name}. Choose the
            contact type so it updates the matching schedule. You’ll see it in
            Activity and Last contact after saving.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!parsed.success || log.isPending) return;
            setError(null);
            try {
              await log.mutateAsync({
                personnelId: personnel.id,
                ...parsed.data,
              });
              toast.success(
                `${ACTIVITY_TYPE_LABELS[type]} logged for ${personnel.nameMissing ? "this member" : personnel.name}`,
              );
              setOpen(false);
              setContent("");
            } catch {
              setError(
                "The contact could not be logged. Your note is kept; try again.",
              );
            }
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${fieldId}-type`}>Contact type</label>
            <Select<LogCareActivityForm["type"]>
              disabled={log.isPending}
              value={type}
              items={ACTIVITY_TYPE_LABELS}
              onValueChange={(value) => value && setType(value)}
            >
              <SelectTrigger id={`${fieldId}-type`} aria-label="Contact type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_ACTIVITY_TYPES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {ACTIVITY_TYPE_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${fieldId}-note`}>Contact note</label>
            <Textarea
              id={`${fieldId}-note`}
              disabled={log.isPending}
              placeholder="What did you discuss, and what needs a follow-up?"
              value={content}
              maxLength={2000}
              onChange={(event) => setContent(event.target.value)}
              required
              rows={4}
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={log.isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={log.isPending || !parsed.success}>
              {log.isPending ? "Logging…" : "Log contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
