import { loadSupportContacts } from "@asym/api/admin/support/loaders";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@asym/ui/components/shadcn/empty";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import Link from "next/link";
import { Suspense } from "react";
type Props = { searchParams?: Promise<{ search?: string | string[] }> };
export default function SupportContactsPage(props: Props) {
  return (
    <Suspense fallback={<p role="status">Loading contacts…</p>}>
      <ContactsContent {...props} />
    </Suspense>
  );
}

export const metadata = { title: "Support contacts" };
async function ContactsContent({ searchParams }: Props) {
  const [contacts, params] = await Promise.all([
    loadSupportContacts(),
    searchParams,
  ]);
  const rawSearch = params?.search;
  const search =
    (Array.isArray(rawSearch) ? rawSearch[0] : rawSearch)?.trim() ?? "";
  const query = search.toLocaleLowerCase();
  const matches = contacts.filter((contact) =>
    [contact.name, contact.email, contact.organization].some((value) =>
      value?.toLocaleLowerCase().includes(query),
    ),
  );
  return (
    <PageShell
      title="Support contacts"
      description="Saved contacts in your organization."
    >
      <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="support-contact-search">Search contacts</Label>
          <Input
            id="support-contact-search"
            name="search"
            defaultValue={search}
          />
        </div>
        <Button type="submit">Search</Button>
      </form>
      <p role="status" className="mb-4 text-sm text-muted-foreground">
        Showing {matches.length} of {contacts.length} contacts
      </p>
      {matches.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {matches.map((contact) => (
            <Card key={contact.id}>
              <CardHeader>
                <CardTitle>{contact.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>{contact.email}</p>
                <p>{contact.organization}</p>
                <Link
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                  href={
                    "/support/tickets?search=" +
                    encodeURIComponent(contact.email || contact.name)
                  }
                >
                  View tickets
                </Link>
                {contact.email ? (
                  <Link
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                    href={"/crm?email=" + encodeURIComponent(contact.email)}
                  >
                    Find in CRM
                  </Link>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {contacts.length
                ? "No contacts match your search"
                : "No saved contacts yet"}
            </EmptyTitle>
            <EmptyDescription>
              {contacts.length
                ? "Try another name, email, or organization."
                : "Saved support contacts will appear here."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </PageShell>
  );
}
