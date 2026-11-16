import { loadSupportTicketIntake } from "@asym/api/admin/support/loaders";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Suspense } from "react";

import { NewTicketForm } from "./new-ticket-form";
import { SupportSubNav } from "../../../../../features/support-hub/components/workspace/SupportSubNav";

export default function NewSupportTicketPage() {
  return (
    <Suspense fallback={<p role="status">Loading ticket intake…</p>}>
      <TicketIntake />
    </Suspense>
  );
}

export const metadata = { title: "New support ticket" };
async function TicketIntake() {
  const model = await loadSupportTicketIntake();
  return (
    <PageShell
      title="New support ticket"
      description="Capture a request and route it to the right support track."
    >
      <SupportSubNav section="tickets" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ticket intake</CardTitle>
            <CardDescription>
              Capture the required details and route the ticket to the right
              support track.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewTicketForm
              contacts={model.contacts.map((contact) => ({
                email: contact.email,
                id: contact.id,
                name: contact.name,
              }))}
              queues={model.queues}
            />
          </CardContent>
        </Card>

        <Card className="lg:w-80 lg:shrink-0">
          <CardHeader>
            <CardTitle>Track hints</CardTitle>
            <CardDescription>
              Use these to route the first touch.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {model.queues.map((queue) => (
              <div className="rounded-2xl bg-muted p-3" key={queue.id}>
                <p className="text-sm font-bold">{queue.label}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {queue.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
