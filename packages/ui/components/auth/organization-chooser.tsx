import { CircleAlert } from "lucide-react";

import { OrganizationChoiceSubmit } from "./organization-choice-submit";
import { Alert, AlertDescription, AlertTitle } from "../shadcn/alert";
import { ButtonLink } from "../shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../shadcn/card";

import type { StaffSubrole } from "@asym/database/types";
import type { ReactNode } from "react";

const SUB_ROLE_LABELS: Record<StaffSubrole, string> = {
  finance: "Finance",
  mobilizer: "Mobilizer",
  development: "Development",
  hr: "HR",
  member_care: "Member care",
};

/** An option that opens the organization at its own address. */
interface LinkOption {
  subRole: StaffSubrole | null;
  href: string;
}

/** An option Web Studio posts: the membership row the person chooses. */
interface FormOption {
  subRole: StaffSubrole | null;
  assignmentId: string;
}

export interface OrganizationChooserOrganization<Option = LinkOption> {
  tenantId: string;
  name: string;
  options: ReadonlyArray<Option>;
}

type OrganizationChooserProps =
  | {
      organizations: ReadonlyArray<OrganizationChooserOrganization>;
      choose?: undefined;
    }
  | {
      organizations: ReadonlyArray<OrganizationChooserOrganization<FormOption>>;
      /**
       * Web Studio (plan 5.2): its organization is one signed cookie for the
       * whole of Web Studio, so each option posts the choice to `action`,
       * which checks it and sets the cookie, then returns to `next`.
       */
      choose: {
        action: (formData: FormData) => void | Promise<void>;
        next: string;
        /** The last choice posted was refused: the chooser says so. */
        refused?: boolean;
        /**
         * The organization a link from Mission Control named, when Web Studio
         * works in another or in none yet (council on the joined release,
         * JC3). The caller offers it first; the chooser says why it asks.
         */
        cameFrom?: string;
      };
    };

/**
 * An option's name, said once: "Open Acme", or "Acme: Finance", where the
 * role alone would not say which organization (council round 1, A13).
 */
function OptionName({
  organization,
  subRole,
}: {
  organization: string;
  subRole: StaffSubrole | null;
}) {
  return subRole ? (
    <>
      <span className="sr-only">{organization}: </span>
      {SUB_ROLE_LABELS[subRole]}
    </>
  ) : (
    <>{`Open ${organization}`}</>
  );
}

/**
 * The organization and assignment chooser (plan 5.2): a person who belongs
 * to several organizations, or holds several staff roles in one, picks where
 * to work. In Mission Control and the missionary workspace each option is a
 * plain link to the organization's own address, so choosing loads a new
 * document: nothing from the previous organization or role stays in the
 * page. In Web Studio each option is a form that sets Web Studio's
 * organization for every Web Studio tab.
 */
export function OrganizationChooser(props: OrganizationChooserProps) {
  const { organizations } = props;
  const only = organizations.length === 1 ? organizations[0]! : null;
  const title = only
    ? `Choose your role in ${only.name}`
    : "Choose an organization";
  const description = props.choose
    ? "Web Studio works in one organization at a time. Your choice applies to every Web Studio tab; pages already open for another organization ask you to reload before they save."
    : only
      ? "You have more than one role here. Pick the one to work in now; you can come back here to switch."
      : "You belong to more than one organization. Each one opens at its own address, so you can keep them in separate tabs.";

  return (
    <ChooserFrame title={title} description={description}>
      <div className="flex flex-col gap-5">
        {props.choose?.refused ? (
          <Alert variant="destructive">
            <AlertTitle>That choice didn’t go through</AlertTitle>
            <AlertDescription>
              You may no longer hold that role, or it changed after this page
              opened. Choose again from the list below.
            </AlertDescription>
          </Alert>
        ) : props.choose?.cameFrom ? (
          <Alert>
            <AlertDescription>
              {`You came from ${props.choose.cameFrom} in Mission Control, and Web Studio asks before it works in another organization.`}
            </AlertDescription>
          </Alert>
        ) : null}
        <ul className="flex flex-col gap-5">
          {organizations.map((organization) => (
            <li key={organization.tenantId} className="flex flex-col gap-2">
              {only ? null : (
                <h2 className="text-sm font-medium">{organization.name}</h2>
              )}
              <ul className="flex flex-col gap-2">
                {props.choose
                  ? (
                      organization as OrganizationChooserOrganization<FormOption>
                    ).options.map((option) => (
                      <li key={option.assignmentId}>
                        <form action={props.choose.action}>
                          <input
                            type="hidden"
                            name="tenant"
                            value={organization.tenantId}
                          />
                          <input
                            type="hidden"
                            name="assignment"
                            value={option.assignmentId}
                          />
                          <input
                            type="hidden"
                            name="next"
                            value={props.choose.next}
                          />
                          <OrganizationChoiceSubmit>
                            <OptionName
                              organization={organization.name}
                              subRole={option.subRole}
                            />
                          </OrganizationChoiceSubmit>
                        </form>
                      </li>
                    ))
                  : (
                      organization as OrganizationChooserOrganization
                    ).options.map((option) => (
                      <li key={option.href}>
                        <ButtonLink
                          href={option.href}
                          variant="outline"
                          className="w-full"
                        >
                          <OptionName
                            organization={organization.name}
                            subRole={option.subRole}
                          />
                        </ButtonLink>
                      </li>
                    ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </ChooserFrame>
  );
}

/**
 * The chooser when the person's organizations could not be read (council
 * round 1, A9): an alert in the page, with a link that loads the chooser
 * again for the same choice, instead of the app's error page.
 */
export function OrganizationChooserUnavailable({
  retryHref,
}: {
  retryHref: string;
}) {
  return (
    <ChooserFrame title="Choose an organization">
      <Alert variant="destructive">
        <CircleAlert aria-hidden />
        <AlertTitle>Your organizations could not be loaded</AlertTitle>
        <AlertDescription>
          <p>This is usually brief. Try again in a moment.</p>
          <ButtonLink
            href={retryHref}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Try again
          </ButtonLink>
        </AlertDescription>
      </Alert>
    </ChooserFrame>
  );
}

function ChooserFrame({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          </CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  );
}
