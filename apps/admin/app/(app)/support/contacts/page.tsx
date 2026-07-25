import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";

import { supportHubDemoModel } from "../support-hub.data";

export default function SupportContactsPage() {
  return (
    <PageShell
      title="Support Contacts"
      description="See the donor, missionary, church, and staff context behind requests."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {supportHubDemoModel.contacts.map((contact) => (
          <Card className="rounded-3xl" key={contact.id}>
            <CardHeader>
              <CardTitle>{contact.name}</CardTitle>
              <CardDescription>{contact.relationship}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{contact.email}</p>
              <p>{contact.organization}</p>
              <p>{contact.givingSummary}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
