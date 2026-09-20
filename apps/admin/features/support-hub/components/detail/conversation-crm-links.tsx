import { Building2, Heart, Receipt, Sparkles, UserPlus } from "lucide-react";

import type { SupportContactRef } from "../../types";

export interface ConversationCrmLink {
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

  if (contact?.contactId) {
    links.push({
      key: "contact",
      label: "Profile",
      href: `/crm?contact=${encodeURIComponent(contact.contactId)}`,
      icon: <UserPlus className="size-3 text-zinc-500" />,
      description: `Open CRM profile ${contact.contactId}`,
    });
  } else if (donorEmail) {
    links.push({
      key: "contact-search",
      label: "Find in CRM",
      href: `/crm?email=${encodeURIComponent(donorEmail)}`,
      icon: <UserPlus className="size-3 text-zinc-500" />,
      description: `Search CRM for ${donorEmail}`,
    });
  }

  if (contact?.donorId) {
    links.push({
      key: "donor",
      label: "Donor",
      href: `/contributions?donor=${encodeURIComponent(contact.donorId)}`,
      icon: <Heart className="size-3 text-rose-400" />,
      description: `Open donor giving history for ${contact.donorId}`,
    });
  }

  if (contact?.contributionId) {
    links.push({
      key: "gift",
      label: "Gift",
      href: `/contributions?contribution=${encodeURIComponent(contact.contributionId)}`,
      icon: <Receipt className="size-3 text-amber-500" />,
      description: `Open contribution ${contact.contributionId}`,
    });
  }

  if (contact?.missionaryId) {
    links.push({
      key: "missionary",
      label: "Missionary",
      href: `/crm?missionary=${encodeURIComponent(contact.missionaryId)}`,
      icon: <Sparkles className="size-3 text-violet-500" />,
      description: `Open missionary ${contact.missionaryId}`,
    });
  }

  if (contact?.churchId) {
    links.push({
      key: "church",
      label: "Church",
      href: `/crm?church=${encodeURIComponent(contact.churchId)}`,
      icon: <Building2 className="size-3 text-zinc-500" />,
      description: `Open church ${contact.churchId}`,
    });
  }

  return links;
}
