"use client";

import { useMC } from "@asym/lib/mission-control/context";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import {
  Bot,
  ChevronRight,
  Globe,
  Mail,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useId } from "react";

import type { Role } from "@asym/config/navigation";

type AdminDestination = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  roles?: Role[];
};

const SECTIONS: Array<{ title: string; items: AdminDestination[] }> = [
  {
    title: "People and access",
    items: [
      {
        title: "Staff directory",
        description: "Staff accounts in this organization and their roles.",
        href: "/admin/teams",
        icon: Users,
        // Reads the admin-only users endpoint.
        roles: ["admin"],
      },
      {
        title: "Web Studio editors",
        description: "Who can sign in to Web Studio and edit the public site.",
        href: "/web-studio/collections/cms-users",
        icon: Globe,
      },
    ],
  },
  {
    title: "Services",
    items: [
      {
        title: "Email delivery",
        description:
          "Connect Resend, set the sender and check domain authentication.",
        href: "/settings/integrations/resend",
        icon: Mail,
      },
      {
        title: "Eve",
        description: "The assistant's release gate and emergency switches.",
        href: "/admin/eve",
        icon: Bot,
        // The Eve page admits admins only (eve/workspace-access.ts).
        roles: ["admin"],
      },
    ],
  },
];

function AdminSection({
  title,
  items,
}: {
  title: string;
  items: AdminDestination[];
}) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h2 id={headingId} className="text-sm font-medium text-muted-foreground">
        {title}
      </h2>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.href}>
            <Item variant="outline" render={<Link href={item.href} />}>
              <ItemMedia variant="icon">
                <item.icon aria-hidden="true" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{item.title}</ItemTitle>
                <ItemDescription>{item.description}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
              </ItemActions>
            </Item>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function AdminPage() {
  const { role } = useMC();
  const sections = SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => !item.roles || item.roles.includes(role),
    ),
  })).filter((section) => section.items.length > 0);
  return (
    <PageShell
      title="Administration"
      description="Manage who can use Mission Control and how its services are set up."
      density="compact"
    >
      <div className="grid gap-8 max-xl:max-w-3xl xl:grid-cols-2 xl:items-start">
        {sections.map((section) => (
          <AdminSection
            key={section.title}
            title={section.title}
            items={section.items}
          />
        ))}
      </div>
    </PageShell>
  );
}
