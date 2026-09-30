"use client";

import { Alert, AlertDescription } from "@asym/ui/components/shadcn/alert";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectControlLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import Link from "next/link";
import { useId, useRef, useState } from "react";

import { supportHubRoutes } from "../../support-hub.routes";

import type {
  SupportQueue,
  SupportTicketPriority,
} from "@asym/database/collections/support-workspace";

interface NewTicketFormProps {
  contacts: {
    email: string;
    id: string;
    name: string;
  }[];
  queues: SupportQueue[];
}

const priorities: SupportTicketPriority[] = ["low", "normal", "high", "urgent"];

export function NewTicketForm({ contacts, queues }: NewTicketFormProps) {
  const pendingActionLabelId = useId();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInFlight = useRef(false);
  const [contactValue, setContactValue] = useState<string | null>(null);
  const [queueValue, setQueueValue] = useState<string | null>(null);
  const [priorityValue, setPriorityValue] =
    useState<SupportTicketPriority>("normal");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionInFlight.current) return;
    const form = event.currentTarget;
    setError(null);
    setSuccess(null);

    const formData = new FormData(form);
    const contactId = String(formData.get("contact") ?? "");
    const contact = contacts.find((item) => item.id === contactId);
    const subject = String(formData.get("subject") ?? "").trim();
    const summary = String(formData.get("summary") ?? "").trim();
    const queueId = String(formData.get("queueId") ?? "");
    const priority = String(formData.get("priority") ?? "");

    if (!contact || !subject || !summary || !queueId || !priority) {
      setError(
        "Contact, subject, support track, priority, and summary are required.",
      );
      return;
    }

    submissionInFlight.current = true;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId,
          contactEmail: contact.email,
          contactName: contact.name,
          priority,
          queueId,
          subject,
          summary,
        }),
      });
      const body = (await response.json()) as { error?: string; id?: string };

      if (!response.ok) {
        setError(body.error ?? "Unable to create support ticket.");
        return;
      }

      setSuccess(`Created ticket ${body.id ?? ""}`.trim());
      form.reset();
    } catch {
      setError("Unable to create support ticket.");
    } finally {
      submissionInFlight.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit}
      onReset={() => {
        setContactValue(null);
        setQueueValue(null);
        setPriorityValue("normal");
      }}
    >
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {success ? (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Select
          items={contacts.map((contact) => ({
            value: contact.id,
            label: contact.name,
          }))}
          value={contactValue}
          onValueChange={(value) => {
            if (value !== null) setContactValue(value);
          }}
          id="support-contact"
          name="contact"
          required
        >
          <SelectControlLabel>Contact</SelectControlLabel>
          <SelectTrigger className="min-h-11 w-full rounded-2xl px-4 py-3">
            <SelectValue placeholder="Select contact" />
          </SelectTrigger>
          <SelectContent>
            {contacts.map((contact) => (
              <SelectItem key={contact.id} value={contact.id}>
                {contact.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="support-subject">Subject</Label>
        <Input
          id="support-subject"
          name="subject"
          placeholder="Briefly describe the support request"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Select
            items={queues.map((queue) => ({
              value: queue.id,
              label: queue.label,
            }))}
            value={queueValue}
            onValueChange={(value) => {
              if (value !== null) setQueueValue(value);
            }}
            id="support-queue"
            name="queueId"
            required
          >
            <SelectControlLabel>Support track</SelectControlLabel>
            <SelectTrigger className="min-h-11 w-full rounded-2xl px-4 py-3">
              <SelectValue placeholder="Select support track" />
            </SelectTrigger>
            <SelectContent>
              {queues.map((queue) => (
                <SelectItem key={queue.id} value={queue.id}>
                  {queue.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Select
            items={priorities.map((priority) => ({
              value: priority,
              label: priority,
            }))}
            value={priorityValue}
            onValueChange={(value) => {
              if (value !== null) setPriorityValue(value);
            }}
            id="support-priority"
            name="priority"
            required
          >
            <SelectControlLabel>Priority</SelectControlLabel>
            <SelectTrigger className="min-h-11 w-full rounded-2xl px-4 py-3 capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="support-summary">Summary</Label>
        <Textarea
          id="support-summary"
          name="summary"
          placeholder="Describe the request and the next best action."
          required
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          aria-labelledby={`${pendingActionLabelId}-10`}
          focusableWhenDisabled={isSubmitting}
          disabled={isSubmitting}
          type="submit"
        >
          <span id={`${pendingActionLabelId}-10`}>
            {isSubmitting ? "Creating..." : "Create ticket"}
          </span>
        </Button>
        <Link
          href={supportHubRoutes.tickets}
          className={buttonVariants({ variant: "outline" })}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
