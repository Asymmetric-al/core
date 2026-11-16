"use client";

import { Alert, AlertDescription } from "@asym/ui/components/shadcn/alert";
import {
  Button,
  ButtonLink,
  buttonVariants,
} from "@asym/ui/components/shadcn/button";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
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

import { CONVERSATION_PRIORITY_LABELS } from "../../../../../features/support-hub/lib/status-labels";
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
const NEW_CONTACT = "new-contact";

export function NewTicketForm({ contacts, queues }: NewTicketFormProps) {
  const pendingActionLabelId = useId();

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<
      Record<
        | "contact"
        | "contactName"
        | "contactEmail"
        | "subject"
        | "summary"
        | "queueId"
        | "priority",
        string
      >
    >
  >({});
  const [createdId, setCreatedId] = useState("");
  const invalidProps = (field: keyof typeof fieldErrors) => ({
    "aria-invalid": Boolean(fieldErrors[field]),
    "aria-describedby": fieldErrors[field]
      ? pendingActionLabelId + "-" + field + "-error"
      : undefined,
  });
  const clearFieldError = (field: keyof typeof fieldErrors) =>
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInFlight = useRef(false);
  const [contactValue, setContactValue] = useState<string | null>(null);
  const typingContact = contacts.length === 0 || contactValue === NEW_CONTACT;
  const [queueValue, setQueueValue] = useState<string | null>(null);
  const [priorityValue, setPriorityValue] =
    useState<SupportTicketPriority>("normal");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionInFlight.current) return;
    const form = event.currentTarget;
    setError(null);
    setSuccess(null);
    setCreatedId("");

    const formData = new FormData(form);
    const contactId = String(formData.get("contact") ?? "");
    const contact = contacts.find((item) => item.id === contactId);
    const contactName = typingContact
      ? String(formData.get("contactName") ?? "").trim()
      : (contact?.name ?? "");
    const contactEmail = typingContact
      ? String(formData.get("contactEmail") ?? "").trim()
      : (contact?.email ?? "");
    const subject = String(formData.get("subject") ?? "").trim();
    const summary = String(formData.get("summary") ?? "").trim();
    const queueId = String(formData.get("queueId") ?? "");
    const priority = String(formData.get("priority") ?? "");

    const missing = {
      contact: typingContact || contact ? undefined : "Choose a contact.",
      contactName:
        typingContact && !contactName ? "Enter a contact name." : undefined,
      contactEmail:
        typingContact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)
          ? "Enter a valid contact email."
          : undefined,
      subject: subject ? undefined : "Enter a subject.",
      summary: summary ? undefined : "Enter a summary.",
      queueId: queues.some((queue) => queue.id === queueId)
        ? undefined
        : "Choose a support track.",
      priority: priorities.includes(priority as SupportTicketPriority)
        ? undefined
        : "Choose a priority.",
    };
    setFieldErrors(missing);
    if (Object.values(missing).some(Boolean)) return;

    submissionInFlight.current = true;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(typingContact ? {} : { contactId }),
          contactEmail,
          contactName,
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

      setCreatedId(body.id?.trim() ?? "");
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
        setFieldErrors({});
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
          <AlertDescription>
            {success}
            {createdId ? (
              <Link
                href={supportHubRoutes.ticket(createdId)}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                View ticket
              </Link>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      {contacts.length > 0 ? (
        <Field data-invalid={Boolean(fieldErrors.contact)}>
          <Select
            items={[
              ...contacts.map((contact) => ({
                value: contact.id,
                label: contact.name,
              })),
              { value: NEW_CONTACT, label: "Someone new" },
            ]}
            value={contactValue}
            onValueChange={(value) => {
              clearFieldError("contact");
              clearFieldError("contactName");
              clearFieldError("contactEmail");
              if (value !== null) setContactValue(value);
            }}
            id="support-contact"
            name="contact"
            required
          >
            <SelectControlLabel>Contact</SelectControlLabel>
            <SelectTrigger {...invalidProps("contact")} className="w-full">
              <SelectValue placeholder="Select contact" />
            </SelectTrigger>
            <SelectContent>
              {contacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.name}
                </SelectItem>
              ))}
              <SelectItem value={NEW_CONTACT}>Someone new</SelectItem>
            </SelectContent>
          </Select>
          <FieldError id={pendingActionLabelId + "-contact-error"}>
            {fieldErrors.contact}
          </FieldError>
        </Field>
      ) : null}

      {typingContact ? (
        <>
          <Field data-invalid={Boolean(fieldErrors.contactName)}>
            <FieldLabel htmlFor="support-contact-name">Contact name</FieldLabel>
            <Input
              id="support-contact-name"
              name="contactName"
              autoComplete="name"
              required
              {...invalidProps("contactName")}
              onChange={() => clearFieldError("contactName")}
            />
            <FieldError id={pendingActionLabelId + "-contactName-error"}>
              {fieldErrors.contactName}
            </FieldError>
          </Field>
          <Field data-invalid={Boolean(fieldErrors.contactEmail)}>
            <FieldLabel htmlFor="support-contact-email">
              Contact email
            </FieldLabel>
            <Input
              id="support-contact-email"
              name="contactEmail"
              type="email"
              autoComplete="email"
              required
              {...invalidProps("contactEmail")}
              onChange={() => clearFieldError("contactEmail")}
            />
            <FieldError id={pendingActionLabelId + "-contactEmail-error"}>
              {fieldErrors.contactEmail}
            </FieldError>
          </Field>
        </>
      ) : null}

      <Field data-invalid={Boolean(fieldErrors.subject)}>
        <FieldLabel htmlFor="support-subject">Subject</FieldLabel>
        <Input
          id="support-subject"
          {...invalidProps("subject")}
          onChange={() => clearFieldError("subject")}
          name="subject"
          placeholder="Briefly describe the support request"
          required
        />
        <FieldError id={pendingActionLabelId + "-subject-error"}>
          {fieldErrors.subject}
        </FieldError>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={Boolean(fieldErrors.queueId)}>
          <Select
            items={queues.map((queue) => ({
              value: queue.id,
              label: queue.label,
            }))}
            value={queueValue}
            onValueChange={(value) => {
              clearFieldError("queueId");
              if (value !== null) setQueueValue(value);
            }}
            id="support-queue"
            name="queueId"
            required
          >
            <SelectControlLabel>Support track</SelectControlLabel>
            <SelectTrigger {...invalidProps("queueId")} className="w-full">
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
          <FieldError id={pendingActionLabelId + "-queueId-error"}>
            {fieldErrors.queueId}
          </FieldError>
        </Field>

        <Field data-invalid={Boolean(fieldErrors.priority)}>
          <Select
            items={priorities.map((priority) => ({
              value: priority,
              label: CONVERSATION_PRIORITY_LABELS[priority],
            }))}
            value={priorityValue}
            onValueChange={(value) => {
              clearFieldError("priority");
              if (value !== null) setPriorityValue(value);
            }}
            id="support-priority"
            name="priority"
            required
          >
            <SelectControlLabel>Priority</SelectControlLabel>
            <SelectTrigger {...invalidProps("priority")} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {CONVERSATION_PRIORITY_LABELS[priority]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError id={pendingActionLabelId + "-priority-error"}>
            {fieldErrors.priority}
          </FieldError>
        </Field>
      </div>

      <Field data-invalid={Boolean(fieldErrors.summary)}>
        <FieldLabel htmlFor="support-summary">Summary</FieldLabel>
        <Textarea
          id="support-summary"
          {...invalidProps("summary")}
          onChange={() => clearFieldError("summary")}
          name="summary"
          placeholder="Describe the request and the next best action."
          required
        />
        <FieldError id={pendingActionLabelId + "-summary-error"}>
          {fieldErrors.summary}
        </FieldError>
      </Field>

      <div className="flex flex-wrap gap-2">
        <Button
          aria-labelledby={`${pendingActionLabelId}-10`}
          focusableWhenDisabled={isSubmitting}
          disabled={isSubmitting}
          type="submit"
        >
          <span id={`${pendingActionLabelId}-10`}>
            {isSubmitting ? "Creating…" : "Create ticket"}
          </span>
        </Button>
        <ButtonLink
          variant="outline"
          render={<Link href={supportHubRoutes.tickets}>Cancel</Link>}
        />
      </div>
    </form>
  );
}
