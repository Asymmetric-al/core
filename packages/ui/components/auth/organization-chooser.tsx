import { ButtonLink } from "../shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../shadcn/card";

import type { StaffSubrole } from "@asym/database/types";

const SUB_ROLE_LABELS: Record<StaffSubrole, string> = {
  finance: "Finance",
  mobilizer: "Mobilizer",
  development: "Development",
  hr: "HR",
  member_care: "Member care",
};

export interface OrganizationChooserOrganization {
  tenantId: string;
  name: string;
  options: ReadonlyArray<{ subRole: StaffSubrole | null; href: string }>;
}

/**
 * The organization and assignment chooser (plan 5.2): a person who belongs
 * to several organizations, or holds several staff roles in one, picks where
 * to work. Each option is a plain link, so choosing loads a new document:
 * nothing from the previous organization or role stays in the page.
 */
export function OrganizationChooser({
  organizations,
}: {
  organizations: ReadonlyArray<OrganizationChooserOrganization>;
}) {
  const only = organizations.length === 1 ? organizations[0]! : null;
  const title = only
    ? `Choose your role in ${only.name}`
    : "Choose an organization";
  const description = only
    ? "You have more than one role here. Pick the one to work in now; you can come back here to switch."
    : "You belong to more than one organization. Each one opens at its own address, so you can keep them in separate tabs.";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-5">
            {organizations.map((organization) => (
              <li key={organization.tenantId} className="flex flex-col gap-2">
                {only ? null : (
                  <h2 className="text-sm font-medium">{organization.name}</h2>
                )}
                <ul className="flex flex-col gap-2">
                  {organization.options.map((option) => (
                    <li key={option.href}>
                      <ButtonLink
                        href={option.href}
                        variant="outline"
                        className="w-full"
                      >
                        <span className="sr-only">{organization.name}: </span>
                        {option.subRole
                          ? SUB_ROLE_LABELS[option.subRole]
                          : `Open ${organization.name}`}
                      </ButtonLink>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
