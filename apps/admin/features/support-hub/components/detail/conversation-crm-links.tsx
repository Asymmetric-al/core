import { Heart, Receipt, UserPlus } from "lucide-react";

import { isContributionGiftParam } from "../../../../app/(app)/contributions/contribution-detail-query";

import type { SupportContactRef } from "../../types";

interface ConversationCrmLink {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  /** Tooltip / aria-label content shown to assistive tech. */
  description: string;
}

export function buildCrmLinks(
  contact: SupportContactRef | null,
  donorEmail: string | null,
): ConversationCrmLink[] {
  const links: ConversationCrmLink[] = [];

  if (donorEmail) {
    links.push({
      key: "contact-search",
      label: "Find in CRM",
      href: `/crm?email=${encodeURIComponent(donorEmail)}`,
      icon: <UserPlus className="size-3 text-muted-foreground" />,
      description: `Search CRM for ${donorEmail}`,
    });
  }

  if (contact?.donorId) {
    links.push({
      key: "donor",
      label: "Donor",
      href: `/crm?donor=${encodeURIComponent(contact.donorId)}`,
      icon: <Heart className="size-3 text-destructive" />,
      description: `Open donor giving history for ${contact.donorId}`,
    });
  }

  const contributionId = contact?.contributionId;
  if (contributionId && isContributionGiftParam(contributionId)) {
    links.push({
      key: "gift",
      label: "Gift",
      href: `/contributions?gift=${encodeURIComponent(contributionId)}`,
      icon: <Receipt className="size-3 text-warning" />,
      description: `Open contribution ${contributionId}`,
    });
  }

  return links;
}
