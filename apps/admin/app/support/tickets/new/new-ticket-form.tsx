"use client";

import { Alert, AlertDescription } from "@asym/ui/components/shadcn/alert";
import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import Link from "next/link";
import { useState } from "react";

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
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
      event.currentTarget.reset();
    } catch {
      setError("Unable to create support ticket.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
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
        <Label htmlFor="support-contact">Contact</Label>
        <select
          className="min-h-11 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
          defaultValue=""
          id="support-contact"
          name="contact"
          required
        >
          <option value="" disabled>
            Select contact
          </option>
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.name}
            </option>
          ))}
        </select>
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
          <Label htmlFor="support-queue">Support track</Label>
          <select
            className="min-h-11 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
            defaultValue=""
            id="support-queue"
            name="queueId"
            required
          >
            <option value="" disabled>
              Select support track
            </option>
            {queues.map((queue) => (
              <option key={queue.id} value={queue.id}>
                {queue.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="support-priority">Priority</Label>
          <select
            className="min-h-11 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm capitalize"
            defaultValue="normal"
            id="support-priority"
            name="priority"
            required
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
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
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating..." : "Create ticket"}
        </Button>
        <Button asChild variant="outline">
          <Link href={supportHubRoutes.tickets}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
