import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";

import { NewTicketForm } from "./new-ticket-form";
import { supportHubDemoModel } from "../../support-hub.data";

export default function NewSupportTicketPage() {
  return (
    <PageShell
      title="New Support Ticket"
      description="Capture a request and route it to the right support track."
    >
      <div className="flex flex-col gap-6 lg:flex-row">
        <Card className="min-w-0 flex-1">
          <CardHeader>
            <CardTitle>Ticket intake</CardTitle>
            <CardDescription>
              Capture the required details and route the ticket to the right
              support track.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewTicketForm
              contacts={supportHubDemoModel.contacts.map((contact) => ({
                email: contact.email,
                id: contact.id,
                name: contact.name,
              }))}
              queues={supportHubDemoModel.queues}
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
            {supportHubDemoModel.queues.map((queue) => (
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
